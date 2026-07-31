// ============================================================
//  gamesystems.js - 游戏子系统（第二大IIFE）
//  包含：1.状态效果系统 2.NPC交互 3.战斗 4.AI记忆 5.合成制造
//        6.事件系统 7.日志 8.成就 9.导入导出 10.结局/音效覆盖
//  依赖：data.js(常量) + audio.js(工具函数+基础playSfx) + main.js(核心gst/gch/渲染)
// ============================================================
(function() {
// ------- 确保 window 上有必要的默认值（data.js/audio.js 加载顺序不严格时的兜底）-------
(function initDefaults() {
  const ds = [
    ['STATUS_EFFECTS', {}], ['WEAPON_DATA', {}], ['CRAFT_RECIPES', []], ['RANDOM_EVENTS', []],
    ['NPC_DATA', {}], ['NPC_RELATIONSHIPS', []], ['ACHIEVEMENTS', []], ['ENDING_CONDITIONS', []],
    ['ABILITIES', {}], ['NORMAL_SKILLS', {}], ['ITEM_PRESETS', {}], ['DPROMPT', '']
  ];
  ds.forEach(([k,v]) => { if (window[k] == null) window[k] = v; });
  const fnDefaults = [
    'playSfx','playTone','snotify','tst','esc','escAttr','sketchConfirm','sketchPrompt',
    'gch','gst','gclk','cfg','sch','sst','sclk','scf','mds','pai','buildInvAndEquipFromItems',
    'getItemInfo','getItemBaseName','stopIdle','rbt','upui','stg','ccb','svh','apb','scb',
    'hin','abold','migrateSta','migrateChr','migrateCfg','mergeSbx','ssbx','gsbx','ldh','ssv',
    'gsv','gsp','spBar','mentalityLabel','itemEmoji','fmtTime','dayPhase','seasonFromDay',
    'randWeather','randTemp','aiInitStats','fillCharModal','_getHist','_setHist','_getSbx','_setSbx',
    'hasHover'
  ];
  fnDefaults.forEach(k => {
    if (typeof window[k] !== 'function') {
      if (k === 'sketchConfirm') window[k] = () => Promise.resolve(false);
      else if (k === 'sketchPrompt') window[k] = () => Promise.resolve('');
      else window[k] = function(){};
    }
  });
  if (typeof window.esc !== 'function' || !window.esc.name) {
    window.esc = function(s) { try { const d=document.createElement('div'); d.textContent=s==null?'':s; return d.innerHTML;} catch(e){return String(s||'');} };
    window.escAttr = function(s){ return String(s==null?'':s).replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); };
  }
})();

(function innerIIFE() {
        // Cross-script access to core functions from main IIFE
        const gch = window.gch, gst = window.gst, gclk = window.gclk, cfg = window.cfg;
        const sch = window.sch, sst = window.sst, sclk = window.sclk, scf = window.scf;
        const mds = window.mds, pai = window.pai;
        const buildInvAndEquipFromItems = window.buildInvAndEquipFromItems;
        const getItemInfo = window.getItemInfo, getItemBaseName = window.getItemBaseName;
        const stopIdle = window.stopIdle;
        // Additional functions from main IIFE
        const rbt = window.rbt, upui = window.upui, stg = window.stg;
        const ccb = window.ccb, svh = window.svh, apb = window.apb, scb = window.scb;
        const hin = window.hin, abold = window.abold;
        const migrateSta = window.migrateSta, migrateChr = window.migrateChr, migrateCfg = window.migrateCfg;
        const mergeSbx = window.mergeSbx, ssbx = window.ssbx, gsbx = window.gsbx;
        const ldh = window.ldh, ssv = window.ssv, gsv = window.gsv, gsp = window.gsp;
        const spBar = window.spBar, mentalityLabel = window.mentalityLabel, itemEmoji = window.itemEmoji;
        const fmtTime = window.fmtTime, dayPhase = window.dayPhase;
        const seasonFromDay = window.seasonFromDay, randWeather = window.randWeather, randTemp = window.randTemp;
        const aiInitStats = window.aiInitStats, fillCharModal = window.fillCharModal;
        const sketchConfirm = window.sketchConfirm, sketchPrompt = window.sketchPrompt;
        const _getHist = window._getHist, _setHist = window._setHist;
        const _getSbx = window._getSbx, _setSbx = window._setSbx;
        const hasHover = window.hasHover;
        // Helpers needed by playSfx override and status effect system
        const playSfx = window.playSfx, playTone = window.playTone, snotify = window.snotify, tst = window.tst;
        const esc = window.esc, escAttr = window.escAttr;
        const ABILITIES = window.ABILITIES, NORMAL_SKILLS = window.NORMAL_SKILLS;
        const STATUS_EFFECTS = window.STATUS_EFFECTS, WEAPON_DATA = window.WEAPON_DATA;
        const CRAFT_RECIPES = window.CRAFT_RECIPES, RANDOM_EVENTS = window.RANDOM_EVENTS;
        const NPC_DATA = window.NPC_DATA, NPC_RELATIONSHIPS = window.NPC_RELATIONSHIPS;
        const ACHIEVEMENTS = window.ACHIEVEMENTS, ENDING_CONDITIONS = window.ENDING_CONDITIONS;
        // Note: triggerRandomEvent, checkSeasonalEvent, checkForRandomEvent, applyStatusEffect,
        // tickStatusEffects, addKeyMemory, addLogEntry, checkAchievements are defined locally below

        // ===== 11. 状态效果系统 =====
        // 注意：STATUS_EFFECTS 常量值来自 window.STATUS_EFFECTS（data.js 提供）
        // 直接复用前面已声明的本地 const STATUS_EFFECTS（L65）即可，这里不再重新声明对象字面量

        function applyStatusEffect(effectName, duration, stacks) {
            const s = gst();
            if (!s.statusEffects) s.statusEffects = {};
            const eff = STATUS_EFFECTS[effectName];
            if (!eff) return;
            const stackKey = stacks && eff.stackable ? '_stacks' : '';
            const key = effectName + stackKey;
            const existing = s.statusEffects[key];
            if (eff.stackable) {
                const curStacks = existing ? existing.stacks : 0;
                const newStacks = Math.min(eff.maxStacks, curStacks + (stacks || 1));
                s.statusEffects[key] = { name: effectName, stacks: newStacks, remaining: duration || eff.duration };
            } else {
                s.statusEffects[key] = { name: effectName, stacks: 0, remaining: duration || eff.duration };
            }
            if (eff.onApply) eff.onApply(s);
            sst(s);
            playSfx('status');
            snotify('status', '状态', eff.name + (eff.stackable ? ' ×' + (s.statusEffects[key].stacks) : ''));
            // Update sidebar status display
            const statusList = [];
            Object.entries(s.statusEffects).forEach(([k, v]) => {
                const e = STATUS_EFFECTS[v.name];
                if (e) statusList.push(e.icon + e.name + '(' + Math.ceil(v.remaining/60) + 'm)');
            });
            if (statusList.length) {
                const statusDisp = document.getElementById('statusEffects');
                if (statusDisp) statusDisp.textContent = statusList.join(' ');
            }
        }

        function tickStatusEffects() {
            const s = gst();
            if (!s.statusEffects) return;
            const toRemove = [];
            Object.entries(s.statusEffects).forEach(([key, data]) => {
                const eff = STATUS_EFFECTS[data.name];
                if (!eff) { toRemove.push(key); return; }
                data.remaining -= 1;
                if (eff.onTick) {
                    try { eff.onTick(s); } catch(e) {}
                }
                if (data.remaining <= 0) {
                    toRemove.push(key);
                    snotify('status', '状态', eff.name + ' 结束');
                }
            });
            toRemove.forEach(k => delete s.statusEffects[k]);
            if (toRemove.length) sst(s);
        }

        // Status effect ticker - runs every game minute
        setInterval(() => {
            const s = gst();
            if (!s.statusEffects || Object.keys(s.statusEffects).length === 0) return;
            tickStatusEffects();
            sst(s);
        }, 5000);

        // ===== 2. 战斗系统 =====
        function calculateDamage(weapon, attackerStat, defenderStat) {
            const wd = WEAPON_DATA[weapon] || { dmg: 10, crit: 0.1, speed: 'medium', range: 1 };
            const baseDmg = wd.dmg + (attackerStat.str || 5) * 2;
            let dmg = baseDmg;
            const isCrit = Math.random() < wd.crit;
            if (isCrit) dmg *= 1.8;
            // Defender mitigation
            const armorReduce = defenderStat.armor || 0;
            dmg = Math.max(1, dmg - armorReduce * 0.3);
            return { damage: Math.round(dmg), critical: isCrit, weapon: weapon };
        }

        function attemptDodge(agility) {
            return Math.random() < (agility || 5) * 0.04;
        }

        function attemptBlock(weaponDurability) {
            const success = Math.random() < 0.25;
            if (success && weaponDurability !== undefined) {
                const s = gst();
                const curDur = (s.weaponDurability && s.weaponDurability[weaponDurability]) || 100;
                if (curDur > 0) {
                    s.weaponDurability[weaponDurability] = Math.max(0, curDur - 2);
                    sst(s);
                }
            }
            return success;
        }

        function attemptCounter(agility, weapon) {
            return Math.random() < (agility || 5) * 0.03;
        }

        function processCombatRound(enemyStats, playerStats) {
            const result = { events: [], playerDamage: 0, enemyDamage: 0, ended: false };
            const s = gst();
            const weapon = s.equip ? s.equip.weapon : null;
            const wd = WEAPON_DATA[weapon] || { dmg: 8, range: 1, crit: 0.05, speed: 'medium' };
            
            // Player attacks
            const pAgility = playerStats.agility || s.agility || 5;
            const eAgility = enemyStats.agility || 5;
            const eHp = enemyStats.hp || 100;
            const weaponName = weapon || '徒手';

            if (attemptDodge(eAgility)) {
                result.events.push('敌方闪避了你的攻击！');
            } else {
                const dmgCalc = calculateDamage(weapon, playerStats, enemyStats);
                result.enemyDamage = dmgCalc.damage;
                if (dmgCalc.critical) result.events.push('暴击！造成 ' + dmgCalc.damage + ' 点伤害');
                else result.events.push('你用' + weaponName + '攻击，造成 ' + dmgCalc.damage + ' 点伤害');
                // Apply infection chance for bites/scratches
                if (enemyStats.type === '丧尸' && Math.random() < 0.3) {
                    applyStatusEffect('infection', 180);
                    result.events.push('⚠️ 你被咬伤了，可能感染！');
                }
            }

            // Check if enemy is dead
            const newEHp = eHp - result.enemyDamage;
            if (newEHp <= 0) {
                result.events.push('敌人已被击倒！');
                result.ended = true;
                playSfx('victory');
                // Drop loot chance
                if (Math.random() < 0.3) {
                    const lootPool = ['压缩饼干', '瓶装水', '绷带', '抗生素', '金属', '零件', '手电筒', '止痛药', '火柴', '巧克力'];
                    const loot = lootPool[Math.floor(Math.random() * lootPool.length)];
                    const cs = gst();
                    cs.inv.push(loot);
                    sst(cs);
                    result.events.push('获得战利品：' + loot);
                    playSfx('pickup');
                }
                return result;
            }

            // Enemy attacks
            if (!result.ended) {
                if (attemptDodge(pAgility)) {
                    result.events.push('你成功闪避了敌人的攻击！');
                } else if (weapon && attemptBlock(weapon)) {
                    result.events.push('你用武器格挡了攻击！');
                } else {
                    // Armor reduction: check body slot for armor
                    const bodyArmor = (s.equip && s.equip.body) ? getItemInfo(s.equip.body) : null;
                    const armorReduce = (bodyArmor && bodyArmor.subCategory === 'armor') ? 5 : 0;
                    const eDmg = Math.max(1, (enemyStats.dmg || 8) - armorReduce);
                    result.playerDamage = eDmg;
                    result.events.push('敌人反击造成 ' + eDmg + ' 点伤害');
                    // Apply status effects
                    if (eDmg > 15) applyStatusEffect('bleeding', 60);
                    if (Math.random() < 0.1) applyStatusEffect('panic', 60);
                    playSfx('hurt');
                }

                // Counter attack chance
                if (attemptCounter(pAgility, weapon)) {
                    const counterDmg = Math.max(1, Math.floor((wd.dmg || 8) * 0.5));
                    result.enemyDamage += counterDmg;
                    result.events.push('你抓住机会反击，造成 ' + counterDmg + ' 点伤害！');
                    playSfx('counter');
                }
            }
            
            return result;
        }

        // ===== 1. 合成/制造系统 =====
        function getCraftingRecipes() {
            return CRAFT_RECIPES.slice();
        }

        // 【辅助】解析物品名和数量："木板x3" → {name:'木板', qty:3}
        function parseItemQty(str) {
            const s = (str || '').trim();
            const m = s.match(/^(.*?)\s*x\s*(\d+)$/i);
            if (m) return { name: m[1].trim(), qty: parseInt(m[2]) || 1 };
            return { name: s, qty: 1 };
        }
        // 【辅助】从背包中获取某物品的总数量（支持 "x3" 后缀累加）
        function getInventoryQty(inv, itemName) {
            let total = 0;
            inv.forEach(it => {
                const { name, qty } = parseItemQty(it);
                if (name === itemName) total += qty;
            });
            return total;
        }
        // 【辅助】从背包中消耗指定数量物品（消耗完的项删除，带xN的项减少数量）
        function consumeInventoryQty(inv, itemName, needQty) {
            let remain = needQty;
            // 从后往前遍历，避免索引错位
            for (let i = inv.length - 1; i >= 0 && remain > 0; i--) {
                const { name, qty } = parseItemQty(inv[i]);
                if (name !== itemName) continue;
                if (qty <= remain) {
                    remain -= qty;
                    inv.splice(i, 1);
                } else {
                    const left = qty - remain;
                    remain = 0;
                    if (left <= 1) inv[i] = name;
                    else inv[i] = name + 'x' + left;
                }
            }
        }

        function tryCraft(recipeId) {
            const recipe = CRAFT_RECIPES.find(r => r.id === recipeId);
            if (!recipe) return { success: false, message: '未知配方' };
            const s = gst();
            if (!s.inv) s.inv = [];
            const missing = [];
            // 第一步：检查配料数量是否足够（精确匹配物品名 + 累加数量）
            recipe.ingredients.forEach(ingStr => {
                const { name: ingName, qty: ingQty } = parseItemQty(ingStr);
                const have = getInventoryQty(s.inv, ingName);
                if (have < ingQty) missing.push(ingName + (ingQty > 1 ? 'x' + ingQty : '') + '（差' + (ingQty - have) + '）');
            });
            if (missing.length > 0) {
                return { success: false, message: '缺少：' + missing.join('、') };
            }
            // 第二步：消耗所有配料（从后往前消耗防止索引错位）
            recipe.ingredients.forEach(ingStr => {
                const { name: ingName, qty: ingQty } = parseItemQty(ingStr);
                consumeInventoryQty(s.inv, ingName, ingQty);
            });
            // 第三步：产出结果（如果结果带xN则直接推入，玩家使用时再解析）
            s.inv.push(recipe.result);
            s.crafts = (s.crafts || 0) + 1;
            if (typeof addLogEntry === 'function') addLogEntry('craft', '成功合成：' + recipe.result);
            sst(s);
            playSfx('craft');
            return { success: true, message: '合成成功！获得 ' + recipe.result, item: recipe.result };
        }

        function openCraftingModal() {
            const s = gst();
            // 统计每种物品的可用数量
            const invQty = {};
            (s.inv || []).forEach(it => {
                const { name, qty } = parseItemQty(it);
                invQty[name] = (invQty[name] || 0) + qty;
            });
            const recipes = CRAFT_RECIPES.map(r => {
                // 逐配料检查数量是否满足
                let canCraft = true;
                const needArr = [];
                r.ingredients.forEach(ingStr => {
                    const { name: ingName, qty: ingQty } = parseItemQty(ingStr);
                    const have = invQty[ingName] || 0;
                    if (have < ingQty) {
                        canCraft = false;
                        needArr.push(ingName + (ingQty > 1 ? 'x' + ingQty : ''));
                    }
                });
                return { ...r, canCraft, need: needArr.join('、') };
            });
            const d = document.createElement('div');
            d.className = 'modal-overlay';
            d.style.zIndex = '9998';
            // ===== 分类：按ID/关键词分组 =====
            const categoryRules = [
                { name: '🍞 食物加工', test: r => /hardtack|jerky|smoked|dried|broth|mre_upgrade|vitamin_extract|canned|food/i.test(r.id) || r.result.includes('饼干') || r.result.includes('肉') || r.result.includes('熏鱼') || r.result.includes('果干') || /压缩|风干|熏|骨汤|自热|维生素/.test(r.name) },
                { name: '💊 医疗用品', test: r => /iodine|splint|stitch|herbal|antivenom|blood_bag|morphine|cpr|bandage|gauze|medkit|surgical|purify/i.test(r.id) || /绷带|医疗|碘伏|骨折|缝合|草药|抗毒|血浆|吗啡|复苏|净水|药片/.test(r.name + r.result) },
                { name: '⚔️ 武器弹药', test: r => /pipe_gun|smg_craft|tactical|katanahandle|compound_bow|crossbow_scope|fire_axe_special|taser|ballistic_knife|incendiary|explosive_arrow|molotov|spark|bow_craft|arrow_craft|stun_baton|whetstone|spear|axe|crossbow/i.test(r.id) || /手枪|冲锋|匕首|打刀|复合|十字弩|破拆斧|电击|飞刀|燃烧|爆裂|弩箭|弓箭|长矛|链锯|唐刀|武士刀/.test(r.name + r.result) },
                { name: '🛡️ 防具护具', test: r => /kevlar|riot_helmet|full_plate|chainmail|combat_boots|gauntlets|shin|bite_proof|armor_plate|shield|spike/i.test(r.id) || /凯夫拉|防暴|板甲|锁子|作战靴|护手|护胫|防咬|护心|盾牌|钉甲/.test(r.name + r.result) },
                { name: '🔧 电子/工具', test: r => /nv_upgrade|solar_panel_array|ebike|jammer|faraday|metal_detector|door_barricade|perimeter_alarm|spike_strip|watchtower|radio|generator|battery_pack|solar_charger|rebreather|lockpick_master|battery_rebuild|ham_radio|water_heater|portable_stove|bug_out_bag|multitool_kit|climbing_kit/i.test(r.id) || /夜视|太阳能|电动|干扰|法拉第|探测器|门闩|周界|阻车|瞭望|对讲|发电|充电|防毒|开锁|电池|电台|热水器|炉具|生存包|组合|攀岩/.test(r.name + r.result) },
                { name: '🌱 农业种植', test: r => /compost|grow_light|seed_bank|irrigation|greenhouse|smoker|rain|fishing/i.test(r.id) || /堆肥|生长灯|种子|滴灌|温室|熏肉|雨水|钓鱼|渔网/.test(r.name + r.result) },
                { name: '🪤 陷阱防御', test: r => /punji|snare|bear_trap|alarm_trap|concussion|tear_gas|trap|booby|landmine|wire|filter|torch|candle/i.test(r.id) || /尖钉|捕兽|警报|震爆|催泪|地雷|铁丝|滤水|火把|蜡烛|简易陷阱|爆炸/.test(r.name + r.result) },
                { name: '📦 其他/基础', test: () => true }
            ];
            const categoryList = [];
            const used = new Set();
            categoryRules.forEach(cat => {
                const arr = recipes.filter(r => !used.has(r.id) && cat.test(r));
                arr.forEach(r => used.add(r.id));
                if (arr.length > 0) categoryList.push({ ...cat, list: arr });
            });
            // 难度星标
            const diffStars = d => {
                const n = Math.max(1, Math.min(5, parseInt(d) || 1));
                return '★'.repeat(n) + '☆'.repeat(5 - n);
            };
            // 生成分类HTML
            let recipeHTML = categoryList.map(cat => {
                const items = cat.list.map(r => {
                    // 给每种材料加上已拥有提示
                    const ingWithHint = r.ingredients.map(ingStr => {
                        const { name: inName, qty: inQty } = parseItemQty(ingStr);
                        const have = invQty[inName] || 0;
                        const ok = have >= inQty;
                        const display = inQty > 1 ? inName + '×' + inQty : inName;
                        const hint = ' <span style="color:' + (ok ? '#3a7c3a' : '#9d5a3a') + '">[' + have + '/' + inQty + ']</span>';
                        return display + hint;
                    }).join(' + ');
                    const status = r.canCraft ? '<span style="color:#3a7c3a;">✓ 材料齐全</span>' : '<span style="color:#9d5a3a;">✗ 缺少：' + r.need + '</span>';
                    const btn = r.canCraft ? '<button class="btn-header craft-btn" data-rid="' + r.id + '" style="background:linear-gradient(135deg,#d4a95b,#b58941);color:#fff;border:none;">🔨 合成</button>' : '<button class="btn-header" disabled style="opacity:0.5;">材料不足</button>';
                    return '<div style="background:#fffef7;border:1.5px solid #c5b9a0;border-radius:8px;padding:11px;margin:8px 0;box-shadow:2px 2px 0 rgba(120,100,70,0.08);">' +
                        '<div style="font-weight:bold;color:#5c4028;margin-bottom:4px;display:flex;justify-content:space-between;align-items:center;">' +
                        '<span>' + r.name + ' <span style="font-weight:normal;font-size:0.72rem;color:#a08b6c;margin-left:6px;">' + diffStars(r.difficulty) + '（' + r.difficulty + '级）</span></span>' +
                        '<span style="font-size:0.7rem;color:#8a7b6a;font-weight:normal;">产出: ' + r.result + '</span>' +
                        '</div>' +
                        '<div style="font-size:0.78rem;color:#5a4e3e;margin-bottom:6px;">' + r.desc + '</div>' +
                        '<div style="font-size:0.75rem;color:#555;margin-bottom:8px;background:#f9f5e9;padding:5px 8px;border-radius:4px;border-left:3px solid #c9b88a;">材料：' + ingWithHint + '</div>' +
                        '<div style="display:flex;justify-content:space-between;align-items:center;">' +
                        '<span style="font-size:0.72rem;">' + status + '</span>' + btn + '</div></div>';
                }).join('');
                // 折叠面板（默认展开第一个，其他点击展开）
                const isFirst = cat === categoryList[0];
                const catId = 'craft-cat-' + Math.random().toString(36).slice(2, 8);
                return '<div class="craft-category" style="margin-bottom:14px;">' +
                    '<div style="background:linear-gradient(135deg,#f5e8cb,#ecdcb4);border:1.5px solid #c9b88a;border-radius:8px 8px 4px 4px;padding:8px 12px;cursor:pointer;display:flex;justify-content:space-between;align-items:center;font-weight:bold;color:#5c4028;" data-cat-toggle="#' + catId + '">' +
                    '<span>' + cat.name + ' <span style="font-weight:normal;font-size:0.72rem;color:#8a7b6a;margin-left:4px;">（' + cat.list.length + '个配方）</span></span>' +
                    '<span class="cat-arrow" style="transition:transform 0.2s;display:inline-block;transform:' + (isFirst ? 'rotate(180deg)' : 'rotate(0)') + ';">▼</span>' +
                    '</div>' +
                    '<div id="' + catId + '" style="' + (isFirst ? '' : 'display:none;') + 'padding:2px 4px 0;">' + items + '</div>' +
                    '</div>';
            }).join('');
            // 统计信息
            const totalRecipes = recipes.length;
            const craftableCount = recipes.filter(r => r.canCraft).length;
            d.innerHTML = '<div class="modal-panel" style="max-width:520px;max-height:85vh;overflow-y:auto;">' +
                '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">' +
                '<h3 style="color:#5c4028;margin:0;">🔨 合成工作台</h3>' +
                '<button class="btn-close" id="craftClose">×</button></div>' +
                '<div style="font-size:0.78rem;color:#7a6b5a;margin-bottom:10px;background:#f9f5e9;padding:7px 10px;border-radius:5px;border-left:3px solid #c9b88a;display:flex;justify-content:space-between;">' +
                '<span>共 ' + totalRecipes + ' 个配方 · 难度★=简单 ★★★★★=大师</span>' +
                '<span style="color:' + (craftableCount > 0 ? '#3a7c3a' : '#888') + ';">当前可合成：' + craftableCount + ' 个</span>' +
                '</div>' +
                recipeHTML + '</div>';
            document.body.appendChild(d);
            // 分类折叠点击
            d.querySelectorAll('[data-cat-toggle]').forEach(t => {
                t.addEventListener('click', () => {
                    const sel = t.getAttribute('data-cat-toggle');
                    const panel = d.querySelector(sel);
                    const arrow = t.querySelector('.cat-arrow');
                    if (panel.style.display === 'none') {
                        panel.style.display = '';
                        if (arrow) arrow.style.transform = 'rotate(180deg)';
                    } else {
                        panel.style.display = 'none';
                        if (arrow) arrow.style.transform = 'rotate(0)';
                    }
                });
            });
            d.querySelector('#craftClose').onclick = () => d.remove();
            d.querySelectorAll('.craft-btn').forEach(btn => {
                btn.onclick = () => {
                    const rid = btn.dataset.rid;
                    const result = tryCraft(rid);
                    if (result.success) {
                        // 成功闪一下
                        btn.style.background = 'linear-gradient(135deg,#3a7c3a,#2e632e)';
                        btn.textContent = '✓ 成功';
                        tst(result.message);
                        playSfx('levelup');
                        setTimeout(() => {
                            d.remove();
                            setTimeout(openCraftingModal, 100);
                        }, 350);
                    } else {
                        btn.style.background = 'linear-gradient(135deg,#9d5a3a,#7a4328)';
                        const ot = btn.textContent;
                        btn.textContent = '✗ 失败';
                        tst(result.message);
                        setTimeout(() => { btn.style.background = ''; btn.textContent = ot; }, 700);
                    }
                };
            });
        }

        // ===== 6. 事件系统 =====
        const CURRENT_SEASON = '秋季';
        const WEATHER_EVENTS = {
            '晴': { encounter: 0.3, combat: 0.4, loot: 0.5 },
            '阴': { encounter: 0.4, combat: 0.5, loot: 0.4 },
            '雨': { encounter: 0.2, combat: 0.2, loot: 0.3 },
            '雪': { encounter: 0.2, combat: 0.2, loot: 0.2 },
            '雾': { encounter: 0.5, combat: 0.3, loot: 0.3 },
            '沙暴': { encounter: 0.1, combat: 0.1, loot: 0.2 },
            '雷暴': { encounter: 0.1, combat: 0.1, loot: 0.2 }
        };

        let lastEventTime = 0;
        let eventLog = [];
        function checkForRandomEvent(triggerType) {
            const s = gst();
            const now = Date.now();
            if (now - lastEventTime < 60000) return null;
            const clk = gclk();
            const weather = (clk && clk.weather) ? clk.weather : '晴';
            const probs = WEATHER_EVENTS[weather] || WEATHER_EVENTS['晴'];
            const location = (s && s.location) || '';
            const locationDanger = /医院|警局|学校|仓库|工厂|地铁|商场/.test(location) ? 1.5 : 1.0;

            if (Math.random() < 0.08 * locationDanger) {
                const dayPart = clk.elapsedSec / 3600;
                const isDaytime = (dayPart > 6 && dayPart < 22);
                const eligible = RANDOM_EVENTS.filter(e => {
                    // Time-triggered events only during day
                    if (e.trigger === 'time') return isDaytime;
                    // Proximity events only when exploring
                    if (e.trigger === 'proximity') return triggerType === 'exploration' || triggerType === 'location' || !triggerType;
                    return true;
                });
                if (!eligible.length) return null;
                const event = eligible[Math.floor(Math.random() * eligible.length)];
                lastEventTime = now;
                eventLog.push({ ...event, time: now });
                if (eventLog.length > 30) eventLog.shift();
                addLogEntry('event', event.name + '：' + event.text);
                playSfx('warn');
                return event;
            }
            return null;
        }
        function triggerRandomEvent() {
            const event = checkForRandomEvent();
            if (event) {
                const s = gst();
                if (event.type === 'loot' && event.maxItems) {
                    const lootPool = ['压缩饼干', '午餐肉罐头', '瓶装水', '绷带', '医疗包', '抗生素', '金属', '零件', '电池', '手电筒', '止痛药', '火柴', '方便面', '巧克力', '牛肉干', '9mm子弹', '5.56mm子弹', '绳子', '铁丝'];
                    const count = Math.floor(Math.random() * (event.maxItems - (event.minItems || 1) + 1)) + (event.minItems || 1);
                    for (let i = 0; i < count; i++) {
                        const item = lootPool[Math.floor(Math.random() * lootPool.length)];
                        s.inv.push(item);
                    }
                    sst(s);
                    tst('🎁 ' + event.name + '！获得' + count + '件物资');
                    playSfx('pickup');
                } else if (event.type === 'combat') {
                    tst('⚠️ ' + event.name + '！');
                    playSfx('danger_alarm');
                } else if (event.type === 'npc') {
                    addKeyMemory(event.name + '：' + event.text, 'event');
                    tst('👥 ' + event.name);
                } else if (event.type === 'buff' && event.effect) {
                    if (event.effect.spirit) s.spirit = Math.min(100, (s.spirit || 0) + event.effect.spirit);
                    if (event.effect.joy) s.joy = Math.min(100, (s.joy || 0) + event.effect.joy);
                    if (event.effect.hp) s.hp = Math.min(s.maxHp || 100, (s.hp || 100) + event.effect.hp);
                    sst(s);
                    tst('✨ ' + event.name + '！精神+' + (event.effect.spirit || 0) + ' 欢愉+' + (event.effect.joy || 0));
                    playSfx('notify');
                } else if (event.type === 'clue') {
                    addBookmark(event.name, event.text);
                    tst('📌 ' + event.name + '！已加入书签');
                    playSfx('notify');
                } else {
                    tst('📢 ' + event.name);
                }
                addLogEntry(event.type === 'combat' ? 'system' : 'event', event.name + '：' + event.text);
            }
        }
        // Seasonal event triggers
        const SEASONAL_EVENTS = {
            '春节': { name: '春节遭遇', text: '你发现了一个被遗弃的避难所，里面有春节的装饰和一些遗留的物资。', items: ['罐头', '烟花', '春联'] },
            '暴雨': { name: '暴雨来袭', text: '暴雨迫使你寻找避难处，水位在不断上涨。', effect: '体温下降' },
            '暴雪': { name: '暴风雪', text: '刺骨的寒风和大雪席卷而来，你必须找到保暖的地方。', effect: '失温风险增加' }
        };
        function checkSeasonalEvent() {
            const clk = gclk();
            const season = clk.season || '';
            if (SEASONAL_EVENTS[season]) {
                const ev = SEASONAL_EVENTS[season];
                if (Math.random() < 0.05) {
                    addLogEntry('seasonal', ev.name + '：' + ev.text);
                    if (ev.items) {
                        const s = gst();
                        ev.items.forEach(it => s.inv.push(it));
                        sst(s);
                        tst('🎊 ' + ev.name + '！获得特殊物资');
                    } else {
                        tst('🌨️ ' + ev.name);
                    }
                }
            }
        }

        // ===== 5. NPC 交互深度 =====
        function addNpcRelationship(name, trustDelta) {
            if (!NPC_DATA[name]) return;
            const npc = NPC_DATA[name];
            npc.trust = Math.max(0, Math.min(100, (npc.trust || 0) + trustDelta));
            npc.affinity = Math.max(0, Math.min(100, (npc.affinity || 0) + trustDelta * 0.7));
        }

        function getNpcDialogue(name) {
            const npc = NPC_DATA[name];
            if (!npc || !npc.dialogue) return name + '看了你一眼。';
            const trust = npc.trust || 0;
            if (trust >= (npc.unlockLevel || 70)) return npc.dialogue.high;
            if (trust >= (npc.unlockLevel || 70) * 0.5) return npc.dialogue.mid;
            return npc.dialogue.low;
        }

        function shouldNpcInteract(name) {
            const npc = NPC_DATA[name];
            if (!npc) return false;
            const s = gst();
            if (s.spirit < 20) return true;
            if (s.hunger > 70) return true;
            return Math.random() < 0.15 + (npc.trust || 0) * 0.005;
        }
        function getNpcDialogueOptions(name) {
            const npc = NPC_DATA[name];
            if (!npc) return null;
            const trust = npc.trust || 0;
            const options = [
                { label: '寒暄', trustReq: 0, text: '你还好吗？最近怎么样？' },
                { label: '赠送礼物', trustReq: 20, text: '这是我找到的一些东西，给你。' },
                { label: '倾诉心事', trustReq: 40, text: '我最近经历了很多……想找人说说。' },
                { label: '请求帮助', trustReq: 50, text: '我需要你的帮助，这很重要。' },
                { label: '分享秘密', trustReq: 70, text: '我告诉你一个秘密，但你必须保密。' },
                { label: '寻求合作', trustReq: 60, text: '我们合作吧，一起去找更好的物资。' },
                { label: '询问过去', trustReq: 30, text: '你以前是做什么的？能告诉我你的故事吗？' },
                { label: '保持沉默', trustReq: 0, text: '（你选择不说话，只是默默陪伴）' }
            ];
            const available = options.filter(o => trust >= o.trustReq);
            return available;
        }
        function processNpcInteraction(npcName, choiceIndex) {
            const npc = NPC_DATA[npcName];
            if (!npc) return null;
            const s = gst();
            const options = getNpcDialogueOptions(npcName);
            const choice = options[choiceIndex] || options[0];
            const trustChange = (choice.trustReq > 0) ? 2 : 0;
            const affChange = choice.trustReq > 40 ? 3 : 1;
            addNpcRelationship(npcName, trustChange);
            const dialog = getNpcDialogue(npcName);
            return {
                npc: npcName,
                dialog: dialog,
                choice: choice.label,
                trustChange: trustChange,
                affinityChange: affChange
            };
        }
        function triggerNpcEncounter() {
            const s = gst();
            const npcRel = s.npcRel || {};
            const allNpcs = Object.keys(NPC_DATA);
            const available = allNpcs.filter(n => shouldNpcInteract(n));
            if (available.length === 0) return null;
            const npcName = available[Math.floor(Math.random() * available.length)];
            const npc = NPC_DATA[npcName];
            const options = getNpcDialogueOptions(npcName);
            const dialogue = getNpcDialogue(npcName);
            addKeyMemory('遇见' + npcName + '：' + dialogue, 'npc');
            addLogEntry('npc', '遇见' + npcName + '：' + dialogue);
            return { name: npcName, personality: npc.personality, dialogue: dialogue, options: options };
        }

        function openNpcPanel() {
            const s = gst();
            const rels = s.npcRel || {};
            const allNpcs = Object.keys(NPC_DATA);
            let html = '<div style="display:flex;justify-content:space-between;margin-bottom:12px;">' +
                '<h3 style="color:#5c4028;margin:0;">👥 NPC 关系网</h3>' +
                '<button class="btn-close" id="npcClose">×</button></div>' +
                '<div style="font-size:0.8rem;color:#7a6b5a;margin-bottom:12px;">管理你与幸存者之间的信任与好感度</div>';
            // NPC cards
            html += '<div style="display:grid;grid-template-columns:1fr;gap:10px;max-height:400px;overflow-y:auto;">';
            allNpcs.forEach(name => {
                const npc = NPC_DATA[name];
                const playerRel = rels[name] || { trust: npc.trust || 0, affinity: npc.affinity || 0 };
                const trust = playerRel.trust || 0;
                const aff = playerRel.affinity || 0;
                let level = '陌生人';
                if (trust >= 80) level = '挚友';
                else if (trust >= 60) level = '好友';
                else if (trust >= 40) level = '熟人';
                else if (trust >= 20) level = '认识';
                const levelColor = trust >= 60 ? '#3a7c3a' : trust >= 40 ? '#8a6b3a' : '#9d5a3a';
                const options = getNpcDialogueOptions(name);
                html += '<div style="background:#fffef7;border:1.5px solid #c5b9a0;border-radius:6px;padding:10px;filter:url(#light);">' +
                    '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">' +
                        '<strong style="color:#5c4028;">' + name + '</strong>' +
                        '<span style="font-size:0.72rem;color:' + levelColor + ';font-weight:bold;">' + level + '</span>' +
                    '</div>' +
                    '<div style="font-size:0.72rem;color:#7a6b5a;margin-bottom:6px;">' +
                        npc.personality + ' · ' + npc.occupation +
                    '</div>' +
                    '<div style="margin-bottom:6px;">' +
                        '<div style="font-size:0.68rem;color:#8a7b6a;margin-bottom:2px;">信任 ' + trust + '/100</div>' +
                        '<div style="background:#e8d8b0;border-radius:3px;height:8px;overflow:hidden;"><div style="height:100%;background:#d4a03a;width:' + trust + '%;transition:width 0.3s;"></div></div>' +
                    '</div>' +
                    '<div style="margin-bottom:6px;">' +
                        '<div style="font-size:0.68rem;color:#8a7b6a;margin-bottom:2px;">好感 ' + aff + '/100</div>' +
                        '<div style="background:#e8d8b0;border-radius:3px;height:8px;overflow:hidden;"><div style="height:100%;background:#c75b3a;width:' + aff + '%;transition:width 0.3s;"></div></div>' +
                    '</div>' +
                    '<div style="font-size:0.7rem;color:#6a5e4e;font-style:italic;margin-bottom:6px;">"' + getNpcDialogue(name) + '"</div>' +
                    '<div style="display:flex;flex-wrap:wrap;gap:4px;">';
                options.slice(0, 4).forEach((opt, i) => {
                    html += '<button class="btn-header npc-interact" data-npc="' + name + '" data-idx="' + i + '" style="font-size:0.7rem;padding:4px 8px;">' + opt.label + '</button>';
                });
                html += '</div></div>';
            });
            html += '</div>';
            // NPC relationships
            if (NPC_RELATIONSHIPS.length > 0) {
                html += '<div style="margin-top:12px;padding-top:10px;border-top:1px dashed #c5b9a0;">' +
                    '<div style="font-size:0.78rem;color:#5c4028;font-weight:bold;margin-bottom:6px;">🔗 NPC 间关系</div>';
                NPC_RELATIONSHIPS.forEach(r => {
                    html += '<div style="font-size:0.72rem;color:#7a6b5a;padding:2px 0;">' +
                        r.from + ' ↔ ' + r.to + '：' + r.type + ' (亲密度 ' + r.level + ')</div>';
                });
                html += '</div>';
            }
            const d = document.createElement('div');
            d.className = 'modal-overlay';
            d.style.zIndex = '9998';
            d.innerHTML = '<div class="modal-panel" style="max-width:500px;">' + html + '</div>';
            document.body.appendChild(d);
            d.querySelector('#npcClose').onclick = () => d.remove();
            d.querySelectorAll('.npc-interact').forEach(btn => {
                btn.onclick = () => {
                    const npcName = btn.dataset.npc;
                    const idx = parseInt(btn.dataset.idx);
                    const result = processNpcInteraction(npcName, idx);
                    if (result) {
                        tst('与' + npcName + '交流：' + result.choice + ' (信任+' + result.trustChange + ')');
                        addKeyMemory('与' + npcName + '进行' + result.choice, 'npc');
                        playSfx('notify');
                        d.remove();
                        openNpcPanel(); // Refresh
                    }
                };
            });
        }

        // ===== 4. AI 上下文管理 =====
        let keyMemories = JSON.parse(localStorage.getItem('vn_keyMemories') || '[]');
        function addKeyMemory(text, type) {
            keyMemories.push({ text: text, type: type || 'general', time: Date.now() });
            if (keyMemories.length > 50) keyMemories = keyMemories.slice(-50);
            try { localStorage.setItem('vn_keyMemories', JSON.stringify(keyMemories)); } catch(e) {}
        }
        function getKeyMemoryContext() {
            if (keyMemories.length === 0) return '';
            const recent = keyMemories.slice(-10);
            return '【关键记忆（不可遗忘）】\n' + recent.map(m => '· ' + m.text).join('\n');
        }
        function validateSummary(summary) {
            if (!summary) return { valid: false, missing: keyMemories.map(m => m.text), total: keyMemories.length };
            const keyTerms = keyMemories.map(m => m.text.slice(0, 6));
            const missing = [];
            keyTerms.forEach(t => {
                if (t && !summary.includes(t)) missing.push(t);
            });
            return { valid: missing.length === 0, missing: missing, total: keyMemories.length };
        }
        // Inject keyMemories into system prompt via global variable
        // gsp() will check window.__vnExtContext to append extended context
        window.__vnExtContext = function() {
            const memCtx = getKeyMemoryContext();
            const skillCtx = getSkillContext();
            const statusCtx = getStatusContext();
            const npcCtx = getNpcContext();
            return [memCtx, skillCtx, statusCtx, npcCtx].filter(Boolean).join('\n');
        };
        function getSkillContext() {
            const c = gch();
            if (!c.skills || Object.keys(c.skills).length === 0) return '';
            const skills = Object.entries(c.skills).map(([k, v]) => k + ' Lv.' + v).join('、');
            return '【玩家技能】' + skills;
        }
        function getStatusContext() {
            const s = gst();
            if (!s.statusEffects || Object.keys(s.statusEffects).length === 0) return '';
            const effects = Object.values(s.statusEffects).map(se => {
                const e = STATUS_EFFECTS[se.name];
                if (!e) return '';
                const timeLeft = Math.ceil(se.remaining / 60);
                return e.icon + e.name + '(' + timeLeft + 'm)';
            }).filter(Boolean).join('、');
            if (!effects) return '';
            return '【当前状态效果】' + effects + '，叙事中请体现状态影响。';
        }
        function getNpcContext() {
            const s = gst();
            if (!s.npcRel || Object.keys(s.npcRel).length === 0) return '';
            const rels = Object.entries(s.npcRel).map(([name, data]) => {
                const trust = data.trust || 0;
                const aff = data.affinity || 0;
                const npc = NPC_DATA[name];
                const info = npc ? '（' + npc.personality + '，' + npc.occupation + '）' : '';
                let level = '陌生人';
                if (trust >= 80) level = '挚友';
                else if (trust >= 60) level = '好友';
                else if (trust >= 40) level = '熟人';
                else if (trust >= 20) level = '认识';
                return name + info + '：信任' + trust + '/好感' + aff + ' → ' + level;
            }).join('；');
            return '【NPC关系网】' + rels + '。请在对话和互动中体现关系亲疏。';
        }

        // ===== 8. 日志回顾功能 =====
        let logEntries = [];
        let logBookmarks = [];
        function addLogEntry(type, text, chapterId) {
            logEntries.push({ type: type, text: text, chapter: chapterId || 0, time: Date.now() });
            if (logEntries.length > 500) logEntries.shift();
        }
        function addBookmark(text, note) {
            logBookmarks.push({ id: Date.now(), text: text, note: note || '', time: Date.now() });
            if (logBookmarks.length > 30) logBookmarks.shift();
            try { localStorage.setItem('vn_logBookmarks', JSON.stringify(logBookmarks)); } catch(e) {}
        }
        function loadBookmarks() {
            try { logBookmarks = JSON.parse(localStorage.getItem('vn_logBookmarks') || '[]'); } catch(e) { logBookmarks = []; }
        }
        loadBookmarks();
        // ===== Log viewer dedicated item preview (PC hover / mobile click) =====
        let _logTipEl = null;
        function _closeLogTip() {
            if (_logTipEl) { _logTipEl.remove(); _logTipEl = null; }
        }
        function _showLogTip(anchorEl, info, name) {
            _closeLogTip();
            const tip = document.createElement('div');
            tip.className = 'log-item-tip';
            const lines = info.split('\n');
            tip.innerHTML = '<div class="log-item-tip-title">' + (itemEmoji(name)) + ' ' + esc(name) + '</div>' +
                '<div class="log-item-tip-body">' + esc(lines.slice(1).join('\n')) + '</div>';
            document.body.appendChild(tip);
            _logTipEl = tip;
            const rect = anchorEl.getBoundingClientRect();
            const tipW = Math.min(280, tip.offsetWidth || 240);
            tip.style.width = tipW + 'px';
            let tx = rect.left + rect.width / 2 - tipW / 2;
            let ty = rect.top - tip.offsetHeight - 8;
            if (tx < 8) tx = 8;
            if (tx + tipW > window.innerWidth - 8) tx = window.innerWidth - 8 - tipW;
            if (ty < 8) ty = rect.bottom + 8;
            tip.style.left = tx + 'px';
            tip.style.top = ty + 'px';
        }
        function attachLogItemPreview(container) {
            if (!container) return;
            const boldEls = container.querySelectorAll('.auto-bold');
            boldEls.forEach(el => {
                if (el._logTipBound) return;
                el._logTipBound = true;
                const name = el.textContent.trim();
                // Use buildItemTooltipHTML via window to get item info
                const buildTooltip = window.buildItemTooltipHTML || function() { return null; };
                const info = buildTooltip(name);
                if (!info) return;
                if (hasHover) {
                    // PC: hover to show tooltip
                    el.style.cursor = 'help';
                    el.addEventListener('mouseenter', () => _showLogTip(el, info, name));
                    el.addEventListener('mouseleave', () => {
                        // Small delay to allow moving into tooltip
                        setTimeout(() => {
                            if (!el._tipHover) _closeLogTip();
                        }, 100);
                    });
                } else {
                    // Mobile: click to toggle tooltip
                    el.style.cursor = 'pointer';
                    el.addEventListener('click', (e) => {
                        e.stopPropagation();
                        if (_logTipEl && _logTipEl._anchor === el) {
                            _closeLogTip();
                        } else {
                            _showLogTip(el, info, name);
                            _logTipEl._anchor = el;
                            const closeHandler = (ev) => {
                                if (!_logTipEl || !_logTipEl.contains(ev.target)) {
                                    _closeLogTip();
                                    document.removeEventListener('click', closeHandler);
                                }
                            };
                            setTimeout(() => document.addEventListener('click', closeHandler), 10);
                        }
                    });
                }
            });
        }
        function searchLogs(query) {
            const q = (query || '').toLowerCase();
            return logEntries.filter(e => e.text.toLowerCase().includes(q));
        }
        function openLogViewer() {
            const d = document.createElement('div');
            d.className = 'modal-overlay';
            d.style.zIndex = '9998';
            const entries = logEntries.slice(-200).reverse();
            // Group entries by day
            const grouped = {};
            entries.forEach(e => {
                const day = new Date(e.time).toLocaleDateString();
                if (!grouped[day]) grouped[day] = [];
                grouped[day].push(e);
            });
            const typeColors = {narration:'#5c4028',npc:'#6b4c7a',player:'#3a5c7a',system:'#8a6b3a',craft:'#3a7c5a',event:'#b55a3a',skill:'#5a6b8a',trauma:'#8a3a3a',achievement:'#d4a03a',kill:'#3a3a3a',seasonal:'#4a7a5a',npc_encounter:'#6b4c7a'};
            let html = '<div style="display:flex;justify-content:space-between;margin-bottom:10px;">' +
                '<h3 style="color:#5c4028;">📜 叙事日志</h3>' +
                '<button class="btn-close" id="logClose">×</button></div>' +
                '<div style="display:flex;gap:6px;margin-bottom:10px;flex-wrap:wrap;">' +
                    '<input type="text" id="logSearch" placeholder="搜索日志/物品..." style="flex:1;padding:6px 10px;border:1.5px solid #c5b9a0;border-radius:4px;background:#fffef7;font-size:0.82rem;">' +
                    '<button class="btn-header" id="tabBookmark" style="padding:6px 10px;font-size:0.75rem;">⭐ 书签(' + logBookmarks.length + ')</button>' +
                '</div>' +
                '<div id="logBookmarkList" style="display:none;max-height:150px;overflow-y:auto;margin-bottom:10px;padding:6px;background:#f5ead5;border:1px dashed #c5b9a0;border-radius:4px;font-size:0.78rem;">';
            logBookmarks.forEach((b, i) => {
                html += '<div style="padding:4px 6px;border-bottom:1px dashed #c5b9a0;display:flex;justify-content:space-between;align-items:center;">' +
                    '<span style="flex:1;cursor:pointer;" data-bm="' + i + '">' + esc(b.text.slice(0, 50)) + (b.text.length > 50 ? '…' : '') + '</span>' +
                    '<button class="btn-close" data-delbm="' + i + '" style="font-size:0.7rem;padding:2px 6px;">×</button>' +
                    '</div>';
            });
            html += '</div>' +
                '<div id="logList" style="max-height:400px;overflow-y:auto;">';
            // Render grouped entries with item-aware text rendering
            Object.keys(grouped).sort().reverse().forEach(day => {
                html += '<div style="background:#f5ead5;padding:4px 8px;font-size:0.78rem;color:#8a6b3a;font-weight:bold;border-bottom:1px solid #c5b9a0;position:sticky;top:0;z-index:1;">📅 ' + day + '</div>';
                grouped[day].forEach(e => {
                    const time = new Date(e.time);
                    const t = time.getHours().toString().padStart(2,'0') + ':' + time.getMinutes().toString().padStart(2,'0');
                    const typeLabel = {narration:'叙事',npc:'NPC',player:'玩家',system:'系统',craft:'合成',event:'事件',skill:'技能',trauma:'创伤',achievement:'成就',kill:'击杀',seasonal:'季节',npc_encounter:'遭遇'}[e.type] || e.type;
                    const typeColor = typeColors[e.type] || '#8a6b3a';
                    const isBookmarked = logBookmarks.some(b => b.text === e.text);
                    const displayText = e.text.length > 150 ? e.text.slice(0, 150) + '…' : e.text;
                    const isTruncated = e.text.length > 150;
                    html += '<div class="log-entry" style="padding:6px 8px;border-bottom:1px dashed #c5b9a0;font-size:0.78rem;display:flex;gap:6px;align-items:flex-start;cursor:pointer;" data-text="' + esc(e.text.replace(/"/g, '&quot;')) + '" data-fulltext="' + esc(e.text.replace(/"/g, '&quot;')) + '">' +
                        '<span style="color:#b58b5a;font-size:0.7rem;white-space:nowrap;flex-shrink:0;">' + t + '</span>' +
                        '<span style="background:#e8d8b0;padding:0 4px;border-radius:2px;font-size:0.65rem;color:' + typeColor + ';white-space:nowrap;flex-shrink:0;">' + typeLabel + '</span>' +
                        '<span class="log-text" style="flex:1;min-width:0;line-height:1.5;">' + abold(displayText) + (isTruncated ? '<span class="log-expand-hint" style="color:#b58b5a;font-size:0.65rem;margin-left:4px;">展开</span>' : '') + '</span>' +
                        '<span class="bm-btn" style="cursor:pointer;font-size:0.8rem;flex-shrink:0;' + (isBookmarked ? 'color:#d4a03a;' : 'color:#ccc;') + '">⭐</span>' +
                        '</div>';
                });
            });
            html += '</div>';
            d.innerHTML = '<div class="modal-panel log-viewer-panel" style="max-width:680px;">' + html + '</div>';
            document.body.appendChild(d);
            const listEl = d.querySelector('#logList');
            const bookmarkList = d.querySelector('#logBookmarkList');
            const tabBtn = d.querySelector('#tabBookmark');
            d.querySelector('#logClose').onclick = () => d.remove();
            // Bind item preview after DOM insertion (PC hover / mobile click)
            attachLogItemPreview(listEl);
            // Bookmark tab toggle
            tabBtn.onclick = () => {
                bookmarkList.style.display = bookmarkList.style.display === 'none' ? 'block' : 'none';
            };
            // Bookmark item click to jump
            bookmarkList.querySelectorAll('[data-bm]').forEach(el => {
                el.onclick = () => {
                    const idx = parseInt(el.dataset.bm);
                    const bm = logBookmarks[idx];
                    if (bm) {
                        const items = listEl.querySelectorAll('[data-text]');
                        items.forEach(item => {
                            if (item.dataset.text === bm.text.replace(/"/g, '&quot;')) {
                                item.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                item.style.background = '#fff5d6';
                                setTimeout(() => { item.style.background = ''; }, 1500);
                            }
                        });
                    }
                };
            });
            // Delete bookmark
            bookmarkList.querySelectorAll('[data-delbm]').forEach(el => {
                el.onclick = () => {
                    const idx = parseInt(el.dataset.delbm);
                    logBookmarks.splice(idx, 1);
                    try { localStorage.setItem('vn_logBookmarks', JSON.stringify(logBookmarks)); } catch(e) {}
                    openLogViewer();
                };
            });
            // Star click to bookmark
            listEl.querySelectorAll('.bm-btn').forEach(btn => {
                btn.onclick = (ev) => {
                    ev.stopPropagation();
                    const parent = btn.closest('[data-text]');
                    if (!parent) return;
                    const text = parent.dataset.text;
                    const existing = logBookmarks.find(b => b.text === text);
                    if (existing) {
                        logBookmarks = logBookmarks.filter(b => b.text !== text);
                        btn.style.color = '#ccc';
                    } else {
                        addBookmark(text, '');
                        btn.style.color = '#d4a03a';
                        tst('⭐ 已添加书签');
                    }
                    try { localStorage.setItem('vn_logBookmarks', JSON.stringify(logBookmarks)); } catch(e) {}
                };
            });
            // Click log entry to expand/collapse full text
            listEl.querySelectorAll('.log-entry').forEach(entry => {
                entry.addEventListener('click', () => {
                    const fullText = entry.dataset.fulltext || '';
                    const textSpan = entry.querySelector('.log-text');
                    if (!textSpan) return;
                    if (entry._expanded) {
                        // Collapse
                        entry._expanded = false;
                        const shortText = fullText.length > 150 ? fullText.slice(0, 150) + '…' : fullText;
                        textSpan.innerHTML = abold(shortText) + '<span class="log-expand-hint" style="color:#b58b5a;font-size:0.65rem;margin-left:4px;">展开</span>';
                    } else {
                        // Expand
                        entry._expanded = true;
                        textSpan.innerHTML = abold(fullText) + '<span class="log-expand-hint" style="color:#b58b5a;font-size:0.65rem;margin-left:4px;">收起</span>';
                    }
                    attachLogItemPreview(entry);
                });
            });
            // Search with item-aware rendering
            d.querySelector('#logSearch').oninput = (ev) => {
                const q = ev.target.value.toLowerCase();
                listEl.style.display = 'block';
                if (!q) {
                    // Reset to grouped view
                    let resetHtml = '';
                    Object.keys(grouped).sort().reverse().forEach(day => {
                        resetHtml += '<div style="background:#f5ead5;padding:4px 8px;font-size:0.78rem;color:#8a6b3a;font-weight:bold;border-bottom:1px solid #c5b9a0;">📅 ' + day + '</div>';
                        grouped[day].forEach(e => {
                            const time = new Date(e.time);
                            const t = time.getHours().toString().padStart(2,'0') + ':' + time.getMinutes().toString().padStart(2,'0');
                            const typeLabel = {narration:'叙事',npc:'NPC',player:'玩家',system:'系统',craft:'合成',event:'事件',skill:'技能',trauma:'创伤',achievement:'成就',kill:'击杀'}[e.type] || e.type;
                            const typeColor = typeColors[e.type] || '#8a6b3a';
                            const displayText = e.text.length > 150 ? e.text.slice(0, 150) + '…' : e.text;
                            resetHtml += '<div class="log-entry" style="padding:6px 8px;border-bottom:1px dashed #c5b9a0;font-size:0.78rem;display:flex;gap:6px;align-items:flex-start;cursor:pointer;" data-text="' + esc(e.text.replace(/"/g, '&quot;')) + '" data-fulltext="' + esc(e.text.replace(/"/g, '&quot;')) + '">' +
                                '<span style="color:#b58b5a;font-size:0.7rem;white-space:nowrap;flex-shrink:0;">' + t + '</span>' +
                                '<span style="background:#e8d8b0;padding:0 4px;border-radius:2px;font-size:0.65rem;color:' + typeColor + ';white-space:nowrap;flex-shrink:0;">' + typeLabel + '</span>' +
                                '<span class="log-text" style="flex:1;min-width:0;line-height:1.5;">' + abold(displayText) + '</span>' +
                                '</div>';
                        });
                    });
                    listEl.innerHTML = resetHtml;
                    attachLogItemPreview(listEl);
                    // Rebind click handlers
                    listEl.querySelectorAll('.log-entry').forEach(entry => {
                        entry.addEventListener('click', () => {
                            const fullText = entry.dataset.fulltext || '';
                            const textSpan = entry.querySelector('.log-text');
                            if (!textSpan) return;
                            if (entry._expanded) {
                                entry._expanded = false;
                                const shortText = fullText.length > 150 ? fullText.slice(0, 150) + '…' : fullText;
                                textSpan.innerHTML = abold(shortText);
                            } else {
                                entry._expanded = true;
                                textSpan.innerHTML = abold(fullText);
                            }
                            attachLogItemPreview(entry);
                        });
                    });
                } else {
                    const filtered = logEntries.filter(e => e.text.toLowerCase().includes(q)).reverse();
                    listEl.innerHTML = filtered.map(e => {
                        const time = new Date(e.time);
                        const t = time.getHours().toString().padStart(2,'0') + ':' + time.getMinutes().toString().padStart(2,'0');
                        const typeLabel = {narration:'叙事',npc:'NPC',player:'玩家',system:'系统',craft:'合成',event:'事件',skill:'技能',trauma:'创伤',achievement:'成就',kill:'击杀'}[e.type] || e.type;
                        const typeColor = typeColors[e.type] || '#8a6b3a';
                        const displayText = e.text.length > 300 ? e.text.slice(0, 300) + '…' : e.text;
                        return '<div class="log-entry" style="padding:6px 8px;border-bottom:1px dashed #c5b9a0;font-size:0.78rem;display:flex;gap:6px;align-items:flex-start;cursor:pointer;" data-text="' + esc(e.text.replace(/"/g, '&quot;')) + '" data-fulltext="' + esc(e.text.replace(/"/g, '&quot;')) + '">' +
                            '<span style="color:#b58b5a;font-size:0.7rem;white-space:nowrap;flex-shrink:0;">' + t + '</span>' +
                            '<span style="background:#e8d8b0;padding:0 4px;border-radius:2px;font-size:0.65rem;color:' + typeColor + ';white-space:nowrap;flex-shrink:0;">' + typeLabel + '</span>' +
                            '<span class="log-text" style="flex:1;min-width:0;line-height:1.5;">' + abold(displayText) + '</span>' +
                            '</div>';
                    }).join('');
                    attachLogItemPreview(listEl);
                    // Rebind click handlers
                    listEl.querySelectorAll('.log-entry').forEach(entry => {
                        entry.addEventListener('click', () => {
                            const fullText = entry.dataset.fulltext || '';
                            const textSpan = entry.querySelector('.log-text');
                            if (!textSpan) return;
                            if (entry._expanded) {
                                entry._expanded = false;
                                const shortText = fullText.length > 300 ? fullText.slice(0, 300) + '…' : fullText;
                                textSpan.innerHTML = abold(shortText);
                            } else {
                                entry._expanded = true;
                                textSpan.innerHTML = abold(fullText);
                            }
                            attachLogItemPreview(entry);
                        });
                    });
                }
            };
        }

        // ===== 9. 成就系统 =====
        const ACH_KEY = 'vn_achievements';
        const unlockedAchievements = new Set();
        // 从localStorage加载已解锁成就，避免刷新后重复弹出
        try {
            const saved = localStorage.getItem(ACH_KEY);
            if (saved) {
                JSON.parse(saved).forEach(id => unlockedAchievements.add(id));
            }
        } catch(e) {}
        function saveAchievements() {
            try {
                localStorage.setItem(ACH_KEY, JSON.stringify([...unlockedAchievements]));
            } catch(e) {}
        }
        function checkAchievements() {
            ACHIEVEMENTS.forEach(a => {
                if (!unlockedAchievements.has(a.id) && a.check()) {
                    unlockedAchievements.add(a.id);
                    saveAchievements();
                    tst('🏆 成就解锁：' + a.name + ' — ' + a.desc);
                    playSfx('levelup');
                    addLogEntry('achievement', '成就解锁：' + a.name);
                    logEvent('achievement', '成就解锁：' + a.name);
                }
            });
        }
        // 渲染成就面板
        function renderAchievementsPanel() {
            const list = $('achievementsList');
            if (!list) return;
            list.innerHTML = '';
            ACHIEVEMENTS.forEach(a => {
                const unlocked = unlockedAchievements.has(a.id);
                const el = document.createElement('div');
                el.className = 'achievement-item' + (unlocked ? '' : ' locked');
                el.innerHTML = '<div class="ach-icon">' + a.icon + '</div>' +
                    '<div class="ach-info">' +
                    '<div class="ach-name">' + esc(a.name) + (unlocked ? ' ✓' : ' 🔒') + '</div>' +
                    '<div class="ach-desc">' + esc(a.desc) + '</div>' +
                    '</div>';
                list.appendChild(el);
            });
        }
        // 事件记录存储（用于事件面板显示）
        let eventDisplayLog = [];
        function logEvent(type, text) {
            const clk = gclk();
            eventDisplayLog.unshift({ type, text, time: fmtTime(clk.elapsedSec) + ' D' + (clk.day || 1) });
            if (eventDisplayLog.length > 50) eventDisplayLog.pop();
        }
        // 渲染事件面板
        function renderEventsPanel() {
            const list = $('eventsList');
            if (!list) return;
            if (eventDisplayLog.length === 0) {
                list.innerHTML = '<div style="text-align:center;color:var(--text-muted);padding:20px;">暂无突发事件记录</div>';
                return;
            }
            list.innerHTML = '';
            eventDisplayLog.forEach(e => {
                const el = document.createElement('div');
                el.className = 'event-item';
                el.innerHTML = '<div class="ev-time">' + esc(e.time) + '</div>' + esc(e.text);
                list.appendChild(el);
            });
        }

        // Check achievements periodically
        setInterval(checkAchievements, 15000);

        // ===== 突发事件系统 =====
        const EVENT_TRIGGERS = {
            onLowHealth: (s) => {
                if (s.hp < 30 && Math.random() < 0.3) {
                    snotify('status', '警告', '生命值偏低！');
                    logEvent('warning', '生命值偏低！');
                    addLogEntry('event', '事件：生命危机');
                }
            },
            onLowHunger: (s) => {
                if (s.hunger < 20 && Math.random() < 0.4) {
                    snotify('status', '警告', '饥饿难耐！');
                    logEvent('warning', '饥饿难耐！');
                    addLogEntry('event', '事件：严重饥饿');
                }
            },
            onNightfall: (clk) => {
                if (clk && clk.elapsedSec && (clk.elapsedSec % 86400 > 64800) && (clk.elapsedSec % 86400 < 72000)) {
                    if (Math.random() < 0.15) {
                        snotify('info', '夜晚', '夜幕降临，注意安全');
                        logEvent('info', '夜幕降临，注意安全');
                    }
                }
            },
            onZombieThreat: (s) => {
                if (s.hp < 50 && s.infection > 30 && Math.random() < 0.2) {
                    snotify('danger', '威胁', '尸群正在逼近！');
                    logEvent('danger', '尸群正在逼近！');
                    addLogEntry('event', '事件：尸群逼近');
                }
            }
        };

        function checkRandomEvents() {
            const s = gst();
            const clk = gclk();
            if (!s || cfg().debug) return;
            Object.values(EVENT_TRIGGERS).forEach(fn => {
                try { fn(s, clk); } catch(e) {}
            });
        }

        // Check events periodically
        setInterval(checkRandomEvents, 30000);

        // ===== 7. 存档导出/导入 =====
        function exportSave() {
            const data = {
                cfg: cfg(),
                chr: gch(),
                sta: gst(),
                clk: gclk(),
                sbx: gsbx(),
                hist: _getHist(),
                exportTime: new Date().toISOString(),
                version: '2.0'
            };
            const json = JSON.stringify(data, null, 2);
            const blob = new Blob([json], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'ZDay存档_' + new Date().toISOString().slice(0,10) + '.json';
            a.click();
            URL.revokeObjectURL(url);
            tst('存档已导出');
            playSfx('success');
        }

        function importSave(file) {
            const reader = new FileReader();
            reader.onload = async (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    if (!data.cfg || !data.sta) throw new Error('存档文件格式错误');
                    stopIdle();
                    // Cross-player detection
                    const curChr = gch();
                    const bkChr = data.chr || {};
                    const bkName = bkChr.cn || bkChr.characterName || '未知角色';
                    const curName = curChr.cn || curChr.characterName || '当前角色';
                    if (bkName !== curName) {
                        if (!await sketchConfirm('⚠️ 检测到这不是当前玩家的存档！\n\n当前角色：' + curName + '\n备份角色：' + bkName + '\n\n这是来自另一个玩家/角色的存档，将完全覆盖当前进度。\n\n确定要继续导入吗？此操作不可撤销！')) return;
                    }
                    if (!await sketchConfirm('确定要导入该存档吗？当前所有进度将被覆盖。此操作不可撤销。')) return;
                    if (data.hist) _setHist(data.hist);
                    if (data.sta) { sst(migrateSta(data.sta)); }
                    if (data.chr) sch(migrateChr(data.chr));
                    if (data.clk) sclk(data.clk);
                    if (data.sbx) { _setSbx(mergeSbx(data.sbx)); ssbx(_getSbx()); }
                    if (data.cfg) scf(migrateCfg(data.cfg));
                    if (data.hist) svh(data.hist);
                    rbt(); upui();
                    tst('存档已导入');
                    playSfx('levelup');
                } catch(err) {
                    tst('导入失败：' + err.message);
                    playSfx('fail');
                }
            };
            reader.readAsText(file);
        }

        function openImportDialog() {
            const d = document.createElement('div');
            d.className = 'modal-overlay';
            d.style.zIndex = '9998';
            d.innerHTML = '<div class="modal-panel" style="max-width:360px;text-align:center;">' +
                '<h3 style="color:#5c4028;margin-bottom:10px;">📥 导入存档</h3>' +
                '<p style="font-size:0.82rem;margin-bottom:16px;">选择之前导出的 JSON 存档文件</p>' +
                '<input type="file" id="importFile" accept=".json" style="margin-bottom:16px;">' +
                '<div style="display:flex;gap:8px;justify-content:center;">' +
                '<button class="btn-header" id="importCancel">取消</button>' +
                '<button class="btn-header" id="importOk" style="background:#3a7c3a;color:#fff;">导入</button>' +
                '</div></div>';
            document.body.appendChild(d);
            d.querySelector('#importCancel').onclick = () => d.remove();
            d.querySelector('#importOk').onclick = () => {
                const file = d.querySelector('#importFile').files[0];
                if (!file) { tst('请选择一个JSON文件'); return; }
                d.remove();
                importSave(file);
            };
        }

        // ===== 11. 多结局系统 =====
        function calculateEnding() {
            const s = gst();
            const c = gch();
            const clk = gclk();
            const days = clk.day || 0;
            const kills = s.totalKills || 0;
            const trustCount = Object.values(NPC_DATA).filter(n => n.trust >= 60).length;
            const morality = c.morality || 'survival-first';
            const hasBetrayal = s.traumas && s.traumas.some(t => t.includes('背叛'));
            if (hasBetrayal) return ENDING_CONDITIONS[5];
            if (days >= 30 && trustCount >= 3 && kills > 20) return ENDING_CONDITIONS[0];
            if (days >= 20 && trustCount >= 2) return ENDING_CONDITIONS[1];
            if (days >= 15 && kills > 15) return ENDING_CONDITIONS[6];
            if (days >= 15) return ENDING_CONDITIONS[2];
            return ENDING_CONDITIONS[3];
        }

        function showEndingScreen() {
            const ending = calculateEnding();
            const c = gch();
            const clk = gclk();
            const s = gst();
            const days = clk.day || 0;
            const kills = s.totalKills || 0;
            const invCount = (s.inv || []).length;
            const trustCount = Object.values(NPC_DATA).filter(n => n.trust >= 60).length;
            let detail = ending.detail
                .replace('{days}', days)
                .replace('{kills}', kills)
                .replace('{trust}', trustCount)
                .replace('{inv}', invCount)
                .replace('{betrayer}', s.npcRel ? Object.keys(s.npcRel)[0] || '某人' : '某人');
            const d = document.createElement('div');
            d.className = 'modal-overlay';
            d.style.zIndex = '10000';
            d.innerHTML = '<div class="modal-panel" style="max-width:520px;text-align:center;padding:40px 30px;background:#fffef7;border:2px solid ' + ending.color + ';">' +
                '<div style="font-size:4rem;margin-bottom:16px;filter:url(#mid);">' + ending.icon + '</div>' +
                '<h2 style="color:' + ending.color + ';margin-bottom:12px;filter:url(#mid);font-size:1.8rem;">' + ending.name + '</h2>' +
                '<p style="font-size:1rem;color:#5a4e3e;margin-bottom:8px;font-weight:bold;">' + ending.intro.replace('{days}', days) + '</p>' +
                '<p style="font-size:0.88rem;color:#6a5e4e;margin-bottom:16px;line-height:1.8;">' + detail + '</p>' +
                '<blockquote style="border-left:3px solid ' + ending.color + ';padding-left:12px;color:' + ending.color + ';font-style:italic;margin:12px 0;font-size:0.9rem;">' + ending.poem + '</blockquote>' +
                '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:16px 0;font-size:0.82rem;color:#7a6b5a;">' +
                    '<div>存活天数: <strong>' + days + '</strong></div>' +
                    '<div>击杀敌人: <strong>' + kills + '</strong></div>' +
                    '<div>物资收集: <strong>' + invCount + '</strong></div>' +
                    '<div>信任伙伴: <strong>' + trustCount + '</strong></div>' +
                '</div>' +
                '<button class="btn-header" id="endingRestart" style="background:' + ending.color + ';color:#fff;margin-top:12px;">重新开始</button>' +
                '</div>';
            document.body.appendChild(d);
            playSfx('ending');
            d.querySelector('#endingRestart').onclick = () => {
                d.remove();
                stg();
                location.reload();
            };
        }

        // ===== 音效扩展 =====
        const sfxExt = {
            'craft': { freq: [440, 660, 880], type: 'triangle', dur: 0.08, vol: 0.35 },
            'counter': { freq: 330, type: 'square', dur: 0.15, vol: 0.3 },
            'hurt': { freq: 220, type: 'sawtooth', dur: 0.2, vol: 0.4 },
            'status': { freq: 880, type: 'sine', dur: 0.08, vol: 0.25 },
            'success': { freq: [523, 659, 784], type: 'sine', dur: 0.12, vol: 0.35 },
            'ending': { freq: [262, 330, 392, 523], type: 'sine', dur: 0.3, vol: 0.3 },
            'ambient_night': { type: 'loop', freq: 80, vol: 0.08 },
            'ambient_rain': { type: 'noise', vol: 0.1 },
            'ambient_wind': { type: 'noise', vol: 0.05 },
            'ambient_thunder': { freq: 80, type: 'sawtooth', dur: 0.8, vol: 0.4 },
            'ui_click': { freq: 600, type: 'sine', dur: 0.03, vol: 0.2 },
            'ui_hover': { freq: 1000, type: 'sine', dur: 0.02, vol: 0.1 },
            'ui_alert': { freq: [600, 800], type: 'sine', dur: 0.1, vol: 0.3 },
            'footstep': { freq: 200, type: 'triangle', dur: 0.05, vol: 0.15 },
            'door': { freq: 150, type: 'sawtooth', dur: 0.15, vol: 0.25 },
            'danger_alarm': { freq: [400, 200, 400, 200], type: 'square', dur: 0.15, vol: 0.4 }
        };

        // Update original playSfx to route through sfxExt first
        window.playSfx = function(type) {
            if (!window.audioCtx) {
                try { window.audioCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch(e) { return; }
            }
            if (!window.audioCtx) return;
            if (sfxExt[type]) {
                const conf = sfxExt[type];
                if (conf.type === 'loop' || conf.type === 'noise') {
                    playNoiseAmbient(conf);
                    return;
                }
                if (Array.isArray(conf.freq)) {
                    conf.freq.forEach((f, i) => {
                        setTimeout(() => playTone(f, conf.dur, conf.type, conf.vol), i * 80);
                    });
                } else if (conf.freq !== undefined) {
                    playTone(conf.freq, conf.dur, conf.type, conf.vol);
                }
                return;
            }
            // Default sounds
            const defaults = {
                'click': () => playTone(800, 0.05, 'sine', 0.4),
                'send': () => { playTone(600, 0.08, 'triangle', 0.4); setTimeout(() => playTone(800, 0.06, 'triangle', 0.3), 40); },
                'notify': () => playTone(1200, 0.1, 'sine', 0.35),
                'warn': () => playTone(300, 0.15, 'sawtooth', 0.4),
                'danger': () => { playTone(200, 0.25, 'sawtooth', 0.5); setTimeout(() => playTone(150, 0.2, 'sawtooth', 0.4), 100); },
                'victory': () => { playTone(523, 0.12, 'sine', 0.4); setTimeout(() => playTone(659, 0.12, 'sine', 0.4), 100); setTimeout(() => playTone(784, 0.2, 'sine', 0.4), 200); },
                'levelup': () => { playTone(440, 0.1, 'sine', 0.4); setTimeout(() => playTone(554, 0.1, 'sine', 0.4), 80); setTimeout(() => playTone(659, 0.15, 'sine', 0.4), 160); setTimeout(() => playTone(880, 0.25, 'sine', 0.4), 240); },
                'pickup': () => { playTone(1000, 0.06, 'sine', 0.35); setTimeout(() => playTone(1300, 0.08, 'sine', 0.3), 50); },
                'drop': () => playTone(300, 0.15, 'triangle', 0.35),
                'heal': () => { playTone(500, 0.2, 'sine', 0.3); setTimeout(() => playTone(700, 0.25, 'sine', 0.3), 100); },
                'equip': () => { playTone(700, 0.08, 'square', 0.25); setTimeout(() => playTone(500, 0.12, 'square', 0.2), 60); },
                'fail': () => { playTone(300, 0.15, 'sawtooth', 0.35); setTimeout(() => playTone(200, 0.25, 'sawtooth', 0.3), 100); },
                'tab': () => playTone(1000, 0.03, 'sine', 0.2),
                'open': () => playTone(400, 0.06, 'sine', 0.3),
                'close': () => playTone(300, 0.05, 'sine', 0.25)
            };
            if (defaults[type]) defaults[type]();
        };

        // Noise-based ambient sounds
        let ambientNode = null;
        let ambientGain = null;
        function playNoiseAmbient(conf) {
            if (!window.audioCtx) return;
            if (ambientNode) {
                try { ambientNode.stop(); } catch(e) {}
                ambientNode = null;
            }
            const ctx = window.audioCtx;
            if (conf.type === 'loop' && conf.freq) {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'sine';
                osc.frequency.value = conf.freq;
                gain.gain.value = conf.vol;
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start();
                ambientNode = osc;
                ambientGain = gain;
            } else if (conf.type === 'noise') {
                const bufferSize = ctx.sampleRate * 2;
                const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
                const data = buffer.getChannelData(0);
                for (let i = 0; i < bufferSize; i++) {
                    data[i] = Math.random() * 2 - 1;
                }
                const source = ctx.createBufferSource();
                source.buffer = buffer;
                source.loop = true;
                const gain = ctx.createGain();
                gain.gain.value = conf.vol;
                const filter = ctx.createBiquadFilter();
                filter.type = 'lowpass';
                filter.frequency.value = 800;
                source.connect(filter);
                filter.connect(gain);
                gain.connect(ctx.destination);
                source.start();
                ambientNode = source;
                ambientGain = gain;
            }
        }
        function stopAmbient() {
            if (ambientNode) {
                try { ambientNode.stop(); } catch(e) {}
                ambientNode = null;
            }
        }

        function triggerDeathEnding(s) {
            if (s.deathProcessed) return;
            s.deathProcessed = true;
            playSfx('death');
            // Show death notification
            const deathReasons = [
                '你因伤势过重而倒下...',
                '失血过多，意识逐渐模糊...',
                '感染的伤口最终夺走了你的生命...',
                '寒冷的天气让你永远睡去...',
                '饥饿和疲劳最终击垮了你...'
            ];
            const reason = deathReasons[Math.floor(Math.random() * deathReasons.length)];
            // Add death scene to log
            addLogEntry('system', '【死亡结局】' + reason + ' 你存活了' + (gclk().day || 1) + '天。');
            // Show ending modal after delay
            setTimeout(() => {
                generateDeathEnding(s, reason);
            }, 2000);
        }
        function generateDeathEnding(s, reason) {
            // Save death location for easter egg
            const deathLocation = s.location || '废弃公寓';
            const deathDay = gclk().day || 1;
            const deathKills = s.totalKills || 0;
            const deathClues = (s.clues && s.clues.length) || 0;
            // Store death info for new character easter egg
            try {
                localStorage.setItem('dz_death_info', JSON.stringify({
                    location: deathLocation,
                    day: deathDay,
                    kills: deathKills,
                    clues: deathClues,
                    reason: reason,
                    timestamp: Date.now()
                }));
            } catch(e) {}

            const d = document.createElement('div');
            d.className = 'modal-overlay';
            d.style.zIndex = '10005';
            d.innerHTML = '<div class="modal-panel" style="max-width:400px;text-align:center;padding:30px 24px;">' +
                '<div style="font-size:2.5rem;margin-bottom:12px;">💀</div>' +
                '<h3 style="color:var(--color-danger);margin-bottom:12px;">末日终结</h3>' +
                '<p style="font-size:0.82rem;color:var(--ink-soft);line-height:1.6;margin-bottom:16px;">' +
                    esc(reason) + '<br><br>' +
                    '存活天数：' + deathDay + ' 天<br>' +
                    '击杀数：' + deathKills + '<br>' +
                    '解锁线索：' + deathClues + ' 条<br>' +
                    '死亡地点：' + esc(deathLocation) +
                '</p>' +
                '<div style="font-size:0.7rem;color:var(--text-muted);margin-bottom:16px;">' +
                    '"在这片废墟中，你的故事画上了句号。但末日仍在继续..."' +
                '</div>' +
                '<div style="display:flex;flex-direction:column;gap:8px;justify-content:center;">' +
                    '<button class="btn-header accent" id="deathNewChar" style="width:100%;">创建新角色</button>' +
                    '<button class="btn-header" id="deathLoadSave" style="width:100%;">读取最近存档</button>' +
                    '<button class="btn-header" id="deathViewStats" style="width:100%;font-size:0.7rem;">查看结局统计</button>' +
                '</div>' +
            '</div>';
            document.body.appendChild(d);
            // Create new character
            d.querySelector('#deathNewChar').onclick = () => {
                d.remove();
                ccb();
                sst(JSON.parse(JSON.stringify(DSTA)));
                svh([]);
                stopIdle();
                rbt(); upui();
                // Clear death flag so new character can die
                const newSta = gst();
                if (newSta) { newSta.deathShown = false; newSta.deathProcessed = false; sst(newSta); }
                $('charModal').style.display = 'flex';
                tst('新角色已创建。前一个角色的死亡地点：' + deathLocation);
            };
            // Load most recent save
            d.querySelector('#deathLoadSave').onclick = () => {
                d.remove();
                // Try to load from slot 0 (auto-save) or most recent
                const saves = [];
                for (let i = 0; i < 10; i++) {
                    try {
                        const data = localStorage.getItem('dz_sav_' + i);
                        if (data) {
                            const parsed = JSON.parse(data);
                            saves.push({ slot: i, data: parsed, time: parsed.saveTime || 0 });
                        }
                    } catch(e) {}
                }
                if (saves.length === 0) {
                    tst('没有可用的存档');
                    return;
                }
                // Sort by time descending, get most recent
                saves.sort((a, b) => (b.time || 0) - (a.time || 0));
                const recent = saves[0];
                try {
                    const data = recent.data;
                    if (data.sta) {
                        const loadedSta = JSON.parse(data.sta);
                        loadedSta.deathShown = false;
                        loadedSta.deathProcessed = false;
                        sst(loadedSta);
                    }
                    if (data.chr) sch(JSON.parse(data.chr));
                    if (data.clk) sclk(JSON.parse(data.clk));
                    if (data.cfg) scf(JSON.parse(data.cfg));
                    if (data.hist) svh(JSON.parse(data.hist));
                    rbt(); upui();
                    tst('已从槽位' + recent.slot + '读取存档');
                } catch(e) {
                    tst('读取存档失败：' + e.message);
                }
            };
            // View ending stats
            d.querySelector('#deathViewStats').onclick = () => {
                d.remove();
                showEndingScreen();
            };
        }

        // ===== 全局初始化 =====
        window.GameSystems = {
            applyStatusEffect, tickStatusEffects, STATUS_EFFECTS,
            processCombatRound, calculateDamage, WEAPON_DATA,
            tryCraft, openCraftingModal, getCraftingRecipes, CRAFT_RECIPES,
            checkForRandomEvent, triggerRandomEvent, checkSeasonalEvent, RANDOM_EVENTS,
            addNpcRelationship, getNpcDialogue, getNpcDialogueOptions, processNpcInteraction, triggerNpcEncounter, openNpcPanel,
            NPC_DATA, NPC_RELATIONSHIPS,
            addKeyMemory, getKeyMemoryContext, validateSummary,
            getSkillContext, getStatusContext, getNpcContext,
            skills: NORMAL_SKILLS, abilities: ABILITIES,
            log: { add: addLogEntry, search: searchLogs, openViewer: openLogViewer, entries: () => logEntries.slice() },
            achievements: { check: checkAchievements, unlocked: unlockedAchievements, list: ACHIEVEMENTS },
            exportSave, openImportDialog, importSave,
            calculateEnding, showEndingScreen, ENDING_CONDITIONS,
            sfx: { play: window.playSfx, stopAmbient }
        };
        // Expose actual implementations to window._xxx so the first script block's forwarders can call them
        window._addLogEntry = addLogEntry;
        window._addKeyMemory = addKeyMemory;
        window._triggerRandomEvent = triggerRandomEvent;
        window._checkSeasonalEvent = checkSeasonalEvent;
        window._checkForRandomEvent = checkForRandomEvent;
        window._openLogViewer = openLogViewer;
        window._searchLogs = searchLogs;
        window._processNpcInteraction = processNpcInteraction;
        window._triggerNpcEncounter = triggerNpcEncounter;
        window._addNpcRelationship = addNpcRelationship;
        window._applyStatusEffect = applyStatusEffect;
        window._tickStatusEffects = tickStatusEffects;
        window._checkAchievements = checkAchievements;
        window.renderAchievementsPanel = renderAchievementsPanel;
        window.renderEventsPanel = renderEventsPanel;

        // Add buttons to settings panel
        setTimeout(() => {
            const btnBar = document.querySelector('.settings-buttons') || document.getElementById('settingsActions');
            if (btnBar) {
                const craftBtn = document.createElement('button');
                craftBtn.className = 'btn-header';
                craftBtn.innerHTML = '🔨 合成';
                craftBtn.onclick = openCraftingModal;
                btnBar.appendChild(craftBtn);
                const exportBtn = document.createElement('button');
                exportBtn.className = 'btn-header';
                exportBtn.innerHTML = '📤 导出存档';
                exportBtn.onclick = exportSave;
                btnBar.appendChild(exportBtn);
                const importBtn = document.createElement('button');
                importBtn.className = 'btn-header';
                importBtn.innerHTML = '📥 导入存档';
                importBtn.onclick = openImportDialog;
                btnBar.appendChild(importBtn);
                const logBtn = document.createElement('button');
                logBtn.className = 'btn-header';
                logBtn.innerHTML = '📜 日志';
                logBtn.onclick = openLogViewer;
                btnBar.appendChild(logBtn);
                const endBtn = document.createElement('button');
                endBtn.className = 'btn-header';
                endBtn.innerHTML = '🎬 查看结局';
                endBtn.onclick = showEndingScreen;
                btnBar.appendChild(endBtn);
                const npcBtn = document.createElement('button');
                npcBtn.className = 'btn-header';
                npcBtn.innerHTML = '👥 NPC关系';
                npcBtn.onclick = openNpcPanel;
                btnBar.appendChild(npcBtn);
            }
            // Add craft button to backpack
            const bpActions = document.querySelector('.backpack-actions');
            if (bpActions) {
                const bpCraft = document.createElement('button');
                bpCraft.className = 'btn-header';
                bpCraft.style.width = '100%';
                bpCraft.style.marginTop = '8px';
                bpCraft.innerHTML = '🔨 打开合成界面';
                bpCraft.onclick = openCraftingModal;
                bpActions.appendChild(bpCraft);
            }
            // Init auto BGM playback
            initAutoBGM();
        }, 1000);

        // Hook into AI response processing for events and features
        const origMds = window.mds;
        if (origMds) {
            window.mds = function(ch) {
                if (origMds) origMds(ch);
                if (ch && ch.kill) {
                    const s = gst();
                    s.totalKills = (s.totalKills || 0) + 1;
                    sst(s);
                    addLogEntry('kill', '击杀敌人');
                    playSfx('victory');
                }
                if (ch && ch.abilityLevel !== undefined) {
                    const c = gch();
                    addKeyMemory(c.cn + ' 异能等级提升', 'ability');
                }
            };
        }

        // Hook into AI text output for logging and post-processing
        const origPai = window.pai;
        let lastLoggedBubbleCount = 0;
        let eventTimer = null, npcTimer = null;
        // Reset log counter at the start of each AI turn (called by hin())
        window._resetPaiLog = function() { lastLoggedBubbleCount = 0; };
        if (origPai) {
            window.pai = function(raw) {
                const bubbles = origPai(raw);
                if (bubbles && bubbles.length) {
                    // Only log NEW bubbles (avoids duplicate logging during streaming mode
                    // where pai() is called repeatedly with growing `raw`)
                    for (let i = lastLoggedBubbleCount; i < bubbles.length; i++) {
                        const b = bubbles[i];
                        if (b.ty === 'narration' || b.ty === 'npc' || b.ty === 'player') {
                            addLogEntry(b.ty, b.tx || b.content || '');
                        }
                    }
                    lastLoggedBubbleCount = bubbles.length;
                    // Debounce random event & NPC encounter triggers so streaming mode
                    // (which calls pai() many times) only fires them once per AI turn.
                    if (eventTimer) clearTimeout(eventTimer);
                    eventTimer = setTimeout(() => {
                        if (Math.random() < 0.3) triggerRandomEvent();
                        eventTimer = null;
                    }, 2000);
                    if (npcTimer) clearTimeout(npcTimer);
                    npcTimer = setTimeout(() => {
                        if (Math.random() < 0.15) {
                            const enc = triggerNpcEncounter();
                            if (enc) addLogEntry('npc_encounter', '遇到' + enc.name);
                        }
                        npcTimer = null;
                    }, 2500);
                }
                // Auto-save after major events
                const clk = gclk();
                if (clk && clk.elapsedSec && clk.elapsedSec > 0 && clk.elapsedSec % 3600 < 30) {
                    checkSeasonalEvent();
                }
                // Periodic key memory save
                if (keyMemories.length > 0) {
                    try { localStorage.setItem('vn_keyMemories', JSON.stringify(keyMemories)); } catch(e) {}
                }
                return bubbles;
            };
        }

        // Start ambient environment system
        let ambientStarted = false;
        function updateAmbient() {
            if (!window.audioCtx) return;
            const clk = gclk();
            const hour = (clk.elapsedSec || 0) / 3600;
            const weather = clk.weather || '晴';
            let targetAmbient = null;
            if (weather === '雨') targetAmbient = 'ambient_rain';
            else if (weather === '雷暴') targetAmbient = 'ambient_rain';
            else if (weather === '雪') targetAmbient = 'ambient_wind';
            else if (hour >= 20 || hour < 6) targetAmbient = 'ambient_night';
            else targetAmbient = 'ambient_wind';
            const conf = sfxExt[targetAmbient];
            if (conf && conf.type === 'loop' && conf.freq) {
                if (!ambientStarted || ambientNode && ambientNode.frequency && Math.abs(ambientNode.frequency.value - conf.freq) > 5) {
                    playNoiseAmbient(conf);
                    ambientStarted = true;
                }
            }
        }
        setInterval(updateAmbient, 60000);
        updateAmbient();

        // Periodic status effects ticker (already exists at 5s interval)
        // Periodic random event checks during gameplay
        setInterval(() => {
            if (gst().hp > 0) triggerRandomEvent();
        }, 120000); // Check every 2 minutes

})(); // innerIIFE 结束

})(); // gamesystems.js 外层 IIFE 结束
