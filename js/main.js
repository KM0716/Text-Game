        (function() {
            const $ = id => document.getElementById(id);
            const K = { CFG: 'dz_cfg', STA: 'dz_sta', SAV: 'dz_sav', CHR: 'dz_chr', HIS: 'dz_his', THM: 'dz_thm', SBX: 'dz_sbx', CLK: 'dz_clk', SUM: 'dz_sum' };
            const AP = {
                openai: { ep: 'https://api.openai.com/v1/chat/completions', md: ['gpt-4o', 'gpt-4o-mini', 'gpt-4.1', 'gpt-4.1-mini'] },
                deepseek: { ep: 'https://api.deepseek.com/v1/chat/completions', md: ['deepseek-chat', 'deepseek-reasoner'] },
                ollama: { ep: 'http://localhost:11434/v1/chat/completions', md: ['llama3', 'mistral', 'qwen2.5'] },
                custom: { ep: '', md: [] }
            };

            // ========== 从 window 读取拆分到其他文件的常量/函数（本地别名）==========
            const DPROMPT = (window.DPROMPT != null) ? window.DPROMPT : '';
            const ABILITIES = (window.ABILITIES != null) ? window.ABILITIES : {};
            const NORMAL_SKILLS = (window.NORMAL_SKILLS != null) ? window.NORMAL_SKILLS : {};
            const DCLK = (window.DCLK != null) ? window.DCLK : {};
            const CATS = (window.CATS != null) ? window.CATS : {};
            const CAT_KW = (window.CAT_KW != null) ? window.CAT_KW : {};
            const SUB_ICONS = (window.SUB_ICONS != null) ? window.SUB_ICONS : {};
            const ITEM_EMOJI = (window.ITEM_EMOJI != null) ? window.ITEM_EMOJI : {};
            const ITEM_PRESETS = (window.ITEM_PRESETS != null) ? window.ITEM_PRESETS : {};
            // audio.js 暴露的 —— 使用安全包装，延迟读取 window，避免与 audio.js 加载时序的耦合问题
            const playSfx = (...a) => { if (typeof window.playSfx === 'function') return window.playSfx(...a); };
            const playTone = (...a) => { if (typeof window.playTone === 'function') return window.playTone(...a); };
            const tst = (...a) => { if (typeof window.tst === 'function') return window.tst(...a); };
            const esc = (s) => { if (typeof window.esc === 'function') return window.esc(s); const d = document.createElement('div'); d.textContent = s == null ? '' : s; return d.innerHTML; };
            const escAttr = (s) => { if (typeof window.escAttr === 'function') return window.escAttr(s); return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); };
            const scb = (...a) => { if (typeof window.scb === 'function') return window.scb(...a); };
            const sketchConfirm = (...a) => { if (typeof window.sketchConfirm === 'function') return window.sketchConfirm(...a); return Promise.resolve(false); };
            const sketchPrompt = (...a) => { if (typeof window.sketchPrompt === 'function') return window.sketchPrompt(...a); return Promise.resolve(''); };
            const bgmToggle = (...a) => { if (typeof window.bgmToggle === 'function') return window.bgmToggle(...a); };
            const bgmQuickPick = (...a) => { if (typeof window.bgmQuickPick === 'function') return window.bgmQuickPick(...a); };
            const bgmOpenPicker = (...a) => { if (typeof window.bgmOpenPicker === 'function') return window.bgmOpenPicker(...a); };
            const bgmAutoSwitch = (...a) => { if (typeof window.bgmAutoSwitch === 'function') return window.bgmAutoSwitch(...a); };
            const initAutoBGM = (...a) => { if (typeof window.initAutoBGM === 'function') return window.initAutoBGM(...a); };
            const toggleSfx = (...a) => { if (typeof window.toggleSfx === 'function') return window.toggleSfx(...a); };
            const launchTutorial = (...a) => { if (typeof window.launchTutorial === 'function') return window.launchTutorial(...a); };
            const bgmInit = (...a) => { if (typeof window.bgmInit === 'function') return window.bgmInit(...a); };
            const bgmPlay = (...a) => { if (typeof window.bgmPlay === 'function') return window.bgmPlay(...a); };
            const bgmPlayCategory = (...a) => { if (typeof window.bgmPlayCategory === 'function') return window.bgmPlayCategory(...a); };
            const bgmStop = (...a) => { if (typeof window.bgmStop === 'function') return window.bgmStop(...a); };
            const bgmSetVol = (...a) => { if (typeof window.bgmSetVol === 'function') return window.bgmSetVol(...a); };
            // sfxEnabled / BGM 在 audio.js 中维护，window.sfxEnabled 暴露的是其同步引用
            const sfxEnabled = () => 'sfxEnabled' in window ? window.sfxEnabled : (localStorage && localStorage.getItem('vn_sfx') !== '0');
            const BGM = () => window.BGM || { enabled: false, volume: 0.45, tracks: {}, _currentCategory: 'title' };
            // 注：hasHover 在下方 L462 正式定义（window.matchMedia 更严格版本），此处避免重复声明


            // ===== Default Sandbox Config (10 categories) =====
            const DSBX = {
                cat1: {
                    title: '一、时间与世界设施',
                    fields: {
                        dayLenSec: { label: '昼夜流速', type: 'number', val: 86400, hint: '游戏一天对应现实秒数，86400=真实时间，1200=20分钟' },
                        waterStopMode: { label: '停水模式', type: 'select', val: '随机', opts: ['随机','固定天数','永不停水'], hint: '城市供水何时中断' },
                        powerStopMode: { label: '停电模式', type: 'select', val: '随机', opts: ['随机','固定天数','永不停电'] },
                        foodRotSpeed: { label: '食物变质速度', type: 'select', val: '正常', opts: ['缓慢','正常','快速'], hint: '食物在背包中变质速度' },
                        itemRefresh: { label: '物资刷新间隔', type: 'select', val: '较长', opts: ['不刷新','较短','正常','较长'], hint: '离开区域后物资重新生成的频率' }
                    }
                },
                cat2: {
                    title: '二、天气与自然环境',
                    fields: {
                        baseTemp: { label: '基准气温(°C)', type: 'number', val: 12 },
                        rainFreq: { label: '降雨频率', type: 'select', val: '适中', opts: ['极少','较少','适中','频繁'] },
                        snowOn: { label: '是否降雪', type: 'toggle', val: false },
                        fogIntensity: { label: '雾气强度', type: 'select', val: '轻微', opts: ['无','轻微','中等','浓雾'] },
                        forageAmt: { label: '野外采集量', type: 'select', val: '适中', opts: ['稀缺','较少','适中','丰富'] }
                    }
                },
                cat3: {
                    title: '三、随机事件',
                    fields: {
                        eventFreq: { label: '事件触发频率', type: 'select', val: '适中', opts: ['极少','较少','适中','频繁'], hint: '探索时遭遇随机事件的概率' },
                        survivorProb: { label: '幸存者遭遇率', type: 'select', val: '较低', opts: ['极低','较低','适中','较高'] },
                        sleepEvent: { label: '睡眠突发事件', type: 'toggle', val: true }
                    }
                },
                cat4: {
                    title: '四、尸体与感染机制',
                    fields: {
                        corpseInfect: { label: '尸体感染风险', type: 'select', val: '中等', opts: ['无','低','中等','高'], hint: '接触尸体的感染概率' },
                        noiseFromCorpse: { label: '尸体吸引丧尸', type: 'toggle', val: true, hint: '尸体气味是否吸引丧尸聚集' }
                    }
                },
                cat5: {
                    title: '五、战利品（物资刷新率）',
                    fields: {
                        lootFood: { label: '食物', type: 'select', val: '适中', opts: ['无','极少','较少','适中','丰富','极丰富'] },
                        lootMedical: { label: '医疗用品', type: 'select', val: '较少', opts: ['无','极少','较少','适中','丰富','极丰富'] },
                        lootWeapon: { label: '武器', type: 'select', val: '较少', opts: ['无','极少','较少','适中','丰富','极丰富'] },
                        lootAmmo: { label: '弹药', type: 'select', val: '极少', opts: ['无','极少','较少','适中','丰富','极丰富'] },
                        lootSurvival: { label: '生存物资', type: 'select', val: '适中', opts: ['无','极少','较少','适中','丰富','极丰富'] },
                        lootMech: { label: '机械零件', type: 'select', val: '适中', opts: ['无','极少','较少','适中','丰富','极丰富'] }
                    }
                },
                cat6: {
                    title: '六、僵尸基础设置（核心）',
                    fields: {
                        zSpeed: { label: '丧尸移速', type: 'select', val: '蹒跚', opts: ['奔跑','快蹒跚','蹒跚'], hint: '丧尸的移动速度' },
                        zStrength: { label: '丧尸力量', type: 'select', val: '普通', opts: ['弱小','普通','强壮','极端'] },
                        infectMode: { label: '感染途径', type: 'select', val: '咬伤抓伤', opts: ['仅咬伤','咬伤抓伤','空气传播','无感染'] },
                        zVision: { label: '丧尸视力', type: 'select', val: '普通', opts: ['盲','差','普通','锐利'] },
                        zHearing: { label: '丧尸听力', type: 'select', val: '普通', opts: ['聋','差','普通','敏锐'] },
                        zActiveMode: { label: '活跃时段', type: 'select', val: '全天', opts: ['白天','夜间','全天'] }
                    }
                },
                cat7: {
                    title: '七、僵尸种群与密度',
                    fields: {
                        zTotalMult: { label: '丧尸密度', type: 'select', val: '适中', opts: ['稀少','较少','适中','密集','极密集'] }
                    }
                },
                cat8: {
                    title: '八、角色生存与人物属性',
                    fields: {
                        hungerRate: { label: '饥渴消耗速度', type: 'select', val: '正常', opts: ['缓慢','正常','快速','极快'] },
                        fatigueRate: { label: '疲劳积累速度', type: 'select', val: '正常', opts: ['缓慢','正常','快速','极快'] },
                        staminaRecover: { label: '耐力恢复速度', type: 'select', val: '正常', opts: ['缓慢','正常','快速'] },
                        woundInfect: { label: '伤口感染', type: 'select', val: '普通', opts: ['无','轻微','普通','严重'] },
                        starterPack: { label: '新手初始物资', type: 'toggle', val: true }
                    }
                },
                cat9: {
                    title: '九、载具系统',
                    fields: {
                        vehicleAvail: { label: '载具可用性', type: 'select', val: '较低', opts: ['极低','较低','适中','较高'], hint: '可发现的可用载具数量' }
                    }
                },
                cat10: {
                    title: '十、伦理与人性底线',
                    fields: {
                        moralityLevel: { label: '伦理底线', type: 'select', val: '生存优先', opts: ['严格守德','生存优先','道德相对','无底线'], hint: 'NPC和玩家行为的道德尺度，对应角色创建时的伦理底线' },
                        survivalRate: { label: '幸存概率', type: 'select', val: '灰暗艰难', opts: ['充满希望','灰暗艰难','绝望深渊'], hint: '整体世界基调，对应角色创建时的幸存概率' },
                        violenceLevel: { label: '暴力程度', type: 'select', val: '适中', opts: ['无','低','适中','高','极端'], hint: 'NPC冲突、战斗、死亡描写的详细程度' },
                        languageLevel: { label: '粗口程度', type: 'select', val: '适中', opts: ['干净','轻微','适中','强烈'], hint: 'NPC对话中的语言尺度' },
                        humanityDecay: { label: '人性衰减', type: 'select', val: '缓慢', opts: ['无','缓慢','正常','快速'], hint: 'NPC从文明到野蛮的转变速度' },
                        survivalOutlook: { label: '幸存者心态', type: 'select', val: '复杂', opts: ['乐观','务实','冷漠','绝望','复杂'], hint: '幸存者群体的普遍心理状态' },
                        trustLevel: { label: '陌生人信任度', type: 'select', val: '较低', opts: ['极低','较低','适中','较高'], hint: 'NPC对陌生玩家的初始信任程度' }
                    }
                }
            };

            // ===== Default Prompt Template =====
            // ===== Default Prompt Template（定义于 data.js 的 window.DPROMPT，此处略）=====

            const DCFG = {
                ep: 'https://api.openai.com/v1/chat/completions', key: '', model: 'gpt-4o',
                maxT: 2048, temp: 0.7, ctx: 24, tspd: 20, strm: true, fsz: '15px',
                prompt: DPROMPT, idleInt: 60, idleOn: false, idleDir: '休养', idleCustom: '',
                worldLock: false, lastSlot: null, debug: false
            };
            const DSTA = { hunger: 70, thirst: 70, fatigue: 20, bodyTemp: 36.8, injury: '无', enc: 5, hp: 100, maxHp: 100, inv: ['破损背包', '半瓶水', '手电筒', '压缩饼干x2', '绷带x2'], clues: [], status: [], vehicle: '无', mapUnlock: [], mentality: '稳定', spirit: 85, joy: 0, pleasureUnlocked: false, actionBar: [], location: '废弃公寓', traits: ['生存本能', '警觉'],
                equip: { head: '', body: '', legs: '', feet: '', weapon: '', offhand: '', backpack: '破损背包', accessory: '' },
                weaponDurability: {}, // 武器耐久: { '手枪': 85, '砍刀': 100 }
                ammo: {}, // 弹药: { '手枪子弹': 12, '步枪子弹': 30 }
                ability: null, abilityLevel: 0,
                bookmarks: [], // 收藏夹: [{id, text, time}]
                npcRel: {} // NPC关系: { '张三': { trust: 50, affinity: 30, lastMeet: day } }
            };
            const DCHR = {
                dn: '哈里斯病毒爆发', days: '第21天',
                zr: '行动缓慢，对声音高度敏感，可翻越低矮障碍物，无视觉但嗅觉灵敏。',
                env: '深秋，中型城市废墟，水电断绝，空气中有淡淡腐臭味。',
                geo: '内陆中型城市，三面环山，一条河流穿城而过，主要桥梁已被炸毁。',
                loc: '市中心医院、地下商场、城北军事基地、废弃学校、河边仓库区。',
                weather: '多阴雨，气温5-15°C，偶有大雾。',
                fac: '军方残余部队偶尔巡逻；幸存者营地隐匿郊区；掠夺者活跃商业区。',
                hist: '病毒经水源传播，三周内城市沦陷，军方撤离时炸毁了主要桥梁阻断交通。',
                res: '食物药品极度稀缺，弹药稀少，水源多受污染，木材金属相对易得。',
                wr: '伤口暴露可能感染；食物3-5天腐烂；噪音约50米吸引丧尸；夜间丧尸更活跃。',
                danger: '夜间极危险；商业区丧尸密集；郊区相对安全；医院是高风险高回报区域。',
                survival: 'grim',
                diff: '标准', god: false, hiddenPresets: [],
                morality: 'survival-first',
                cn: '幸存者', ca: '32', gd: '男', bt: '正常', ht: '175', wt: '70',
                job: '机械师', hand: '右', bt2: 'O',
                pers: '性格沉稳，遇事冷静，但对陌生人保持警惕，不轻易信任他人。',
                app: '短发，面容消瘦，左眉有一道旧疤，穿着沾满灰尘的工装。',
                skl: '机械维修\n基础驾驶\n简易工具制作',
                lang: '中文、基础英语',
                bg: '曾是工厂技工，有妻女，灾难中失散，独自求生至今，不确定家人是否存活。',
                mental: '焦虑',
                fear: '幽闭恐惧症，不擅长游泳。',
                tp: ['擅长修理机械', '动手能力强'], tn: ['轻微烟瘾', '右膝旧伤'],
                it: '破损背包、半瓶水、手电筒、多功能扳手', sp: '废弃公寓卧室',
                map: '公寓区域、商业区、市中心医院、地下商场、城北军事基地、废弃学校、河边仓库区、地铁网络、郊区营地、港口区域、西郊废弃加油站、东部乡镇集市、南郊别墅区、北方边境检查站',
                extraFeature: '', abilityName: '', abilityDesc: '', abilityPreset: ''
            };

            // Supernatural abilities (unlocked when extraFeature = '异能')

            // Normal survival skills (non-supernatural)

            // Game clock: { dayLenSec, elapsedSec, weather, temp, timeStr }

            // Backpack categories
            const CAT_ICONS = { food: '🍔', tool: '🔧', weapon: '⚔', material: '📦', medical: '✚', misc: '❓', survival: '🏕', clothing: '👕' };

            function itemEmoji(itemName) {
                const n = (itemName || '').toLowerCase();
                if (ITEM_EMOJI[n]) return ITEM_EMOJI[n];
                // Sort keys by length descending so more specific matches are found first
                const keys = Object.keys(ITEM_EMOJI).sort((a, b) => b.length - a.length);
                for (const key of keys) {
                    if (n.includes(key)) return ITEM_EMOJI[key];
                }
                if (/水|饮|食物|肉|菜|果|酒|糖|面包|饼干|罐头|巧克力/.test(itemName)) return '🍽️';
                if (/药|绷|医疗|酒精|口罩|疫苗|血清|血/.test(itemName)) return '⚕️';
                if (/枪|刀|剑|斧|锤|棍|棒|武器/.test(itemName)) return '⚔️';
                if (/手电|电池|火|蜡烛|工具|扳手|螺丝|钉|绳/.test(itemName)) return '🔧';
                if (/衣|鞋|帽|裤|手套|头盔|护目|面罩/.test(itemName)) return '👕';
                if (/手机|对讲|收音|电子|充电|信号/.test(itemName)) return '📱';
                if (/木|砖|塑料|金属|零件|材料/.test(itemName)) return '🧱';
                if (/钱|现金|卡|硬币|金/.test(itemName)) return '💰';
                if (/书|地图|笔记|文件|日记/.test(itemName)) return '📄';
                if (/车|自行|摩托|汽油/.test(itemName)) return '🚗';
                if (/钥匙|锁|门卡/.test(itemName)) return '🔑';
                return '📦';
            }
            function wrapEmoji(name) {
                const e = typeof itemEmoji === 'function' ? itemEmoji(name) : '📦';
                return '<span class="emoji-icon" data-item="' + esc(name) + '">' + e + '</span>';
            }
            // Parse item effect string (e.g. '饱腹+30 口渴+10') and apply changes to state
            function applyItemEffect(itemName) {
                const s = gst();
                if (!s) return [];
                const itemInfo = getItemInfo(itemName);
                const effects = [];
                // First try effect-based approach (existing mechanism)
                if (itemInfo && itemInfo.effect) {
                    const results = [];
                    const parts = itemInfo.effect.split(/\s+/);
                    const statMap = {
                        '饱腹': 'hunger', '口渴': 'thirst', '疲劳': 'fatigue',
                        '体温': 'bodyTemp', '精神': 'spirit', '欢愉': 'joy',
                        '血量': 'hp', '伤势': 'injury'
                    };
                    parts.forEach(part => {
                        const m = part.match(/^(.+?)([+-])(\d+(?:\.\d+)?)$/);
                        if (!m) return;
                        const label = m[1];
                        const sign = m[2];
                        const val = parseFloat(m[3]);
                        const key = statMap[label];
                        if (!key) return;
                        const cur = s[key];
                        if (cur === undefined || cur === null) return;
                        const delta = sign === '+' ? val : -val;
                        const min = (key === 'bodyTemp') ? 30 : (key === 'hp') ? 0 : 0;
                        const max = (key === 'bodyTemp') ? 45 : (key === 'hp') ? (s.maxHp || 100) : 100;
                        s[key] = Math.max(min, Math.min(max, (typeof cur === 'number' ? cur : 0) + delta));
                        results.push(label + sign + val);
                    });
                    // 处理文字型效果（非数值格式）
                    if (results.length === 0 && itemInfo.effect) {
                        const eff = itemInfo.effect;
                        if (/治疗轻伤|包扎|止血/.test(eff)) {
                            s.hp = Math.min(s.maxHp || 100, (s.hp || 50) + 15);
                            if (s.injury && s.injury !== '无') s.injury = '轻微';
                            results.push('生命+15');
                        } else if (/治疗重伤/.test(eff)) {
                            s.hp = Math.min(s.maxHp || 100, (s.hp || 50) + 35);
                            s.injury = '无';
                            results.push('生命+35 伤势痊愈');
                        } else if (/治疗感染|抗生素/.test(eff)) {
                            s.infection = 0;
                            s.hp = Math.min(s.maxHp || 100, (s.hp || 50) + 10);
                            results.push('感染消除');
                        } else if (/消除炎症|消炎/.test(eff)) {
                            if (s.status && s.status.includes('感染')) {
                                s.status = s.status.filter(st => st !== '感染');
                            }
                            s.infection = 0;
                            results.push('炎症消除');
                        } else if (/缓解疼痛|止痛/.test(eff)) {
                            s.spirit = Math.min(100, (s.spirit || 50) + 10);
                            results.push('精神+10');
                        } else if (/退烧/.test(eff)) {
                            s.bodyTemp = 37;
                            results.push('体温恢复正常');
                        } else if (/消毒/.test(eff)) {
                            s.infection = Math.max(0, (s.infection || 0) - 5);
                            results.push('消毒完成');
                        }
                    }
                    if (results.length > 0) {
                        sst(s);
                        upui();
                        return results;
                    }
                }
                // Fallback: category-based effect mapping
                if (itemInfo && itemInfo.category) {
                    const cat = itemInfo.category;
                    const sub = itemInfo.subCategory;
                    if (cat === 'consumable' && sub === 'food') {
                        s.hunger = Math.min(100, (s.hunger || 50) + 30);
                        effects.push('饱腹+30');
                    } else if (cat === 'consumable' && (sub === 'water' || sub === 'drink')) {
                        s.thirst = Math.min(100, (s.thirst || 50) + 30);
                        effects.push('口渴+30');
                    } else if (cat === 'consumable' && sub === 'medical') {
                        s.hp = Math.min(s.maxHp || 100, (s.hp || 50) + 20);
                        s.injury = '无';
                        effects.push('生命+20');
                    } else if (cat === 'equip' && sub === 'weapon') {
                        effects.push('武器已装备');
                    }
                }
                if (effects.length > 0) {
                    sst(s);
                    upui();
                }
                return effects;
            }
            // Smart item matching: exact > longest substring > substring with word boundary
            function getItemInfo(itemName) {
                if (!itemName) return null;
                const name = itemName.trim();
                // 1. Exact match (highest priority)
                if (ITEM_PRESETS[name]) return ITEM_PRESETS[name];
                // 2. Normalize: strip quantity suffixes like x2, x3, 1.5kg, 500g, 2L etc.
                const normalized = name.replace(/\s*(x\d+|\d+\.?\d*\s*[kKmMgGlL升克千克]?)$/i, '').trim();
                if (normalized !== name && ITEM_PRESETS[normalized]) return ITEM_PRESETS[normalized];
                // 3. Sort keys by length descending for more specific matches
                const keys = Object.keys(ITEM_PRESETS).sort((a, b) => b.length - a.length);
                // 3a. Check if the item contains a preset key AND the key is significant
                for (const key of keys) {
                    if (name.includes(key)) {
                        // For short keys (1-2 chars), require word boundary or significant context
                        if (key.length <= 2) {
                            // Check the char before and after the match
                            const idx = name.indexOf(key);
                            const before = idx > 0 ? name[idx - 1] : '';
                            const after = idx + key.length < name.length ? name[idx + key.length] : '';
                            // Accept if surrounded by non-Chinese chars (numbers, spaces, punctuation) or at boundaries
                            const boundaryOK = !before || !after ||
                                /[\d\s，。、；：,.;:!?！？（）()\[\]【】"'·-]/.test(before) ||
                                /[\d\s，。、；：,.;:!?！？（）()\[\]【】"'·-]/.test(after);
                            if (boundaryOK) return ITEM_PRESETS[key];
                            // Also accept if the key IS the item name (exact short key)
                            if (name === key) return ITEM_PRESETS[key];
                            continue;
                        }
                        // For longer keys (3+ chars), the substring match is trustworthy
                        return ITEM_PRESETS[key];
                    }
                }
                // 4. Try matching the normalized version
                if (normalized !== name) {
                    for (const key of keys) {
                        if (normalized.includes(key)) {
                            if (key.length <= 2) {
                                const idx = normalized.indexOf(key);
                                const before = idx > 0 ? normalized[idx - 1] : '';
                                const after = idx + key.length < normalized.length ? normalized[idx + key.length] : '';
                                const boundaryOK = !before || !after ||
                                    /[\d\s，。、；：,.;:!?！？（）()\[\]【】"'·-]/.test(before) ||
                                    /[\d\s，。、；：,.;:!?！？（）()\[\]【】"'·-]/.test(after);
                                if (boundaryOK) return ITEM_PRESETS[key];
                                if (normalized === key) return ITEM_PRESETS[key];
                                continue;
                            }
                            return ITEM_PRESETS[key];
                        }
                    }
                }
                // 5. Try semantic classification for unknown items
                const semantic = classifyItemSemantic(name) || (normalized !== name ? classifyItemSemantic(normalized) : null);
                if (semantic) {
                    return {
                        category: semantic.category,
                        subCategory: semantic.subCategory,
                        type: semantic.type,
                        desc: '（自动分类：' + semantic.category + ' - ' + semantic.subCategory + '）'
                    };
                }
                return null;
            }
            // Semantic item classification - properly categorize items by actual usage
            function classifyItemSemantic(itemName) {
                const name = (itemName || '').trim();
                if (!name) return { category: 'misc', subCategory: 'other', type: 'unknown' };
                
                // Container keywords - these are containers, not consumables
                const containerKeywords = ['袋', '背包', '包', '箱', '盒', '罐', '瓶', '壶', '桶', '囊', '储物', '收纳', '防水', '钱包', '腰包', '口袋'];
                // Water consumable keywords - actually drinkable water
                const waterKeywords = ['饮用水', '瓶装水', '矿泉水', '纯净水', '桶装水', '净水', '清水', '活水'];
                // Food keywords
                const foodKeywords = ['饼干', '面包', '罐头', '午餐肉', '沙丁鱼', '巧克力', '能量棒', '火腿', '香肠', '方便面', '压缩饼干', '口粮'];
                // Medical keywords
                const medicalKeywords = ['绷带', '药品', '抗生素', '止痛药', '消炎药', '退烧药', '酒精', '碘伏', '消毒', '口罩', '创可贴', '急救'];
                
                // Special handling for "water" containing items
                // Check if it's actually water (drinkable) vs container/water-resistant
                const isActuallyWater = waterKeywords.some(kw => name.includes(kw));
                const isContainer = containerKeywords.some(kw => name.includes(kw));
                
                // "防水布袋" is a container, not water
                if (name.includes('防水') || (name.includes('水') && isContainer)) {
                    return { category: 'tool', subCategory: 'container', type: 'equippable' };
                }
                
                // Check for actual water consumables
                if (isActuallyWater) {
                    return { category: 'consumable', subCategory: 'water', type: 'usable' };
                }
                
                // Check for containers
                if (isContainer && !name.includes('水')) {
                    return { category: 'tool', subCategory: 'container', type: 'equippable' };
                }
                
                // Check for food
                if (foodKeywords.some(kw => name.includes(kw))) {
                    return { category: 'consumable', subCategory: 'food', type: 'usable' };
                }
                
                // Check for medical
                if (medicalKeywords.some(kw => name.includes(kw))) {
                    return { category: 'consumable', subCategory: 'medical', type: 'usable' };
                }
                
                // Default: return null to let existing logic handle
                return null;
            }
            // Check if text fragment could be a real item name (not a measurement or number)
            function isValidItemName(text) {
                if (!text || text.length < 1) return false;
                // Skip pure measurements like "500g", "2L", "1.5kg"
                if (/^[\d.]+$/.test(text.trim())) return false;
                // Skip pure number+unit patterns
                if (/^\s*\d+[\d.]*\s*[kKmMgGlL升克千克吨]\s*$/.test(text.trim())) return false;
                // Skip very short fragments that are just units
                if (/^[kKmMgGlL升克千克吨升]$/.test(text.trim())) return false;
                // Skip Chinese punctuation only
                if (/^[，。、；：,.;:!?！？（）()\[\]【】"'·\-\s]+$/.test(text)) return false;
                // If it contains Chinese characters, it's likely an item name
                if (/[\u4e00-\u9fff]/.test(text)) return true;
                // If it has alphanumeric content (for English items)
                if (/[a-zA-Z0-9]/.test(text) && text.length >= 2) return true;
                return false;
            }

            // Job presets (selectable in character creation)
            const JOB_PRESETS = {
                'iammerchant': { name: '行商', desc: '初始携带大量交易物资和一辆货车', bonus: ['货车钥匙','交易清单','防身手枪','3箱罐头','医药包'] },
                'iamsf': { name: '特别行动部队', desc: '退役特种兵，拥有专业军事技能和装备', bonus: ['战术背心','军用步枪','消音器','夜视仪','军用口粮x3'], skills: '战术射击\n近身格斗\n爆破\n潜行\n野外生存\n通讯设备使用' },
                'iamdoctor': { name: '流浪医生', desc: '前军医，携带专业医疗装备', bonus: ['医疗箱','手术刀','抗生素x5','止血钳','绷带x10'], skills: '外科手术\n急救\n药理学\n疾病诊断' },
                'iamengineer': { name: '工程师', desc: '资深工程师，精通机械和建筑', bonus: ['工具箱','电焊机','发电机','钢材x5','电路板x3'], skills: '机械工程\n电气工程\n建筑施工\n焊接' },
                'iamhacker': { name: '黑客', desc: '前网络安全专家，擅长电子入侵和信息战', bonus: ['笔记本电脑','无线信号探测器','EMP手雷','加密U盘','电池x5'], skills: '网络入侵\n信息检索\n电子设备维修\n编程\n数据解密' },
                'iamsniper': { name: '狙击手', desc: '前职业狙击手，擅长远程精确打击和野外隐蔽', bonus: ['狙击步枪','消音器','望远镜伪装','迷彩服','测距仪'], skills: '远程射击\n野外隐蔽\n伪装潜行\n弹道计算\n观察侦察' },
                'iampsych': { name: '心理学家', desc: '前临床心理学家，擅长谈判和心理分析', bonus: ['便携录音机','心理评估量表','镇静剂x3','笔记本','钢笔'], skills: '心理评估\n谈判说服\n情绪分析\n催眠引导\n危机干预' },
                'iamalchemist': { name: '炼金术士', desc: '前化学研究员，精通药物合成和毒理学', bonus: ['化学实验箱','蒸馏装置','草药集','防毒面具','试剂x5'], skills: '药物合成\n毒理学\n草药识别\n化学分析\n解毒治疗' },
                'iamsoldier': { name: '退伍军人', desc: '前陆军步兵，拥有基础军事技能和装备', bonus: ['军用背包','战术腰带','多功能刀','急救包','单兵口粮x2'], skills: '基础射击\n军事战术\n野外生存\n团队协作\n装备维护' },
                'iamcop': { name: '前警官', desc: '前刑警，擅长调查和近身搏斗', bonus: ['警棍','手铐','辣椒水','警用对讲机','防弹衣'], skills: '近身搏斗\n调查取证\n审讯技巧\n法律知识\n擒拿格斗' },
                'iamthug': { name: '街头混混', desc: '前帮派成员，擅长街头战斗和黑市交易', bonus: ['钢管','弹簧刀','黑市地图','现金x3','香烟x5'], skills: '街头斗殴\n黑市交易\n情报网络\n偷窃潜入\n恐吓威慑' },
                'iamsurvivor': { name: '野外生存专家', desc: '前野外向导，精通野外生存和觅食', bonus: ['猎刀','捕兽夹','净水器','帐篷','打火石'], skills: '野外觅食\n追踪辨识\n搭建庇护所\n取火技巧\n动植物辨识' },
                'iamscientist': { name: '科学家', desc: '前研究员，擅长病毒学和数据分析', bonus: ['便携显微镜','样本采集工具','培养皿','数据记录仪','防护服'], skills: '病毒学\n数据分析\n样本采集\n实验室操作\n科研论文写作' },
                'iampriest': { name: '神父/祭司', desc: '前宗教人士，擅长安抚人心和精神引导', bonus: ['圣经','十字架','圣油','蜡烛x5','便携扩音器'], skills: '心理疏导\n公众演讲\n宗教仪式\n精神安抚\n社区组织' },
                'iamnoble': { name: '贵族/继承人', desc: '前富裕家族继承人，拥有资源和人脉', bonus: ['信用卡','保险箱钥匙','名贵手表','丝绸衣物','私人信件'], skills: '社交礼仪\n资源调配\n人脉经营\n商业谈判\n鉴赏古董' }
            };

            // ===== 部署基础路径 =====
            // 使用相对路径即可在 GitHub Pages 子路径下正常工作
            // 浏览器会自动将 'BGM/xxx.mp3' 解析为相对于 game.html 的路径
            // 无需额外处理编码或子路径

            let hist = [], busy = false, ctrl = null, undo = null, theme = 'light', chr, sta, clk, sbx, sideMode = 'profile';
            const hasHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
            const isMobile = () => !hasHover || /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || window.innerWidth <= 480;
            window.isMobile = isMobile;
            let bpCat = 'food', bpSub = 'solid', bpPage = 0, bpView = 'cat'; // 'cat' | 'all' | 'star'
            let idleTimer = null, clockTimer = null;

            function ld(k, fb) {
                try {
                    let raw = localStorage.getItem(k);
                    if (!raw) {
                        // Try backup
                        const backup = localStorage.getItem(k + '_bak');
                        if (backup) {
                            console.warn('[Storage] Restore from backup for key:', k);
                            localStorage.setItem(k, backup);
                            raw = backup;
                        }
                    }
                    if (!raw) return fb;
                    let obj;
                    try { obj = JSON.parse(raw); }
                    catch (e) {
                        // Try backup if main is corrupted
                        const backup = localStorage.getItem(k + '_bak');
                        if (backup) {
                            console.warn('[Storage] Main corrupted, restoring backup:', k);
                            try {
                                obj = JSON.parse(backup);
                                localStorage.setItem(k, backup);
                            } catch { obj = null; }
                        }
                        if (!obj) {
                            console.error('[Storage] Failed to parse key:', k, e.message);
                            return fb;
                        }
                    }
                    if (!obj || typeof obj !== 'object') return fb;
                    // Merge with fallback to preserve any stored keys even if some fields are missing
                    return { ...fb, ...obj };
                } catch { return fb; }
            }
            function storageReportText() {
                try {
                    const sizeKB = Math.round(JSON.stringify(localStorage).length / 1024);
                    let breakdown = [];
                    const keySize = (key) => { try { const v = localStorage.getItem(key); return v ? Math.round(v.length/1024) : 0; } catch { return 0; } };
                    for (const k of Object.values(K)) {
                        const kb = keySize(k);
                        if (kb > 0) breakdown.push(k + ': ~' + kb + 'KB');
                    }
                    return '当前占用：约 ' + sizeKB + 'KB\n存储项明细：' + breakdown.join(' · ');
                } catch { return ''; }
            }
            function sv(k, v) {
                try {
                    const json = JSON.stringify(v);
                    // 计算当前 localStorage 使用量，超过 4MB 时主动清理
                    let totalBytes = 0;
                    try {
                        for (let i = 0; i < localStorage.length; i++) {
                            const key = localStorage.key(i);
                            totalBytes += (localStorage.getItem(key) || '').length;
                        }
                    } catch {}
                    const MAX_BYTES = 4.5 * 1024 * 1024; // 4.5MB 阈值
                    if (totalBytes > MAX_BYTES && k === K.HIS) {
                        // 紧急裁剪历史，降到 200 条
                        const trimmed = Array.isArray(v) ? v.slice(-200) : v;
                        return sv(k, trimmed);
                    }
                    // Store main copy
                    try {
                        localStorage.setItem(k, json);
                    } catch (e) {
                        console.warn('[Storage] Main save failed (quota?):', k, e.message);
                        // 如果配额超限，尝试更激进的裁剪
                        if (e.name === 'QuotaExceededError' || e.code === 22) {
                            try {
                                const report = storageReportText ? storageReportText() : '';
                                const promptMsg = '⚠️ 本地存储空间已满！\n\n' + report + '\n\n系统将尝试自动裁剪对话历史来释放空间。\n\n【建议】：请尽快使用「设置 → 导出备份」手动导出完整存档到本地文件，防止数据丢失。\n\n是否允许自动裁剪对话历史？';
                                setTimeout(() => {
                                    const showQ = () => {
                                        if (typeof sketchConfirm === 'function') {
                                            sketchConfirm(promptMsg + '\n\n（点击「确定」= 允许裁剪；「取消」= 稍后手动处理）').then(ok => {
                                                if (!ok) return;
                                                doQuotaTrim();
                                            }).catch(() => {});
                                        } else {
                                            if (confirm(promptMsg)) doQuotaTrim();
                                        }
                                    };
                                    let storageTrimDone = false;
                                    function doQuotaTrim() {
                                        if (storageTrimDone) return; storageTrimDone = true;
                                        try {
                                            if (k === K.HIS && v && v.length > 50) {
                                                const beforeCount = v.length;
                                                const trimmed = v.slice(-50);
                                                try { localStorage.setItem(k, JSON.stringify(trimmed)); tst('对话历史已裁剪：保留最近50条'); } catch {}
                                                try { generateContextSummary(); } catch {}
                                            } else {
                                                try { Object.values(K).forEach(key => { if (key !== k + '_bak') localStorage.removeItem(key + '_bak'); }); } catch {}
                                                try { localStorage.setItem(k, json); } catch {}
                                            }
                                        } catch(err) {}
                                    }
                                    showQ();
                                }, 0);
                            } catch(err2) {
                                try {
                                    if (k === K.HIS && v && v.length > 50) {
                                        const trimmed = v.slice(-50);
                                        try { localStorage.setItem(k, JSON.stringify(trimmed)); } catch {}
                                    } else {
                                        try { Object.values(K).forEach(key => { if (key !== k + '_bak') localStorage.removeItem(key + '_bak'); }); } catch {}
                                        try { localStorage.setItem(k, json); } catch {}
                                    }
                                } catch(err3) {}
                            }
                        }
                    }
                    // Update backup asynchronously
                    setTimeout(() => {
                        try { localStorage.setItem(k + '_bak', json); }
                        catch (e) { console.warn('[Storage] Backup save failed:', k); }
                    }, 50);
                } catch {}
            }
            // Storage health check on load
            (function storageHealthCheck() {
                try {
                    const report = [];
                    Object.values(K).forEach(key => {
                        const raw = localStorage.getItem(key);
                        if (!raw) return;
                        try { JSON.parse(raw); report.push('✓ ' + key); }
                        catch (e) { report.push('✗ ' + key + ': ' + e.message); localStorage.removeItem(key); }
                    });
                    const usedKB = Math.round(JSON.stringify(localStorage).length / 1024);
                    report.push('Storage used: ~' + usedKB + 'KB');
                    if (usedKB > 4500) report.push('⚠️ Warning: Approaching 5MB localStorage limit');
                    console.log('[Storage Health]\n' + report.join('\n'));
                } catch {}
            })();

            // ===== Data migration: convert legacy English values to Chinese =====
            const MIGRATE_MAP = {
                diff: { 'casual': '休闲', 'relaxed': '轻度', 'standard': '标准', 'hardcore': '硬核', 'nightmare': '噩梦' },
                mental: { 'stable': '稳定', 'anxious': '焦虑', 'grieving': '悲痛', 'determined': '坚定', 'traumatized': '创伤' },
                mentality: { 'stable': '稳定', 'anxious': '焦虑', 'grieving': '悲痛', 'determined': '坚定', 'traumatized': '创伤', 'hopeful': '希望', 'desperate': '绝望' },
                extraFeature: { 'supernatural': '异能' },
                abilityPreset: { 'thermal': '热能感知', 'enhanced': '强化体质', 'telepathy': '心灵感应', 'regen': '细胞再生', 'shadow': '暗影潜行', 'electro': '电磁感应', 'vision': '超凡视觉', 'hearing': '超级听觉', 'strength': '超凡力量', 'agility': '闪电敏捷', 'sixth': '第六感', 'healing': '治愈之力', 'fire': '火焰操控', 'shield': '能量护盾', 'summon': '召唤', 'custom': '自定义' },
                abilityName: { 'thermal': '热能感知', 'enhanced': '强化体质', 'telepathy': '心灵感应', 'regen': '细胞再生', 'shadow': '暗影潜行', 'electro': '电磁感应', 'vision': '超凡视觉', 'hearing': '超级听觉', 'strength': '超凡力量', 'agility': '闪电敏捷', 'sixth': '第六感', 'healing': '治愈之力', 'fire': '火焰操控', 'shield': '能量护盾', 'summon': '召唤' },
                idleDir: { 'rest': '休养', 'explore': '探索', 'custom': '自定义' }
            };
            function migrateObj(obj, fields) {
                if (!obj || typeof obj !== 'object') return obj;
                let changed = false;
                fields.forEach(f => {
                    if (obj[f] && MIGRATE_MAP[f] && MIGRATE_MAP[f][obj[f]]) {
                        obj[f] = MIGRATE_MAP[f][obj[f]];
                        changed = true;
                    }
                });
                return changed;
            }
            function migrateChr(c) {
                if (!c || typeof c !== 'object') return c;
                migrateObj(c, ['diff', 'mental', 'extraFeature', 'abilityPreset', 'abilityName']);
                // Backward compatibility: remove iamthegod from old saves
                if (c.hiddenPresets && Array.isArray(c.hiddenPresets)) {
                    const hadGod = c.hiddenPresets.includes('iamthegod');
                    c.hiddenPresets = c.hiddenPresets.filter(code => JOB_PRESETS[code] !== undefined);
                    if (hadGod || c.god) {
                        c.god = false;
                    }
                } else if (c.god) {
                    c.god = false;
                }
                return c;
            }
            function migrateSta(s) {
                if (!s || typeof s !== 'object') return s;
                migrateObj(s, ['mentality']);
                return s;
            }
            function migrateCfg(f) {
                if (!f || typeof f !== 'object') return f;
                migrateObj(f, ['idleDir']);
                return f;
            }

            function cfg() { const c = ld(K.CFG, DCFG); if (migrateCfg(c)) scf(c); return c; }
            function scf(c) { sv(K.CFG, c); afs(c.fsz); }
            
            // 全局 API 请求函数（欢迎页面测试、游戏主循环共用）：直连模式，纯 localStorage 本地保存密钥
            window._sendProxyRequest = async function(targetUrl, body, apiKey, signal, isStream) {
                const headers = { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + (apiKey || '') };
                if (isStream) headers['Accept'] = 'text/event-stream';
                return fetch(targetUrl, {
                    method: 'POST',
                    headers: headers,
                    body: JSON.stringify(body),
                    signal: signal
                });
            };
            // ===== 背包操作统一封装（支持数量后缀x2/x3匹配）=====
            function parseItemQty(item) {
                if (!item) return { base: '', qty: 0, raw: '' };
                const m = item.match(/^(.+?)x(\d+)$/);
                if (m) return { base: m[1], qty: parseInt(m[2]), raw: item };
                return { base: item, qty: 1, raw: item };
            }
            function formatItemQty(base, qty) {
                if (qty <= 0) return null;
                if (qty === 1) return base;
                return base + 'x' + qty;
            }
            // 在背包中查找物品匹配的索引和数量信息；matchMode=exact/base/contains
            function invFindIndex(inv, itemName, matchMode) {
                const pq = parseItemQty(itemName);
                mode = matchMode || 'base';
                for (let i = 0; i < inv.length; i++) {
                    const pq2 = parseItemQty(inv[i]);
                    if (mode === 'exact' && pq2.raw === pq.raw) return { idx: i, base: pq2.base, qty: pq2.qty, raw: pq2.raw };
                    if (mode === 'base' && pq2.base === pq.base) return { idx: i, base: pq2.base, qty: pq2.qty, raw: pq2.raw };
                    if (mode === 'contains' && (pq2.base.includes(pq.base) || pq.base.includes(pq2.base))) return { idx: i, base: pq2.base, qty: pq2.qty, raw: pq2.raw };
                }
                return { idx: -1 };
            }
            // 检测背包是否拥有某物品（含x数量后缀）
            function invHas(itemName, qty) {
                const s = gst();
                if (!s.inv) s.inv = [];
                const need = qty || 1;
                let found = 0;
                for (let i = 0; i < s.inv.length; i++) {
                    const pq = parseItemQty(s.inv[i]);
                    if (pq.base === parseItemQty(itemName).base) {
                        found += pq.qty;
                        if (found >= need) return true;
                    }
                }
                return false;
            }
            // 添加物品到背包（自动合并同base的数量，返回实际添加结果 {base, addedQty, totalQty}）
            function invAdd(itemName, qty) {
                const s = gst();
                if (!s.inv) s.inv = [];
                const pq = parseItemQty(itemName);
                const addQty = (qty != null ? qty : pq.qty) || 1;
                let foundEntry = null;
                for (let i = 0; i < s.inv.length; i++) {
                    const pq2 = parseItemQty(s.inv[i]);
                    if (pq2.base === pq.base) { foundEntry = { i, base: pq2.base, cur: pq2.qty }; break; }
                }
                if (foundEntry) {
                    const newQty = foundEntry.cur + addQty;
                    s.inv[foundEntry.i] = formatItemQty(foundEntry.base, newQty);
                    sst(s);
                    return { base: foundEntry.base, addedQty: addQty, totalQty: newQty };
                } else {
                    const raw = formatItemQty(pq.base, addQty);
                    s.inv.push(raw);
                    sst(s);
                    return { base: pq.base, addedQty: addQty, totalQty: addQty };
                }
            }
            // 从背包移除物品（优先数量后缀），返回是否成功 {success, removedQty}
            function invRemove(itemName, qty) {
                const s = gst();
                if (!s.inv) s.inv = [];
                const pq = parseItemQty(itemName);
                let need = (qty != null ? qty : pq.qty) || 1;
                let removed = 0;
                for (let pass = 0; pass < 2 && need > 0; pass++) {
                    for (let i = 0; i < s.inv.length && need > 0; i++) {
                        const pq2 = parseItemQty(s.inv[i]);
                        const matchExact = (pass === 0 && pq2.base === pq.base);
                        const matchFuzzy = (pass === 1 && pq.base && (pq2.base.includes(pq.base) || pq.base.includes(pq2.base)) && pq2.base !== pq.base);
                        if (!matchExact && !matchFuzzy) continue;
                        const take = Math.min(need, pq2.qty);
                        const remain = pq2.qty - take;
                        if (remain <= 0) s.inv.splice(i, 1);
                        else s.inv[i] = formatItemQty(pq2.base, remain);
                        removed += take; need -= take;
                        if (pass === 1) i--;
                    }
                }
                sst(s);
                return { success: removed > 0, removedQty: removed, remaining: need };
            }
            // ===== 装备槽位推断统一函数 =====
            const SLOT_KEYWORDS = {
                head: ['头盔','帽子','头灯','面罩','防毒面具','护目镜','头套','头巾','安全帽','作战头盔','防弹头盔','贝雷帽','帽'],
                body: ['背心','夹克','衣','服','甲','外套','冲锋衣','防弹衣','战术背心','作战服','雨衣','大衣','毛衣','衬衫','T恤'],
                legs: ['裤','裙','牛仔裤','作战裤','工装裤','运动裤'],
                feet: ['鞋','靴','袜','运动鞋','军靴','登山靴','作战靴','雨靴','拖鞋'],
                weapon: ['斧','刀','棍','枪','剑','棒','锤','矛','弩','锯','钳','扳手','铁管','钢管','球棒','平底锅','匕首','刺刀','步枪','手枪','霰弹枪','冲锋枪','狙击枪','机枪'],
                offhand: ['盾','护臂','护肘','护膝','手电筒','战术手电','医疗包','急救包'],
                backpack: ['背包','包','箱','袋','登山包','战术背包','军用背包','双肩包','腰包'],
                accessory: ['戒','链','表','环','坠','符','项链','手链','戒指','耳环','护符','徽章']
            };
            const SUBCATEGORY_SLOT_MAP = {
                weapon: 'weapon', armor: 'body', tool: 'offhand', backpack: 'backpack',
                tech: 'offhand', misc: 'accessory', helmet: 'head', pants: 'legs', shoes: 'feet',
                clothing: 'body', jewelry: 'accessory', shield: 'offhand'
            };
            function getEquipSlot(itemName, info) {
                if (info && info.slot) return info.slot;
                const sub = info && info.subCategory;
                if (sub && SUBCATEGORY_SLOT_MAP[sub.toLowerCase ? sub.toLowerCase() : sub]) return SUBCATEGORY_SLOT_MAP[sub.toLowerCase()];
                const cat = info && info.category;
                if (cat === 'weapon' || info && info.type === 'weapon') return 'weapon';
                for (const [slot, keywords] of Object.entries(SLOT_KEYWORDS)) {
                    if (keywords.some(kw => itemName && itemName.includes(kw))) return slot;
                }
                try {
                    const mem = JSON.parse(localStorage.getItem('vn_slotMem') || '{}');
                    const base = parseItemQty(itemName).base;
                    if (mem[base]) return mem[base];
                } catch(e) {}
                return null;
            }
            function getEquipPreviewText(slotKey, newBaseName, oldBaseName, newInfo, oldInfo) {
                const parts = [];
                const oldDur = (oldInfo && oldInfo.durability) || 0;
                const newDur = (newInfo && newInfo.durability) || 0;
                const slot = slotLabel(slotKey);
                if (newBaseName) {
                    if (oldBaseName) parts.push(slot + '：' + oldBaseName + ' → ' + newBaseName);
                    else parts.push(slot + '装备：' + newBaseName);
                } else {
                    if (oldBaseName) parts.push(slot + '卸下：' + oldBaseName);
                }
                if (newDur !== oldDur && (newDur || oldDur)) {
                    parts.push('耐久 ' + (oldDur||0) + ' → ' + (newDur||0));
                }
                if (newBaseName || oldBaseName) {
                    const heavy = /背包|军用|战术|防弹|钢|铁|合金/;
                    let oldW = heavy.test(oldBaseName||'') ? 3 : 1;
                    let newW = heavy.test(newBaseName||'') ? 3 : 1;
                    if (oldW !== newW) parts.push('负重约 +' + (newW - oldW) + 'kg');
                }
                return parts.join(' · ');
            }
            function showEquipSlotSelector(itemName, itemInfo, onSelected) {
                const slots = [
                    {k:'head', label:'头部', icon:'⛑️'},
                    {k:'body', label:'躯干', icon:'🥋'},
                    {k:'legs', label:'腿部', icon:'👖'},
                    {k:'feet', label:'足部', icon:'👟'},
                    {k:'weapon', label:'主手', icon:'⚔️'},
                    {k:'offhand', label:'副手', icon:'🛡️'},
                    {k:'backpack', label:'背包', icon:'🎒'},
                    {k:'accessory', label:'饰品', icon:'💍'}
                ];
                const ov = document.createElement('div');
                ov.className = 'modal-overlay';
                ov.style.zIndex = '99999';
                const panel = document.createElement('div');
                panel.className = 'modal-panel';
                panel.style.maxWidth = '360px';
                panel.style.padding = '18px';
                panel.style.transform = 'rotate(-0.2deg)';
                panel.innerHTML =
                    '<h3 style="margin:0 0 10px;">📌 选择装备槽位</h3>' +
                    '<div style="font-size:0.75rem;color:var(--ink-soft);margin-bottom:12px;">无法自动识别 <strong>' + esc(itemEmoji(itemName) + ' ' + itemName) + '</strong> 的装备位置，请手动选择：</div>' +
                    '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;" class="slot-sel-grid"></div>' +
                    '<div style="margin-top:14px;text-align:right;"><button class="btn btn-sm equip-cancel-sel" style="padding:5px 14px;">取消</button></div>';
                const gridEl = panel.querySelector('.slot-sel-grid');
                slots.forEach(sl => {
                    const b = document.createElement('div');
                    b.className = 'equip-slot equip-slot--empty';
                    b.style.cursor = 'pointer';
                    b.innerHTML = '<div class="equip-slot__header"><span class="equip-slot__icon">' + sl.icon + '</span><span>' + sl.label + '</span></div>';
                    b.title = '装备到「' + sl.label + '」槽位';
                    b.addEventListener('click', () => {
                        try {
                            const base = parseItemQty(itemName).base;
                            const mem = JSON.parse(localStorage.getItem('vn_slotMem') || '{}');
                            mem[base] = sl.k;
                            localStorage.setItem('vn_slotMem', JSON.stringify(mem));
                        } catch(e) {}
                        ov.remove();
                        onSelected(sl.k);
                    });
                    gridEl.appendChild(b);
                });
                panel.querySelector('.equip-cancel-sel').addEventListener('click', () => ov.remove());
                ov.addEventListener('click', (e) => { if (e.target === ov) ov.remove(); });
                ov.appendChild(panel);
                document.body.appendChild(ov);
            }
            function gst() { if (!sta) { sta = ld(K.STA, DSTA); if (migrateSta(sta)) sst(sta); } return sta; }
            function sst(s) { sta = s; sv(K.STA, s); }
            function gch() { if (!chr) { chr = ld(K.CHR, DCHR); if (migrateChr(chr)) sch(chr); } return chr; }
            function sch(c) { chr = c; sv(K.CHR, c); }
            function hasCustomCharacter() {
                const c = gch();
                // If character creation was explicitly completed (even with defaults)
                if (c._charCreated) return true;
                // Check if character has been customized (not default)
                if (c.cn && c.cn !== DCHR.cn) return true;
                if (c.dn && c.dn !== DCHR.dn) return true;
                if (c.loc && c.loc !== DCHR.loc) return true;
                if (c.map && c.map !== DCHR.map) return true;
                if (c.geo && c.geo !== DCHR.geo) return true;
                // If hidden presets exist, it's been customized
                if (c.hiddenPresets && c.hiddenPresets.length > 0) return true;
                // Check if name is set (non-default)
                if (c.cn && c.cn !== '幸存者') return true;
                return false;
            }
            function gsv() { return ld(K.SAV, {}); }
            function ssv(s) { sv(K.SAV, s); }
            function validateSaveData(sn, strict) {
                const errs = [];
                if (!sn || typeof sn !== 'object') { errs.push('存档格式不是合法对象'); return { valid:false, errs, recovered:null }; }
                const rec = { hi: [], st: null, ch: null, clk: null, sbx: null, cfg: null, tm: Date.now() };
                if (sn.hi != null) {
                    if (!Array.isArray(sn.hi)) errs.push('hi 不是数组');
                    else rec.hi = sn.hi.filter(x => x && x.role && typeof x.content === 'string').slice(0, 500);
                }
                if (strict && rec.hi.length === 0 && (!sn.st)) errs.push('对话历史和状态均为空');
                if (sn.st != null) {
                    if (typeof sn.st !== 'object') errs.push('st 不是对象');
                    else {
                        const ms = migrateSta(JSON.parse(JSON.stringify(sn.st)));
                        if (!ms.inv) ms.inv = [];
                        if (!ms.equip) ms.equip = { head:'', body:'', legs:'', feet:'', weapon:'', offhand:'', backpack:'', accessory:'' };
                        if (ms.hunger == null) ms.hunger = 50;
                        if (ms.thirst == null) ms.thirst = 50;
                        if (ms.fatigue == null) ms.fatigue = 20;
                        if (ms.hp == null) ms.hp = 100;
                        if (ms.maxHp == null) ms.maxHp = 100;
                        if (ms.bodyTemp == null) ms.bodyTemp = 36.8;
                        ms.hunger = Math.max(0, Math.min(100, ms.hunger));
                        ms.thirst = Math.max(0, Math.min(100, ms.thirst));
                        ms.fatigue = Math.max(0, Math.min(100, ms.fatigue));
                        ms.hp = Math.max(0, Math.min(ms.maxHp || 100, ms.hp));
                        ms.bodyTemp = Math.max(30, Math.min(45, ms.bodyTemp));
                        rec.st = ms;
                    }
                } else if (strict) errs.push('st 状态字段缺失');
                if (sn.ch != null) {
                    if (typeof sn.ch !== 'object') errs.push('ch 不是对象');
                    else rec.ch = Object.assign({}, DCHR, sn.ch);
                }
                if (sn.clk != null) {
                    if (typeof sn.clk !== 'object') errs.push('clk 不是对象');
                    else rec.clk = Object.assign({}, DCLK, sn.clk);
                }
                if (sn.sbx != null) {
                    if (typeof sn.sbx !== 'object') errs.push('sbx 不是对象');
                    else rec.sbx = mergeSbx(sn.sbx);
                }
                if (sn.cfg != null && typeof sn.cfg === 'object') rec.cfg = sn.cfg;
                const valid = !strict ? true : errs.length === 0 || (errs.length <= 2 && rec.st != null);
                if (rec.st == null) rec.st = JSON.parse(JSON.stringify(DSTA));
                if (rec.ch == null) rec.ch = JSON.parse(JSON.stringify(DCHR));
                if (rec.clk == null) rec.clk = JSON.parse(JSON.stringify(DCLK));
                return { valid, errs, recovered: rec };
            }
            function ldh() { return ld(K.HIS, []); }
            function svh(h) { sv(K.HIS, h.slice(-500)); }
            function gclk() {
                if (!clk) {
                    clk = ld(K.CLK, DCLK);
                    // Sync dayLenSec from sandbox config
                    const sbx = gsbx();
                    if (sbx.cat1 && sbx.cat1.fields && sbx.cat1.fields.dayLenSec) {
                        clk.dayLenSec = sbx.cat1.fields.dayLenSec.val;
                    }
                }
                return clk;
            }
            function sclk(c) { clk = c; sv(K.CLK, c); }
            function gsbx() { if (!sbx) { sbx = mergeSbx(ld(K.SBX, JSON.parse(JSON.stringify(DSBX)))); } return sbx; }
            function mergeSbx(s) {
                if (!s || typeof s !== 'object') return s;
                Object.keys(DSBX).forEach(catK => {
                    if (!s[catK]) { s[catK] = JSON.parse(JSON.stringify(DSBX[catK])); }
                    else {
                        s[catK].title = DSBX[catK].title;
                        if (!s[catK].fields) s[catK].fields = {};
                        Object.keys(DSBX[catK].fields).forEach(fk => {
                            if (!s[catK].fields[fk]) {
                                s[catK].fields[fk] = JSON.parse(JSON.stringify(DSBX[catK].fields[fk]));
                            }
                        });
                    }
                });
                return s;
            }
            function ssbx(s) { sbx = s; sv(K.SBX, s);
                if (s.cat1 && s.cat1.fields && s.cat1.fields.dayLenSec) {
                    const c = gclk();
                    c.dayLenSec = s.cat1.fields.dayLenSec.val;
                    sclk(c);
                }
            }
            const THEMES = [
                { key: 'light', label: '浅色' },
                { key: 'dark', label: '深色' },
                { key: 'blue', label: '蓝色' },
                { key: 'green', label: '绿色' },
                { key: 'red', label: '红色' }
            ];
            let themeIdx = 0;
            function ath(t) {
                theme = t;
                themeIdx = THEMES.findIndex(x => x.key === t);
                if (themeIdx < 0) themeIdx = 0;
                const root = document.documentElement;
                root.setAttribute('data-theme', t === 'light' ? '' : t);
                $('btnTheme').textContent = THEMES[themeIdx].label;
            }
            function cycleTheme() {
                themeIdx = (themeIdx + 1) % THEMES.length;
                const t = THEMES[themeIdx].key;
                ath(t);
                localStorage.setItem(K.THM, t);
                playSfx('tab');
            }
            function afs(sz) { document.documentElement.style.setProperty('--font-size-base', sz); document.documentElement.style.setProperty('--font-size-sm', (parseInt(sz) - 3) + 'px'); document.documentElement.style.setProperty('--font-size-lg', (parseInt(sz) + 2) + 'px'); }


            // ===== Game Clock =====
            function fmtTime(sec) {
                const total = sec % 86400;
                const h = Math.floor(total / 3600);
                const m = Math.floor((total % 3600) / 60);
                return String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0');
            }
            function dayPhase(sec) {
                const h = Math.floor((sec % 86400) / 3600);
                if (h >= 5 && h < 8) return '清晨';
                if (h >= 8 && h < 12) return '上午';
                if (h >= 12 && h < 14) return '正午';
                if (h >= 14 && h < 17) return '下午';
                if (h >= 17 && h < 19) return '黄昏';
                if (h >= 19 && h < 23) return '夜晚';
                return '深夜';
            }
            const WEATHERS = ['晴', '多云', '阴', '小雨', '大雨', '雾', '霾', '雪', '雷暴', '沙尘暴'];
            const SEASONS = ['春', '夏', '秋', '冬'];
            const SEASON_TEMP = { '春': [8, 22], '夏': [22, 38], '秋': [5, 20], '冬': [-15, 5] };
            function seasonFromDay(day) {
                // Each season lasts ~30 game days; ensure non-negative
                const d = Math.max(1, day || 1);
                const idx = Math.floor(((d - 1) % 120 + 120) % 120 / 30);
                return SEASONS[idx] || SEASONS[0];
            }
            function randWeather(season, prev) {
                const bx = gsbx();
                const rainFreq = bx.cat2.fields.rainFreq.val;
                const snowOn = bx.cat2.fields.snowOn.val;
                const fogIntensity = bx.cat2.fields.fogIntensity.val;
                const w = [...WEATHERS];
                // Bias by season
                if (season === '春') { w.push('小雨', '雾'); }
                if (season === '夏') { w.push('雷暴', '大雨'); }
                if (season === '秋') { w.push('多云', '霾'); }
                if (season === '冬') { w.push('雪', '霾'); }
                // Apply rain frequency bias
                const rainBias = { '极少': 0.2, '较少': 0.35, '适中': 0.5, '频繁': 0.7 }[rainFreq] || 0.5;
                if (Math.random() < rainBias) {
                    const rainOptions = season === '冬' ? ['小雪', '雪'] : (season === '夏' ? ['雷暴', '大雨', '小雨'] : ['小雨', '中雨']);
                    w.push(...rainOptions);
                }
                // Apply fog bias
                if (fogIntensity !== '无' && Math.random() < (fogIntensity === '浓雾' ? 0.4 : fogIntensity === '中等' ? 0.25 : 0.12)) {
                    w.push('雾');
                }
                // Remove snow if disabled
                if (!snowOn) {
                    const snowWords = ['雪', '小雪', '暴风雪'];
                    for (let i = w.length - 1; i >= 0; i--) if (snowWords.includes(w[i])) w.splice(i, 1);
                }
                // Avoid same as previous
                let pool = w;
                if (prev) pool = w.filter(x => x !== prev);
                if (!pool.length) pool = w; // fallback if all filtered out
                return pool[Math.floor(Math.random() * pool.length)];
            }
            function randTemp(season, prev) {
                const bx = gsbx();
                const baseTemp = bx.cat2.fields.baseTemp.val || 12;
                const range = SEASON_TEMP[season] || [5, 25];
                // Shift range based on base temp
                const mid = (range[0] + range[1]) / 2;
                const shift = baseTemp - mid;
                const adjustedRange = [range[0] + shift, range[1] + shift];
                let t = adjustedRange[0] + Math.random() * (adjustedRange[1] - adjustedRange[0]);
                if (prev != null) {
                    // Smooth transition: keep within 5 degrees of previous
                    t = prev + (t - prev) * 0.4 + (Math.random() - 0.5) * 3;
                    t = Math.max(adjustedRange[0] - 5, Math.min(adjustedRange[1] + 5, t));
                }
                return Math.round(t * 10) / 10;
            }
            // 检查上一个角色的死亡地点彩蛋
            function checkDeathEasterEgg() {
                try {
                    const deathInfo = localStorage.getItem('dz_death_info');
                    if (!deathInfo) return;
                    const info = JSON.parse(deathInfo);
                    // Only trigger if within 30 days of previous death
                    const curDay = gclk().day || 1;
                    const s = gst();
                    if (!s || !s.location) return;
                    // Check if player is at or near the death location
                    if (s.location.includes(info.location) || info.location.includes(s.location)) {
                        // Player found the previous character's remains
                        const easterEggMsg = '你在' + info.location + '发现了一具尸体——看穿着和装备，似乎是前不久在这里遇难的幸存者。' +
                            '尸体旁边散落着一些物品，身上有' + (info.reason || '致命伤') + '的痕迹。' +
                            '从遗物来看，此人存活了' + info.day + '天，击杀了' + info.kills + '个敌人。';
                        // Add to narrative
                        setTimeout(() => {
                            apb({ ty: 'narration', tx: easterEggMsg }, 0);
                            // Give player some leftover items
                            const s2 = gst();
                            if (s2 && s2.inv) {
                                const leftoverItems = ['破损的背包', '半瓶水', '生锈的匕首', '几发子弹', '一张沾血的纸条'];
                                const found = leftoverItems[Math.floor(Math.random() * leftoverItems.length)];
                                s2.inv.push(found);
                                sst(s2);
                                snotify('add', '发现遗物', found);
                            }
                            // Clear death info so it doesn't trigger again
                            localStorage.removeItem('dz_death_info');
                        }, 3000);
                    }
                } catch(e) {}
            }
            function startClock() {
                if (clockTimer) clearInterval(clockTimer);
                // Check for death location easter egg (one-time)
                if (!window._deathEggChecked) {
                    window._deathEggChecked = true;
                    setTimeout(() => checkDeathEasterEgg(), 5000);
                }
                clockTimer = setInterval(() => {
                    const c = gclk();
                    const isRealTime = (c.dayLenSec === 86400);
                    const prevDay = c.day || 1;
                    const prevHour = Math.floor(c.elapsedSec / 3600);

                    if (isRealTime) {
                        // Real time sync mode: use player's device clock
                        const now = new Date();
                        const hrs = now.getHours(), mins = now.getMinutes(), secs = now.getSeconds();
                        const newElapsed = hrs * 3600 + mins * 60 + secs;
                        // Only change day when midnight passes in real time
                        if (c._lastRealDay !== now.getDate() && c._lastRealDay !== undefined) {
                            c.day = (c.day || 1) + (now.getDate() !== c._lastRealDay ? 1 : 0);
                            c._lastRealDay = now.getDate();
                            const season = seasonFromDay(c.day);
                            if (Math.random() < 0.6) c.weather = randWeather(season, c.weather);
                            c.temp = randTemp(season, c.temp);
                            c.season = season;
                        } else if (c._lastRealDay === undefined) {
                            c._lastRealDay = now.getDate();
                        }
                        c.elapsedSec = newElapsed;
                    } else {
                        // Standard accelerated time — dayLenSec 控制游戏一天对应多少现实秒
                        // 例如 dayLenSec=1200 表示现实20分钟=游戏24小时，每秒推进72秒游戏时间
                        const dayLen = c.dayLenSec || 86400;
                        const advance = 86400 / dayLen;
                        c.elapsedSec += advance;
                        // 跨天处理
                        if (c.elapsedSec >= 86400) {
                            c.elapsedSec -= 86400;
                            c.day = (c.day || 1) + 1;
                            const season = seasonFromDay(c.day);
                            if (c.day !== prevDay && Math.random() < 0.6) {
                                c.weather = randWeather(season, c.weather);
                            }
                            c.temp = randTemp(season, c.temp);
                            c.season = season;
                            // 新一天触发：饥饿/口渴额外衰减（模拟夜间消耗）
                            const s = gst();
                            if (s) {
                                s.hunger = Math.max(0, (s.hunger ?? 50) - 3);
                                s.thirst = Math.max(0, (s.thirst ?? 50) - 4);
                                sst(s);
                            }
                        }
                        // 夜间危险提示（夜晚时段且每隔一段时间）
                        const curH = Math.floor(c.elapsedSec / 3600);
                        if (curH >= 20 && curH < 22 && prevHour < 20 && prevHour >= 18) {
                            // 刚进入夜晚时提示
                            if (Math.random() < 0.3) {
                                snotify('info', '夜晚降临', '夜间丧尸更活跃，注意安全');
                            }
                        }
                    }

                    const curHour = Math.floor(c.elapsedSec / 3600);
                    if (curHour !== prevHour) {
                        const gameHours = Math.abs(curHour - prevHour) > 12 ? 1 : (curHour - prevHour + 24) % 24 || 1;
                        decayStatus(gameHours);
                        const season = c.season || seasonFromDay(c.day || 1);
                        c.temp = randTemp(season, c.temp);
                        upui();
                        // Small ambient interaction on hour change
                        if (Math.random() < 0.05) {
                            const smallEvents = [
                                { t: '远处传来一声丧尸的低吼…', w: 'night' },
                                { t: '风从破碎的窗户灌进来，带着灰尘味。', w: null },
                                { t: '你听到几只鸟雀掠过屋顶。', w: 'day' },
                                { t: '远处的汽车警报器突然响了几秒，又戛然而止。', w: null },
                                { t: '收音机的白噪声中，似乎有人声闪过…', w: null },
                                { t: '脚下的地板发出轻微吱呀声。', w: null }
                            ];
                            const now = new Date();
                            const h = isRealTime ? now.getHours() : curHour;
                            const isNight = (h >= 20 || h < 6);
                            const valid = smallEvents.filter(e => 
                                (e.w === 'night' && isNight) || (e.w === 'day' && !isNight) || e.w == null
                            );
                            if (valid.length) {
                                const pick = valid[Math.floor(Math.random() * valid.length)];
                                addLogEntry('event', pick.t);
                            }
                        }
                    }
                    sclk(c);
                    updClockUI();
                    // Update ambient sound based on time/weather
                    if (window.updateAmbientSound) window.updateAmbientSound();
                }, 1000);
            }
            function updClockUI() {
                const c = gclk();
                const season = c.season || seasonFromDay(c.day || 1);
                if ($('stTime')) $('stTime').textContent = fmtTime(c.elapsedSec) + ' D' + (c.day || 1) + ' ' + season;
                if ($('stWeather')) $('stWeather').textContent = c.weather || '晴';
                if ($('stTemp')) $('stTemp').textContent = c.temp != null ? (Math.round(c.temp * 10) / 10).toFixed(1) : '--';
                if ($('stDayPhase')) $('stDayPhase').textContent = dayPhase(c.elapsedSec);
            }
            function advTime(hours) {
                const c = gclk();
                const prevDay = c.day || 1;
                c.elapsedSec += hours * 3600;
                while (c.elapsedSec >= 86400) { c.elapsedSec -= 86400; c.day = (c.day || 1) + 1; }
                if (c.day !== prevDay) {
                    const season = seasonFromDay(c.day);
                    c.season = season;
                    if (Math.random() < 0.5) c.weather = randWeather(season, c.weather);
                    c.temp = randTemp(season, c.temp);
                    // 追踪夜间存活次数（用于成就判定）
                    const s = gst();
                    s.nightSurvived = (s.nightSurvived || 0) + 1;
                    sst(s);
                }
                decayStatus(hours);
                sclk(c);
                updClockUI();
                upui();
            }

            function decayStatus(gameHours) {
                if (gameHours <= 0) return;
                const s = gst();
                const c = gclk();
                const bx = gsbx();
                const hungerMult = { '缓慢': 0.6, '正常': 1, '快速': 1.5, '极快': 2.2 }[bx.cat8.fields.hungerRate.val] || 1;
                const fatigueMult = { '缓慢': 0.6, '正常': 1, '快速': 1.5, '极快': 2.2 }[bx.cat8.fields.fatigueRate.val] || 1;
                const recoverMult = { '缓慢': 0.6, '正常': 1, '快速': 1.5 }[bx.cat8.fields.staminaRecover.val] || 1;
                const curH = Math.floor((c.elapsedSec || 0) / 3600) % 24;
                const isNight = curH >= 20 || curH < 6;
                // 饥饿衰减：夜间代谢减缓
                const hungerDrain = 0.8 * gameHours * hungerMult * (isNight ? 0.7 : 1);
                s.hunger = Math.max(0, Math.min(100, (s.hunger ?? 50) - hungerDrain));
                // 口渴衰减：白天加速脱水
                const thirstDrain = 1.2 * gameHours * hungerMult * (isNight ? 0.6 : 1.1);
                s.thirst = Math.max(0, Math.min(100, (s.thirst ?? 50) - thirstDrain));
                // 疲劳增长
                let fatigueGain = 0.4 * gameHours * fatigueMult;
                if ((s.hunger ?? 50) < 30) fatigueGain += 0.3 * gameHours * fatigueMult;
                if ((s.thirst ?? 50) < 30) fatigueGain += 0.4 * gameHours * fatigueMult;
                if (c.weather === '暴雨' || c.weather === '暴风雪') fatigueGain += 0.2 * gameHours;
                if (isNight) fatigueGain += 0.15 * gameHours; // 夜间更易疲劳
                s.fatigue = Math.max(0, Math.min(100, (s.fatigue ?? 30) + fatigueGain));
                // 体温调节
                let tempTarget = (c.temp != null ? c.temp : 15);
                if ((s.fatigue ?? 30) > 70) tempTarget += 1.5;
                if ((s.thirst ?? 50) < 20) tempTarget += 2;
                if ((s.hunger ?? 50) < 20) tempTarget -= 1;
                if (c.weather === '暴风雪' || c.weather === '雪') tempTarget -= 3;
                if (c.weather === '暴雨') tempTarget -= 1;
                s.bodyTemp = s.bodyTemp != null ? s.bodyTemp + (tempTarget - s.bodyTemp) * 0.02 * gameHours : 37;
                s.bodyTemp = Math.max(30, Math.min(42, Math.round(s.bodyTemp * 10) / 10));
                // 感染进展：伤口感染会恶化
                if (s.infection && s.infection > 0) {
                    s.infection = Math.min(100, s.infection + 0.5 * gameHours);
                    if (s.infection > 60 && s.hp > 0) {
                        s.hp = Math.max(0, (s.hp ?? 50) - 0.3 * gameHours);
                    }
                }
                // 极端饥饿/口渴导致生命值下降
                if ((s.hunger ?? 50) <= 0) {
                    s.hp = Math.max(0, (s.hp ?? 50) - 0.5 * gameHours);
                }
                if ((s.thirst ?? 50) <= 0) {
                    s.hp = Math.max(0, (s.hp ?? 50) - 0.8 * gameHours);
                }
                // 精神状态
                if ((s.hunger ?? 50) <= 0 || (s.thirst ?? 50) <= 0) {
                    const mentalShift = { '稳定': '焦虑', '希望': '焦虑', '焦虑': '绝望', '悲痛': '绝望' };
                    if (mentalShift[s.mentality]) s.mentality = mentalShift[s.mentality];
                }
                if ((s.hunger ?? 50) < 20 || (s.thirst ?? 50) < 20 || (s.fatigue ?? 30) > 80) {
                    s.spirit = Math.max(0, (s.spirit ?? 80) - 0.5 * gameHours);
                }
                // 夜间精神略微下降
                if (isNight && (s.fatigue ?? 30) > 50) {
                    s.spirit = Math.max(0, (s.spirit ?? 80) - 0.2 * gameHours);
                }
                // 体力恢复：休息且吃饱喝足时恢复疲劳
                if ((s.hunger ?? 50) > 60 && (s.thirst ?? 50) > 60 && (s.fatigue ?? 30) > 10) {
                    s.fatigue = Math.max(0, (s.fatigue ?? 30) - 0.2 * gameHours * recoverMult);
                }
                // 生命自然恢复：吃饱喝足且疲劳低时缓慢回血
                if ((s.hp ?? 50) < (s.maxHp ?? 100) && (s.hunger ?? 50) > 50 && (s.thirst ?? 50) > 50 && (s.fatigue ?? 30) < 40) {
                    s.hp = Math.min(s.maxHp ?? 100, (s.hp ?? 50) + 0.15 * gameHours * recoverMult);
                }
                sst(s);
            }

            // ===== Auto-bold items and names =====
            function buildItemTooltipHTML(rawName) {
                if (!rawName) return null;
                const name = String(rawName).replace(/<[^>]+>/g, '').trim();
                if (!name || !isValidItemName(name)) return null;
                const s = gst();
                const inv = s && s.inv ? s.inv : [];
                const inInventory = inv.some(i => i && (i === name || name.includes(i) || i.includes(name)));
                const info = getItemInfo(name);
                // Only build tooltip for items that are either in inventory OR have preset data
                if (!inInventory && !info) return null;
                const emoji = itemEmoji(name);
                let h = emoji + '「' + esc(name) + '」';
                if (info) {
                    const cnMap = { consumable: '消耗品', equip: '装备', material: '材料', key: '钥匙' };
                    const scMap = { food: '食品', water: '饮用水', medical: '医疗', weapon: '武器', armor: '防具', tool: '工具', backpack: '背包', fuel: '燃料', build: '建材', tech: '科技', misc: '杂项', tactical: '战术', key: '钥匙' };
                    if (scMap[info.subCategory]) h += ' · ' + scMap[info.subCategory];
                    else if (cnMap[info.category]) h += ' · ' + cnMap[info.category];
                    if (info.effect) h += '\n效果：' + info.effect;
                    if (info.durability !== undefined) h += '\n耐久：' + info.durability;
                    if (info.desc) {
                        let cleanDesc = String(info.desc).replace(/[（(][^）)]*[）)]?/g, m => {
                            if (/\d{1,4}(ml|g|kg|mAh|度|%|小时|天)?$/.test(m.slice(1,-1).trim()) || m.length < 4) return '';
                            return m;
                        }).trim();
                        if (cleanDesc.length > 80) cleanDesc = cleanDesc.slice(0, 80) + '…';
                        if (cleanDesc) h += '\n' + cleanDesc;
                    }
                }
                if (inInventory && !info) {
                    h += ' | 背包物品';
                }
                return h;
            }
            function attachItemInfoToBoldElements(containerEl) {
                if (!containerEl) return;
                containerEl.querySelectorAll('.auto-bold').forEach(el => {
                    if (el._itemInfoBound) return;
                    const rawName = el.textContent.trim();
                    const name = rawName.replace(/<[^>]+>/g, '').trim();
                    // Filter out non-item names (pure numbers, measurements, etc.)
                    if (!isValidItemName(name)) {
                        el._itemInfoBound = true;
                        el.style.cursor = 'default';
                        el.removeAttribute('data-item-info');
                        return;
                    }
                    const info = buildItemTooltipHTML(name);
                    if (!info) {
                        // Not a recognized item — clear the bold tooltip behavior
                        el.style.cursor = 'default';
                        el.removeAttribute('data-item-info');
                        el._itemInfoBound = true;
                        return;
                    }
                    el.setAttribute('data-item-info', info);
                    // Only bind click-tooltip on non-hover devices (mobile/touch)
                    if (!hasHover) {
                        el._tipOpen = false;
                        el.addEventListener('click', (e) => {
                            e.stopPropagation();
                            const rect = el.getBoundingClientRect();
                            const oldTip = document.querySelector('.mobile-item-tip');
                            if (el._tipOpen && oldTip && oldTip._sourceEl === el) { oldTip.remove(); el._tipOpen = false; return; }
                            if (oldTip) { if (oldTip._sourceEl) oldTip._sourceEl._tipOpen = false; oldTip.remove(); }
                            const tip = document.createElement('div');
                            tip.className = 'mobile-item-tip';
                            tip.innerHTML = '<div style="font-weight:bold;color:var(--accent);margin-bottom:4px;">' + (itemEmoji(name)) + ' ' + esc(name) + '</div>' +
                                '<div style="white-space:pre-wrap;font-size:0.72rem;line-height:1.45;color:var(--code-text);">' + esc(info.split('\n').slice(1).join('\n')) + '</div>';
                            tip._sourceEl = el;
                            document.body.appendChild(tip);
                            const tipW = Math.min(240, tip.offsetWidth || 220);
                            let tx = rect.left + rect.width / 2 - tipW / 2;
                            let ty = rect.top - tip.offsetHeight - 8;
                            if (tx < 8) tx = 8;
                            if (tx + tipW > window.innerWidth - 8) tx = window.innerWidth - 8 - tipW;
                            if (ty < 8) ty = rect.bottom + 8;
                            tip.style.left = tx + 'px';
                            tip.style.top = ty + 'px';
                            tip.style.width = tipW + 'px';
                            el._tipOpen = true;
                            const closeHandler = () => { tip.remove(); el._tipOpen = false; document.removeEventListener('click', closeHandler); };
                            setTimeout(() => document.addEventListener('click', closeHandler), 10);
                        });
                    }
                    el._itemInfoBound = true;
                });
            }
            function abold(text) {
                let html = esc(text);
                // 容错处理：如果AI错误地输出了HTML标签（如 <strong class="auto-bold">text</strong>），
                // esc() 会将其转义为 &lt;strong class="auto-bold"&gt;text&lt;/strong&gt;
                // 这里将转义的strong标签重新转换回实际的HTML元素
                html = html.replace(/&lt;strong\s+class=&quot;auto-bold&quot;&gt;([\s\S]*?)&lt;\/strong&gt;/g, '<strong class="auto-bold">$1</strong>');
                // 也处理可能的其他HTML标签
                html = html.replace(/&lt;span\s+class=&quot;item-ref[^&]*&quot;&gt;([\s\S]*?)&lt;\/span&gt;/g, '<span class="item-ref">$1</span>');
                
                html = html.replace(/\*\*([^*]+)\*\*/g, '<strong class="auto-bold">$1</strong>');
                html = html.replace(/【([^】]+)】/g, '<strong class="auto-bold">$1</strong>');
                // 保护已存在的 auto-bold 和 item-ref 标签避免嵌套
                const protectedPlaceholders = [];
                // 使用 [^>]* 捕获完整的标签属性部分（包括 data-item-info 等所有属性）
                html = html.replace(/<(strong class="auto-bold"|span class="item-ref[^>]*)>([\s\S]*?)<\/(strong|span)>/g, (m, tagStart, inner, tagEnd) => {
                    const idx = protectedPlaceholders.length;
                    const tagName = tagStart.indexOf('strong') === 0 ? 'strong' : 'span';
                    protectedPlaceholders.push({ tagName: tagName, tagAttr: tagStart, inner: inner });
                    return '||PROT' + idx + '||';
                });
                const s = gst(), c = gch();
                const names = [];
                if (c && c.cn && c.cn.length >= 2) names.push(c.cn);
                // Normalize inventory items: strip quantity suffixes for bold matching
                if (s && s.inv) s.inv.forEach(i => {
                    if (!i || i.length < 2) return;
                    // Add original name
                    names.push(i);
                    // Also add normalized version (strip x2, 1.5kg, etc. for matching in text)
                    const normalized = i.replace(/\s*(x\d+|\d+\.?\d*\s*[kKmMgGlL升克千克]?)$/i, '').trim();
                    if (normalized.length >= 2 && normalized !== i) names.push(normalized);
                });
                const unique = [...new Set(names)];
                if (unique.length) {
                    // Sort by length descending to match longer names first
                    unique.sort((a, b) => b.length - a.length);
                    const pattern = unique.map(n => esc(n).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
                    if (pattern) {
                        try { html = html.replace(new RegExp('(' + pattern + ')', 'g'), '<strong class="auto-bold">$1</strong>'); } catch (e) {}
                    }
                }
                // Render item references {{name}}
                html = html.replace(/\{\{([^}]+)\}\}/g, (m, name) => {
                    const info = buildItemTooltipHTML(name);
                    if (info) {
                        return '<span class="item-ref auto-bold" data-item-info="' + escAttr(info) + '">' + esc(name) + '</span>';
                    }
                    return '<span class="item-ref">' + esc(name) + '</span>';
                });
                // 还原保护的标签：tagAttr 包含完整的标签名+所有属性，直接拼接即可
                html = html.replace(/\|\|PROT(\d+)\|\|/g, (m, idx) => {
                    const n = parseInt(idx);
                    const p = protectedPlaceholders[n];
                    if (!p) return m;
                    // tagAttr 已经是完整的 "strong class=..." 或 "span class=... data-item-info=..."
                    return '<' + p.tagAttr + '>' + p.inner + '</' + p.tagName + '>';
                });
                return html;
            }

            // ===== Side notification bubbles (queue mode with per-category cooldown) =====
            let notifyQueue = [];
            let notifyBusy = false;
            let _notifyCurrentBatchId = 0;
            let _notifyThisBatchSet = new Set();
            // 按通知签名的冷却记录：Map<sig, lastShownTimestamp>
            const _notifyCooldownMap = new Map();
            function snotifyStartBatch() { _notifyCurrentBatchId = Date.now(); _notifyThisBatchSet = new Set(); }
            function snotifyEndBatch() { _notifyCurrentBatchId = 0; }
            window._snotifyStartBatch = snotifyStartBatch;
            window._snotifyEndBatch = snotifyEndBatch;
            // 分类冷却时间（毫秒）：警告类冷却更久，避免重复刷屏
            const _notifyCooldownByType = {
                'warn': 60000,     // 警告：60秒
                'danger': 45000,   // 危险：45秒
                'info': 30000,     // 信息：30秒
                'status': 3000,    // 状态变更：3秒
                'add': 2000,       // 获得物品：2秒
                'remove': 2000,    // 失去物品：2秒
                'clue': 2000,      // 线索：2秒
                'map': 5000,       // 地图：5秒
                'vehicle': 5000,   // 载具：5秒
                'ability': 3000,   // 异能：3秒
                'craft': 3000,     // 合成：3秒
                'event': 10000,    // 事件：10秒
                'skill_add': 5000, // 技能：5秒
                'trait_add': 5000, // 特质：5秒
                'trait_rem': 5000,
                'memory': 5000
            };
            function snotify(type, label, value) {
                if (_replayingHistory) return;
                const container = $('notifyContainer');
                if (!container) return;
                const now = Date.now();
                const cd = _notifyCooldownByType[type] || 3000;
                const valueSig = [type || '', label || '', value || ''].join('\u0001');
                const noValueSig = [type || '', label || ''].join('\u0001');
                if (_notifyCurrentBatchId > 0) {
                    if (_notifyThisBatchSet.has(valueSig)) return;
                    _notifyThisBatchSet.add(valueSig);
                } else {
                    if (_notifyCooldownMap.has(noValueSig) && (now - _notifyCooldownMap.get(noValueSig) < cd)) return;
                    if (notifyQueue.some(n => [n.type || '', n.label || '', n.value || ''].join('\u0001') === valueSig)) return;
                }
                _notifyCooldownMap.set(noValueSig, now);
                // 清理过期的冷却记录（避免Map无限增长）
                if (_notifyCooldownMap.size > 100) {
                    for (const [k, t] of _notifyCooldownMap) {
                        if (now - t > 120000) _notifyCooldownMap.delete(k);
                    }
                }
                notifyQueue.push({ type, label, value });
                try { sessionStorage.setItem('vn_notifyQueue', JSON.stringify(notifyQueue)); } catch(e) {}
                if (!notifyBusy) processNotifyQueue();
            }
            function processNotifyQueue() {
                const container = $('notifyContainer');
                if (container) {
                    const isMob = typeof isMobile === 'function' ? isMobile() : (window.innerWidth < 768);
                    if (isMob) {
                        container.classList.add('notify-mobile');
                        if (!document.getElementById('notifyMobileStyle_inline')) {
                            const st = document.createElement('style');
                            st.id = 'notifyMobileStyle_inline';
                            st.textContent = '#notifyContainer.notify-mobile{top:60px;right:8px;left:8px;bottom:auto;width:auto;}#notifyContainer.notify-mobile .notify-bubble{margin:0 0 6px;max-width:100%;}';
                            document.head.appendChild(st);
                        }
                    } else {
                        container.classList.remove('notify-mobile');
                    }
                }
                if (!container) { notifyQueue = []; return; }
                if (notifyQueue.length === 0) { notifyBusy = false; return; }
                notifyBusy = true;
                const batch = Math.min(3, notifyQueue.length);
                for (let b = 0; b < batch; b++) {
                    const { type, label, value } = notifyQueue.shift();
                    const el = document.createElement('div');
                    let cls = 'notify-bubble', icon = '', prefix = '';
                    if (type === 'add') { cls += ' type-add'; icon = '+'; prefix = '获得'; }
                    else if (type === 'remove') { cls += ' type-remove'; icon = '−'; prefix = '失去'; }
                    else if (type === 'clue') { cls += ' type-clue'; icon = '!'; prefix = '新线索'; }
                    else if (type === 'status') { cls += ' type-status'; icon = '~'; prefix = label; }
                    else if (type === 'map') { cls += ' type-clue'; icon = 'M'; prefix = '地图解锁'; }
                    else if (type === 'vehicle') { cls += ' type-add'; icon = 'V'; prefix = '载具'; }
                    else if (type === 'warn') { cls += ' type-status'; icon = '⚠'; prefix = label || '警告'; }
                    else if (type === 'danger') { cls += ' type-remove'; icon = '☠'; prefix = label || '危险'; }
                    else if (type === 'info') { cls += ' type-clue'; icon = 'ℹ'; prefix = label || '提示'; }
                    else if (type === 'ability') { cls += ' type-add'; icon = '✦'; prefix = label || '异能'; }
                    else if (type === 'craft') { cls += ' type-add'; icon = '⚒'; prefix = label || '合成'; }
                    else if (type === 'event') { cls += ' type-clue'; icon = '★'; prefix = label || '事件'; }
                    else if (type === 'skill_add') { cls += ' type-add'; icon = '↑'; prefix = label || '技能'; }
                    else if (type === 'trait_add') { cls += ' type-add'; icon = '◆'; prefix = '获得特质'; }
                    else if (type === 'trait_rem') { cls += ' type-remove'; icon = '◇'; prefix = '失去特质'; }
                    el.className = cls;
                    const close = document.createElement('span');
                    close.className = 'notify-close';
                    close.textContent = '✕';
                    close.title = '关闭';
                    close.style.cssText = 'position:absolute;top:2px;right:4px;font-size:0.6rem;cursor:pointer;opacity:0.55;padding:1px 4px;';
                    close.addEventListener('click', (ev) => {
                        ev.stopPropagation();
                        el.classList.add('hide');
                        setTimeout(() => { if (el.parentNode) el.remove(); }, 250);
                    });
                    el.appendChild(close);
                    el.style.position = 'relative';
                    el.addEventListener('click', () => {
                        el.classList.add('hide');
                        setTimeout(() => { if (el.parentNode) el.remove(); }, 250);
                    });
                    const clk = gclk();
                    const timeTag = '<span style="font-size:0.55rem;opacity:0.6;margin-left:4px;">[' + fmtTime(clk.elapsedSec) + ' D' + (clk.day || 1) + ']</span>';
                    if (type === 'status' || type === 'warn' || type === 'danger' || type === 'info') {
                        el.innerHTML = '<span class="notify-icon">' + icon + '</span>' + esc(prefix) + (value ? ' → <strong>' + esc(value) + '</strong>' : '') + timeTag;
                    } else {
                        el.innerHTML = '<span class="notify-icon">' + icon + '</span>' + prefix + ' <strong>' + esc(value) + '</strong>' + timeTag;
                    }
                    try {
                        const vStr = value != null ? String(value) : '';
                        if (vStr && (type === 'status' || type === 'warn' || type === 'danger' || type === 'info' || type === 'add' || type === 'remove')) {
                            const nv = parseFloat(vStr);
                            if (!isNaN(nv) && (vStr.includes('%') || /^\d+(\.\d+)?$/.test(vStr.trim()))) {
                                const hint = document.createElement('span');
                                hint.style.cssText = 'font-size:0.55rem;opacity:0.55;margin-left:4px;';
                                const lbl = (label || '').trim();
                                const propMap = {'饱腹':'hunger','口渴':'thirst','疲劳':'fatigue','HP':'hp','血量':'hp','体温':'bodyTemp','精神':'spirit','欢愉':'joy','负重':'enc'};
                                let trend = '';
                                if (propMap[lbl]) {
                                    const sn = gst();
                                    const key = propMap[lbl];
                                    const prev = parseFloat(window._prevStatus && window._prevStatus[key]);
                                    if (!isNaN(prev)) {
                                        const diff = nv - prev;
                                        if (diff > 0.01) trend = ' <span style="color:var(--notify-add)">↑' + (diff > 1 ? Math.round(diff) : diff.toFixed(1)) + '</span>';
                                        else if (diff < -0.01) trend = ' <span style="color:var(--color-danger)">↓' + (diff < -1 ? Math.round(-diff) : (-diff).toFixed(1)) + '</span>';
                                    }
                                }
                                hint.innerHTML = trend;
                                el.appendChild(hint);
                            }
                        }
                    } catch(e) {}
                    container.appendChild(el);
                    const delay = b * 70;
                    el.style.transitionDelay = (delay / 1000) + 's';
                    el._ts = Date.now() + delay;
                    requestAnimationFrame(() => {
                        setTimeout(() => { el.classList.add('show'); el.style.transitionDelay = ''; }, delay);
                    });
                    setTimeout(() => {
                        el.classList.add('hide');
                        setTimeout(() => { if (el.parentNode) el.remove(); }, 400);
                    }, 2500);
                }
                if (container.children.length > 12) {
                    const all = Array.from(container.children);
                    const overflow = container.children.length - 12;
                    for (let k = 0; k < overflow && k < all.length; k++) {
                        const old = all[k];
                        if (!old) continue;
                        const ts = old._ts || 0;
                        const age = Date.now() - ts;
                        if (age >= 1800 || old.classList.contains('hide')) {
                            old.classList.add('hide');
                            setTimeout(() => { if (old.parentNode) old.remove(); }, 300);
                        }
                    }
                }
                if (notifyQueue.length > 0) {
                    setTimeout(() => processNotifyQueue(), 600);
                } else {
                    notifyBusy = false;
                }
            }

            function spBar(label, val, isPercent) {
                const v = isPercent !== false ? (val != null ? Math.round(val) : 0) : val;
                const display = isPercent !== false ? v + '%' : val;
                const pct = isPercent !== false ? Math.max(0, Math.min(100, v)) : 50;
                let color = 'var(--accent)';
                if (isPercent !== false) {
                    if (pct < 25) color = 'var(--color-danger)';
                    else if (pct < 50) color = 'var(--color-warn)';
                    else if (pct < 75) color = 'var(--notify-add)';
                }
                return '<div class="sp-bar-row"><span class="sp-bar-lbl">' + label + '</span><div class="sp-bar-bg"><div class="sp-bar-fg" style="width:' + pct + '%;background:' + color + ';"></div></div><span class="sp-bar-val">' + display + '</span></div>';
            }
            function upWelcome() {
                const el = $('welcomeText');
                if (!el) return;
                const c = gch();
                const dn = c.dn || '未知灾难';
                const days = c.days || '';
                const extra = c.extraFeature || '';
                let html = dn;
                if (days) html += '已过去' + days;
                html += '…<br>你独自在这片废墟中求生。';
                if (extra === '异能') {
                    const ab = c.abilityName || '未知异能';
                    html += '<br><span style="color:var(--accent);">' + ab + '</span>在体内觉醒…';
                }
                el.innerHTML = html;
            }
            function updateSideView() {
                const profileView = $('sideProfileView');
                const panelView = $('sidePanelView');
                if (!profileView || !panelView) return;
                if (sideMode === 'profile') {
                    profileView.style.display = '';
                    panelView.style.display = 'none';
                } else {
                    profileView.style.display = 'none';
                    panelView.style.display = '';
                }
            }
            function renderClueSidebar() {
                const cont = $('clueNoteContent');
                if (!cont) return;
                const s = gst();
                // 归一化所有线索为对象，并回写以避免 string/object 混用 bug
                if (s && s.clues && s.clues.length) {
                    s.clues = s.clues.map((c, i) => {
                        if (typeof c === 'string') {
                            return { text: c, priority: 2, id: 'clue_' + i + '_' + Date.now(), time: '' };
                        }
                        return {
                            text: c.text || c.content || String(c),
                            priority: c.priority || 2,
                            id: c.id || ('clue_' + i + '_' + Date.now()),
                            time: c.time || ''
                        };
                    });
                    sst(s);
                }
                // 读取归一化后的线索
                let clues = (s && s.clues) ? s.clues.slice() : [];
                // 按优先级排序（1=高, 3=低），同优先级保持原序
                clues.sort((a, b) => {
                    const pa = (a.priority || 2), pb = (b.priority || 2);
                    if (pa !== pb) return pa - pb;
                    return 0;
                });
                // Update clue count in header
                const header = $('clueSidebar') ? $('clueSidebar').querySelector('.clue-sidebar-header span') : null;
                if (header) {
                    header.textContent = '📌 线索便签（' + clues.length + '）';
                }
                // Update quick-action badge
                const badge = $('clueCountBadge');
                if (badge) {
                    if (clues.length > 0) {
                        badge.textContent = '·' + clues.length;
                        badge.style.display = '';
                    } else {
                        badge.style.display = 'none';
                    }
                }
                // 渲染线索列表（空列表也显示提示+按钮）
                let html = '';
                if (!clues.length) {
                    html += '<div class="clue-note-empty">暂无线索<br>去探索世界，发现更多真相吧～</div>';
                } else {
                    html += clues.map((c, i) => {
                        const idx = clues.length - i;
                        const priority = c.priority || 2;
                        const pClass = 'p' + priority;
                        const actions = '<div class="clue-actions">' +
                            '<span data-act="edit" data-id="' + c.id + '">✎ 编辑</span>' +
                            '<span data-act="del" data-id="' + c.id + '">✕ 删除</span>' +
                            '</div>';
                        return '<div class="clue-note-item" data-id="' + c.id + '">' +
                            '<span class="clue-priority ' + pClass + '" data-priority="' + priority + '" title="点击切换优先级">' + priority + '</span>' +
                            '<span style="font-weight:bold;margin-right:4px;color:#b58b5a;">#' + idx + '</span>' +
                            esc(c.text || '') +
                            actions +
                            '</div>';
                    }).join('');
                }
                // 始终添加操作按钮
                html += '<div class="clue-sidebar-actions">' +
                    '<button id="btnAddClue">+ 添加线索</button>' +
                    '<button id="btnSortClue">自动排序</button>' +
                    '</div>';
                cont.innerHTML = html;

                // Bind events for clue items
                cont.querySelectorAll('.clue-note-item').forEach(item => {
                    const priSpan = item.querySelector('.clue-priority');
                    if (priSpan) {
                        priSpan.onclick = (e) => {
                            e.stopPropagation();
                            const curPri = parseInt(priSpan.dataset.priority);
                            const newPri = curPri >= 3 ? 1 : curPri + 1;
                            const s2 = gst();
                            if (s2 && s2.clues) {
                                const itemId = item.dataset.id;
                                const clueObj = s2.clues.find(c => c.id === itemId);
                                if (clueObj) {
                                    clueObj.priority = newPri;
                                    sst(s2);
                                    renderClueSidebar();
                                }
                            }
                        };
                    }
                    // 阻止长按触发删除：使用 click 而非 touchstart/touchend
                    item.querySelectorAll('.clue-actions span').forEach(btn => {
                        btn.onclick = (e) => {
                            e.stopPropagation();
                            const act = btn.dataset.act;
                            const itemId = btn.dataset.id;
                            const s2 = gst();
                            if (!s2 || !s2.clues) return;
                            if (act === 'del') {
                                // 仅删除匹配 id 的线索，不影响其他线索
                                s2.clues = s2.clues.filter(c => c.id !== itemId);
                                sst(s2);
                                renderClueSidebar();
                                playSfx('drop');
                            } else if (act === 'edit') {
                                const clueObj = s2.clues.find(c => c.id === itemId);
                                if (clueObj) {
                                    sketchPrompt('编辑线索内容：', clueObj.text || '', '编辑线索').then(newText => {
                                        if (newText !== null && newText.trim()) {
                                            clueObj.text = newText.trim();
                                            sst(s2);
                                            renderClueSidebar();
                                            playSfx('pickup');
                                        }
                                    });
                                }
                            }
                        };
                    });
                });

                // Add clue button
                const addBtn = cont.querySelector('#btnAddClue');
                if (addBtn) {
                    addBtn.onclick = () => {
                        sketchPrompt('请输入新线索内容：', '', '添加线索').then(text => {
                            if (text && text.trim()) {
                                const s2 = gst();
                                if (!s2.clues) s2.clues = [];
                                s2.clues.push({
                                    text: text.trim(),
                                    priority: 2,
                                    id: 'clue_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
                                    time: (gclk().day || 1) + '日 ' + fmtTime(gclk().elapsedSec)
                                });
                                sst(s2);
                                renderClueSidebar();
                                playSfx('pickup');
                                tst('新线索已添加');
                            }
                        });
                    };
                }

                // Sort button
                const sortBtn = cont.querySelector('#btnSortClue');
                if (sortBtn) {
                    sortBtn.onclick = () => {
                        const s2 = gst();
                        if (!s2 || !s2.clues || !s2.clues.length) {
                            tst('暂无线索可排序');
                            return;
                        }
                        // 按关键词智能分级
                        s2.clues.forEach(c => {
                            const text = c.text || '';
                            if (/(重要|关键|核心|危险|警告|注意|紧急|必须|致命|感染|密码|钥匙|代码|逃离|出口|秘密|隐藏)/.test(text)) {
                                c.priority = 1;
                            } else if (/(线索|提示|发现|记得|记住|地图|位置|方向|幸存者|商人|营地|任务|物品|路线|时间|天气)/.test(text)) {
                                c.priority = 2;
                            } else {
                                c.priority = 3;
                            }
                        });
                        // 按优先级排序
                        s2.clues.sort((a, b) => {
                            const pa = a.priority || 2, pb = b.priority || 2;
                            if (pa !== pb) return pa - pb;
                            return 0;
                        });
                        sst(s2);
                        renderClueSidebar();
                        tst('已自动排序线索（按关键词智能分级）');
                        playSfx('pickup');
                    };
                }

                // Clear any drag-position inline styles
                const clueSb = $('clueSidebar');
                if (clueSb) {
                    if (clueSb.style.left) clueSb.style.left = '';
                    if (clueSb.style.top) clueSb.style.top = '';
                }
            }
            function upui() {
                const s = gst();
                const ch = gch();
                const f = cfg();
                // God badge
                const gb = $('godBadge');
                if (gb) {
                    if (f.debug) gb.classList.add('show'); else gb.classList.remove('show');
                }
                // Idle badge - 点击挂机出现，停止挂机消失
                const ib = $('idleBadge');
                if (ib) {
                    if (f.idleOn) { ib.textContent = '挂机中 · ' + (f.idleDir || '休养'); ib.classList.add('show'); }
                    else { ib.classList.remove('show'); }
                }
                // Ensure idle button text matches state
                const ibtn = $('btnIdle');
                if (ibtn) {
                    if (f.idleOn) { ibtn.textContent = '停止挂机'; ibtn.classList.add('accent'); }
                    else { ibtn.textContent = '挂机'; ibtn.classList.remove('accent'); }
                }
                // Profile section
                if (sideMode === 'profile' && $('sideProfile')) {
                    const abilityDisp = ch.extraFeature === '异能' && ch.abilityName;
                    const abName = abilityDisp ? (ABILITIES[ch.abilityName] ? ABILITIES[ch.abilityName].name : ch.abilityName) : '';
                    $('sideProfile').innerHTML =
                        '<div class="sp-card">' +
                        '<div class="sp-row"><span class="sp-lbl">姓名</span><span class="sp-val">' + esc(ch.cn || '幸存者') + '</span></div>' +
                        '<div class="sp-row"><span class="sp-lbl">性别</span><span class="sp-val">' + esc(ch.gd || '未设定') + ' / ' + esc(ch.ca || '未知') + '</span></div>' +
                        '<div class="sp-row"><span class="sp-lbl">体型</span><span class="sp-val">' + esc(ch.bt || '未设定') + ' / ' + (ch.ht || '--') + 'cm / ' + (ch.wt || '--') + 'kg</span></div>' +
                        '<div class="sp-row"><span class="sp-lbl">职业</span><span class="sp-val">' + esc(ch.job || '未设定') + '</span></div>' +
                        '<div class="sp-row"><span class="sp-lbl">性格</span><span class="sp-val">' + esc(ch.pers || '未设定') + '</span></div>' +
                        '<div class="sp-row"><span class="sp-lbl">外貌</span><span class="sp-val" style="max-width:180px;">' + esc(ch.app || '未设定') + '</span></div>' +
                        '<div class="sp-row"><span class="sp-lbl">恐惧</span><span class="sp-val">' + esc(ch.fear || '无') + '</span></div>' +
                        '</div>' +
                        '<div class="sp-card">' +
                        '<div class="sp-row"><span class="sp-lbl">技能</span></div>' +
                        '<div style="font-size:0.72rem;color:var(--ink-soft);line-height:1.5;padding:2px 0 0;">' + esc(ch.skl || '无') + '</div>' +
                        (abName ? '<div class="sp-row" style="margin-top:4px;color:var(--accent);"><span class="sp-lbl">异能</span><span class="sp-val">' + esc(abName) + '</span></div>' : '') +
                        '</div>';
                }
                // Background story
                if (sideMode === 'profile' && $('sideBackground')) {
                    $('sideBackground').innerHTML = '<div class="sp-card" style="font-size:0.72rem;color:var(--ink-soft);line-height:1.5;">' + esc(ch.bg || '暂无背景') + '</div>';
                }
                // Traits (profile view)
                if (sideMode === 'profile' && $('sideTraits')) {
                    const tp = (ch.tp && ch.tp.length) ? ch.tp.map(t => '<span class="trait-chip positive">' + esc(t) + '</span>').join('') : '';
                    const tn = (ch.tn && ch.tn.length) ? ch.tn.map(t => '<span class="trait-chip negative">' + esc(t) + '</span>').join('') : '';
                    $('sideTraits').innerHTML = '<div class="sp-card">' + ((tp || tn) ? (tp + tn) : '<span style="font-size:0.7rem;color:var(--ink-soft);">无特殊特质</span>') + '</div>';
                }
                if ($('stHunger')) $('stHunger').textContent = Math.round(s.hunger);
                if ($('stThirst')) $('stThirst').textContent = Math.round(s.thirst);
                if ($('stFatigue')) $('stFatigue').textContent = Math.round(s.fatigue);
                if ($('stBodyTemp')) $('stBodyTemp').textContent = (Math.round((s.bodyTemp || 37) * 10) / 10).toFixed(1);
                if ($('stInjury')) $('stInjury').textContent = s.injury;
                if ($('stEnc')) $('stEnc').textContent = s.enc;
                if ($('stMentality')) $('stMentality').textContent = mentalityLabel(s.mentality);
                if ($('stSpirit')) $('stSpirit').textContent = s.spirit != null ? Math.round(s.spirit) : '--';
                if ($('stJoy')) { $('stJoy').textContent = (s.pleasureUnlocked && s.joy != null) ? Math.round(s.joy) + '%' : '隐藏'; if ($('stJoyItem')) $('stJoyItem').style.display = s.pleasureUnlocked ? '' : 'none'; }
                if (sideMode === 'panel' && $('sideProps')) $('sideProps').innerHTML =
                    '<div class="sp-card">' +
                        (s.hp != null ? spBar('● 血量', s.hp) : '') +
                        spBar('● 饱腹', s.hunger) +
                        spBar('● 口渴', s.thirst) +
                        spBar('● 疲劳', s.fatigue) +
                        spBar('● 体温', s.bodyTemp != null ? s.bodyTemp : 36.5, false) +
                    '</div>' +
                    '<div class="sp-card">' +
                        spBar('● 精神', s.spirit != null ? s.spirit : 0) +
                        spBar('● 心态', mentalityLabel(s.mentality), false) +
                        (s.pleasureUnlocked ? spBar('● 欢愉', s.joy != null ? s.joy : 0) : '') +
                    '</div>' +
                    '<div class="sp-card">' +
                        '<div class="sp-row"><span class="sp-lbl">● 伤势</span><span class="sp-val">' + esc(s.injury) + '</span></div>' +
                        '<div class="sp-row"><span class="sp-lbl">● 负重</span><span class="sp-val">' + s.enc + 'kg</span></div>' +
                        (s.vehicle && s.vehicle !== '无' ? '<div class="sp-row"><span class="sp-lbl">● 载具</span><span class="sp-val">' + esc(s.vehicle) + '</span></div>' : '') +
                        (s.status && s.status.length ? '<div class="sp-row"><span class="sp-lbl">● 状态</span><span class="sp-val">' + s.status.map(x => esc(x)).join('、') + '</span></div>' : '') +
                    '</div>' +
                    (s.weaponDurability && Object.keys(s.weaponDurability).length ? '<div class="sp-card"><div class="sp-row" style="font-size:0.66rem;color:var(--ink-soft);margin-bottom:4px;">● 武器耐久</div>' + Object.entries(s.weaponDurability).map(([w,d]) => spBar(w, d)).join('') + '</div>' : '') +
                    (s.ammo && Object.keys(s.ammo).length ? '<div class="sp-card"><div class="sp-row" style="font-size:0.66rem;color:var(--ink-soft);margin-bottom:4px;">● 弹药</div>' + Object.entries(s.ammo).map(([a,c]) => spBar(a, c)).join('') + '</div>' : '') +
                    (s.npcRel && Object.keys(s.npcRel).length ? '<div class="sp-card"><div class="sp-row" style="font-size:0.66rem;color:var(--ink-soft);margin-bottom:4px;">● NPC关系 (' + Object.keys(s.npcRel).length + ')</div>' + Object.entries(s.npcRel).map(([n,r]) => {
                        const t = Math.max(0, Math.min(100, r.trust||0));
                        const a = Math.max(0, Math.min(100, r.affinity||0));
                        const lastMeet = r.lastMeet ? '第' + r.lastMeet + '天' : '未知';
                        return '<div class="sp-row" style="display:block;margin-bottom:6px;padding:4px 6px;background:var(--bg-paper-alt);border-radius:4px;">' +
                            '<div style="display:flex;justify-content:space-between;font-weight:bold;color:var(--accent);font-size:0.72rem;margin-bottom:2px;">' + esc(n) + '<span style="font-size:0.6rem;color:var(--text-muted);">上次:' + lastMeet + '</span></div>' +
                            '<div style="font-size:0.66rem;margin-bottom:1px;">信任 <span style="display:inline-block;width:60px;height:6px;background:var(--bg-paper);border-radius:3px;overflow:hidden;vertical-align:middle;margin:0 4px;"><span style="display:block;height:100%;width:' + t + '%;background:' + (t > 60 ? 'var(--notify-add)' : t > 30 ? 'var(--color-warn)' : 'var(--color-danger)') + ';"></span></span>' + t + '%</div>' +
                            '<div style="font-size:0.66rem;">好感 <span style="display:inline-block;width:60px;height:6px;background:var(--bg-paper);border-radius:3px;overflow:hidden;vertical-align:middle;margin:0 4px;"><span style="display:block;height:100%;width:' + a + '%;background:' + (a > 60 ? 'var(--accent)' : a > 30 ? 'var(--color-warn)' : 'var(--color-danger)') + ';"></span></span>' + a + '%</div>' +
                            '</div>';
                    }).join('') + '</div>' : '') +
                    (s.bookmarks && s.bookmarks.length ? '<div class="sp-card"><div class="sp-row" style="font-size:0.66rem;color:var(--ink-soft);margin-bottom:4px;">★ 收藏夹 (' + s.bookmarks.length + ')</div>' + s.bookmarks.slice(-5).reverse().map(b => '<div class="sp-row" style="font-size:0.68rem;"><span class="sp-lbl" style="max-width:120px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">' + esc(b.text) + '</span><span class="sp-val" style="font-size:0.58rem;color:var(--text-muted);">' + esc(b.time || '') + '</span></div>').join('') + '</div>' : '');
                if (sideMode === 'panel' && $('sideClues')) { /* sideClues removed, clues shown in floating sidebar */ }
                if (sideMode === 'panel' && $('sideLocation')) $('sideLocation').innerHTML = esc(s.location || ch.sp || '未知');
                if (sideMode === 'panel' && $('sideMap')) {
                    const unlocked = s.mapUnlock || [];
                    const rawMap = (ch.map || '').split(/[、，,;；\n]/).map(x => x.trim()).filter(Boolean);
                    const rawLocs = (ch.loc || '').split(/[、，,;；\n]/).map(x => x.trim()).filter(Boolean);
                    const defaultAreas = (DCHR.map || '').split(/[、，,;；\n]/).map(x => x.trim()).filter(Boolean);
                    const allAreas = rawMap.length ? rawMap : (rawLocs.length ? rawLocs : defaultAreas);
                    const curLoc = s.location || ch.sp || '';
                    const cols = Math.min(3, allAreas.length);
                    const rows = Math.ceil(allAreas.length / cols);
                    const cellW = 100 / cols;
                    const cellH = 100 / rows;
                    let svg = '<svg viewBox="0 0 100 100" style="width:100%;height:100%;display:block;background:var(--bg-paper-alt);border:1.5px solid var(--border-light);border-radius:6px;margin-bottom:6px;">';
                    const startX = cellW / 2, startY = cellH / 2;
                    allAreas.forEach((area, i) => {
                        const col = i % cols, row = Math.floor(i / cols);
                        const x = startX + col * cellW;
                        const y = startY + row * cellH;
                        const isUnlocked = unlocked.some(u => area.includes(u) || u.includes(area));
                        const isCurrent = curLoc && (curLoc.includes(area) || area.includes(curLoc));
                        if (i > 0) {
                            const prevCol = (i - 1) % cols, prevRow = Math.floor((i - 1) / cols);
                            const prevX = startX + prevCol * cellW;
                            const prevY = startY + prevRow * cellH;
                            const bothUnlocked = isUnlocked && unlocked.some(u => allAreas[i-1].includes(u) || u.includes(allAreas[i-1]));
                            svg += '<line x1="' + prevX + '" y1="' + prevY + '" x2="' + x + '" y2="' + y + '" stroke="' + (bothUnlocked ? 'var(--accent)' : 'var(--border-light)') + '" stroke-width="0.5" stroke-dasharray="' + (bothUnlocked ? '' : '1,1') + '"/>';
                        }
                        if (i === 0) {
                            svg += '<line x1="' + startX + '" y1="' + startY + '" x2="' + x + '" y2="' + y + '" stroke="' + (isUnlocked ? 'var(--accent)' : 'var(--border-light)') + '" stroke-width="0.5"/>';
                        }
                        const fill = isCurrent ? 'var(--accent)' : isUnlocked ? '#8b4513' : '#b0a090';
                        const radius = isCurrent ? '3' : '2';
                        svg += '<circle cx="' + x + '" cy="' + y + '" r="' + radius + '" fill="' + fill + '" opacity="' + (isUnlocked || isCurrent ? '1' : '0.4') + '"/>';
                        svg += '<text x="' + x + '" y="' + (y + 4.5) + '" text-anchor="middle" font-size="2.6" fill="' + (isUnlocked || isCurrent ? 'var(--ink)' : 'var(--text-muted)') + '">' + esc(area.length > 6 ? area.slice(0, 6) : area) + '</text>';
                    });
                    svg += '</svg>';
                    let listHTML = '';
                    allAreas.forEach(area => {
                        const isUnlocked = unlocked.some(u => area.includes(u) || u.includes(area));
                        const isCurrent = curLoc && (curLoc.includes(area) || area.includes(curLoc));
                        listHTML += '<div class="map-item ' + (isUnlocked ? 'unlocked' : 'locked') + (isCurrent ? ' current' : '') + '">' + (isCurrent ? '★ ' : isUnlocked ? '◆ ' : '◇ ') + esc(area) + '</div>';
                    });
                    $('sideMap').innerHTML = svg + '<div style="max-height:120px;overflow-y:auto;margin-top:4px;">' + listHTML + '</div>';
                }
                renderClueSidebar();
                updClockUI();
                // Auto-refresh backpack if it's currently open (so new items appear immediately)
                const bpModal = $('backpackModal');
                if (bpModal && bpModal.style.display === 'flex' && typeof renderBackpack === 'function') {
                    renderBackpack();
                }
            }
            function mentalityLabel(m) {
                const map = { '稳定': '稳定', '焦虑': '焦虑', '悲痛': '悲痛', '坚定': '坚定', '创伤': '创伤', '希望': '希望', '绝望': '绝望', 'stable': '稳定', 'anxious': '焦虑', 'grieving': '悲痛', 'determined': '坚定', 'traumatized': '创伤', 'hopeful': '希望', 'desperate': '绝望' };
                return map[m] || m || '稳定';
            }

            function mds(ch) {
                try {
                    const s0 = gst();
                    window._prevStatus = {
                        hunger: s0.hunger, thirst: s0.thirst, fatigue: s0.fatigue,
                        hp: s0.hp, bodyTemp: s0.bodyTemp, spirit: s0.spirit,
                        joy: s0.joy, enc: s0.enc
                    };
                } catch(e) {}
                const s = gst();
                const c = gch();
                if (ch.hp !== undefined) { 
                    s.hp = Math.max(0, Math.min(s.maxHp || 100, ch.hp)); 
                    if (s.hp <= 0 && !cfg().debug) { 
                        s.injury = s.injury === '无' ? '致命伤' : s.injury + '（致命）';
                        s.deathTriggered = true;
                    } 
                }
                // Check for death conditions
                if (!cfg().debug && s.hp <= 0 && !s.deathShown) {
                    s.deathShown = true;
                    triggerDeathEnding(s);
                }
                if (ch.wpnDurName && ch.wpnDurDelta !== undefined) {
                    if (!s.weaponDurability) s.weaponDurability = {};
                    const cur = s.weaponDurability[ch.wpnDurName] || 100;
                    s.weaponDurability[ch.wpnDurName] = Math.max(0, Math.min(100, cur + ch.wpnDurDelta));
                }
                if (ch.ammoName && ch.ammoDelta !== undefined) {
                    if (!s.ammo) s.ammo = {};
                    s.ammo[ch.ammoName] = Math.max(0, (s.ammo[ch.ammoName] || 0) + ch.ammoDelta);
                }
                if (ch.battle) {
                    if (ch.battle === '胜') { s.spirit = Math.min(100, (s.spirit || 50) + 10); s.notify = '战斗胜利'; playSfx('victory'); }
                    else if (ch.battle === '负') { s.spirit = Math.max(0, (s.spirit || 50) - 30); s.injury = s.injury === '无' ? '重伤' : s.injury + '（加重）'; s.notify = '战斗失败'; playSfx('danger'); }
                    else if (ch.battle === '伤') { s.injury = s.injury === '无' ? '轻伤' : s.injury; s.notify = '战斗中受伤'; playSfx('warn'); }
                }
                if (ch.hp !== undefined && ch.hp <= 30 && ch.hp > 0) playSfx('warn');
                if (ch.ai) { if (!s.inv.includes(ch.ai)) { s.inv.push(ch.ai); playSfx('pickup'); } }
                // Handle multiple item additions (ptg aiList) — 限制每次最多收集8种物品
                if (ch.aiList && Array.isArray(ch.aiList)) {
                    const newItems = ch.aiList.filter(v => v && !s.inv.includes(v)).slice(0, 8);
                    newItems.forEach(v => { s.inv.push(v); playSfx('pickup'); });
                    if (ch.aiList.length > 8) {
                        snotify('status', '物资限制', '单次收集已上限8种，多余物品未拾取');
                    }
                }
                if (ch.bookmark) {
                    if (!s.bookmarks) s.bookmarks = [];
                    s.bookmarks.push({ id: Date.now(), text: ch.bookmark, time: gclk().day + '日 ' + fmtTime(gclk().elapsedSec) });
                }
                if (ch.npcRel) {
                    if (!s.npcRel) s.npcRel = {};
                    Object.keys(ch.npcRel).forEach(npc => {
                        if (!s.npcRel[npc]) s.npcRel[npc] = { trust: 0, affinity: 0 };
                        const { field, val } = ch.npcRel[npc];
                        if (field === '信任度') s.npcRel[npc].trust = Math.max(0, Math.min(100, val));
                        else if (field === '好感度') s.npcRel[npc].affinity = Math.max(0, Math.min(100, val));
                        s.npcRel[npc].lastMeet = gclk().day;
                    });
                }
                if (ch.hunger !== undefined) s.hunger = Math.max(0, Math.min(100, ch.hunger));
                if (ch.thirst !== undefined) s.thirst = Math.max(0, Math.min(100, ch.thirst));
                if (ch.fatigue !== undefined) s.fatigue = Math.max(0, Math.min(100, ch.fatigue));
                if (ch.bodyTemp !== undefined) s.bodyTemp = Math.max(30, Math.min(45, ch.bodyTemp));
                if (ch.injury !== undefined) s.injury = ch.injury;
                if (ch.enc !== undefined) s.enc = Math.max(0, ch.enc);
                if (ch.mentality !== undefined) s.mentality = ch.mentality;
                if (ch.spirit !== undefined) s.spirit = Math.max(0, Math.min(100, ch.spirit));
                if (ch.joy !== undefined) { s.joy = Math.max(0, Math.min(100, ch.joy)); if (ch.joy > 0) s.pleasureUnlocked = true; }
                // Item removal helper: removes one instance of itemName from inventory
                function removeOneItem(inv, itemName) {
                    let idx = inv.findIndex(i => i === itemName);
                    if (idx < 0) idx = inv.findIndex(i => { const m = i.match(/^(.+?)x(\d+)$/); return m && m[1] === itemName; });
                    if (idx < 0) idx = inv.findIndex(i => i.includes(itemName));
                    if (idx >= 0) {
                        const item = inv[idx];
                        const cm = item.match(/^(.+?)x(\d+)$/);
                        if (cm) {
                            const n = parseInt(cm[2]) - 1;
                            if (n <= 0) inv.splice(idx, 1);
                            else inv[idx] = cm[1] + 'x' + n;
                        } else {
                            inv.splice(idx, 1);
                        }
                        return true;
                    }
                    return false;
                }
                // Backward compat: single item removal (ch.ri)
                if (ch.ri) {
                    const qty = ch.riQty || 1;
                    for (let q = 0; q < qty; q++) removeOneItem(s.inv, ch.ri);
                }
                // Multiple item removals (ptg riList)
                if (ch.riList && Array.isArray(ch.riList)) {
                    ch.riList.forEach(r => {
                        for (let q = 0; q < (r.qty || 1); q++) removeOneItem(s.inv, r.name);
                    });
                }
                if (ch.equip) {
                    if (!s.equip) s.equip = { head:'',body:'',legs:'',feet:'',weapon:'',offhand:'',backpack:'',accessory:'' };
                    Object.keys(ch.equip).forEach(k => { s.equip[k] = ch.equip[k]; });
                }
                if (ch.cl) { if (!s.clues) s.clues = []; const exist = s.clues.some(c => (typeof c === 'string' ? c === ch.cl : (c && c.text === ch.cl))); if (!exist) s.clues.push({ text: ch.cl, priority: 2, id: 'clue_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6), time: (gclk().day || 1) + '日 ' + fmtTime(gclk().elapsedSec) }); }
                if (ch.clList && Array.isArray(ch.clList)) { if (!s.clues) s.clues = []; ch.clList.forEach(v => { const exist = s.clues.some(c => (typeof c === 'string' ? c === v : (c && c.text === v))); if (!exist) s.clues.push({ text: v, priority: 2, id: 'clue_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6), time: (gclk().day || 1) + '日 ' + fmtTime(gclk().elapsedSec) }); }); }
                if (ch.stAdd) { if (!s.status) s.status = []; if (!s.status.includes(ch.stAdd)) s.status.push(ch.stAdd); }
                if (ch.stRem) {
                    if (s.status) s.status = s.status.filter(x => x !== ch.stRem);
                    // 追踪治愈次数（用于成就判定）
                    if (ch.stRem.startsWith('治愈-') || ['流血','感染','中毒','骨折','失温','恐慌','虚脱'].includes(ch.stRem)) {
                        s.healCount = (s.healCount || 0) + 1;
                    }
                }
                if (ch.veh) s.vehicle = ch.veh;
                if (ch.mapAdd) { if (!s.mapUnlock) s.mapUnlock = []; if (!s.mapUnlock.includes(ch.mapAdd)) s.mapUnlock.push(ch.mapAdd); }
                if (ch.mapNew) {
                    const curMap = (c.map || '').split(/[、，,;；\n]/).map(x => x.trim()).filter(Boolean);
                    const newArea = ch.mapNew.trim();
                    if (newArea && !curMap.includes(newArea)) {
                        curMap.push(newArea);
                        c.map = curMap.join('、');
                        sch(c);
                    }
                }
                if (ch.mapExpand) {
                    const curMap = (c.map || '').split(/[、，,;；\n]/).map(x => x.trim()).filter(Boolean);
                    const expansions = ch.mapExpand.split(/[、，,;；\n]/).map(x => x.trim()).filter(Boolean);
                    expansions.forEach(e => { if (e && !curMap.includes(e)) curMap.push(e); });
                    c.map = curMap.join('、');
                    sch(c);
                }
                if (ch.weather) { const c2 = gclk(); c2.weather = ch.weather; sclk(c2); }
                if (ch.temp !== undefined) { const c2 = gclk(); c2.temp = ch.temp; sclk(c2); }
                if (ch.abilityLevel !== undefined) { s.abilityLevel = Math.max(0, Math.min(5, ch.abilityLevel)); }
                if (ch.abilityUp) { s.abilityLevel = Math.min(5, (s.abilityLevel || 0) + 1); }
                if (ch.advTime) advTime(ch.advTime);
                if (ch.location) s.location = ch.location;
                if (ch.traitsAdd) { if (!s.traits) s.traits = []; if (!s.traits.includes(ch.traitsAdd)) s.traits.push(ch.traitsAdd); }
                if (ch.traitsRem) { if (s.traits) s.traits = s.traits.filter(x => x !== ch.traitsRem); }
                if (ch.craftResult) {
                    const recipes = (window.GameSystems && window.GameSystems.getCraftingRecipes) ? window.GameSystems.getCraftingRecipes() : [];
                    const recipe = recipes.find(r => r.name === ch.craftResult);
                    if (recipe) {
                        const ingCount = recipe.ingredients.length;
                        let ingMatched = 0;
                        recipe.ingredients.forEach(ing => {
                            const idx = s.inv.findIndex(i => {
                                const name = i.replace(/\s*(x\d+|\d+\.?\d*\s*[kKmMgGlL升克千克]?)$/i, '').trim();
                                return name === ing;
                            });
                            if (idx >= 0) {
                                const item = s.inv[idx];
                                const match = item.match(/(.*)x(\d+)/);
                                if (match) {
                                    const count = parseInt(match[2]) - 1;
                                    if (count <= 0) s.inv.splice(idx, 1);
                                    else s.inv[idx] = match[1] + 'x' + count;
                                } else {
                                    s.inv.splice(idx, 1);
                                }
                                ingMatched++;
                            }
                        });
                        if (ingMatched === ingCount) {
                            s.inv.push(recipe.result);
                            s.crafts = (s.crafts || 0) + 1;
                            addLogEntry('craft', '成功合成：' + recipe.result);
                        } else {
                            s.inv.push(ch.craftResult);
                            s.crafts = (s.crafts || 0) + 1;
                            addLogEntry('craft', 'AI合成：' + ch.craftResult);
                        }
                    } else {
                        s.inv.push(ch.craftResult);
                        addLogEntry('craft', 'AI合成：' + ch.craftResult);
                    }
                }
                if (ch.skillAdd) {
                    if (!c.skills) c.skills = {};
                    const skillName = ch.skillAdd;
                    c.skills[skillName] = (c.skills[skillName] || 0) + 1;
                    sch(c);
                    addLogEntry('skill', '技能提升：' + skillName);
                    playSfx('levelup');
                }
                if (ch.skillRem) {
                    if (!c.skills) c.skills = {};
                    const skillName = ch.skillRem;
                    c.skills[skillName] = Math.max(0, (c.skills[skillName] || 1) - 1);
                    sch(c);
                }
                if (ch.keyMemory && typeof window.GameSystems !== 'undefined' && window.GameSystems.addKeyMemory) {
                    window.GameSystems.addKeyMemory(ch.keyMemory, 'narrative');
                }
                if (ch.trauma) {
                    if (!s.traumas) s.traumas = [];
                    if (!s.traumas.includes(ch.trauma)) s.traumas.push(ch.trauma);
                    if (s.spirit !== undefined) s.spirit = Math.max(0, s.spirit - 10);
                    s.injury = s.injury === '无' ? '心理创伤' : s.injury + '（心理创伤）';
                    addLogEntry('trauma', '创伤事件：' + ch.trauma);
                    playSfx('danger');
                }
                if (ch.event) {
                    addLogEntry('event', ch.event);
                }
                sst(s);
                upui();
            }

            // ===== Parse AI tags (expanded) =====
            // silent: if true, skip mds() state update and snotify() notifications (used during history replay)
            let _replayingHistory = false;
            function ptg(tx, silent) {
                const ch = {};
                const notes = [];
                const firedSet = new Set();
                tx = tx.replace(/\[([^\]]+)\]/g, (m, tg) => {
                    if (tg.startsWith('饱腹:')) { const v = Math.max(0, Math.min(100, parseInt(tg.split(':')[1]) || 0)); ch.hunger = v; const key = 'status:饱腹:' + v; if (!firedSet.has(key)) { firedSet.add(key); notes.push({ ty: 'status', label: '饱腹', val: v + '%' }); } }
                    else if (tg.startsWith('口渴:')) { const v = Math.max(0, Math.min(100, parseInt(tg.split(':')[1]) || 0)); ch.thirst = v; const key = 'status:口渴:' + v; if (!firedSet.has(key)) { firedSet.add(key); notes.push({ ty: 'status', label: '口渴', val: v + '%' }); } }
                    else if (tg.startsWith('疲劳:')) { const v = Math.max(0, Math.min(100, parseInt(tg.split(':')[1]) || 0)); ch.fatigue = v; const key = 'status:疲劳:' + v; if (!firedSet.has(key)) { firedSet.add(key); notes.push({ ty: 'status', label: '疲劳', val: v + '%' }); } }
                    else if (tg.startsWith('体温:')) { const v = Math.max(30, Math.min(45, parseFloat(tg.split(':')[1]) || 37)); ch.bodyTemp = v; const key = 'status:体温:' + v; if (!firedSet.has(key)) { firedSet.add(key); notes.push({ ty: 'status', label: '体温', val: v + '°C' }); } }
                    else if (tg.startsWith('伤势:')) { const v = tg.split(':').slice(1).join(':').trim(); ch.injury = v; const key = 'status:伤势:' + v; if (!firedSet.has(key)) { firedSet.add(key); notes.push({ ty: 'status', label: '伤势', val: v }); } }
                    else if (tg.startsWith('负重:')) { const v = parseFloat(tg.split(':')[1]) || 0; ch.enc = v; const key = 'status:负重:' + v; if (!firedSet.has(key)) { firedSet.add(key); notes.push({ ty: 'status', label: '负重', val: v + 'kg' }); } }
                    else if (tg.startsWith('物品:+')) {
                        const v = tg.split(':+')[1].trim();
                        if (!ch.aiList) ch.aiList = [];
                        ch.aiList.push(v);
                        const key = 'add:' + v; if (!firedSet.has(key)) { firedSet.add(key); notes.push({ ty: 'add', val: v }); }
                    }
                    else if (tg.startsWith('物品:-')) {
                        const raw = tg.split(':-')[1].trim();
                        const mx = raw.match(/^(.+?)x(\d+)$/);
                        const riName = mx ? mx[1] : raw;
                        const riQty = mx ? parseInt(mx[2]) : 1;
                        if (!ch.riList) ch.riList = [];
                        ch.riList.push({ name: riName, qty: riQty });
                        const key = 'remove:' + raw; if (!firedSet.has(key)) { firedSet.add(key); notes.push({ ty: 'remove', val: raw }); }
                    }
                    else if (tg.startsWith('线索:')) { const v = tg.split(':').slice(1).join(':').trim(); if (!ch.clList) ch.clList = []; ch.clList.push(v); ch.cl = v; const key = 'clue:' + v; if (!firedSet.has(key)) { firedSet.add(key); notes.push({ ty: 'clue', val: v }); } }
                    else if (tg.startsWith('时间:+')) {
                        // Parse time value with unit: h=hours, m=minutes, 分=分钟.
                        // Supports formats like: [时间:+2h], [时间:+30m], [时间:+1.5h], [时间:+120分]
                        // When no unit, default is HOURS (prompt convention).
                        const raw = (tg.split(':+')[1] || '').trim();
                        // Match optional number + optional unit (Chinese or English)
                        const tm = raw.match(/^(\d+(?:\.\d+)?)\s*(h|hour|小时|m|min|minute|分|分钟)?$/i);
                        if (tm) {
                            let v = parseFloat(tm[1]) || 0;
                            const unit = (tm[2] || '').toLowerCase();
                            // Convert minutes to hours when unit indicates minute
                            if (unit === 'm' || unit === 'min' || unit === 'minute' || unit === '分' || unit === '分钟') {
                                v = v / 60;
                            }
                            ch.advTime = (ch.advTime || 0) + v;
                            // Display: if < 1h show minutes (integer), else show hours with proper precision
                            const dispMin = Math.round(v * 60);
                            const dispVal = v < 1 ? dispMin + 'm' : (v % 1 === 0 ? v + 'h' : v.toFixed(1) + 'h');
                            const key = 'status:时间推进:' + v.toFixed(4);
                            if (!firedSet.has(key)) { firedSet.add(key); notes.push({ ty: 'status', label: '时间推进', val: '+' + dispVal }); }
                        }
                    }
                    else if (tg.startsWith('装备:') || tg.startsWith('equip:')) {
                        const body = tg.split(':')[1];
                        const eq = body.split('=');
                        if (eq.length === 2) {
                            const slotMap = { '头部':'head','身体':'body','腿部':'legs','脚部':'feet','主手':'weapon','副手':'offhand','背包':'backpack','饰品':'accessory' };
                            const k = eq[0].trim(); const v = eq[1].trim();
                            const realK = slotMap[k] || k;
                            if (['head','body','legs','feet','weapon','offhand','backpack','accessory'].includes(realK)) {
                                if (!ch.equip) ch.equip = {};
                                ch.equip[realK] = (v === '无' || v === '空') ? '' : v;
                                const key = 'equip:' + realK + ':' + v; if (!firedSet.has(key)) { firedSet.add(key); notes.push({ ty: 'add', label: '装备', val: k + ' → ' + (v === '无' || v === '空' ? '空' : v) }); }
                            }
                        }
                    }
                    else if (tg.startsWith('天气:')) { const v = tg.split(':').slice(1).join(':').trim(); ch.weather = v; const key = 'status:天气:' + v; if (!firedSet.has(key)) { firedSet.add(key); notes.push({ ty: 'status', label: '天气', val: v }); } bgmAutoSwitch({ location: ch.location || '', weather: v }); }
                    else if (tg.startsWith('气温:')) { const v = parseFloat(tg.split(':')[1]) || 12; ch.temp = v; const key = 'status:气温:' + v; if (!firedSet.has(key)) { firedSet.add(key); notes.push({ ty: 'status', label: '气温', val: v + '°C' }); } }
                    else if (tg.startsWith('载具:')) { const v = tg.split(':').slice(1).join(':').trim(); ch.veh = v === '无' ? '无' : v; const key = 'vehicle:' + v; if (!firedSet.has(key)) { firedSet.add(key); notes.push({ ty: 'vehicle', val: v }); } }
                    else if (tg.startsWith('地图:解锁-')) { const v = tg.split('解锁-')[1].trim(); ch.mapAdd = v; const key = 'map:' + v; if (!firedSet.has(key)) { firedSet.add(key); notes.push({ ty: 'map', val: v }); } }
                    else if (tg.startsWith('地图:新增-')) { const v = tg.split('新增-')[1].trim(); ch.mapNew = v; const key = 'mapNew:' + v; if (!firedSet.has(key)) { firedSet.add(key); notes.push({ ty: 'map', label: '新地点', val: v }); } }
                    else if (tg.startsWith('地图:扩展-')) { const v = tg.split('扩展-')[1].trim(); ch.mapExpand = v; const key = 'mapExpand:' + v; if (!firedSet.has(key)) { firedSet.add(key); notes.push({ ty: 'map', label: '地图扩展', val: v }); } }
                    else if (tg.startsWith('异能:升级')) { ch.abilityUp = true; notes.push({ ty: 'ability', label: '异能提升', val: '熟练度+1' }); }
                    else if (tg.startsWith('异能:等级-')) { const v = parseInt(tg.split('等级-')[1]); ch.abilityLevel = v; notes.push({ ty: 'ability', label: '异能等级', val: 'Lv.' + v }); }
                    else if (tg.startsWith('血量:')) { const v = Math.max(0, Math.min(100, parseFloat(tg.split(':')[1]) || 0)); ch.hp = v; const key = 'hp:' + v; if (!firedSet.has(key)) { firedSet.add(key); notes.push({ ty: 'status', label: '血量', val: v + '%' }); } }
                    else if (tg.startsWith('武器:耐久-')) {
                        const v = tg.split('耐久-')[1].trim();
                        const idx = v.indexOf('-');
                        if (idx > 0) { const wName = v.slice(0, idx).trim(); const dmg = parseInt(v.slice(idx + 1)) || 1; ch.wpnDurName = wName; ch.wpnDurDelta = -dmg; const key = 'wpnDur:' + wName + ':' + dmg; if (!firedSet.has(key)) { firedSet.add(key); notes.push({ ty: 'status', label: wName + '耐久', val: '-' + dmg }); } }
                    }
                    else if (tg.startsWith('武器:弹药-')) {
                        const v = tg.split('弹药-')[1].trim();
                        const idx = v.indexOf('-');
                        if (idx > 0) { const aName = v.slice(0, idx).trim(); const cnt = parseInt(v.slice(idx + 1)) || 1; ch.ammoName = aName; ch.ammoDelta = -cnt; const key = 'ammo:' + aName + ':' + cnt; if (!firedSet.has(key)) { firedSet.add(key); notes.push({ ty: 'status', label: aName, val: '-' + cnt }); } }
                    }
                    else if (tg.startsWith('战斗:')) { const v = tg.split(':').slice(1).join(':').trim(); ch.battle = v; const key = 'battle:' + v; if (!firedSet.has(key)) { firedSet.add(key); notes.push({ ty: 'status', label: '战斗结果', val: v === '胜' ? '胜利' : v === '负' ? '失败' : '受伤' }); } }
                    else if (tg.startsWith('收藏:')) { const v = tg.split(':').slice(1).join(':').trim(); ch.bookmark = v; const key = 'bookmark:' + v; if (!firedSet.has(key)) { firedSet.add(key); notes.push({ ty: 'clue', label: '收藏', val: v }); } }
                    else if (tg.startsWith('关系:')) {
                        const rest = tg.split(':').slice(1).join(':').trim();
                        const dotIdx = rest.indexOf('.');
                        if (dotIdx > 0) {
                            const npcName = rest.slice(0, dotIdx).trim();
                            const eqIdx = rest.indexOf('=');
                            if (eqIdx > 0) {
                                const field = rest.slice(dotIdx + 1, eqIdx).trim();
                                const val = parseFloat(rest.slice(eqIdx + 1)) || 0;
                                if (!ch.npcRel) ch.npcRel = {};
                                ch.npcRel[npcName] = { field, val };
                                const key = 'rel:' + npcName + '.' + field; if (!firedSet.has(key)) { firedSet.add(key); notes.push({ ty: 'status', label: npcName + '·' + field, val: val }); }
                            }
                        }
                    }
                    else if (tg.startsWith('心态:')) { const v = tg.split(':').slice(1).join(':').trim(); ch.mentality = v; const key = 'status:心态:' + v; if (!firedSet.has(key)) { firedSet.add(key); notes.push({ ty: 'status', label: '心态', val: v }); } bgmAutoSwitch({}); }
                    else if (tg.startsWith('精神:')) { const v = parseFloat(tg.split(':')[1]) || 50; ch.spirit = v; const key = 'status:精神:' + v; if (!firedSet.has(key)) { firedSet.add(key); notes.push({ ty: 'status', label: '精神', val: v + '%' }); } }
                    else if (tg.startsWith('欢愉:')) { const v = parseFloat(tg.split(':')[1]) || 0; ch.joy = v; ch.pleasureUnlocked = true; const key = 'status:欢愉:' + v; if (!firedSet.has(key)) { firedSet.add(key); notes.push({ ty: 'status', label: '欢愉', val: v + '%' }); } }
                    else if (tg.startsWith('状态:')) {
                        const v = tg.split(':').slice(1).join(':').trim();
                        if (v.startsWith('治愈-')) { ch.stRem = v.slice(3); const key = 'status:状态解除:' + v; if (!firedSet.has(key)) { firedSet.add(key); notes.push({ ty: 'status', label: '状态解除', val: v }); } }
                        else { ch.stAdd = v; const key = 'status:状态:' + v; if (!firedSet.has(key)) { firedSet.add(key); notes.push({ ty: 'status', label: '状态', val: v }); } }
                    }
                    else if (tg.startsWith('地点:')) { const v = tg.split(':').slice(1).join(':').trim(); ch.location = v; const key = 'location:' + v; if (!firedSet.has(key)) { firedSet.add(key); notes.push({ ty: 'location', val: v }); } const _clk = gclk(); bgmAutoSwitch({ location: v, season: _clk && _clk.season, weather: _clk && _clk.weather, mentality: ch.mentality, hp: ch.hp, fatigue: ch.fatigue }); }
                    else if (tg.startsWith('合成:')) { const v = tg.split(':').slice(1).join(':').trim(); ch.craftResult = v; const key = 'craft:' + v; if (!firedSet.has(key)) { firedSet.add(key); notes.push({ ty: 'craft', label: '合成', val: v }); } }
                    else if (tg.startsWith('技能:+')) { const v = tg.split(':+')[1].trim(); ch.skillAdd = v; const key = 'skill_add:' + v; if (!firedSet.has(key)) { firedSet.add(key); notes.push({ ty: 'skill_add', label: '技能提升', val: v }); } }
                    else if (tg.startsWith('技能:-')) { const v = tg.split(':-')[1].trim(); ch.skillRem = v; const key = 'skill_rem:' + v; if (!firedSet.has(key)) { firedSet.add(key); notes.push({ ty: 'skill_rem', label: '技能减退', val: v }); } }
                    else if (tg.startsWith('记忆:')) { const v = tg.split(':').slice(1).join(':').trim(); ch.keyMemory = v; const key = 'memory:' + v.slice(0,10); if (!firedSet.has(key)) { firedSet.add(key); notes.push({ ty: 'memory', label: '关键记忆', val: v.slice(0,30) }); } }
                    else if (tg.startsWith('创伤:')) { const v = tg.split(':').slice(1).join(':').trim(); ch.trauma = v; const key = 'trauma:' + v; if (!firedSet.has(key)) { firedSet.add(key); notes.push({ ty: 'status', label: '创伤事件', val: v }); } }
                    else if (tg.startsWith('事件:')) { const v = tg.split(':').slice(1).join(':').trim(); ch.event = v; const key = 'event:' + v; if (!firedSet.has(key)) { firedSet.add(key); notes.push({ ty: 'event', label: '事件', val: v }); } }
                    else if (tg.startsWith('特质:+')) { const v = tg.split(':+')[1].trim(); ch.traitsAdd = v; const key = 'trait_add:' + v; if (!firedSet.has(key)) { firedSet.add(key); notes.push({ ty: 'trait_add', val: v }); } }
                    else if (tg.startsWith('特质:-')) { const v = tg.split(':-')[1].trim(); ch.traitsRem = v; const key = 'trait_rem:' + v; if (!firedSet.has(key)) { firedSet.add(key); notes.push({ ty: 'trait_rem', val: v }); } }
                    // ===== DEBUG ONLY: Sandbox / Character advanced modifiers (仅调试模式激活) =====
                    else if (cfg().debug) {
                        let handled = false;
                        const splitFirstEq = (s) => {
                            const i = s.indexOf('='); const j = s.indexOf(':');
                            const idx = (i < 0 ? j : (j < 0 ? i : Math.min(i, j)));
                            return idx < 0 ? [s] : [s.slice(0, idx).trim(), s.slice(idx + 1).trim()];
                        };
                        // [沙盒:分类.字段=值] 例:[沙盒:cat10.moralityLevel=严格守德]
                        if (tg.startsWith('沙盒:') || tg.startsWith('sandbox:') || tg.startsWith('sbx:')) {
                            const rest = tg.split(':').slice(1).join(':').trim();
                            const [path, val] = splitFirstEq(rest);
                            if (path && path.includes('.') && val !== undefined) {
                                const [catK, fld] = path.split('.');
                                const bx = gsbx();
                                if (bx[catK] && bx[catK].fields && bx[catK].fields[fld]) {
                                    const fd = bx[catK].fields[fld];
                                    if (fd.type === 'toggle') fd.val = (val === 'true' || val === '开' || val === '1');
                                    else if (fd.type === 'number') fd.val = parseFloat(val) || 0;
                                    else fd.val = val;
                                    ssbx(bx);
                                    notes.push({ ty: 'status', label: '沙盒·' + bx[catK].title + '·' + fd.label, val: (fd.val === true ? '开' : fd.val === false ? '关' : String(fd.val)) });
                                    handled = true;
                                }
                            }
                        }
                        // [角色:字段=值]
                        else if (tg.startsWith('角色:') || tg.startsWith('chr:') || tg.startsWith('character:')) {
                            const rest = tg.split(':').slice(1).join(':').trim();
                            const [k, v] = splitFirstEq(rest);
                            if (k && v !== undefined) {
                                const c = gch();
                                if (['tp','tn','hiddenPresets'].includes(k)) c[k] = String(v).split(/[,，、]/).map(x=>x.trim()).filter(Boolean);
                                else c[k] = /^-?\d+(\.\d+)?$/.test(v) ? parseFloat(v) : v;
                                sch(c);
                                notes.push({ ty: 'status', label: '角色·' + k, val: String(c[k]).slice(0,30) });
                                handled = true;
                            }
                        }
                        // [装备:槽=物品名]
                        else if (tg.startsWith('装备:') || tg.startsWith('equip:')) {
                            const rest = tg.split(':').slice(1).join(':').trim();
                            const [k, v] = splitFirstEq(rest);
                            if (k && v !== undefined) {
                                const slotMap = { '头部':'head','身体':'body','腿部':'legs','脚部':'feet','主手':'weapon','副手':'offhand','背包':'backpack','饰品':'accessory' };
                                const realK = slotMap[k] || k;
                                const valid = ['head','body','legs','feet','weapon','offhand','backpack','accessory'].includes(realK);
                                if (valid) {
                                    const s = gst(); if (!s.equip) s.equip = {};
                                    s.equip[realK] = (v === '无' || v === '空') ? '' : v;
                                    sst(s);
                                    notes.push({ ty: 'add', label: '装备', val: (slotMap[k] ? k : realK) + ' → ' + (s.equip[realK] || '空') });
                                    handled = true;
                                }
                            }
                        }
                        // [背包:物品A、物品B…] 全量重置
                        else if (tg.startsWith('背包:') || tg.startsWith('inv:')) {
                            const rest = tg.split(':').slice(1).join(':').trim();
                            const items = rest.split(/[,，、]/).map(x=>x.trim()).filter(Boolean);
                            const s = gst(); s.inv = items; sst(s);
                            notes.push({ ty: 'status', label: '背包', val: '重置为' + items.length + '件' });
                            handled = true;
                        }
                        if (handled) return '';
                    }
                    return '';
                });
                // During history replay, skip state mutations and notifications
                if (silent || _replayingHistory) {
                    // Still track clues for clue sidebar display during replay
                    if (notes.some(n => n.ty === 'clue')) {
                        renderClueSidebar();
                    }
                } else {
                    if (Object.keys(ch).length) (window.mds || mds)(ch);
                    // Auto-open clue sidebar when new clues are discovered
                    if (notes.some(n => n.ty === 'clue')) {
                        renderClueSidebar();
                        const clueSb = $('clueSidebar');
                        if (clueSb) {
                            // Clear drag-position inline styles before opening
                            if (clueSb.style.left) clueSb.style.left = '';
                            if (clueSb.style.top) clueSb.style.top = '';
                            if (clueSb.style.right) clueSb.style.right = '';
                            if (!clueSb.classList.contains('open')) {
                                clueSb.classList.add('open');
                            }
                        }
                    }
                    notes.forEach((n) => {
                        if (n.ty === 'add') snotify('add', n.label || '', n.val);
                        else if (n.ty === 'remove') snotify('remove', n.label || '', n.val);
                        else if (n.ty === 'clue') snotify('clue', n.label || '', n.val);
                        else if (n.ty === 'status') snotify('status', n.label, n.val);
                        else if (n.ty === 'map') snotify('map', n.label || '地图解锁', n.val);
                        else if (n.ty === 'vehicle') snotify('vehicle', n.label || '', n.val);
                        else if (n.ty === 'location') snotify('map', '位置变更', n.val);
                        else if (n.ty === 'trait_add') snotify('trait_add', n.label || '', n.val);
                        else if (n.ty === 'trait_rem') snotify('trait_rem', n.label || '', n.val);
                        else if (n.ty === 'ability') snotify('ability', n.label, n.val);
                        else if (n.ty === 'craft') snotify('craft', n.label || '', n.val);
                        else if (n.ty === 'event') snotify('event', n.label || '', n.val);
                        else if (n.ty === 'skill_add') snotify('skill_add', n.label || '', n.val);
                        else if (n.ty === 'skill_rem') snotify('remove', n.label || '技能减退', n.val);
                        else if (n.ty === 'memory') snotify('info', n.label || '关键记忆', n.val);
                    });
                }
                return tx.replace(/\n{3,}/g, '\n\n').trim();
            }

            // ===== Generate system prompt from template =====
            function gsp() {
                const c = gch(), s = gst(), f = cfg(), cl = gclk();
                const dn = { '休闲': '新手友好，物资充足，丧尸稀少', '轻度': '感染可控，适当降低难度', '标准': '写实公正判定，标准生存体验', '硬核': '残酷生存，感染几乎必死', '噩梦': '极限求生，丧尸成群，死亡率极高' };
                const mentalMap = { '稳定': '心态稳定', '焦虑': '焦虑紧张', '悲痛': '悲痛低落', '坚定': '意志坚定', '创伤': '创伤应激' };
                const survMap = { hopeful: '充满希望', grim: '灰暗艰难', despair: '绝望深渊' };
                // Build sandbox summary
                let sbxInfo = '';
                const bx = gsbx();
                Object.keys(bx).forEach(catKey => {
                    const cat = bx[catKey];
                    sbxInfo += cat.title + '：';
                    const fields = cat.fields;
                    const parts = [];
                    Object.keys(fields).forEach(fk => {
                        const fd = fields[fk];
                        parts.push(fd.label + '=' + (fd.val === true ? '开' : fd.val === false ? '关' : fd.val));
                    });
                    sbxInfo += parts.join('，') + '。\n';
                });
                const hiddenP = (c.hiddenPresets || []).map(h => JOB_PRESETS[h] ? JOB_PRESETS[h].name : h).join('、') || '无';
                const abInfo = (c.extraFeature === '异能' && c.abilityName) ? (ABILITIES[c.abilityName] ? ABILITIES[c.abilityName].name + ' — ' + ABILITIES[c.abilityName].desc : c.abilityName + '（' + (c.abilityDesc || '') + '）') : '无';
                const bx10 = bx.cat10 && bx.cat10.fields ? bx.cat10.fields : null;
                const morRevMap = { '严格守德': 'strict', '生存优先': 'survival-first', '道德相对': 'moral-relativistic', '无底线': 'no-bottom-line' };
                const survRevMap = { '充满希望': 'hopeful', '灰暗艰难': 'grim', '绝望深渊': 'despair' };
                const moralityKey = (bx10 && bx10.moralityLevel && morRevMap[bx10.moralityLevel.val]) || c.morality || 'survival-first';
                const survivalKey = (bx10 && bx10.survivalRate && survRevMap[bx10.survivalRate.val]) || c.survival || 'grim';
                const vals = {
                    dn: c.dn || '', days: c.days || '', zr: c.zr || '', env: c.env || '',
                    geo: c.geo || '', loc: c.loc || '', map: c.map || '', weather: cl.weather || c.weather || '',
                    fac: c.fac || '', hist: c.hist || '', res: c.res || '',
                    wr: c.wr || '', danger: c.danger || '', survival: survMap[survivalKey] || survMap['grim'],
                    cn: c.cn || '', ca: c.ca || '', gd: c.gd || '', bt: c.bt || '',
                    ht: c.ht || '', wt: c.wt || '', job: c.job || '', hand: c.hand || '右', bt2: c.bt2 || '未知',
                    pers: c.pers || '', app: c.app || '', skl: (c.skl || '').replace(/\n/g, '、'), lang: c.lang || '',
                    bg: c.bg || '', mental: mentalMap[c.mental] || '', fear: c.fear || '',
                    tp: (c.tp || []).join('、') || '无', tn: (c.tn || []).join('、') || '无',
                    diff: c.diff || '标准', diffdesc: dn[c.diff] || '',
                    god: (c.god ? '【上帝模式】' : '') + (f.debug ? '【上帝模式·玩家无敌】你是全知全能的存在。不会受伤、不会死亡、不会饥渴、不会疲劳。可以随意获取任何物资、进入任何地点、操控任何NPC。叙事中体现你的超能力但不要过于突兀。' : ''),
                    hunger: s.hunger, thirst: s.thirst, fatigue: s.fatigue, bodyTemp: s.bodyTemp,
                    injury: s.injury, enc: s.enc, inv: s.inv.join('、') || '空',
                    clues: s.clues.join('；') || '暂无', it: c.it || '', sp: c.sp || '',
                    gameTime: fmtTime(cl.elapsedSec) + ' 第' + (cl.day || 1) + '天 ' + dayPhase(cl.elapsedSec),
                    timeFlowMode: (cl.dayLenSec === 86400)
                        ? '现实流速（1:1实时同步，游戏时间=现实时间，禁止使用[时间:+Xh]标签，时间由玩家设备时钟驱动）'
                        : '加速流速（1秒现实≈' + Math.ceil(86400 / (cl.dayLenSec || 1200)) + '秒游戏，可使用[时间:+Xh]标签推进游戏时间）',
                    atmosphere: cl.temp != null ? cl.temp : '12',
                    season: cl.season || seasonFromDay(cl.day || 1),
                    sandboxInfo: sbxInfo, hiddenPresets: hiddenP,
                    vehicle: s.vehicle || '无',
                    mapUnlock: (s.mapUnlock || []).join('、') || '暂无',
                    mentality: mentalityLabel(s.mentality),
                    spirit: s.spirit != null ? s.spirit + '%' : '未知',
                    joy: s.pleasureUnlocked ? (s.joy != null ? s.joy + '%' : '0%') : '未解锁',
                    pleasureUnlocked: s.pleasureUnlocked ? '已解锁' : '未解锁',
                    actionBar: (s.actionBar || []).join('、') || '空',
                    location: s.location || c.sp || '未知',
                    traits: (s.traits || []).join('、') || '无',
                    morality: moralityKey,
                    abilityInfo: abInfo,
                    abilityLevel: (s.abilityLevel != null ? 'Lv.' + s.abilityLevel : '0'),
                    debugExtension: f.debug ? `
【调试模式扩展指令（DEBUG MODE ONLY）】
当前为开发者调试模式。除以上标记外，你还可以使用以下高级标记实时修改任意游戏数据（仅调试模式激活时生效）：

◆ 修改沙盒参数：
  [沙盒:cat10.moralityLevel=严格守德]
  格式：[沙盒:分类Key.字段Key=值]
  分类Key：cat1~cat10（cat1=时间与设施，cat2=天气环境，cat3=随机事件，cat4=尸体血腥，cat5=战利品，cat6=丧尸基础，cat7=丧尸种群，cat8=生存属性，cat9=载具，cat10=伦理人性）
  切换类字段值写"开"或"关"；数字类写阿拉伯数字；选择类写选项文本的完整匹配

◆ 修改角色任意字段：
  [角色:cn=李十三] [角色:bg=新的背景故事…] [角色:tp=勇敢、机智]
  数组型字段（tp/tn/hiddenPresets）用中文逗号分隔；其余字段直接写值。

◆ 修改装备栏（中文槽名自动识别）：
  [装备:主手=消防斧] [装备:背包=大号登山包] [装备:饰品=无]
  可用槽名：头部/身体/腿部/脚部/主手/副手/背包/饰品

◆ 全量重置背包（中文逗号分隔）：
  [背包:急救包、压缩饼干、砍刀、火把]

【调试模式规则】
- 玩家开启了调试（上帝）模式，你可以根据剧情需要合理使用以上指令。
- 当玩家明确要求"修改数据""加属性""重置角色""改世界规则"等诉求时，直接用对应指令响应，无需回避。
- 不要在叙事中刻意提及"调试模式""开发者"等元信息，保持叙事沉浸。
` : ''
                };
                // Build morality detail extension from sandbox category 10
                let moralityExtra = '';
                if (bx10) {
                    const extras = [];
                    if (bx10.violenceLevel && moralityKey === 'no-bottom-line') {
                        extras.push(`【暴力描写等级：${bx10.violenceLevel.val}】当前暴力等级已拉满，可自由描写战斗、受伤、截杀的细节。`);
                    }
                    if (bx10.languageLevel && moralityKey === 'no-bottom-line') {
                        extras.push(`【语言尺度：${bx10.languageLevel.val}】NPC对话可以使用粗口、露骨性暗示等强情绪语言。`);
                    }
                    if (bx10.trustLevel && bx10.trustLevel.val === '极低') {
                        extras.push(`【陌生人信任：极低】NPC普遍高度戒备，见面可能攻击或抢夺，需要通过战斗或交易打破僵局。`);
                    }
                    if (bx10.humanityDecay && bx10.humanityDecay.val === '快速') {
                        extras.push(`【人性衰减：快速】NPC普遍退回野兽状态，背叛、吃人、群体欺凌等高黑暗事件经常发生。`);
                    }
                    moralityExtra = extras.join('\n');
                }
                vals.moralityExtra = moralityExtra;
                let p = f.prompt || DPROMPT;
                for (const [k, v] of Object.entries(vals)) {
                    p = p.replace(new RegExp('\\{\\{' + k + '\\}\\}', 'g'), v);
                }
                // Inject extended context (key memories, skills, status, NPC relationships)
                if (typeof window.__vnExtContext === 'function') {
                    const extCtx = window.__vnExtContext();
                    if (extCtx) p += '\n\n' + extCtx;
                }
                return p;
            }

            function pai(raw, silent) {
                const cl = ptg(raw, silent);
                const bb = [];
                // Collect tagged segments and untagged narration
                const tagRegex = /\[(npc[：:][^\]]+|player|system|chapter|whisper|monologue|clue|choice)\]([\s\S]*?)(?=\[(?:npc[：:]|player|system|chapter|whisper|monologue|clue|choice)\]|$)/g;
                let lastIdx = 0;
                let m;
                while ((m = tagRegex.exec(cl)) !== null) {
                    // Add any untagged narration before this tag
                    if (m.index > lastIdx) {
                        const narr = cl.substring(lastIdx, m.index).trim();
                        if (narr) bb.push({ ty: 'narration', tx: narr });
                    }
                    const tag = m[1];
                    const tx = m[2].replace(/\[\/(?:choice|clue)\]/gi, '').trim();
                    if (tag.startsWith('npc')) {
                        const nm = tag.split(/[:：]/)[1].trim();
                        bb.push({ ty: 'npc', nm, tx });
                    } else if (tag === 'player') bb.push({ ty: 'player', tx });
                    else if (tag === 'system') bb.push({ ty: 'system', tx });
                    else if (tag === 'chapter') bb.push({ ty: 'chapter', tx });
                    else if (tag === 'whisper') bb.push({ ty: 'whisper', tx });
                    else if (tag === 'monologue') bb.push({ ty: 'monologue', tx });
                    else if (tag === 'clue') bb.push({ ty: 'clue', tx });
                    else if (tag === 'choice') {
                        const opts = safeSplitChoices(tx);
                        bb.push({ ty: 'choice', opts });
                    }
                    lastIdx = m.index + m[0].length;
                }
                // Remaining untagged text
                if (lastIdx < cl.length) {
                    const narr = cl.substring(lastIdx).trim();
                    if (narr) bb.push({ ty: 'narration', tx: narr });
                }
                // If no bubbles were created but there's content, treat all as narration
                if (!bb.length && cl) bb.push({ ty: 'narration', tx: cl });
                return bb;
            }

            function cbe(b) {
                const el = document.createElement('div');
                let cls = 'vn-narration';
                if (b.ty === 'player') cls = 'vn-bubble--player';
                else if (b.ty === 'npc') cls = 'vn-bubble--npc';
                else if (b.ty === 'whisper') cls = 'vn-bubble--whisper';
                else if (b.ty === 'monologue') cls = 'vn-monologue';
                else if (b.ty === 'system') cls = 'vn-system';
                else if (b.ty === 'chapter') cls = 'vn-chapter';
                else if (b.ty === 'clue') cls = 'vn-clue';
                else if (b.ty === 'choice') cls = 'vn-choice-container';
                el.className = cls;
                if (b.ty === 'npc') { const tg = document.createElement('span'); tg.className = 'vn-tag'; tg.textContent = b.nm; el.appendChild(tg); }
                if (b.ty === 'player') { const tg = document.createElement('span'); tg.className = 'vn-tag'; tg.textContent = '我'; el.appendChild(tg); }
                if (b.ty === 'system') { /* No tag for system messages — clean hand-drawn frame only */ }
                if (b.ty === 'clue') {
                    const ct = document.createElement('div'); ct.className = 'typing-target'; ct.innerHTML = abold(b.tx || ''); el.appendChild(ct);
                    el._ft = b.tx || ''; el._bolded = true;
                    return el;
                }
                if (b.ty === 'choice') {
                    (b.opts || []).forEach((opt, i) => {
                        const btn = document.createElement('div');
                        btn.className = 'vn-choice' + (i % 2 ? ' vn-choice--alt' : '');
                        btn.textContent = opt;
                        btn.addEventListener('click', () => {
                            // Fade out all choices
                            el.style.transition = 'opacity 0.4s ease, max-height 0.4s ease';
                            el.style.opacity = '0';
                            el.style.maxHeight = '0';
                            el.style.overflow = 'hidden';
                            el.style.margin = '0';
                            setTimeout(() => { el.style.display = 'none'; }, 400);
                            // Send the choice as player action
                            const inp = $('inputText');
                            if (inp) { inp.value = opt; }
                            const sendBtn = $('btnSend');
                            if (sendBtn) { sendBtn.click(); }
                        });
                        el.appendChild(btn);
                    });
                    el._ft = ''; el._bolded = true;
                    el._isChoice = true;
                    return el;
                }
                const ct = document.createElement('span');
                ct.className = 'typing-target';
                ct.innerHTML = abold(b.tx || '');
                el.appendChild(ct);
                el._ft = b.tx || '';
                el._bolded = true;
                return el;
            }

            function applyBoldToBubble(el) {
                if (!el || el._bolded) return;
                const tgt = el.querySelector('.typing-target');
                if (tgt && el._ft != null) { tgt.innerHTML = abold(el._ft); el._bolded = true; attachItemInfoToBoldElements(el); }
            }

            let _chatFoldEnabled = true;
            const CHAT_FOLD_THRESHOLD = 180;
            const CHAT_FOLD_KEEP = 120;
            function checkChatFold() {
                if (!_chatFoldEnabled) return;
                const ca = $('chatArea');
                if (!ca) return;
                if (ca.querySelector('.chat-fold-layer')) return;
                if (ca.children.length <= CHAT_FOLD_THRESHOLD) return;
                const foldCount = ca.children.length - CHAT_FOLD_KEEP;
                if (foldCount < 30) return;
                const foldLayer = document.createElement('div');
                foldLayer.className = 'chat-fold-layer';
                foldLayer.style.cssText = 'background:var(--bg-paper-alt);border:1.5px dashed var(--border-light);border-radius:6px;margin:8px 14px;padding:8px;text-align:center;cursor:pointer;font-size:0.75rem;color:var(--ink-soft);transition:background 0.2s;';
                foldLayer.innerHTML = '📂 已折叠 ' + foldCount + ' 条更早的对话（点击展开查看）';
                foldLayer.title = '点击展开更早的' + foldCount + '条对话';
                const hiddenWrap = document.createElement('div');
                hiddenWrap.className = 'chat-fold-hidden';
                hiddenWrap.style.display = 'none';
                foldLayer.addEventListener('click', () => {
                    const hidden = foldLayer.nextElementSibling;
                    if (hidden && hidden.classList.contains('chat-fold-hidden')) {
                        const showing = hidden.style.display !== 'none';
                        if (showing) {
                            hidden.style.display = 'none';
                            foldLayer.innerHTML = '📂 已折叠 ' + foldCount + ' 条更早的对话（点击展开查看）';
                            foldLayer.style.background = 'var(--bg-paper-alt)';
                        } else {
                            hidden.style.display = '';
                            foldLayer.innerHTML = '📁 收起更早的 ' + foldCount + ' 条对话';
                            foldLayer.style.background = 'var(--bg-paper)';
                        }
                    }
                });
                const all = Array.from(ca.children).slice(0, foldCount);
                all.forEach(el => hiddenWrap.appendChild(el));
                ca.insertBefore(foldLayer, ca.firstChild);
                ca.insertBefore(hiddenWrap, foldLayer.nextSibling);
                scb();
            }

            function apb(b, spd) {
                const ee = $('chatEmpty'); if (ee) ee.style.display = 'none';
                const el = cbe(b);
                $('chatArea').appendChild(el);
                checkChatFold();
                scb();
                if (spd > 0 && b.tx) {
                    const tgt = el.querySelector('.typing-target');
                    if (tgt) {
                        tgt.innerHTML = '';
                        let i = 0;
                        const stp = () => {
                            if (i < b.tx.length) {
                                tgt.innerHTML = esc(b.tx.substring(0, i + 1)) + '<span class="cursor-blink"></span>';
                                i++;
                                setTimeout(stp, spd);
                                scb();
                            } else {
                                tgt.innerHTML = abold(b.tx);
                                el._bolded = true;
                                attachItemInfoToBoldElements(el);
                            }
                        };
                        stp();
                    }
                } else if (spd === -1) {
                    el._bolded = false;
                } else {
                    attachItemInfoToBoldElements(el);
                }
                return el;
            }

            let contextSummary = '';
            let summaryLock = false;
            async function generateContextSummary() {
                if (summaryLock) return;
                const nonSummary = hist.filter(m => !(m.role === 'system' && m.content.startsWith('【前情摘要】')));
                if (nonSummary.length < 20) return;
                summaryLock = true;
                try {
                    const f = cfg();
                    const toSummarize = nonSummary.slice(0, -10);
                    const recent = nonSummary.slice(-10);
                    if (toSummarize.length < 5) { summaryLock = false; return; }
                    // ===== 摘要上下文保护：防止对话过大时，单条摘要请求也爆上下文 =====
                    let sumContent = toSummarize.map(m => (m.role === 'user' ? '【玩家】' : '【叙事】') + ': ' + (m.content || '')).join('\n');
                    // 单条摘要控制在 20000 字符以内（约 5K tokens），超过则截断保留最新部分
                    if (sumContent.length > 20000) {
                        sumContent = '…（前面' + (sumContent.length - 20000) + '字省略）…\n' + sumContent.slice(-20000);
                    }
                    const sumPrompt = `请为以下文字冒险游戏的对话历史生成一份精炼的剧情摘要。要求：\n1. 保留关键事件、重要决定、角色变化、发现的物品/NPC/地点\n2. 记录角色的当前状态变化（心态、精神、欢愉等）\n3. 标出未解决的悬念和目标\n4. 控制在300字以内\n\n对话历史：\n${sumContent}\n\n请直接输出摘要，不要其他文字。`;
                    const sumBody = { model: f.model, messages: [{ role: 'user', content: sumPrompt }], max_tokens: 512, temperature: 0.3 };
                    // ===== 给摘要生成也加 3 次重试 =====
                    let summary = '';
                    const MAX_RETRY = 3;
                    for (let attempt = 0; attempt < MAX_RETRY; attempt++) {
                        if (attempt > 0) await new Promise(res => setTimeout(res, 800 * attempt));
                        try {
                            const abCtl = new AbortController();
                            const to = setTimeout(() => { try { abCtl.abort(); } catch(_) {} }, 20000);
                            let rp;
                            try {
                                rp = await window._sendProxyRequest(f.ep, sumBody, f.key, abCtl.signal, false);
                            } finally { clearTimeout(to); }
                            if (!rp.ok) {
                                if ((rp.status === 429 || rp.status >= 500) && attempt < MAX_RETRY - 1) continue;
                                throw new Error('HTTP ' + rp.status);
                            }
                            const d = await rp.json();
                            summary = d.choices && d.choices[0] && d.choices[0].message && d.choices[0].message.content || '';
                            if (summary) break;
                        } catch (e) {
                            if (attempt < MAX_RETRY - 1) continue;
                            throw e;
                        }
                    }
                    if (summary) {
                        hist = [
                            { role: 'system', content: '【前情摘要】' + summary },
                            ...recent
                        ];
                        contextSummary = summary;
                        sv(K.SUM, summary);
                        svh(hist);
                        tst('已生成剧情摘要以保持记忆（节省上下文）');
                    }
                } catch (e) {
                    // 静默失败：保留完整历史即可
                } finally {
                    summaryLock = false;
                }
            }
            // 根据当前状态生成默认互动选项（AI遗漏[choice]时补充）
            function generateDefaultChoices() {
                const s = gst();
                const opts = [];
                if ((s.hunger ?? 50) < 30) opts.push('寻找食物');
                if ((s.thirst ?? 50) < 30) opts.push('寻找饮用水');
                if ((s.fatigue ?? 30) > 70) opts.push('找个安全的地方休息');
                if ((s.hp ?? 100) < 50) opts.push('检查并处理伤势');
                opts.push('搜索周围的物资');
                opts.push('观察周围环境');
                if (opts.length < 3) opts.push('继续前进');
                return opts.slice(0, 4);
            }
            // AI遗漏属性/时间标签时，根据状态做合理的小幅补充（保证状态连续性）
            function generateDefaultTags(s, full) {
                if (!s) return '';
                const tags = [];
                const had = (re) => re.test(full);
                if (!had(/\[饱腹:/)) {
                    const cur = s.hunger != null ? s.hunger : 50;
                    tags.push('[饱腹:' + Math.max(0, Math.min(100, Math.round(cur - 2))) + ']');
                }
                if (!had(/\[口渴:/)) {
                    const cur = s.thirst != null ? s.thirst : 50;
                    tags.push('[口渴:' + Math.max(0, Math.min(100, Math.round(cur - 3))) + ']');
                }
                if (!had(/\[疲劳:/)) {
                    const cur = s.fatigue != null ? s.fatigue : 20;
                    tags.push('[疲劳:' + Math.max(0, Math.min(100, Math.round(cur + 2))) + ']');
                }
                if (!had(/\[时间:/) && !had(/\[加速:/)) {
                    tags.push('[时间:+1h]');
                }
                return tags.join('');
            }
            // 安全切分 choice 选项：兼容 1. 2. 3. / A. B. C. / 、/ ，/ || / | / 分号 等常见分隔
            function safeSplitChoices(raw) {
                if (!raw) return ['继续前进','观察环境','搜索物资','原地休息'];
                let t = (raw || '').trim().replace(/^[\s\-—–•●*]+|[\s\-—–•●*]+$/g, '');
                const numMatch = t.match(/(^|\s)(\d{1,2})[.)、\]】]\s*([^\n\r\d][^\n\r]*?)(?=(\s\d{1,2}[.)、\]】])|$)/g);
                if (numMatch && numMatch.length >= 2) {
                    const r = numMatch.map(s => s.replace(/^\s*(\d{1,2})[.)、\]】]\s*/, '').trim()).filter(Boolean);
                    if (r.length >= 2) return r.slice(0, 6);
                }
                const abcdMatch = t.match(/(^|\s)[A-Z][.)、\]】]\s*([^\n\rA-Z][^\n\r]*?)(?=(\s[A-Z][.)、\]】])|$)/g);
                if (abcdMatch && abcdMatch.length >= 2) {
                    const r = abcdMatch.map(s => s.replace(/^\s*[A-Z][.)、\]】]\s*/, '').trim()).filter(Boolean);
                    if (r.length >= 2) return r.slice(0, 6);
                }
                if (/[\r\n]/.test(t)) {
                    const r = t.split(/[\r\n]+/).map(s => s.replace(/^[\s\-—–•●*\d]+\s*[.)、\]】:：]?\s*/, '').trim()).filter(Boolean);
                    if (r.length >= 2) return r.slice(0, 6);
                }
                if (t.includes('||')) {
                    return t.split('||').map(s => s.trim()).filter(Boolean).slice(0, 6);
                }
                if (/[、；;]/.test(t)) {
                    return t.split(/[、；;]+/).map(s => s.trim()).filter(Boolean).slice(0, 6);
                }
                const byPipe = t.split('|').map(s => s.trim()).filter(Boolean);
                if (byPipe.length >= 2) return byPipe.slice(0, 6);
                if (t.length > 20) {
                    const byComma = t.split(/[,，\s]{2,}/).map(s => s.trim()).filter(x => x.length > 2);
                    if (byComma.length >= 2) return byComma.slice(0, 6);
                }
                return [t || '继续前进', '观察环境', '搜索物资'];
            }

            async function hin(inp, isIdle, displayText, systemPromptExtra) {
                if (busy) return;
                if (!isIdle && idleLocked) { tst('挂机中，行动已锁定。可打开背包或面板查看信息。'); return; }
                const tx = inp.trim(); if (!tx) return;
                // Use displayText for player bubble if provided, otherwise use tx
                const showText = displayText ? displayText.trim() : tx;
                // Hide any visible choice bubbles when player sends custom input
                if (!isIdle) {
                    document.querySelectorAll('.vn-choice-container').forEach(el => {
                        if (el.style.display !== 'none' && el.style.opacity !== '0') {
                            el.style.opacity = '0';
                            el.style.maxHeight = '0';
                            el.style.overflow = 'hidden';
                            el.style.margin = '0';
                            setTimeout(() => { el.style.display = 'none'; }, 400);
                        }
                    });
                }
                undo = { hi: JSON.parse(JSON.stringify(hist)), st: JSON.parse(JSON.stringify(gst())), ch: JSON.parse(JSON.stringify(gch())), clk: JSON.parse(JSON.stringify(gclk())), sbx: JSON.parse(JSON.stringify(gsbx())), ach: unlockedAchievements ? [...unlockedAchievements] : [], bubbleCount: $('chatArea') ? $('chatArea').children.length : 0, turnId: Date.now() };
                snotifyStartBatch();
                // 重置 pai 事件触发的 turn 标记（防止跨回合误触发）
                if (typeof window._paiSetTurn === 'function') window._paiSetTurn(undo.turnId);
                // Reset pai() log counter so new AI turn doesn't skip log entries
                if (typeof window._resetPaiLog === 'function') window._resetPaiLog();
                busy = true;
                // 清除上一回合遗留的随机事件/NPC 定时器（跨回合保护）
                if (typeof window._paiClearEventTimers === 'function') window._paiClearEventTimers();
                if (!isIdle) $('btnSend').disabled = true;
                $('inputText').classList.add('busy');
                // 玩家气泡不渲染item-ref样式，将{{物品名}}转为纯文本【物品名】
                const playerDisplayText = (isIdle ? '[自主] ' : '') + showText.replace(/\{\{([^}]+)\}\}/g, '【$1】');
                apb({ ty: 'player', tx: playerDisplayText }, 0);
                hist.push({ role: 'user', content: tx });

                // If player is asking about clues, sync the clue sidebar immediately
                if (/线索|回顾|总结|整理/.test(tx)) {
                    renderClueSidebar();
                }

                // Auto-summarize when history exceeds threshold
                const cfgt = cfg();
                if (!summaryLock && hist.length > (cfgt.ctx || 24) * 2 && hist.length % 8 === 0) {
                    generateContextSummary();
                }
                
                // 代理请求辅助函数（使用全局定义的版本）
                const sendProxyRequest = window._sendProxyRequest;

                // ===== 上下文溢出保护：估算总字符数，超阈值强制先摘要 =====
                const FORCE_SUMMARIZE_CHARS = 32000; // 约 8K tokens 前强制摘要（1中文字≈2.5tokens）
                let estimatedTotalChars = sysPrompt.length;
                hist.slice(-f.ctx * 2).forEach(m => { estimatedTotalChars += (m.content || '').length + 8; });
                if (estimatedTotalChars > FORCE_SUMMARIZE_CHARS && !summaryLock) {
                    try {
                        tst('上下文较大，正在压缩记忆...');
                        await generateContextSummary();
                    } catch(e) { /* 摘要失败也继续，用原对话 */ }
                }

                // ===== 带指数退避重试 + 超时的安全请求函数 =====
                async function requestWithRetry(targetUrl, body, key, signal, isStream, maxRetries, timeoutMs) {
                    let lastError = null;
                    for (let attempt = 0; attempt <= maxRetries; attempt++) {
                        if (attempt > 0) {
                            const waitMs = Math.min(1000 * Math.pow(2, attempt - 1) + Math.random() * 500, 5000);
                            if (typeof tst === 'function') tst('第 ' + attempt + ' 次重试，等待 ' + Math.round(waitMs) + 'ms...');
                            await new Promise(res => setTimeout(res, waitMs));
                        }
                        const innerAbort = new AbortController();
                        let timeoutId = null;
                        let alreadyAborted = false;
                        if (timeoutMs > 0) {
                            timeoutId = setTimeout(() => {
                                alreadyAborted = true;
                                try { innerAbort.abort(); } catch(_) {}
                            }, timeoutMs);
                        }
                        // 同时监听外部 signal
                        if (signal) {
                            try {
                                if (signal.aborted) innerAbort.abort();
                                else signal.addEventListener('abort', () => innerAbort.abort(), { once: true });
                            } catch(_) {}
                        }
                        try {
                            const response = await sendProxyRequest(targetUrl, body, key, innerAbort.signal, isStream);
                            if (timeoutId) clearTimeout(timeoutId);
                            // 2xx 成功直接返回
                            if (response.ok) return response;
                            // 只对以下情况重试：429 限流、5xx 服务端错误、0 网络错误
                            const shouldRetry = response.status === 429 || response.status >= 500;
                            const et = await response.text().catch(() => '');
                            let friendlyMsg = 'HTTP ' + response.status;
                            if (response.status === 401) friendlyMsg = '认证失败：API密钥无效或已过期，请检查密钥';
                            else if (response.status === 403) friendlyMsg = '访问被拒绝：权限不足或服务未开通';
                            else if (response.status === 404) friendlyMsg = '接口不存在：请检查端点地址是否正确';
                            else if (response.status === 429) friendlyMsg = '请求过于频繁（429）';
                            else if (response.status >= 500) friendlyMsg = '服务器错误（' + response.status + '）';
                            try {
                                const ej = JSON.parse(et);
                                let m = ej.error && ej.error.message ? ej.error.message : (ej.message || '');
                                if (m) {
                                    m = m.replace(/(api[\s_-]?key[\s:="'`]+|sk-|Bearer\s+)[^\s"'`<>&]{4,}/gi, (match) => match.slice(0,4) + '****');
                                    friendlyMsg += '：' + m;
                                }
                            } catch(_) {}
                            friendlyMsg = friendlyMsg.length > 120 ? friendlyMsg.substring(0, 120) + '…' : friendlyMsg;
                            if (shouldRetry && attempt < maxRetries) continue;
                            const err = new Error(friendlyMsg);
                            err.httpStatus = response.status;
                            err.final = true;
                            throw err;
                        } catch (e) {
                            if (timeoutId) clearTimeout(timeoutId);
                            if (alreadyAborted && (!e || e.name === 'AbortError')) {
                                lastError = new Error('请求超时（> ' + timeoutMs + 'ms），请检查网络或降低上下文长度后重试');
                                lastError.timeout = true;
                            } else if (signal && signal.aborted) {
                                throw e; // 用户手动取消，不重试
                            } else {
                                lastError = e;
                            }
                            const isRetriable = !lastError.final && !lastError.httpStatus || (lastError.httpStatus && (lastError.httpStatus === 429 || lastError.httpStatus >= 500));
                            if (isRetriable && attempt < maxRetries) continue;
                            throw lastError;
                        }
                    }
                    throw lastError || new Error('未知请求错误');
                }

                const f = cfg();
                const indicatorEl = document.createElement('div');
                indicatorEl.className = 'typing-indicator';
                indicatorEl.innerHTML = '<span>' + (isIdle ? '挂机演算中' : '演算中') + '</span><div class="typing-dots"><span></span><span></span><span></span></div>';
                $('chatArea').appendChild(indicatorEl);
                scb();
                try {
                    let sysPrompt = gsp();
                    if (isIdle) {
                        const _isRealFlow = (gclk().dayLenSec === 86400);
                        sysPrompt += '\n\n【挂机模式】当前为自动挂机模式，日志将以[monologue]（内心独白/系统日志）形式输出。请以简洁的日志式叙述输出角色自主行动结果，结合角色设定、环境、当前状态和沙盒参数，尽量避开危险行动，以生存、探索、休息、收集资源为主。输出控制在200字以内。请将行动日志包裹在[monologue]标签中。\n\n【挂机流速适配 — 关键】当前' + (_isRealFlow ? '现实流速' : '加速流速') + '。若为现实流速：每次挂机仅描述几分钟内的短时动作（整理装备/观察环境/简短对话/小规模搜索/喝水吃干粮），状态变化幅度小（疲劳±5、饱腹±3、口渴±3），禁止使用[时间:+Xh]标签，禁止描述"睡眠数小时""长途跋涉"等大耗时行动（这些由现实时钟自然推进）。若为加速流速：每次挂机可描述1-2小时的行动，状态变化按行动耗时参考表执行，使用[时间:+Xh]推进时间。\n\n【挂机自主决策优先级 — 必须按序决策】\n挂机不是随机游荡，角色应按以下优先级自主决策（高优先级需求未满足时不做低优先级事）：\n1. 生存急救（最高）：饱腹<30优先觅食；口渴<30优先找水；疲劳>70优先休息；受伤/感染优先治疗。状态危急时取消一切探索。\n2. 安全避险：夜间（22:00-6:00）优先寻找安全据点躲避；丧尸密集区优先撤离；天气极端（暴雪/暴雨）优先避难。\n3. 健康恢复：精神<30时安排休息或轻松活动（整理物资/回忆）；体温异常时调节环境（添衣/取暖/降温）。\n4. 资源储备：状态稳定时搜索附近物资，优先补充消耗品（水/食物/药品）。\n5. 探索发展：资源充足时谨慎探索新区域，标记线索，避免深入未知。\n6. 社交关系：遇到友好NPC时适度互动，不主动挑衅敌对势力。\n挂机风险评估：每轮行动前评估"失败最坏后果"，若可能致死或重伤则放弃该行动改选保守方案。挂机期间禁止主动挑起战斗（除非被攻击），禁止进入标注高危的区域。';
                    }
                    // Inject extra system prompt context (e.g., decision assistance)
                    if (systemPromptExtra) {
                        sysPrompt += '\n\n' + systemPromptExtra;
                    }
                    const msgs = [{ role: 'system', content: sysPrompt }, ...hist.slice(-f.ctx * 2)];
                    let full = '';
                    if (f.strm && f.key) {
                        const ct = new AbortController();
                        ctrl = ct;
                        const requestBody = { model: f.model, messages: msgs, max_tokens: isIdle ? Math.min(f.maxT, 512) : f.maxT, temperature: f.temp, stream: true };
                        // 流式：重试2次（共3次尝试），超时60秒（流式更宽容）
                        const rp = await requestWithRetry(f.ep, requestBody, f.key, ct.signal, true, 2, 60000);
                        const rd = rp.body.getReader();
                        const dc = new TextDecoder();
                        let buf = '', bubblesInDOM = [];
                        let isSSE = true;
                        let firstChunk = true;
                        while (true) {
                            const { done, value } = await rd.read();
                            if (done) {
                                // ===== 修复：SSE 末包丢失 —— done 后处理 buf 中残留的不完整行（有些服务器最后一个包不带\n） =====
                                if (isSSE && buf && buf.length > 0) {
                                    const lines = (buf + '\n').split('\n');
                                    for (const l of lines) {
                                        if (!l.startsWith('data: ')) continue;
                                        const d = l.slice(6).trim();
                                        if (d === '[DONE]') continue;
                                        try { const j = JSON.parse(d); if (j.choices && j.choices[0] && j.choices[0].delta && j.choices[0].delta.content) full += j.choices[0].delta.content; } catch {}
                                    }
                                }
                                break;
                            }
                            const chunk = dc.decode(value, { stream: true });
                            buf += chunk;
                            
                            if (firstChunk && buf.length > 10) {
                                firstChunk = false;
                                if (!buf.includes('data:')) {
                                    isSSE = false;
                                    break;
                                }
                            }
                            
                            if (!isSSE) break;
                            
                            const ls = buf.split('\n');
                            buf = ls.pop() || '';
                            for (const l of ls) {
                                if (!l.startsWith('data: ')) continue;
                                const d = l.slice(6).trim();
                                if (d === '[DONE]') continue;
                                try { const j = JSON.parse(d); if (j.choices && j.choices[0] && j.choices[0].delta && j.choices[0].delta.content) full += j.choices[0].delta.content; } catch {}
                            }
                            const allBubbles = (window.pai || pai)(full, true);
                            while (bubblesInDOM.length < allBubbles.length) {
                                bubblesInDOM.push(apb(allBubbles[bubblesInDOM.length], -1));
                            }
                            if (bubblesInDOM.length > 0 && allBubbles.length > 0) {
                                const lastParsed = allBubbles[allBubbles.length - 1];
                                const lastDOM = bubblesInDOM[bubblesInDOM.length - 1];
                                const tgt = lastDOM.querySelector('.typing-target');
                                if (tgt && lastParsed.tx) {
                                    tgt.innerHTML = abold(lastParsed.tx);
                                    lastDOM._ft = lastParsed.tx;
                                    lastDOM._bolded = true;
                                }
                            }
                            checkChatFold();
                            scb();
                        }
                        if (full && full.length > 50000) { full = full.slice(0, 50000) + '\n\n[系统提示：回复过长已截断，建议分次行动获取更完整叙事。]'; snotify('warn', 'AI回复', '内容超长已截断'); }
                        // Fallback: 如果不是SSE格式，尝试解析为普通JSON
                        if (!isSSE && buf) {
                            try {
                                const d = JSON.parse(buf);
                                full = d.choices && d.choices[0] && d.choices[0].message && d.choices[0].message.content || '';
                                if (full && full.length > 50000) { full = full.slice(0, 50000) + '\n\n[系统提示：回复过长已截断，建议分次行动获取更完整叙事。]'; snotify('warn', 'AI回复', '内容超长已截断'); }
                                if (full) {
                                    const bb = (window.pai || pai)(full, false);
                                    for (const b of bb) apb(b, f.tspd);
                                    checkChatFold();
                                }
                            } catch {
                                full = '[system]无法解析AI响应';
                                apb({ ty: 'system', tx: full }, 0);
                            }
                        } else {
                            bubblesInDOM.forEach(el => applyBoldToBubble(el));
                            // 流式渲染期间使用silent模式跳过了mds状态变更，此处统一应用一次
                            if (full) (window.pai || pai)(full, false);
                        }
                    } else if (!f.strm && f.key) {
                        const requestBody = { model: f.model, messages: msgs, max_tokens: isIdle ? Math.min(f.maxT, 512) : f.maxT, temperature: f.temp, stream: false };
                        // 非流式：重试3次（共4次尝试），超时30秒
                        const rp = await requestWithRetry(f.ep, requestBody, f.key, null, false, 3, 30000);
                        const d = await rp.json();
                        full = d.choices && d.choices[0] && d.choices[0].message && d.choices[0].message.content || '';
                        if (full && full.length > 50000) { full = full.slice(0, 50000) + '\n\n[系统提示：回复过长已截断，建议分次行动获取更完整叙事。]'; snotify('warn', 'AI回复', '内容超长已截断'); }
                        const bb = (window.pai || pai)(full, false);
                        for (const b of bb) apb(b, f.tspd);
                        checkChatFold();
                    } else {
                        full = '[system]未配置API密钥。请点击右上角「设置」配置。';
                        if (full && full.length > 50000) { full = full.slice(0, 50000) + '\n\n[系统提示：回复过长已截断，建议分次行动获取更完整叙事。]'; snotify('warn', 'AI回复', '内容超长已截断'); }
                        (window.pai || pai)(full, false).forEach(b => apb(b, 0));
                        checkChatFold();
                    }
                    if (indicatorEl && indicatorEl.parentNode) indicatorEl.remove();
                    if (full && full.length > 60000) { full = full.slice(0, 60000) + '\n\n[系统：回复超长严重截断]'; }
                    if (full) {
                        // 补充缺失的属性/时间标签（挂机模式也补充）
                        const s0 = gst();
                        const defTags = generateDefaultTags(s0, full);
                        if (defTags) {
                            full = defTags + '\n' + full;
                            try { (window.pai || pai)(defTags, false); } catch(e) {}
                        }
                        // For idle mode, ensure the response has monologue wrapper
                        if (isIdle && !/\[monologue\]/i.test(full)) {
                            full = '[monologue]' + full + '[/monologue]';
                        }
                        // Note: ptg() is already called inside pai() above,
                        // which handles tag parsing, mds() state update, and snotify() notifications.
                        // Do NOT call ptg() again here — it would double-process state changes.
                        // 检查AI是否输出了互动选项，缺失则补充默认选项（挂机模式除外）
                        if (!isIdle && !/\[choice\]/i.test(full)) {
                            const defaultOpts = generateDefaultChoices();
                            apb({ ty: 'choice', opts: defaultOpts }, 0);
                            full += '\n[choice]' + defaultOpts.join('|') + '[/choice]';
                        }
                        hist.push({ role: 'assistant', content: full });
                        svh(hist);
                    }
                } catch (e) {
                    if (indicatorEl && indicatorEl.parentNode) indicatorEl.remove();
                    let errMsg = '错误：' + e.message;
                    if (/认证失败|密钥|API.*key/i.test(e.message)) {
                        errMsg += '\n（可点击右上角「设置」按钮修改API配置）';
                    }
                    if (/服务器错误|服务商暂时不可用|429|频繁|网络|超时|timeout|fetch|abort|Failed to fetch/i.test(e.message)) {
                        errMsg += '\n\n💡 API服务商暂时不可用，请稍后重新发送本次行动，系统将重新生成推演结果。';
                        if (!isIdle && tx) {
                            const inpEl = $('inputText');
                            if (inpEl) inpEl.value = tx;
                        }
                    }
                    apb({ ty: 'system', tx: errMsg }, 0);
                    if (/服务器错误|服务商暂时不可用|429|频繁|网络|超时|timeout|fetch|abort|Failed to fetch/i.test(e.message) && !isIdle && tx) {
                        const retryFn = function() {
                            const inpEl2 = $('inputText');
                            if (inpEl2) inpEl2.value = tx;
                            if (!busy) hin(tx, false);
                        };
                        window._retryLastAction = retryFn;
                        apb({ ty: 'choice', opts: ['🔄 重新发送本次行动', '✕ 取消，手动输入'] }, 0);
                        setTimeout(() => {
                            const choices = document.querySelectorAll('.vn-choice-bubble');
                            if (!choices || !choices.length) return;
                            const last = choices[choices.length - 1];
                            const btns = last.querySelectorAll('button, .vn-choice-item');
                            if (btns[0]) btns[0].onclick = (ev) => { ev.stopPropagation(); if (window._retryLastAction) window._retryLastAction(); };
                            if (btns[1]) btns[1].onclick = (ev) => { ev.stopPropagation(); const ie = $('inputText'); if (ie) ie.focus(); };
                        }, 100);
                    }
                    if (isIdle) stopIdle();
                    snotifyEndBatch();
                } finally {
                    busy = false;
                    snotifyEndBatch();
                    if (!isIdle && !idleLocked) $('btnSend').disabled = false;
                    if (!isIdle) $('inputText').classList.remove('busy');
                    if (!isIdle && !idleLocked && !isMobile()) $('inputText').focus();
                    upui();
                    checkChatFold();
                    scb();
                    // Auto-save after each game action (keep auto-slot in sync)
                    // ALWAYS save, even during idle mode, to prevent data loss on refresh
                    // IMPORTANT: NEVER save empty API key into auto-save slot
                    if (hist.length > 0) {
                        try {
                            const curSvs = gsv();
                            const curCfg = cfg();
                            // Filter out empty values from cfg to prevent API key loss on save
                            const cleanCfg = {};
                            Object.keys(curCfg).forEach(k => {
                                const v = curCfg[k];
                                if (v === '' || v === null || v === undefined) return;
                                cleanCfg[k] = JSON.parse(JSON.stringify(v));
                            });
                            curSvs['auto'] = {
                                hi: JSON.parse(JSON.stringify(hist)),
                                st: JSON.parse(JSON.stringify(gst())),
                                ch: JSON.parse(JSON.stringify(gch())),
                                clk: JSON.parse(JSON.stringify(gclk())),
                                sbx: JSON.parse(JSON.stringify(gsbx())),
                                cfg: cleanCfg,
                                tm: Date.now()
                            };
                            ssv(curSvs);
                        } catch (e) { /* silent fail */ }
                    }
                }
            }

            function ccb() {
                const ca = $('chatArea');
                [...ca.children].forEach(c => { if (c.id !== 'chatEmpty') c.remove(); });
            }

            function rbt() {
                ccb();
                const ee = $('chatEmpty');
                if (hist.length === 0) { if (ee) ee.style.display = 'flex'; return; }
                if (ee) ee.style.display = 'none';
                // Suppress state mutations and notifications during history replay
                _replayingHistory = true;
                hist.forEach(m => {
                    if (m.role === 'user') apb({ ty: 'player', tx: m.content }, 0);
                    else pai(m.content, true).forEach(b => apb(b, 0));
                });
                _replayingHistory = false;
                upui();
                scb();
            }

            window._ui = (nm) => { if (!busy && !idleLocked) hin('使用物品：' + nm); };
            // Forwarders for functions defined in the second script block (called via window._xxx)
            function addLogEntry(type, text, chapterId) { const f = window._addLogEntry; if (f) f(type, text, chapterId); }
            function addKeyMemory(text, type) { const f = window._addKeyMemory; if (f) f(text, type); }
            function triggerRandomEvent() { const f = window._triggerRandomEvent; if (f) f(); }
            function checkSeasonalEvent() { const f = window._checkSeasonalEvent; if (f) f(); }
            function checkForRandomEvent(t) { const f = window._checkForRandomEvent; return f ? f(t) : null; }
            function openLogViewer() { const f = window._openLogViewer; if (f) f(); }
            function searchLogs(q) { const f = window._searchLogs; return f ? f(q) : []; }
            function processNpcInteraction(n, i) { const f = window._processNpcInteraction; return f ? f(n, i) : null; }
            function triggerNpcEncounter() { const f = window._triggerNpcEncounter; return f ? f() : null; }
            function addNpcRelationship(n, t) { const f = window._addNpcRelationship; if (f) f(n, t); }
            function applyStatusEffect(e, d, s) { const f = window._applyStatusEffect; if (f) f(e, d, s); }
            function tickStatusEffects() { const f = window._tickStatusEffects; if (f) f(); }
            function checkAchievements() { const f = window._checkAchievements; if (f) f(); }
            // Expose core functions for cross-script access
            window.gch = gch; window.gst = gst; window.gclk = gclk; window.cfg = cfg;
            window.sch = sch; window.sst = sst; window.sclk = sclk; window.scf = scf;
            window.hasCustomCharacter = hasCustomCharacter; window.playSfx = playSfx;
            window.hasHover = hasHover;
            window.mds = mds; window.pai = pai; window.hin = hin; window.tst = tst;
            window.buildInvAndEquipFromItems = buildInvAndEquipFromItems;
            window.getItemInfo = getItemInfo; window.getItemBaseName = getItemBaseName;
            window.stopIdle = stopIdle; window.startClock = startClock;
            // Note: addLogEntry, triggerRandomEvent, checkSeasonalEvent, checkForRandomEvent,
            // addKeyMemory, openLogViewer, searchLogs, processNpcInteraction, triggerNpcEncounter,
            // addNpcRelationship, applyStatusEffect, tickStatusEffects, checkAchievements
            // are defined in the second script block and exposed there via window.GameSystems
            // Additional functions needed by second script block
            window.rbt = rbt; window.upui = upui; window.stg = stg;
            window.ccb = ccb; window.svh = svh; window.apb = apb; window.scb = scb;
            window.migrateSta = migrateSta; window.migrateChr = migrateChr; window.migrateCfg = migrateCfg;
            window.mergeSbx = mergeSbx; window.ssbx = ssbx; window.gsbx = gsbx;
            window.ldh = ldh; window.ssv = ssv; window.gsv = gsv; window.validateSaveData = validateSaveData;
            window.gsp = gsp;
            window.esc = esc; window.abold = abold; window.spBar = spBar;
            window.buildItemTooltipHTML = buildItemTooltipHTML;
            window.mentalityLabel = mentalityLabel; window.itemEmoji = itemEmoji;
            window.fmtTime = fmtTime; window.dayPhase = dayPhase;
            window.seasonFromDay = seasonFromDay; window.randWeather = randWeather; window.randTemp = randTemp;
            window.aiInitStats = aiInitStats; window.fillCharModal = fillCharModal;
            window.sketchConfirm = sketchConfirm; window.sketchPrompt = sketchPrompt;
            // Expose additional helpers needed by second script block
            window.playTone = playTone; window.snotify = snotify;
            window.NORMAL_SKILLS = NORMAL_SKILLS; window.ABILITIES = ABILITIES;
            // Live variable accessors (hist and sbx are mutable let variables)
            window._getHist = () => hist; window._setHist = (v) => { hist = v; };
            window._getSbx = () => sbx; window._setSbx = (v) => { sbx = v; };

            // Parse character items string and auto-equip appropriate items
            function buildInvAndEquipFromItems(itemsStr) {
                const items = (itemsStr || '').split(/[、，,;；\n]/).map(s => s.trim()).filter(Boolean);
                const inv = items.slice();
                const equip = { head: '', body: '', legs: '', feet: '', weapon: '', offhand: '', backpack: '', accessory: '' };
                const slotKeywords = {
                    head: ['头盔', '帽子', '头灯', '面罩', '防毒面具', '护目镜'],
                    body: ['防弹衣', '防弹背心', '防刺服', '战术背心', '凯夫拉背心', '防化服', '护甲', '盔甲', '外套', '大衣', '夹克', '工装', '迷彩服', '雨衣', '战术腰带'],
                    legs: ['裤', '护腿', '护膝'],
                    feet: ['靴', '鞋', '运动鞋'],
                    backpack: ['背包', '登山包', '书包', '战术包', '旅行包'],
                    accessory: ['手表', '护身符', '项链', '戒指', '手链', '指南针', '口哨', '指北针', '望远镜']
                };
                const weaponKeywords = ['枪', '刀', '斧', '棍', '棒', '矛', '铲', '弩', '锤', '匕首', '砍刀', '扳手', '撬棍', '警棍', '钢管', '球棒', '弓', '武士刀', '三棱刺', '链锯', '电击棒', '手术刀', '铁棍', '铁锤', '消防斧'];
                inv.forEach(item => {
                    const info = getItemInfo(item);
                    const baseName = getItemBaseName(item);
                    // Try to match equipment slots
                    if (info) {
                        if (info.subCategory === 'backpack' && !equip.backpack) { equip.backpack = item; return; }
                        if (info.subCategory === 'weapon' || (info.type === 'weapon' && info.subCategory !== 'tool')) {
                            if (!equip.weapon) { equip.weapon = item; return; }
                            if (!equip.offhand) { equip.offhand = item; return; }
                        }
                        if (info.subCategory === 'armor') {
                            for (const [slot, kws] of Object.entries(slotKeywords)) {
                                if (slot === 'head' || slot === 'body' || slot === 'legs' || slot === 'feet') {
                                    if (kws.some(kw => baseName.includes(kw)) && !equip[slot]) { equip[slot] = item; return; }
                                }
                            }
                            // Default armor to body slot
                            if (!equip.body) { equip.body = item; return; }
                        }
                    }
                    // Fallback: keyword matching
                    for (const [slot, kws] of Object.entries(slotKeywords)) {
                        if (!equip[slot] && kws.some(kw => baseName.includes(kw))) { equip[slot] = item; return; }
                    }
                    if (!equip.weapon && weaponKeywords.some(kw => baseName.includes(kw))) { equip.weapon = item; return; }
                });
                return { inv, equip };
            }

            function stg() {
                ccb();
                hist = [];
                const baseState = JSON.parse(JSON.stringify(DSTA));
                // Build inventory and equipment from character's custom items
                const c = gch();
                const itemsStr = c.it || DCHR.it;
                const { inv, equip } = buildInvAndEquipFromItems(itemsStr);
                baseState.inv = inv;
                baseState.equip = equip;
                // Set initial location from character's custom spawn point
                if (c.sp) baseState.location = c.sp;
                sst(baseState);
                svh([]);
                // Sync clock day with character's outbreak day setting
                const clk = gclk();
                if (c.days) {
                    const dayMatch = String(c.days).match(/(\d+)/);
                    if (dayMatch) {
                        clk.day = parseInt(dayMatch[1]);
                        // Adjust season based on new day
                        clk.season = seasonFromDay(clk.day);
                        // Generate weather/temp for the starting day
                        if (!clk.weather || clk.weather === '晴') clk.weather = randWeather(clk.season);
                        clk.temp = randTemp(clk.season, clk.temp);
                        sclk(clk);
                    }
                }
                upui();
                const ee = $('chatEmpty'); if (ee) ee.style.display = 'flex';
                $('inputText').value = '';
                busy = false;
                $('btnSend').disabled = false;
                $('inputText').classList.remove('busy');
                if (!cfg().key) {
                    apb({ ty: 'system', tx: '请先配置API密钥。' }, 0);
                } else {
                    apb({ ty: 'chapter', tx: c.days + ' | ' + c.dn }, 0);
                    // Generate initial survival stats via AI
                    aiInitStats();
                }
                scb();
            }

            async function aiInitStats() {
                const f = cfg();
                const c = gch();
                const mentalMap = { '稳定': '心态稳定', '焦虑': '焦虑紧张', '悲痛': '悲痛低落', '坚定': '意志坚定', '创伤': '创伤应激' };
                apb({ ty: 'narration', tx: '地点：' + c.sp + '。天色灰蒙，远处传来低吼。系统正在初始化你的生存状态…' }, 0);
                const initPrompt = `根据以下角色设定，生成写实的初始生存状态。角色已经在末世中生存了一段时间，请合理分配各项数值。\n\n角色：${c.cn}，${c.ca}岁，${c.gd}，体型${c.bt}，职业${c.job}\n背景：${c.bg}\n心理：${mentalMap[c.mental] || c.mental}\n特质：正面[${(c.tp||[]).join('、')}] 负面[${(c.tn||[]).join('、')}]\n初始物品：${c.it}\n地点：${c.sp}\n\n请直接输出数字，格式如下（每行一个）：\n饱腹:50\n口渴:45\n疲劳:35\n体温:36.8\n伤势:无\n负重:5\n心态:${c.mental||'稳定'}\n精神:${c.mental==='创伤'?30:c.mental==='悲痛'?40:75}\n欢愉:0\n\n只输出数值和标签，不要其他文字。数值应在合理范围内，体现角色经历了一段求生经历后的状态。`;
                try {
                    const msgs = [
                        { role: 'system', content: '你是写实生存游戏的数据初始化系统。根据角色背景生成合理的初始状态数值。' },
                        { role: 'user', content: initPrompt }
                    ];
                    const initBody = { model: f.model, messages: msgs, max_tokens: 256, temperature: 0.6 };
                    const rp = await window._sendProxyRequest(f.ep, initBody, f.key, null, false);
                    if (!rp.ok) {
                        let friendlyMsg = '初始化失败 (HTTP ' + rp.status + ')';
                        if (rp.status === 401) friendlyMsg = '初始化失败：认证失败，请检查API密钥';
                        else if (rp.status === 404) friendlyMsg = '初始化失败：接口不存在，请检查端点地址';
                        else if (rp.status >= 500) friendlyMsg = '初始化失败：服务器暂时不可用';
                        throw new Error(friendlyMsg);
                    }
                    const d = await rp.json();
                    const content = d.choices && d.choices[0] && d.choices[0].message && d.choices[0].message.content || '';
                    const s = gst();
                    content.split('\n').forEach(line => {
                        const m = line.match(/^\s*(饱腹|口渴|疲劳|体温|伤势|负重|心态|精神|欢愉)\s*[:：]\s*(.+?)\s*$/);
                        if (!m) return;
                        const k = m[1], v = m[2].trim();
                        if (k === '饱腹') s.hunger = Math.max(0, Math.min(100, parseInt(v) || 50));
                        else if (k === '口渴') s.thirst = Math.max(0, Math.min(100, parseInt(v) || 50));
                        else if (k === '疲劳') s.fatigue = Math.max(0, Math.min(100, parseInt(v) || 30));
                        else if (k === '体温') s.bodyTemp = parseFloat(v) || 37;
                        else if (k === '伤势') s.injury = v;
                        else if (k === '负重') s.enc = parseFloat(v) || 5;
                        else if (k === '心态') s.mentality = v;
                        else if (k === '精神') s.spirit = Math.max(0, Math.min(100, parseInt(v) || 75));
                        else if (k === '欢愉') { const j = parseInt(v) || 0; s.joy = Math.max(0, Math.min(100, j)); if (j > 0) s.pleasureUnlocked = true; }
                    });
                    sst(s);
                    upui();
                    // Generate initial narration
                    const initMsg = `你醒来在${c.sp}。外面的风呜咽着穿过破碎的窗户。你摸了摸自己——${s.injury !== '无' ? '身上带着' + s.injury + '，' : ''}${s.hunger < 40 ? '肚子饿得发慌，' : s.hunger > 70 ? '还算饱腹，' : '有些饥饿，'}${s.thirst < 40 ? '口渴得厉害，' : s.thirst > 70 ? '饮水充足，' : '有些口渴，'}${s.fatigue > 60 ? '身体疲惫不堪，' : s.fatigue > 40 ? '略感疲劳，' : '精神尚可，'}${mentalityLabel(s.mentality)}的你需要继续活下去。`;
                    apb({ ty: 'narration', tx: initMsg }, 0);
                    apb({ ty: 'system', tx: '自由输入行动开始。' }, 0);
                } catch (e) {
                    apb({ ty: 'narration', tx: '地点：' + c.sp + '。天色灰蒙，远处传来低吼。你醒来时浑身酸痛，不知道自己昏迷了多久。外面的风呜咽着穿过破碎的窗户。' }, 0);
                    apb({ ty: 'system', tx: '自由输入行动开始。（AI初始化失败，使用默认数值）' }, 0);
                }
            }

            // ===== Auto-idle =====
            let idleLocked = false;
            const IDLE_ACTIONS = {
                休养: [
                    '找个安全角落坐下稍作休息，恢复体力',
                    '缓慢整理呼吸，让紧绷的神经放松',
                    '检查身体状况，处理小伤',
                    '闭目养神，回忆过去的美好片段',
                    '做简单的伸展运动，缓解疲劳',
                    '轻声自言自语，保持心理稳定',
                    '整理行囊，清点物资',
                    '检查周围环境是否安全，然后靠墙壁闭目',
                    '尝试冥想，让自己平静下来',
                    '观察周围环境，确认安全后稍作休息'
                ],
                探索: [
                    '小心移动到附近房间，搜寻可用物资',
                    '探索走廊尽头，看看有什么发现',
                    '检查隔壁房间的柜子和抽屉',
                    '在废墟中寻找食物和水源',
                    '向外围探索，绘制简易地图',
                    '寻找防御工事或可利用的材料',
                    '搜索可能藏有物资的角落',
                    '检查附近的车辆或建筑残骸',
                    '追踪可疑痕迹，判断是否有其他幸存者',
                    '在安全范围内扩大搜索半径'
                ],
                自定义: []
            };
            function getIdleAction() {
                const f = cfg();
                const dir = f.idleDir || '休养';
                if (dir === '自定义' && f.idleCustom) return f.idleCustom;
                const list = IDLE_ACTIONS[dir] || IDLE_ACTIONS['休养'];
                return list[Math.floor(Math.random() * list.length)];
            }
            function startIdle() {
                const f = cfg();
                if (!f.key) { tst('请先配置API密钥'); return; }
                if (!f.idleInt || f.idleInt < 5) { tst('挂机间隔需≥5秒'); return; }
                stopIdle();
                f.idleOn = true; scf(f);
                idleLocked = true;
                $('btnIdle').textContent = '停止挂机';
                $('btnIdle').classList.add('accent');
                $('btnSend').disabled = true;
                $('inputText').classList.add('idle-locked');
                tst('挂机已开启（方向：' + (f.idleDir || '休养') + '），每' + f.idleInt + '秒自动行动');
                idleTimer = setInterval(() => {
                    if (busy) return;
                    const s4 = gst();
                    const lowList = [];
                    if ((s4.hunger ?? 50) <= 20) lowList.push('饱腹');
                    if ((s4.thirst ?? 50) <= 20) lowList.push('口渴');
                    if ((s4.fatigue ?? 0) >= 90) lowList.push('疲劳过高');
                    if ((s4.hp ?? 100) <= 30) lowList.push('HP危险');
                    if ((s4.bodyTemp ?? 37) <= 33 || (s4.bodyTemp ?? 37) >= 42) lowList.push('体温异常');
                    if ((s4.spirit ?? 85) <= 25) lowList.push('精神崩溃');
                    if (lowList.length > 0) {
                        stopIdle();
                        const msg = '⚠️ 挂机已自动停止：' + lowList.join('、') + '，请立即处理！';
                        snotify('danger', '挂机中止', lowList.join('、'));
                        tst(msg);
                        playSfx('danger');
                        return;
                    }
                    if (document.hidden && !cfg().key) return;
                    const action = getIdleAction();
                    hin(action, true);
                }, f.idleInt * 1000);
            }
            function stopIdle() {
                if (idleTimer) { clearInterval(idleTimer); idleTimer = null; }
                const f = cfg(); f.idleOn = false; scf(f);
                idleLocked = false;
                $('btnIdle').textContent = '挂机';
                $('btnIdle').classList.remove('accent');
                $('btnSend').disabled = false;
                $('inputText').classList.remove('idle-locked');
            }
            function toggleIdle() {
                const f = cfg();
                if (f.idleOn) { stopIdle(); return; }
                openIdleConfigPanel();
            }
            function openIdleConfigPanel() {
                const f = cfg();
                const d = document.createElement('div');
                d.className = 'modal-overlay';
                d.style.zIndex = '10000';
                const dirOptions = ['休养', '探索', '自定义'];
                const dirLabels = { '休养': '休养为主', '探索': '探索为主', '自定义': '自定义' };
                d.innerHTML = '<div class="idle-config-panel">' +
                    '<h3>⚙ 挂机配置</h3>' +
                    '<div class="ic-field">' +
                        '<label>行动方向</label>' +
                        '<select id="icDir">' +
                            dirOptions.map(o => '<option value="' + o + '"' + (o === (f.idleDir || '休养') ? ' selected' : '') + '>' + dirLabels[o] + '</option>').join('') +
                        '</select>' +
                    '</div>' +
                    '<div class="ic-field" id="icCustomWrap" style="display:' + ((f.idleDir === '自定义') ? 'block' : 'none') + ';">' +
                        '<label>自定义行动</label>' +
                        '<input type="text" id="icCustom" placeholder="如：在公寓内搜寻可用的工具和零件" value="' + esc(f.idleCustom || '') + '">' +
                        '<div class="ic-hint">当选择"自定义"方向时，挂机将执行此行动内容</div>' +
                    '</div>' +
                    '<div class="ic-field">' +
                        '<label>行动间隔（秒，最小5秒）</label>' +
                        '<input type="number" id="icInt" min="5" max="300" value="' + (f.idleInt || 60) + '">' +
                        '<div class="ic-hint">挂机模式下每次自动行动的间隔时间</div>' +
                    '</div>' +
                    '<div class="ic-buttons">' +
                        '<button class="ic-btn cancel" id="icCancel">取消</button>' +
                        '<button class="ic-btn confirm" id="icConfirm">开始挂机</button>' +
                    '</div>' +
                '</div>';
                document.body.appendChild(d);
                const dirSel = d.querySelector('#icDir');
                const customWrap = d.querySelector('#icCustomWrap');
                dirSel.onchange = () => { customWrap.style.display = (dirSel.value === '自定义') ? 'block' : 'none'; };
                const cleanup = () => { d.remove(); };
                d.querySelector('#icCancel').onclick = cleanup;
                d.querySelector('#icConfirm').onclick = () => {
                    const dir = dirSel.value;
                    const custom = d.querySelector('#icCustom').value;
                    const intInput = d.querySelector('#icInt');
                    const v = parseInt(intInput.value) || 60;
                    if (v < 5) { tst('最小5秒'); return; }
                    f.idleDir = dir;
                    if (dir === '自定义') f.idleCustom = custom;
                    f.idleInt = v;
                    scf(f);
                    cleanup();
                    startIdle();
                };
                d.onclick = (e) => { if (e.target === d) cleanup(); };
            }

            // ===== Sandbox rendering =====
            function renderSandbox() {
                const container = $('sandboxContainer');
                if (!container) return;
                container.innerHTML = '';
                const bx = gsbx();
                Object.keys(bx).forEach(catKey => {
                    const cat = bx[catKey];
                    const sub = document.createElement('div');
                    sub.className = 'sandbox-subgroup';
                    const h5 = document.createElement('h5');
                    h5.textContent = cat.title;
                    h5.addEventListener('click', () => sub.classList.toggle('collapsed'));
                    sub.appendChild(h5);
                    const body = document.createElement('div');
                    body.className = 'subgroup-body';
                    Object.keys(cat.fields).forEach(fk => {
                        const fd = cat.fields[fk];
                        const row = document.createElement('div');
                        row.className = 'sandbox-field-row';
                        const lbl = document.createElement('label');
                        lbl.textContent = fd.label;
                        lbl.style.fontSize = '0.66rem';
                        lbl.style.fontWeight = 'bold';
                        row.appendChild(lbl);
                        if (fd.hint) {
                            const hint = document.createElement('p');
                            hint.className = 'field-hint';
                            hint.textContent = fd.hint;
                            row.appendChild(hint);
                        }
                        const field = document.createElement('div');
                        field.className = 'sandbox-field';
                        if (fd.type === 'select') {
                            const sel = document.createElement('select');
                            fd.opts.forEach(o => { const op = document.createElement('option'); op.value = o; op.textContent = o; if (fd.val === o) op.selected = true; sel.appendChild(op); });
                            sel.addEventListener('change', () => { fd.val = sel.value; });
                            field.appendChild(sel);
                        } else if (fd.type === 'toggle') {
                            const sel = document.createElement('select');
                            ['开','关'].forEach(o => { const op = document.createElement('option'); op.value = o === '开' ? true : false; op.textContent = o; if (fd.val === (o === '开')) op.selected = true; sel.appendChild(op); });
                            sel.addEventListener('change', () => { fd.val = sel.value === 'true'; });
                            field.appendChild(sel);
                        } else {
                            const inp = document.createElement('input');
                            inp.type = fd.type || 'text';
                            inp.value = fd.val;
                            inp.addEventListener('input', () => { fd.val = fd.type === 'number' ? parseFloat(inp.value) || 0 : inp.value; });
                            field.appendChild(inp);
                        }
                        row.appendChild(field);
                        body.appendChild(row);
                    });
                    sub.appendChild(body);
                    container.appendChild(sub);
                });
                // Validate preset conflicts
                const issues = validateSandboxPreset(bx);
                if (issues.length) {
                    const warn = document.createElement('div');
                    warn.style.cssText = 'padding:8px 12px;margin:8px 0;background:rgba(160,64,64,0.08);border:1.5px dashed #a04040;border-radius:6px;font-size:0.72rem;color:#a04040;';
                    warn.innerHTML = '⚠️ <strong>预设冲突检测：</strong>' + issues.map(i => '<br>• ' + esc(i)).join('');
                    container.insertBefore(warn, container.firstChild);
                }
            }
            function validateSandboxPreset(bx) {
                const issues = [];
                const getVal = (catKey, fieldKey) => {
                    try { return bx[catKey] && bx[catKey].fields && bx[catKey].fields[fieldKey] ? bx[catKey].fields[fieldKey].val : null; }
                    catch { return null; }
                };
                // Violence vs morality check
                const violence = getVal('cat10', 'violenceLevel');
                const morality = getVal('cat10', 'moralityLevel');
                if (violence === '禁止暴力' && morality === '无底线') {
                    issues.push('道德底线"无底线"与暴力等级"禁止暴力"存在逻辑冲突');
                }
                // Survival vs humanity decay
                const survivalRate = getVal('cat10', 'survivalRate');
                const humanityDecay = getVal('cat10', 'humanityDecay');
                if (survivalRate === '充满希望' && humanityDecay === '急速衰减') {
                    issues.push('生存率"充满希望"与人性衰减"急速衰减"存在矛盾');
                }
                // Cannibalism taboo
                const vulgarLevel = getVal('cat10', 'vulgarLevel');
                if (vulgarLevel === '允许极端' && morality === '严格守德') {
                    issues.push('低俗程度"允许极端"与道德底线"严格守德"存在冲突');
                }
                // Nightmare difficulty check
                const diffEl = document.getElementById('charDifficulty');
                if (diffEl && diffEl.value === '噩梦') {
                    if (survivalRate === '充满希望' || (morality && morality.indexOf('宽松') >= 0)) {
                        issues.push('噩梦难度下建议降低生存率或道德底线以保持设定一致性');
                    }
                }
                return issues;
            }

            // ===== Backpack functions =====
            function categorizeItem(item) {
                // First check ITEM_PRESETS for known categories
                const preset = getItemInfo(item);
                if (preset && preset.category) {
                    const pc = preset.category;
                    const ps = preset.subCategory || '';
                    let cat = 'misc', sub = 'other';
                    // Map based on BOTH category and subCategory for accuracy
                    if (pc === 'consumable') {
                        if (ps === 'food') { cat = 'food'; sub = 'solid'; }
                        else if (ps === 'water') { cat = 'food'; sub = 'liquid'; }
                        else if (ps === 'drink') { cat = 'food'; sub = 'liquid'; }
                        else if (ps === 'medical') {
                            cat = 'medical';
                            sub = /绷带|纱布|消毒|酒精|碘伏|急救|创可贴|止血|夹板|三角巾|生理盐水/.test(item) ? 'aid' : 'med';
                        }
                        else if (ps === 'tactical') { cat = 'weapon'; sub = 'improvised'; }
                        else if (ps === 'misc') { cat = 'misc'; sub = 'other'; }
                        else { cat = 'food'; sub = 'solid'; }
                    } else if (pc === 'equip') {
                        if (ps === 'weapon') {
                            cat = 'weapon';
                            sub = /枪|弹|弓|弩|子弹|弹药/.test(item) ? 'ranged' : 'melee';
                        } else if (ps === 'armor') {
                            cat = 'weapon'; sub = 'armor';
                        } else if (ps === 'tool') {
                            cat = 'tool';
                            sub = /手电筒|头灯|灯|蜡烛|火柴|打火机|镁棒|荧光棒|紫外线/.test(item) ? 'light' : 'hand';
                        } else if (ps === 'backpack') {
                            cat = 'tool'; sub = 'container';
                        } else if (ps === 'tech') {
                            cat = 'tool'; sub = 'elec';
                        } else if (ps === 'misc') {
                            cat = 'misc'; sub = 'other';
                        } else { cat = 'tool'; sub = 'hand'; }
                    } else if (pc === 'material') {
                        if (ps === 'fuel') { cat = 'material'; sub = 'fuel'; }
                        else if (ps === 'build') {
                            cat = 'material';
                            sub = /木|板|柴|树枝|木棍|原木/.test(item) ? 'wood' : 'metal';
                        } else if (ps === 'tech') { cat = 'material'; sub = 'elec'; }
                        else if (ps === 'tool') {
                            cat = 'material';
                            sub = /绳|布|线|纤维|皮革|胶带/.test(item) ? 'cloth' : 'metal';
                        } else if (ps === 'food') {
                            cat = 'food'; sub = 'spice';
                        } else if (ps === 'ammo') {
                            cat = 'weapon'; sub = 'ranged';
                        } else { cat = 'material'; sub = 'metal'; }
                    } else if (pc === 'key') {
                        cat = 'misc'; sub = 'key';
                    } else if (pc === 'misc') {
                        if (ps === 'valuable') { cat = 'misc'; sub = 'lux'; }
                        else { cat = 'misc'; sub = 'other'; }
                    }
                    // Verify the category exists in CATS
                    if (CATS[cat] && CATS[cat].subs[sub]) {
                        return { cat, sub };
                    }
                }
                // Fallback: keyword-based matching, sorted by keyword length (longest first)
                // Prioritize medical and tool over material to avoid misclassification
                const catOrder = ['medical', 'food', 'tool', 'weapon', 'survival', 'clothing', 'material', 'misc'];
                const allKeywords = [];
                for (const cat of catOrder) {
                    const subs = CAT_KW[cat];
                    if (!subs) continue;
                    for (const [sub, keywords] of Object.entries(subs)) {
                        for (const kw of keywords) {
                            allKeywords.push({ cat, sub, kw, len: kw.length });
                        }
                    }
                }
                allKeywords.sort((a, b) => b.len - a.len);
                for (const { cat, sub, kw } of allKeywords) {
                    if (item.includes(kw)) return { cat, sub };
                }
                return { cat: 'misc', sub: 'other' };
            }
            function getFilteredItems() {
                return (gst().inv || []).filter(item => {
                    const { cat, sub } = categorizeItem(item);
                    return cat === bpCat && sub === bpSub;
                });
            }
            // Combine stacks into summary
            function summarizeInvSummary() {
                const map = new Map();
                (gst().inv || []).forEach(item => {
                    const m = item.match(/^(.+?)x(\d+)$/);
                    const base = m ? m[1] : item;
                    const qty = m ? parseInt(m[2]) : 1;
                    map.set(base, (map.get(base) || 0) + qty);
                });
                return Array.from(map.entries()).map(([name, qty]) => ({
                    name, qty, display: name + (qty > 1 ? 'x' + qty : '')
                }));
            }
            function toggleItemStarred(name) {
                const s = gst();
                if (!s.stars) s.stars = [];
                const base = getItemBaseName(name);
                // 移除任何 baseName 匹配的旧记录（无论是base还是带x后缀）
                const cleanStars = s.stars.filter(x => getItemBaseName(x) !== base);
                if (cleanStars.length === s.stars.length) {
                    // 不存在，添加（统一存 baseName）
                    s.stars = cleanStars.concat([base]);
                    tst('已标常用：' + base);
                } else {
                    s.stars = cleanStars;
                    tst('已取消常用：' + base);
                }
                sst(s);
            }
            function getItemBaseName(item) {
                const m = item.match(/^(.+?)x(\d+)$/);
                return m ? m[1] : item;
            }
            function isItemStarred(item) {
                const s = gst();
                const base = getItemBaseName(item);
                return s.stars && s.stars.some(x => getItemBaseName(x) === base);
            }
            function renderBackpackCell(grid, item) {
                const cell = document.createElement('div');
                const starClass = isItemStarred(item) ? 'bp-cell stared' : 'bp-cell';
                cell.className = starClass;
                cell.innerHTML = '<div class="bp-icon-cell">' + wrapEmoji(item) + '</div><div class="bp-name">' + esc(item) + '</div>';
                let touchTimer = null;
                cell.addEventListener('click', (e) => { showItemContextMenu(e, item); });
                cell.addEventListener('contextmenu', (e) => { e.preventDefault(); showItemContextMenu(e, item); });
                cell.addEventListener('touchstart', (e) => {
                    touchTimer = setTimeout(() => { showItemContextMenu(e.touches[0], item); }, 400);
                });
                cell.addEventListener('touchend', () => { if (touchTimer) { clearTimeout(touchTimer); touchTimer = null; } });
                cell.addEventListener('touchmove', () => { if (touchTimer) { clearTimeout(touchTimer); touchTimer = null; } });
                grid.appendChild(cell);
            }
            function renderBackpack(direction) {
                ['bpViewCat','bpViewAll','bpViewStar'].forEach(id => {
                    const btn = $(id); if (!btn) return;
                    const mode = { 'bpViewCat': 'cat', 'bpViewAll': 'all', 'bpViewStar': 'star' }[id];
                    const active = bpView === mode;
                    btn.style.background = active ? 'var(--grid-cell-bg)' : '';
                    btn.style.border = active ? '1.5px solid var(--accent)' : '';
                    btn.style.color = active ? 'var(--accent)' : '';
                });
                if ($('bpViewTitle')) $('bpViewTitle').textContent = '（' + { cat: '分类视图', all: '总览视图', star: '常用视图' }[bpView] + '）';
                const catRow = $('bpCatRow');
                const subRow = $('bpSubRow');
                const allItems = (gst().inv || []);
                let filtered = [];
                if (bpView === 'cat') {
                    catRow.style.display = '';
                    subRow.style.display = '';
                    catRow.innerHTML = '';
                    Object.entries(CATS).forEach(([key, info]) => {
                        const btn = document.createElement('button');
                        btn.className = 'bp-cat-btn' + (key === bpCat ? ' active' : '');
                        btn.innerHTML = info.name;
                        btn.addEventListener('click', () => { bpCat = key; bpSub = Object.keys(info.subs)[0]; bpPage = 0; renderBackpack('forward'); });
                        catRow.appendChild(btn);
                    });
                    subRow.innerHTML = '';
                    Object.entries(CATS[bpCat].subs).forEach(([key, name]) => {
                        const btn = document.createElement('button');
                        btn.className = 'bp-sub-btn' + (key === bpSub ? ' active' : '');
                        btn.innerHTML = name;
                        btn.addEventListener('click', () => { bpSub = key; bpPage = 0; renderBackpack('forward'); });
                        subRow.appendChild(btn);
                    });
                    filtered = getFilteredItems();
                } else if (bpView === 'all') {
                    catRow.style.display = 'none';
                    subRow.style.display = 'none';
                    const summary = summarizeInvSummary();
                    summary.sort((a, b) => {
                        const sa = isItemStarred(a.name) ? 1 : 0;
                        const sb = isItemStarred(b.name) ? 1 : 0;
                        if (sa !== sb) return sb - sa;
                        return a.name.localeCompare(b.name, 'zh');
                    });
                    filtered = summary.map(s => s.display);
                } else {
                    catRow.style.display = 'none';
                    subRow.style.display = 'none';
                    const s = gst();
                    const starBases = new Set((s.stars || []).map(x => getItemBaseName(x)));
                    const summary = summarizeInvSummary().filter(si => starBases.has(getItemBaseName(si.name)));
                    summary.sort((a, b) => a.name.localeCompare(b.name, 'zh'));
                    filtered = summary.map(s => s.display);
                    if (!filtered.length) filtered = ['NO_STARRED_EMPTY'];
                }
                const kw = ($('bpSearch') && $('bpSearch').value || '').trim().toLowerCase();
                if (kw) {
                    filtered = filtered.filter(name => {
                        if (name === 'NO_STARRED_EMPTY' || !name) return false;
                        const base = parseItemQty(name).base.toLowerCase();
                        const info = getItemInfo(parseItemQty(name).base);
                        const desc = info && (info.desc || info.subCategory || info.type || info.category || '') || '';
                        return base.includes(kw) || desc.toLowerCase().includes(kw);
                    });
                    if (!filtered.length) filtered = ['NO_SEARCH_EMPTY'];
                    const totalPagesK = Math.max(1, Math.ceil(filtered.length / 9));
                    if (bpPage >= totalPagesK) bpPage = totalPagesK - 1;
                }
                const perPage = 9;
                const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
                if (bpPage >= totalPages) bpPage = totalPages - 1;
                if (bpPage < 0) bpPage = 0;
                const pageItems = filtered.slice(bpPage * perPage, bpPage * perPage + perPage);
                const grid = $('bpGrid');
                grid.innerHTML = '';
                for (let i = 0; i < perPage; i++) {
                    if (i < pageItems.length) {
                        const item = pageItems[i];
                        if (item === 'NO_STARRED_EMPTY') {
                            const cell = document.createElement('div');
                            cell.className = 'bp-cell empty';
                            cell.innerHTML = '<div class="bp-name" style="font-size:0.68rem;color:var(--ink-soft);">暂无常用物品<br>在分类视图点击物品 → 常用 加入</div>';
                            grid.appendChild(cell);
                        } else if (item === 'NO_SEARCH_EMPTY') {
                            const cell = document.createElement('div');
                            cell.className = 'bp-cell empty';
                            cell.innerHTML = '<div class="bp-name" style="font-size:0.7rem;color:var(--color-warn);">🔍 未找到匹配物品<br>试试其他关键词</div>';
                            grid.appendChild(cell);
                        } else {
                            renderBackpackCell(grid, item);
                        }
                    } else {
                        const cell = document.createElement('div');
                        cell.className = 'bp-cell empty';
                        cell.innerHTML = '<div class="bp-name">空位</div>';
                        grid.appendChild(cell);
                    }
                }
                $('bpPageInfo').textContent = (bpPage + 1) + '/' + totalPages;
                $('bpPrev').disabled = bpPage <= 0;
                $('bpNext').disabled = bpPage >= totalPages - 1;
                if (bpView === 'cat') {
                    $('bpInfo').textContent = '本类 ' + filtered.length + ' 件 / 共 ' + (gst().inv || []).length + ' 件 | 负重 ' + gst().enc + 'kg';
                } else if (bpView === 'all') {
                    $('bpInfo').textContent = '共 ' + summarizeInvSummary().length + ' 类 / 总数量 ' + (gst().inv || []).length + ' 件 | 负重 ' + gst().enc + 'kg';
                } else {
                    $('bpInfo').textContent = '常用 ' + (gst().stars || []).length + ' 类';
                }
            }
            let _bpSearchInited = false;
            function openBackpack() {
                bpCat = 'food'; bpSub = 'solid'; bpPage = 0;
                renderBackpack();
                const m = $('backpackModal');
                if (!_bpSearchInited && m) {
                    const bpHeader = m.querySelector('.bp-header') || m.querySelector('.modal-header');
                    if (!m.querySelector('#bpSearch')) {
                        const wrap = document.createElement('div');
                        wrap.style.cssText = 'padding:0 14px 10px;';
                        wrap.innerHTML = '<input id="bpSearch" type="text" placeholder="🔍 搜索背包物品…" style="width:100%;padding:7px 10px;border:2px solid var(--input-border);border-radius:4px;background:var(--input-bg);color:var(--text);font-family:inherit;font-size:0.78rem;outline:none;">';
                        const target = bpHeader ? bpHeader.parentNode : m.firstChild;
                        if (bpHeader && bpHeader.nextSibling) bpHeader.parentNode.insertBefore(wrap, bpHeader.nextSibling);
                        else if (m.firstChild) m.insertBefore(wrap, m.firstChild.nextSibling ? m.firstChild.nextSibling : m.firstChild);
                        const inp = wrap.querySelector('#bpSearch');
                        inp.addEventListener('input', () => { bpPage = 0; renderBackpack(); });
                        inp.addEventListener('focus', () => inp.select());
                    }
                    _bpSearchInited = true;
                }
                $('backpackModal').style.display = 'flex';
            }
            // 根据物品名称/信息推断装备槽位（用于本地装备操作）
            // 旧名兼容，内部统一走 getEquipSlot
            function guessEquipSlot(name, info) { return getEquipSlot(name, info); }
            function slotLabel(slot) {
                const labels = { head: '头部', body: '躯干', legs: '腿部', feet: '足部', weapon: '主手', offhand: '副手', backpack: '背包', accessory: '饰品' };
                return labels[slot] || slot;
            }

            function openEquipment() { renderEquipment(); $('equipmentModal').style.display = 'flex'; }

            function renderEquipment() {
                const s = gst();
                const ch = gch();
                const slots = [
                    { key: 'head', label: '头部', icon: '⛑️', type: 'armor' },
                    { key: 'body', label: '躯干', icon: '🥋', type: 'armor' },
                    { key: 'legs', label: '腿部', icon: '👖', type: 'armor' },
                    { key: 'feet', label: '足部', icon: '👟', type: 'armor' },
                    { key: 'weapon', label: '主手', icon: '⚔️', type: 'weapon' },
                    { key: 'offhand', label: '副手', icon: '🛡️', type: 'weapon' },
                    { key: 'backpack', label: '背包', icon: '🎒', type: 'backpack' },
                    { key: 'accessory', label: '饰品', icon: '💍', type: 'accessory' }
                ];
                const eq = s.equip || {};
                const container = $('equipSlots');
                const detail = $('equipDetailContainer');
                const bpLink = $('equipBackpackLink');
                container.innerHTML = '';
                detail.innerHTML = '';
                bpLink.innerHTML = '';

                let totalDur = 0, equipCount = 0;
                slots.forEach(sl => {
                    const val = eq[sl.key] || '';
                    const itemInfo = val ? getItemInfo(val) : null;
                    if (itemInfo && itemInfo.durability) { totalDur += itemInfo.durability; equipCount++; }
                    const emptyClass = val ? '' : ' equip-slot--empty';
                    const typeClass = ' equip-slot--' + sl.type;
                    const slotEl = document.createElement('div');
                    slotEl.className = 'equip-slot' + emptyClass + typeClass;
                    slotEl.innerHTML =
                        '<div class="equip-slot__header">' +
                            '<span class="equip-slot__icon">' + sl.icon + '</span>' +
                            '<span>' + sl.label + '</span>' +
                        '</div>' +
                        '<div class="equip-slot__value">' + (val ? esc(val) : '— 空 —') + '</div>' +
                        (itemInfo && itemInfo.durability ? '<div class="equip-slot__dur">耐久 ' + itemInfo.durability + '</div>' : '') +
                        (itemInfo && itemInfo.subCategory ? '<div class="equip-slot__tag">' + esc(itemInfo.subCategory) + '</div>' : '');
                    slotEl.addEventListener('click', () => showSlotDetail(sl.key, val, itemInfo));
                    container.appendChild(slotEl);
                });

                // Status text
                const statusText = $('equipStatusText');
                if (statusText) {
                    const parts = [];
                    if (equipCount > 0) parts.push('装备 ' + equipCount + ' 件');
                    if (equipCount > 0 && totalDur > 0) parts.push('平均耐久 ' + Math.round(totalDur / equipCount));
                    statusText.textContent = parts.length ? parts.join(' · ') : '（无装备）';
                }

                // Show backpack link section
                const inv = s.inv || [];
                const equippableItems = [];
                inv.forEach(item => {
                    const info = getItemInfo(item);
                    if (info && (info.category === 'equip' || info.type === 'equippable' || info.type === 'weapon')) {
                        equippableItems.push({ name: item, info });
                    }
                });
                if (equippableItems.length > 0) {
                    bpLink.innerHTML = '<div class="equip-backpack-link"><h4>🎒 背包中可装备物品（点击装备）</h4><div class="equip-backpack-link__items"></div></div>';
                    const itemsContainer = bpLink.querySelector('.equip-backpack-link__items');
                    equippableItems.forEach(item => {
                        const btn = document.createElement('div');
                        btn.className = 'equip-bp-item';
                        btn.innerHTML = wrapEmoji(item.name) + ' ' + esc(item.name);
                        btn.title = item.info.desc || '点击装备';
                        btn.addEventListener('click', async () => {
                            if (busy) { tst('正在演算中'); return; }
                            let slot = guessEquipSlot(item.name, item.info);
                            if (!slot) {
                                showEquipSlotSelector(item.name, item.info, (chosenSlot) => {
                                    const s2 = gst();
                                    if (!s2.equip) s2.equip = {};
                                    if (s2.equip[chosenSlot]) invAdd(s2.equip[chosenSlot], 1);
                                    s2.equip[chosenSlot] = parseItemQty(item.name).base;
                                    invRemove(item.name, 1);
                                    addLogEntry('system', '装备了 ' + item.name + ' → ' + slotLabel(chosenSlot));
                                    checkAchievements();
                                    playSfx('equip');
                                    snotify('add', '装备', item.name + ' → ' + slotLabel(chosenSlot));
                                    renderEquipment();
                                    upui();
                                });
                                return;
                            }
                            const s = gst();
                            const oldItem = s.equip && s.equip[slot] || '';
                            const oldInfo = oldItem ? getItemInfo(oldItem) : null;
                            const prevText = getEquipPreviewText(slot, item.name, oldItem, item.info, oldInfo);
                            if (prevText && !await sketchConfirm('【装备预览】\n' + prevText + '\n\n确定要装备吗？')) return;
                            if (!s.equip) s.equip = {};
                            if (s.equip[slot]) invAdd(s.equip[slot], 1);
                            s.equip[slot] = parseItemQty(item.name).base;
                            invRemove(item.name, 1);
                            addLogEntry('system', '装备了 ' + item.name);
                            checkAchievements();
                            playSfx('equip');
                            snotify('add', '装备', item.name + ' → ' + slotLabel(slot));
                            renderEquipment();
                            upui();
                        });
                        itemsContainer.appendChild(btn);
                    });
                }

                // Ability section
                const abSection = $('equipAbilitySection');
                if (abSection) {
                    if (ch.extraFeature === '异能' && ch.abilityName) {
                        abSection.style.display = 'block';
                        const ab = ABILITIES[ch.abilityName] || { name: ch.abilityName, desc: ch.abilityDesc || '未知能力', icon: '◇' };
                        const lv = s.abilityLevel || 0;
                        $('equipAbility').innerHTML =
                            '<div style="font-weight:bold;margin-bottom:4px;">' + (ab.icon || '◇') + ' ' + esc(ab.name) + '（Lv.' + (lv + 1) + '）</div>' +
                            '<div style="color:var(--ink-soft);">' + esc(ab.desc) + '</div>' +
                            '<div style="margin-top:6px;color:var(--ink-faint);font-size:0.7rem;">熟练度：' + '●'.repeat(lv + 1) + '○'.repeat(Math.max(0, 5 - lv - 1)) + '</div>';
                    } else {
                        abSection.style.display = 'none';
                    }
                }
            }

            function showSlotDetail(slotKey, itemName, itemInfo) {
                const detail = $('equipDetailContainer');
                if (!detail) return;
                if (!itemName) {
                    detail.innerHTML = '<div class="equip-empty-hint">此槽位为空。<br>从背包中选择可装备物品进行装备。</div>';
                    return;
                }
                let html = '<div class="equip-detail">';
                html += '<div class="equip-detail__title">' + wrapEmoji(itemName) + ' ' + esc(itemName) + '</div>';
                if (itemInfo) {
                    if (itemInfo.category) html += '<div>分类：<strong>' + esc(itemInfo.category) + '</strong>' + (itemInfo.subCategory ? ' / ' + esc(itemInfo.subCategory) : '') + '</div>';
                    if (itemInfo.effect) html += '<div>效果：<strong>' + esc(itemInfo.effect) + '</strong></div>';
                    if (itemInfo.durability) html += '<div>耐久：<strong>' + itemInfo.durability + '</strong></div>';
                    if (itemInfo.desc) html += '<div class="equip-detail__desc">' + esc(itemInfo.desc) + '</div>';
                } else {
                    html += '<div class="equip-detail__desc">暂无详细信息。</div>';
                }
                const oldName = itemName;
                const oldInfo0 = itemInfo;
                const prev = getEquipPreviewText(slotKey, '', oldName, null, oldInfo0);
                if (prev) html += '<div style="font-size:0.65rem;color:var(--ink-soft);margin:6px 0 0;padding:4px 6px;background:var(--bg-paper-alt);border-left:3px solid var(--accent);border-radius:2px;">💡 卸下后：' + esc(prev) + '</div>';
                html += '<div class="equip-actions">';
                html += '<button class="equip-btn equip-btn--primary" data-act="details">查看详情</button>';
                html += '<button class="equip-btn equip-btn--danger" data-act="unequip">卸下</button>';
                html += '</div></div>';
                detail.innerHTML = html;
                detail.querySelectorAll('.equip-btn').forEach(btn => {
                    btn.addEventListener('click', () => {
                        const act = btn.dataset.act;
                        if (act === 'unequip') {
                            if (busy) { tst('正在演算中'); return; }
                            // 实际执行卸下操作
                            const s = gst();
                            if (s.equip && s.equip[slotKey] && s.equip[slotKey] === itemName) {
                                s.equip[slotKey] = '';
                                // 放回背包
                                invAdd(itemName, 1);
                                addLogEntry('system', '卸下了 ' + itemName);
                                checkAchievements();
                                playSfx('equip');
                                snotify('remove', '装备', itemName);
                                renderEquipment();
                            } else {
                                // 本地卸下操作，不触发AI对话
                                const s2 = gst();
                                if (s2.equip) {
                                    const foundSlot = Object.keys(s2.equip).find(k => s2.equip[k] === itemName);
                                    if (foundSlot) {
                                        s2.equip[foundSlot] = '';
                                        invAdd(itemName, 1);
                                        addLogEntry('system', '卸下了 ' + itemName);
                                        checkAchievements();
                                        playSfx('equip');
                                        snotify('remove', '装备', itemName);
                                        renderEquipment();
                                        upui();
                                    } else {
                                        tst('未找到该装备所在槽位');
                                    }
                                }
                            }
                        } else if (act === 'details') {
                            showItemDetail(itemName, itemInfo);
                        }
                    });
                });
            }

            // ===== Debug Command Runner =====
            function runDebugCmd(raw) {
                let input = raw.trim();
                // Strip prefix: / debug: 调试:
                if (input.startsWith('/')) input = input.slice(1).trim();
                else if (input.startsWith('debug:')) input = input.slice(6).trim();
                else if (input.startsWith('调试:')) input = input.slice(3).trim();

                const out = (m, lv) => tst('[DEBUG] ' + m, lv || 'info');
                const notFound = (k) => out('未识别的指令：' + k + '，输入 /help 查看所有指令', 'warn');
                if (!input) { out('空指令。输入 /help 查看帮助', 'warn'); return; }

                // Help command
                if (/^(help|帮助|\?|h)$/i.test(input)) {
                    const help = [
                        '【状态指令】',
                        '  /s|status  显示当前角色、状态、沙盒概要',
                        '  /set 饱腹=50&口渴=30  批量设置状态字段',
                        '  /max  满饱腹/口渴/体力/精神/欢愉',
                        '  /heal  清空伤势和状态',
                        '  /time +2h  推进时间（支持小数）',
                        '【角色 / 世界】',
                        '  /chr 字段=值  修改角色字段（例：/chr cn=张三 bg=新背景）',
                        '  /bx 分类.字段=值  修改沙盒（例：/bx cat10.moralityLevel=严格守德）',
                        '【道具 / 线索 / 地图】',
                        '  /item +绷带 或 /item -空瓶  增删单个物品',
                        '  /inv 绷带、打火机、水  重置背包（逗号分隔）',
                        '  /clue 发现了地下通道入口  新增线索',
                        '  /clue:clear  清空线索',
                        '  /map +城北研究所  解锁/新地点',
                        '  /go 城北医院  瞬移至指定位置',
                        '【模块控制】',
                        '  /idle on|off|start  挂机控制',
                        '  /save 或 /load s3  快速存档/读档',
                        '  /reset  清空全部游戏进度（角色、背包、对话）',
                        '  /dump chr|st|bx|hist  控制台导出原始数据',
                        '【AI辅助】',
                        '  /prompt  查看当前生效的系统prompt（复制到剪贴板）',
                        '  /ai 自定义文本  直接以角色身份发送给AI（绕过debug拦截）',
                        '',
                        '所有指令仅调试模式生效。正常行动不会触发。'
                    ];
                    help.forEach((h, i) => setTimeout(() => out(h), i * 20));
                    return;
                }

                // Status display
                if (/^(s|status|状态)$/i.test(input)) {
                    const s = gst(), c = gch(), cl = gclk(), f = cfg();
                    out(`角色：${c.cn || '未命名'} | ${c.gd || '?'}${c.ca ? ' ' + c.ca : ''}岁 | ${c.job || '无业'}`);
                    out(`状态：饱腹 ${Math.round(s.hunger)}% / 口渴 ${Math.round(s.thirst)}% / 疲劳 ${Math.round(s.fatigue)}% / 体温 ${s.bodyTemp != null ? s.bodyTemp.toFixed(1) : '--'}°C`);
                    out(`精神 ${s.spirit ?? '--'} / 心态 ${mentalityLabel(s.mentality)} / 伤势 ${s.injury || '无'} / 负重 ${s.enc || 0}kg`);
                    out(`时间：D${cl.day || 1} ${fmtTime(cl.elapsedSec)} ${dayPhase(cl.elapsedSec)} | 天气 ${cl.weather || '晴'} ${cl.temp != null ? cl.temp.toFixed(1) : '--'}°C`);
                    out(`位置：${s.location || c.sp || '未设定'} | 背包物品 ${(s.inv || []).length} | 线索 ${(s.clues || []).length}`);
                    out(`调试：debug=${!!f.debug} | worldLock=${!!f.worldLock} | idle=${f.idleOn ? '运行中' : '关闭'}`);
                    return;
                }

                // Max all vital stats
                if (/^(max|满)$/i.test(input)) {
                    const s = gst();
                    s.hunger = 100; s.thirst = 100; s.fatigue = 0; s.spirit = 100;
                    if (s.pleasureUnlocked) s.joy = 100;
                    s.injury = '无'; s.status = []; sst(s); upui();
                    out('所有基础属性已拉满，伤势清空');
                    return;
                }

                // Heal
                if (/^(heal|治疗|治愈)$/i.test(input)) {
                    const s = gst(); s.injury = '无'; s.status = []; sst(s); upui();
                    out('已清空伤势与所有状态buff/debuff');
                    return;
                }

                // Time advance
                const tm = input.match(/^time\s*([+-]?\d*\.?\d+)\s*h?$/i);
                if (tm) { const h = parseFloat(tm[1]); advTime(h); out('时间推进 ' + h + ' 小时'); return; }

                // Batch set state: /set 饱腹=50&口渴=30
                const setm = input.match(/^set\s+(.+)$/i);
                if (setm) {
                    const pairs = setm[1].split(/[&,，]/).map(s => s.trim()).filter(Boolean);
                    const zh = { '饱腹':'hunger','口渴':'thirst','疲劳':'fatigue','体温':'bodyTemp','伤势':'injury','负重':'enc','心态':'mentality','精神':'spirit','欢愉':'joy' };
                    const s = gst();
                    pairs.forEach(p => {
                        const [k0, v0] = p.split(/[=:]/).map(x => x && x.trim());
                        const key = zh[k0] || k0;
                        if (!key || v0 === undefined) return;
                        if (['hunger','thirst','fatigue','bodyTemp','enc','spirit','joy'].includes(key)) s[key] = parseFloat(v0) || 0;
                        else s[key] = v0;
                        out(`设置 ${k0 || key} = ${v0}`);
                    });
                    if (s.joy != null) s.pleasureUnlocked = true;
                    sst(s); upui();
                    return;
                }

                // /chr field=value
                const chrm = input.match(/^chr\s+(.+)$/i);
                if (chrm) {
                    const pairs = chrm[1].split(/\s+/).filter(Boolean);
                    const c = gch();
                    pairs.forEach(p => {
                        const [k, v] = p.split(/[=:]/);
                        if (!k || v === undefined) return;
                        if (['tp','tn','hiddenPresets'].includes(k)) {
                            const arr = v.split(/[,，、]/).map(x => x.trim()).filter(Boolean);
                            c[k] = arr; out(`设置字符数组字段 ${k} = [${arr.join(',')}]`);
                        } else { c[k] = v; out(`设置角色字段 ${k} = ${v}`); }
                    });
                    sch(c); upui();
                    return;
                }

                // /bx cat.field=value
                const bxm = input.match(/^bx\s+(.+)$/i);
                if (bxm) {
                    const pairs = bxm[1].split(/\s+/).filter(Boolean);
                    const bx = gsbx();
                    pairs.forEach(p => {
                        const [k, v] = p.split(/[=:]/);
                        if (!k || v === undefined) return;
                        const [catKey, fld] = k.split('.');
                        if (!bx[catKey] || !bx[catKey].fields || !bx[catKey].fields[fld]) {
                            out('沙盒路径未找到：' + k, 'warn'); return;
                        }
                        const fd = bx[catKey].fields[fld];
                        if (fd.type === 'toggle') fd.val = (v === 'true' || v === '开' || v === '1');
                        else if (fd.type === 'number') fd.val = parseFloat(v) || 0;
                        else fd.val = v;
                        out(`沙盒 ${bx[catKey].title} / ${fd.label} = ${fd.val === true ? '开' : fd.val === false ? '关' : fd.val}`);
                    });
                    ssbx(bx);
                    return;
                }

                // Item commands
                const itemAdd = input.match(/^item\s+[+](.+)$/i);
                if (itemAdd) { const v = itemAdd[1].trim(); const s = gst(); s.inv.push(v); sst(s); upui(); out('获得物品：' + v); return; }
                const itemRem = input.match(/^item\s+[-](.+)$/i);
                if (itemRem) {
                    const v = itemRem[1].trim(); const s = gst();
                    const idx = s.inv.findIndex(x => x === v);
                    if (idx >= 0) { s.inv.splice(idx, 1); sst(s); upui(); out('失去物品：' + v); }
                    else out('背包中未找到：' + v, 'warn');
                    return;
                }

                // Reset inventory
                const invm = input.match(/^inv\s+(.+)$/i);
                if (invm) {
                    const items = invm[1].split(/[,，、]/).map(x => x.trim()).filter(Boolean);
                    const s = gst(); s.inv = items; sst(s); upui();
                    out('背包已重置，共 ' + items.length + ' 件物品');
                    return;
                }

                // Clue
                const clueClear = input.match(/^clue\s*:\s*clear$/i);
                if (clueClear) { const s = gst(); s.clues = []; sst(s); out('已清空线索'); return; }
                const cluem = input.match(/^clue\s+(.+)$/i);
                if (cluem) { const v = cluem[1].trim(); const s = gst(); s.clues.push(v); sst(s); upui(); out('新增线索：' + v); return; }

                // Map unlock
                const mapAdd = input.match(/^map\s+[+](.+)$/i);
                if (mapAdd) {
                    const v = mapAdd[1].trim(); const s = gst();
                    if (!s.mapUnlock) s.mapUnlock = [];
                    if (!s.mapUnlock.includes(v)) s.mapUnlock.push(v);
                    sst(s); upui(); out('地图已解锁：' + v);
                    return;
                }

                // Go / teleport
                const gom = input.match(/^(go|去|移动)\s+(.+)$/i);
                if (gom) { const v = gom[2].trim(); const s = gst(); s.location = v; sst(s); upui(); out('已移动至：' + v); return; }

                // Idle control
                const idm = input.match(/^idle\s*(on|off|start|stop|开|关)?$/i);
                if (idm) {
                    const arg = (idm[1] || '').toLowerCase();
                    if (!arg) { out('挂机状态：' + (cfg().idleOn ? '运行中' : '关闭')); return; }
                    if (arg === 'on' || arg === 'start' || arg === '开') { toggleIdle(); if (!cfg().idleOn) toggleIdle(); out('已启动挂机'); return; }
                    if (arg === 'off' || arg === 'stop' || arg === '关') { if (cfg().idleOn) toggleIdle(); out('已停止挂机'); return; }
                }

                // Quick save/load
                if (/^save$/i.test(input)) {
                    const svs = gsv();
                    const curCfg = cfg();
                    const cleanCfg = {};
                    Object.keys(curCfg).forEach(k => {
                        const v = curCfg[k];
                        if (v === '' || v === null || v === undefined) return;
                        cleanCfg[k] = JSON.parse(JSON.stringify(v));
                    });
                    svs['auto'] = { hi: JSON.parse(JSON.stringify(hist)), st: JSON.parse(JSON.stringify(gst())), ch: JSON.parse(JSON.stringify(gch())), clk: JSON.parse(JSON.stringify(gclk())), sbx: JSON.parse(JSON.stringify(gsbx())), cfg: cleanCfg, tm: Date.now() };
                    ssv(svs); out('已快速存至 auto 槽'); return;
                }
                const loadm = input.match(/^load\s*(s?\d|auto)?$/i);
                if (loadm) {
                    const key = loadm[1] || 'auto';
                    const svs = gsv(); const sn = svs[key];
                    if (!sn) { out('读档失败，存档槽为空：' + key, 'warn'); return; }
                    stopIdle();
                    const r = validateSaveData(sn, false);
                    hist = r.recovered.hi.slice();
                    sst(r.recovered.st);
                    sch(r.recovered.ch);
                    sclk(r.recovered.clk);
                    if (r.recovered.sbx) { sbx = mergeSbx(r.recovered.sbx); ssbx(sbx); }
                    if (r.recovered.cfg) {
                        const curCfg = cfg();
                        const merged = { ...curCfg, ...r.recovered.cfg };
                        if (!merged.key && curCfg.key) merged.key = curCfg.key;
                        if (r.recovered.cfg.key === '' || r.recovered.cfg.key === null || r.recovered.cfg.key === undefined) merged.key = curCfg.key;
                        scf(migrateCfg(merged));
                    }
                    if (r.errs.length > 0) {
                        snotify('warn', '存档导入', '已自动修复 ' + r.errs.length + ' 处字段缺失');
                        tst('存档部分字段缺失，已自动修复。建议导出新备份。', 'warn');
                    }
                    rbt(); upui(); out('已从槽 ' + key + ' 读档');
                    return;
                }

                // Reset all progress
                if (/^reset$/i.test(input)) {
                    ccb(); hist = [];
                    sst(JSON.parse(JSON.stringify(DSTA)));
                    sch(JSON.parse(JSON.stringify(DCHR)));
                    sclk(JSON.parse(JSON.stringify(DCLK)));
                    sbx = JSON.parse(JSON.stringify(DSBX)); ssbx(sbx);
                    svh([]); stopIdle(); rbt(); upui();
                    out('已重置全部游戏进度（角色、状态、对话、地图、沙盒均已恢复默认）');
                    return;
                }

                // Dump raw data
                const dumpm = input.match(/^dump\s+(chr|st|bx|hist|clk|cfg)$/i);
                if (dumpm) {
                    const map = { chr: gch, st: gst, bx: gsbx, hist: () => hist, clk: gclk, cfg: cfg };
                    const data = map[dumpm[1].toLowerCase()]();
                    console.log('[DEBUG dump ' + dumpm[1] + ']', data);
                    try {
                        const str = JSON.stringify(data, null, 2);
                        navigator.clipboard && navigator.clipboard.writeText(str).catch(() => {});
                        out('已导出 ' + dumpm[1] + ' 至控制台（F12），并复制到剪贴板，长度：' + str.length);
                    } catch (e) { out('导出失败：' + e.message, 'warn'); }
                    return;
                }

                // Show current prompt
                if (/^prompt$/i.test(input)) {
                    const p = gsp();
                    console.log('[DEBUG system prompt]', p);
                    try { navigator.clipboard.writeText(p).catch(() => {}); } catch (e) {}
                    out('当前系统prompt已复制到剪贴板，长度：' + p.length + '（完整内容请F12查看）');
                    return;
                }

                // /ai ... bypass and send to AI directly as user action
                const aim = input.match(/^ai\s+(.+)$/is);
                if (aim) {
                    if (idleLocked) { tst('挂机中，行动已锁定。可打开背包或面板查看信息。'); return; }
                    hin(aim[1]);
                    out('已直接发送AI：' + (aim[1].slice(0, 30) + (aim[1].length > 30 ? '…' : '')));
                    return;
                }

                // Chat fold control
                if (/^fold$/i.test(input)) { _chatFoldEnabled = true; checkChatFold(); out('已启用聊天折叠（气泡>' + CHAT_FOLD_THRESHOLD + '时自动折叠）'); return; }
                if (/^unfold$/i.test(input)) {
                    _chatFoldEnabled = false;
                    const ca = $('chatArea');
                    if (ca) {
                        ca.querySelectorAll('.chat-fold-hidden').forEach(w => {
                            const parent = w.parentNode;
                            while (w.firstChild) parent.insertBefore(w.firstChild, w);
                            w.remove();
                        });
                        ca.querySelectorAll('.chat-fold-layer').forEach(l => l.remove());
                    }
                    out('已禁用聊天折叠，所有历史对话DOM已恢复');
                    return;
                }

                notFound(input);
            }

            function showItemContextMenu(e, item) {
                e.stopPropagation();
                const existing = document.querySelector('.bp-context-menu');
                if (existing) existing.remove();
                const emoji = itemEmoji(item);
                const itemInfo = getItemInfo(item);
                const s = gst();
                const isEquip = itemInfo && itemInfo.category === 'equip';
                const isConsumable = itemInfo && itemInfo.category === 'consumable';
                const isWeapon = itemInfo && itemInfo.subCategory === 'weapon';
                const canUse = isConsumable || isWeapon || (itemInfo && itemInfo.type === 'usable');
                const canEquip = isEquip || (itemInfo && itemInfo.type === 'equippable') || isWeapon;
                const canStore = itemInfo && (itemInfo.category === 'material' || itemInfo.type === 'material');
                const starred = isItemStarred(item);
                const menu = document.createElement('div');
                menu.className = 'bp-context-menu';
                let itemsHTML = '';
                itemsHTML += '<div class="bp-cm-header"><span style="font-size:1.3rem;margin-right:6px;">' + emoji + '</span><span>' + esc(item) + '</span></div>';
                itemsHTML += '<div class="bp-cm-sep"></div>';
                if (canUse) itemsHTML += '<div class="bp-cm-item" data-act="use">使用 ' + (itemInfo && itemInfo.effect ? '(' + itemInfo.effect + ')' : '') + '</div>';
                if (canEquip) itemsHTML += '<div class="bp-cm-item" data-act="equip">装备 / 佩戴</div>';
                itemsHTML += '<div class="bp-cm-item" data-act="drop" style="color:var(--color-danger);">丢弃</div>';
                itemsHTML += '<div class="bp-cm-sep"></div>';
                itemsHTML += '<div class="bp-cm-item" data-act="refinput">引用到输入框</div>';
                itemsHTML += '<div class="bp-cm-item" data-act="bookmark">' + (starred ? '取消常用' : '加入常用（标星）') + '</div>';
                itemsHTML += '<div class="bp-cm-item" data-act="info">查看详情</div>';
                itemsHTML += '<div class="bp-cm-sep"></div>';
                itemsHTML += '<div class="bp-cm-item" data-act="craft" style="color:#8a6b3a;">🔨 打开合成/制造</div>';
                menu.innerHTML = itemsHTML;
                const rect = e.currentTarget.getBoundingClientRect ? e.currentTarget.getBoundingClientRect() : { left: e.clientX, top: e.clientY };
                let x = e.clientX || rect.left;
                let y = e.clientY || rect.top;
                menu.style.left = Math.min(x, window.innerWidth - 160) + 'px';
                menu.style.top = Math.min(y, window.innerHeight - 200) + 'px';
                document.body.appendChild(menu);
                const closeMenu = () => { menu.remove(); document.removeEventListener('click', closeMenu); };
                setTimeout(() => document.addEventListener('click', closeMenu), 10);
                menu.querySelectorAll('.bp-cm-item').forEach(el => {
                    el.addEventListener('click', () => {
                        const act = el.dataset.act;
                        menu.remove();
                        if (act === 'use') {
                            if (busy) { tst('正在演算中'); return; }
                            $('backpackModal').style.display = 'none';
                            const s = gst();
                            const itemInfo = getItemInfo(getItemBaseName(item));
                            // Check if item is consumable/usable
                            const canDirectUse = itemInfo && (itemInfo.type === 'usable' || 
                                itemInfo.category === 'consumable' ||
                                (itemInfo.effect && itemInfo.effect.length > 0));
                            
                            if (canDirectUse) {
                                // Apply item effects locally
                                const eff = applyItemEffect(item);
                                // Remove item from inventory (decrement count)
                                invRemove(item, 1);
                                // Show usage feedback
                                const msg = eff && eff.length
                                    ? '使用了 ' + item + '（效果：' + eff.join(' ') + '）'
                                    : '使用了 ' + item;
                                apb({ ty: 'whisper', tx: msg }, 0);
                                playSfx('heal');
                                // Refresh backpack display
                                if (typeof renderBackpack === 'function') renderBackpack();
                                // Notify side
                                snotify('remove', '消耗', item);
                            } else {
                                // Non-consumable items: still send to AI for narrative
                                const msg = '使用物品：' + item;
                                hin(msg);
                                playSfx('heal');
                            }
                        } else if (act === 'equip') {
                            if (busy) { tst('正在演算中'); return; }
                            const s0 = gst();
                            const itemInfo = getItemInfo(getItemBaseName(item));
                            if (!itemInfo) { tst('无法识别该物品的装备信息'); playSfx('drop'); return; }
                            let slot = getEquipSlot(item, itemInfo);
                            if (!slot) {
                                const $modal = $('backpackModal');
                                if ($modal) $modal.style.display = 'none';
                                showEquipSlotSelector(item, itemInfo, (chosenSlot) => {
                                    const s3 = gst();
                                    if (!s3.equip) s3.equip = {};
                                    if (s3.equip[chosenSlot] === parseItemQty(item).base || s3.equip[chosenSlot] === item) {
                                        const backName = s3.equip[chosenSlot];
                                        s3.equip[chosenSlot] = '';
                                        invAdd(backName, 1);
                                        playSfx('drop');
                                        snotify('remove', '装备', parseItemQty(backName).base);
                                    } else {
                                        if (s3.equip[chosenSlot]) invAdd(s3.equip[chosenSlot], 1);
                                        invRemove(item, 1);
                                        s3.equip[chosenSlot] = parseItemQty(item).base;
                                        sst(s3);
                                        playSfx('equip');
                                        snotify('add', '装备', parseItemQty(item).base + ' → ' + slotLabel(chosenSlot));
                                    }
                                    sst(s3);
                                    upui();
                                    if (typeof renderBackpack === 'function') renderBackpack();
                                });
                                return;
                            }
                            $('backpackModal').style.display = 'none';
                            if (!s0.equip) s0.equip = {};
                            if (s0.equip[slot] === parseItemQty(item).base || s0.equip[slot] === item) {
                                const backName = s0.equip[slot];
                                s0.equip[slot] = '';
                                invAdd(backName, 1);
                                playSfx('drop');
                                snotify('remove', '装备', parseItemQty(backName).base);
                            } else {
                                if (s0.equip[slot]) invAdd(s0.equip[slot], 1);
                                invRemove(item, 1);
                                s0.equip[slot] = parseItemQty(item).base;
                                sst(s0);
                                playSfx('equip');
                                snotify('add', '装备', parseItemQty(item).base + ' → ' + slotLabel(slot));
                            }
                            sst(s0);
                            upui();
                        } else if (act === 'drop') {
                            if (busy) { tst('正在演算中'); return; }
                            $('backpackModal').style.display = 'none';
                            hin('丢弃物品：' + item);
                            playSfx('drop');
                        } else if (act === 'refinput') {
                            $('backpackModal').style.display = 'none';
                            const inp = $('inputText');
                            const baseName = getItemBaseName(item);
                            const insertText = '{{' + baseName + '}}';
                            inp.value = inp.value + (inp.value && !inp.value.endsWith(' ') ? ' ' : '') + insertText + ' ';
                            inp.focus();
                            inp.setSelectionRange(inp.value.length, inp.value.length);
                            tst('已引用「' + baseName + '」到输入框');
                            playSfx('pickup');
                        } else if (act === 'bookmark') {
                            const baseName = getItemBaseName(item);
                            toggleItemStarred(baseName);
                            renderBackpack();
                            playSfx('pickup');
                        } else if (act === 'info') {
                            showItemDetail(item, itemInfo);
                        } else if (act === 'craft') {
                            $('backpackModal').style.display = 'none';
                            if (window.GameSystems && window.GameSystems.openCraftingModal) {
                                window.GameSystems.openCraftingModal();
                            } else {
                                hin('尝试用「' + item + '」进行合成/制造');
                            }
                            playSfx('craft');
                        }
                    });
                });
            }
            function showItemDetail(item, info) {
                const d = document.createElement('div');
                d.className = 'modal-overlay';
                const emoji = itemEmoji(item);
                let infoHTML = '<p style="font-size:0.72rem;color:var(--ink-soft);line-height:1.6;">';
                if (info) {
                    if (info.category) infoHTML += '分类：' + esc(info.category) + '<br>';
                    if (info.subCategory) infoHTML += '子类：' + esc(info.subCategory) + '<br>';
                    if (info.effect) infoHTML += '效果：' + esc(info.effect) + '<br>';
                    if (info.durability) infoHTML += '耐久：' + info.durability + '<br>';
                    if (info.desc) infoHTML += '<br>' + esc(info.desc);
                } else {
                    infoHTML += '物品「' + esc(item) + '」的详细描述将由AI根据上下文决定。';
                }
                infoHTML += '</p>';
                d.innerHTML = '<div class="modal-panel" style="max-width:280px;"><h3>' + emoji + ' ' + esc(item) + '</h3>' + infoHTML + '<div style="display:flex;gap:8px;margin-top:12px;"><button class="btn-header" id="detailClose">关闭</button></div></div>';
                document.body.appendChild(d);
                d.querySelector('#detailClose').onclick = () => d.remove();
                d.onclick = (e) => { if (e.target === d) d.remove(); };
            }

            // ===== Event Listeners =====
            $('btnSend').addEventListener('click', () => {
                const v = $('inputText').value.trim();
                if (v && !busy) {
                    // Cheat code detection
                    if (v === 'worldlock') {
                        const cfgs = cfg();
                        scf({ ...cfgs, worldLock: !cfgs.worldLock });
                        tst(cfgs.worldLock ? '作弊码已关闭：角色锁定已启用' : '作弊码已激活：角色解锁中（可自由修改创建角色）');
                        $('inputText').value = '';
                        return;
                    }
                    if (v === 'toggledebug' || v === 'godmode' || v === 'god' || v === 'debug') {
                        const cur = cfg().debug || false;
                        scf({ ...cfg(), debug: !cur });
                        tst(!cur ? '⚡ 上帝模式已激活：你无所不能、永不死亡、可获取任何物资、进入任何地点、操控任何NPC' : '上帝模式已关闭');
                        upui();
                        $('inputText').value = '';
                        return;
                    }
                    if (v === 'showdebug' || v === 'showsandbox' || v === 'secretpanel') {
                        const sbGrp = $('sandboxGroup');
                        const gdGrp = $('godGroup');
                        if (sbGrp && gdGrp) {
                            const hidden = sbGrp.style.display === 'none';
                            sbGrp.style.display = hidden ? 'block' : 'none';
                            gdGrp.style.display = hidden ? 'block' : 'none';
                            tst(hidden ? '开发者面板已显示' : '开发者面板已隐藏');
                        }
                        $('inputText').value = '';
                        return;
                    }
                    // ===== DEBUG MODE: Command prefix "/" =====
                    if (cfg().debug && (v.startsWith('/') || v.startsWith('debug:') || v.startsWith('调试:'))) {
                        runDebugCmd(v);
                        $('inputText').value = '';
                        $('inputText').style.height = '';
                        return;
                    }
                    // ===== CHEAT DETECTION: Block unrealistic/cheating behavior =====
                    if (!cfg().debug) {
                        const cheatPatterns = [
                            { re: /瞬移|传送|瞬间移动|直接出现在|瞬间到达/, msg: '不可以作弊！末世世界没有瞬移能力，请选择现实可行的移动方式。' },
                            { re: /无限(物资|弹药|资源|金币|金钱)|源源不断|无穷无尽/, msg: '不可以作弊！资源有限，请合理管理和获取物资。' },
                            { re: /不死|无敌|免疫一切|瞬间恢复|瞬间治愈(?:所有)?伤/, msg: '不可以作弊！角色不是无敌的，伤害和死亡是真实威胁。' },
                            { re: /凭空(?:获得|创造|变出)|突然获得(?:物品|物资)|物品凭空出现/, msg: '不可以作弊！物品需要通过搜索、交易或制作获得。' },
                            { re: /时间倒流|让.*复活|创造物质|凭空创造|无中生有/, msg: '不可以作弊！违反现实规则的行为不被允许。' },
                            { re: /一刀秒杀|一击必杀(?:所有)?|控制所有NPC|所有人都(?:听我|服从)/, msg: '不可以作弊！角色没有这种超能力。' },
                            { re: /穿墙|透视|上帝视角|看到所有人|看穿所有/, msg: '不可以作弊！角色没有透视和穿墙能力。' }
                        ];
                        for (const cp of cheatPatterns) {
                            if (cp.re.test(v)) {
                                tst(cp.msg);
                                $('inputText').value = '';
                                return;
                            }
                        }
                    }
                    if (idleLocked) { tst('挂机中，行动已锁定。可打开背包或面板查看信息。'); return; }
                    hin(v); $('inputText').value = ''; $('inputText').style.height = '';
                    playSfx('send');
                }
            });
            $('inputText').addEventListener('keydown', e => { if (e.key === 'Enter' && e.ctrlKey) { e.preventDefault(); $('btnSend').click(); } });
            $('inputText').addEventListener('input', function() { this.style.height = 'auto'; this.style.height = Math.min(this.scrollHeight, 140) + 'px'; });
            
            // ===== 仅移动端启用软键盘适配 =====
            const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
                || !window.matchMedia('(hover: hover) and (pointer: fine)').matches;
            
            if (isMobileDevice) {
                // 移动端软键盘适配：focus/blur 滚动兜底 + VisualViewport 动态调整容器
                function vvApply() {
                    const av = document.querySelector('.app-container');
                    const ia = $('inputArea');
                    const vv = window.visualViewport;
                    if (!av || !vv) { scb(); return; }
                    const h = vv.height || window.innerHeight;
                    av.style.height = h + 'px';
                    // 软键盘弹出时，让输入区域紧贴视觉视口底部
                    if (ia) {
                        const rect = ia.getBoundingClientRect();
                        const gap = Math.max(0, h - rect.bottom - 4);
                        ia.style.marginBottom = gap + 'px';
                    }
                    scb();
                }
                $('inputText').addEventListener('focus', function() {
                    // 多重延时兜底，兼容不同机型软键盘弹出时序
                    [200, 400, 650].forEach(d => setTimeout(() => {
                        try { this.scrollIntoView({ behavior: 'smooth', block: 'center' }); } catch (e) {}
                        vvApply();
                    }, d));
                });
                $('inputText').addEventListener('blur', function() {
                    [100, 300].forEach(d => setTimeout(() => {
                        try { this.scrollIntoView({ behavior: 'smooth', block: 'center' }); } catch (e) {}
                        const av = document.querySelector('.app-container');
                        if (av) av.style.height = '';
                        const ia = $('inputArea'); if (ia) ia.style.marginBottom = '';
                    }, d));
                });
                if (window.visualViewport) {
                    let vvTimer = null;
                    window.visualViewport.addEventListener('resize', () => {
                        if (vvTimer) clearTimeout(vvTimer);
                        vvTimer = setTimeout(vvApply, 80);
                    });
                    window.visualViewport.addEventListener('scroll', () => {
                        const ia = $('inputArea'); if (!ia) return;
                        const vv = window.visualViewport;
                        const rect = ia.getBoundingClientRect();
                        if (rect.bottom > vv.height) {
                            ia.style.marginBottom = (vv.height - rect.bottom - 4) + 'px';
                            scb();
                        }
                    });
                }
            }

            // ===== Fill character modal with existing data =====
            function fillCharModal(overrideData) {
                const c = overrideData || gch();
                const set = (id, val) => { const el = $(id); if (el && val != null) el.value = val; };
                set('charDisasterName', c.dn); set('charDays', c.days);
                set('charEnv', c.env); set('charGeo', c.geo); set('charLocations', c.loc);
                set('charFactions', c.fac); set('charHistory', c.hist);
                set('charResources', c.res); set('charDifficulty', c.diff);
                set('charName', c.cn); set('charAge', c.ca); set('charGender', c.gd);
                set('charBodyType', c.bt); set('charHeight', c.ht); set('charWeight', c.wt);
                set('charJob', c.job); set('charHand', c.hand); set('charBlood', c.bt2);
                set('charPersonality', c.pers); set('charAppearance', c.app);
                set('charSkills', c.skl); set('charLang', c.lang);
                set('charBackground', c.bg); set('charMental', c.mental); set('charFears', c.fear);
                set('charTraitsPos', (c.tp || []).join('\n')); set('charTraitsNeg', (c.tn || []).join('\n'));
                set('charItems', c.it); set('charSpawn', c.sp);
                set('charExtraFeature', c.extraFeature || '');
                set('charAbilityPreset', c.abilityPreset || '');
                set('charAbilityName', c.abilityName || '');
                set('charAbilityDesc', c.abilityDesc || '');
                set('charMapSource', c.mapSource || '自动');
                set('charMapAreas', c.mapAreas || '');
                // Restore ability section visibility
                const section = $('charAbilitySection');
                if (section) section.style.display = (c.extraFeature === '异能') ? 'block' : 'none';
                // Initialize job preset buttons
                const jobPresetBtns = $('jobPresetBtns');
                const jobPresetSection = $('jobPresetSection');
                if (jobPresetBtns && jobPresetSection) {
                    jobPresetBtns.innerHTML = '';
                    const presetCodes = Object.keys(JOB_PRESETS);
                    presetCodes.forEach(code => {
                        const preset = JOB_PRESETS[code];
                        const btn = document.createElement('span');
                        btn.className = 'preset-btn';
                        btn.dataset.jobPreset = code;
                        btn.textContent = preset.name;
                        btn.title = preset.desc + (preset.bonus ? '\n初始物品：' + preset.bonus.join('、') : '') + (preset.skills ? '\n技能：' + preset.skills.replace(/\n/g, '、') : '');
                        btn.style.fontSize = '0.65rem';
                        btn.style.padding = '3px 6px';
                        btn.addEventListener('click', () => {
                            // Toggle selection
                            const wasSelected = window._selectedJobPreset === code;
                            window._selectedJobPreset = wasSelected ? '' : code;
                            // Update visual state
                            jobPresetBtns.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('selected'));
                            if (!wasSelected) {
                                btn.classList.add('selected');
                                // Auto-fill job name and skills
                                $('charJob').value = preset.name;
                                if (preset.skills) {
                                    const existingSkills = $('charSkills').value;
                                    const newSkills = preset.skills.split('\n').filter(s => !existingSkills.includes(s));
                                    if (newSkills.length) {
                                        $('charSkills').value = existingSkills ? existingSkills + '\n' + newSkills.join('\n') : newSkills.join('\n');
                                    }
                                }
                                if (preset.bonus) {
                                    const existingItems = $('charItems').value;
                                    const newItems = preset.bonus.filter(item => !existingItems.includes(item));
                                    if (newItems.length) {
                                        $('charItems').value = existingItems ? existingItems + '、' + newItems.join('、') : newItems.join('、');
                                    }
                                }
                            } else {
                                // Clear job name if it matches preset
                                if ($('charJob').value === preset.name) {
                                    $('charJob').value = '';
                                }
                            }
                        });
                        jobPresetBtns.appendChild(btn);
                    });
                    // Show the section
                    jobPresetSection.style.display = 'block';
                    // Restore previous selection
                    if (c.hiddenPresets && c.hiddenPresets.length > 0) {
                        window._selectedJobPreset = c.hiddenPresets[0];
                        const prevBtn = jobPresetBtns.querySelector(`[data-job-preset="${c.hiddenPresets[0]}"]`);
                        if (prevBtn) prevBtn.classList.add('selected');
                    } else {
                        window._selectedJobPreset = '';
                    }
                }
            }

            $('btnNewGame').addEventListener('click', async () => {
                if (!cfg().key) {
                    // Show API config first if not set
                    const c = cfg();
                    // 无条件回填所有欢迎模态字段（即使用户没填过 key，也会显示 endpoint/preset/model）
                    if ($('welEndpointPreset')) $('welEndpointPreset').value = c.preset || AP[c.preset] ? c.preset : 'openai';
                    // 触发一次 welEndpointPreset change 来刷新 welModelSelect 的选项
                    if ($('welEndpointPreset')) { try { $('welEndpointPreset').dispatchEvent(new Event('change', {bubbles:false})); } catch {} }
                    $('welEndpoint').value = c.ep || '';
                    const sl = $('welModelSelect');
                    if (c.model && sl) {
                        const hasOpt = [...sl.options].some(o => o.value === c.model);
                        if (hasOpt) sl.value = c.model;
                        else { $('welModel').value = c.model; sl.style.display='none'; $('welModel').style.display=''; }
                    } else if (c.model) {
                        $('welModel').value = c.model;
                    }
                    $('welKey').value = c.key || '';
                    $('welcomeModal').style.display = 'flex';
                    return;
                }
                const c = cfg();
                const hasGame = hist.length > 0 || (gst() && gst().inv && gst().inv.length > 0);
                if (hasGame && !c.worldLock) {
                    if (!await sketchConfirm('游戏已开始。角色与世界已锁定，不可更改。\n如需重新开始，请使用"新游戏"功能（将清除所有进度）。\n\n确定要创建新角色吗？此操作将清除当前所有进度！')) return;
                    // Clear everything for a fresh start
                    ccb();
                    hist = [];
                    sst(JSON.parse(JSON.stringify(DSTA)));
                    svh([]);
                    stopIdle();
                }
                // If worldLock cheat code is active, allow editing without clearing
                fillCharModal();
                $('charModal').style.display = 'flex';
            });
            $('btnSettings').addEventListener('click', () => {
                const c = cfg();
                $('apiEndpointPreset').value = c.preset || 'custom';
                $('apiEndpoint').value = c.ep;
                $('apiModel').value = c.model;
                $('apiKey').value = c.key;
                $('apiMaxTokens').value = c.maxT;
                $('apiTemperature').value = c.temp;
                $('apiContextLen').value = c.ctx;
                $('typingSpeed').value = c.tspd;
                $('streamToggle').value = c.strm ? '1' : '0';
                $('fontSizeSelect').value = c.fsz;
                $('idleInterval').value = c.idleInt || 60;
                $('idleDirection').value = c.idleDir || '休养';
                $('idleCustom').value = c.idleCustom || '';
                $('idleCustomWrap').style.display = ($('idleDirection').value === '自定义') ? 'block' : 'none';
                $('idleDirection').onchange = () => { $('idleCustomWrap').style.display = ($('idleDirection').value === '自定义') ? 'block' : 'none'; };
                $('godModeToggle').checked = !!c.debug;
                $('promptEditor').value = c.prompt || DPROMPT;
                // Populate debug cheat sheet
                const dcs = $('debugCheatSheet');
                if (dcs) {
                    dcs.innerHTML =
'<span style="color:var(--accent);">[状态]</span> /s &nbsp; /set 饱腹=50&amp;口渴=30<br>' +
'&nbsp; /max (满) &nbsp; /heal (治愈) &nbsp; /time +2h<br>' +
'<span style="color:var(--accent);">[角色/世界]</span><br>' +
'&nbsp; /chr cn=李四 bg=新背景<br>' +
'&nbsp; /bx cat10.moralityLevel=严格守德<br>' +
'<span style="color:var(--accent);">[物品/线索/地图]</span><br>' +
'&nbsp; /item +绷带 &nbsp; /item -空瓶<br>' +
'&nbsp; /inv 绷带、水 &nbsp; /clue 新线索<br>' +
'&nbsp; /map +新区域 &nbsp; /go 目的地<br>' +
'<span style="color:var(--accent);">[模块]</span> /idle on|off &nbsp; /save &nbsp; /load s3<br>' +
'&nbsp; /reset (清空全部) &nbsp; /dump chr/st/bx<br>' +
'<span style="color:var(--accent);">[AI]</span> /prompt &nbsp; /ai 直接发送给AI的文本';
                }
                updateSummaryDisplay();
                $('settingsModal').style.display = 'flex';
            });
            $('btnSaveSettings').addEventListener('click', () => {
                const preset = $('apiEndpointPreset').value;
                const oldIdle = cfg().idleOn;
                const oldKey = cfg().key || '';
                const newKey = $('apiKey').value;
                // NEVER allow saving an empty key if we already have one (prevents password-manager/autofill wipe)
                const finalKey = newKey.trim() || oldKey;
                scf({
                    ...cfg(),
                    ep: $('apiEndpoint').value || DCFG.ep, key: finalKey,
                    model: $('apiModel').value || 'gpt-4o',
                    maxT: parseInt($('apiMaxTokens').value) || 2048,
                    temp: parseFloat($('apiTemperature').value) || 0.7,
                    ctx: parseInt($('apiContextLen').value) || 24,
                    tspd: parseInt($('typingSpeed').value) || 20,
                    strm: $('streamToggle').value === '1',
                    fsz: $('fontSizeSelect').value || '15px',
                    prompt: $('promptEditor').value || DPROMPT,
                    idleInt: parseInt($('idleInterval').value) || 60,
                    idleOn: oldIdle,
                    idleDir: $('idleDirection').value || '休养',
                    idleCustom: $('idleCustom').value || '',
                    worldLock: cfg().worldLock || false,
                    debug: $('godModeToggle').checked,
                    preset: preset
                });
                upui();
                $('settingsModal').style.display = 'none';
                tst(cfg().debug ? '⚡ 上帝模式已激活' : '设置已保存');
            });
            // ========== 设置模态：API 配置区控件 "输入即保存"（不用等「保存设置」按钮） ==========
            (function bindSettingsAPIInputs() {
                try {
                    function saveFromSettings() {
                        try {
                            const preset = $('apiEndpointPreset') ? $('apiEndpointPreset').value : cfg().preset;
                            const oldKey = cfg().key || '';
                            const newKey = $('apiKey') ? $('apiKey').value : '';
                            // 保护已有密钥：仅当用户明确输入了非空新密钥时才覆盖
                            const finalKey = newKey.trim() || oldKey;
                            const cur = cfg();
                            scf({
                                ...cur,
                                preset: preset,
                                ep: $('apiEndpoint') ? ($('apiEndpoint').value || DCFG.ep) : cur.ep,
                                model: $('apiModel') ? ($('apiModel').value || 'gpt-4o') : cur.model,
                                maxT: $('apiMaxTokens') ? (parseInt($('apiMaxTokens').value, 10) || cur.maxT) : cur.maxT,
                                temp: $('apiTemperature') ? (parseFloat($('apiTemperature').value) || cur.temp) : cur.temp,
                                ctx: $('apiContextLen') ? (parseInt($('apiContextLen').value, 10) || cur.ctx) : cur.ctx,
                                key: finalKey
                            });
                        } catch {}
                    }
                    // 为 apiEndpointPreset 的 change 事件添加 scf 保存（原代码只更新了 DOM）
                    const oldPresetEl = document.getElementById('apiEndpointPreset');
                    if (oldPresetEl) {
                        oldPresetEl.addEventListener('change', function() {
                            try {
                                const p = AP[this.value] || AP.custom;
                                if (document.getElementById('apiEndpoint')) document.getElementById('apiEndpoint').value = p.ep;
                                const sl = document.getElementById('apiModelSelect');
                                if (sl) {
                                    sl.innerHTML = '';
                                    if (p.md && p.md.length) {
                                        p.md.forEach(m => sl.add(new Option(m, m)));
                                        sl.style.display = '';
                                        document.getElementById('apiModel').style.display = 'none';
                                    } else {
                                        sl.style.display = 'none';
                                        document.getElementById('apiModel').style.display = '';
                                    }
                                }
                                // 选完预设立刻 scf 保存
                                saveFromSettings();
                            } catch {}
                        });
                    }
                    // 为其他 7 个 API 控件绑定 input / change 事件
                    ['apiKey','apiEndpoint','apiModel','apiMaxTokens','apiTemperature','apiContextLen'].forEach(id => {
                        const el = document.getElementById(id);
                        if (el) el.addEventListener('input', saveFromSettings);
                    });
                    const modelSelect = document.getElementById('apiModelSelect');
                    if (modelSelect) modelSelect.addEventListener('change', saveFromSettings);
                    // 在设置标题下方加一个小提示
                    try {
                        const headerRow = document.getElementById('settingsModalTitle');
                        if (headerRow && !document.getElementById('apiAutoSaveHint')) {
                            const hint = document.createElement('div');
                            hint.id = 'apiAutoSaveHint';
                            hint.className = 'field-hint';
                            hint.style.cssText = 'position:absolute;top:8px;right:32px;color:var(--notify-add);font-size:0.62rem;';
                            hint.textContent = '✓ API配置自动保存到本地，刷新不丢失';
                            headerRow.parentNode.style.position = 'relative';
                            headerRow.parentNode.appendChild(hint);
                        }
                    } catch {}
                } catch {}
            })();
            // ===== Export / Import full backup =====
            $('btnSetExportBackup') && $('btnSetExportBackup').addEventListener('click', () => {
                const chr = gch();
                const backup = {
                    generatedAt: new Date().toISOString(),
                    version: 2,
                    playerName: chr.cn || chr.characterName || '未知',
                    cfg: cfg(),
                    chr: chr,
                    sta: gst(),
                    clk: gclk(),
                    sbx: gsbx(),
                    hist: hist,
                    theme: theme,
                    saves: (() => { try { return JSON.parse(localStorage.getItem('vn_saves') || '{}'); } catch { return {}; } })()
                };
                try {
                    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    const d = new Date();
                    const pad = n => String(n).padStart(2, '0');
                    a.href = url;
                    a.download = `文游_备份_${d.getFullYear()}${pad(d.getMonth()+1)}${pad(d.getDate())}_${pad(d.getHours())}${pad(d.getMinutes())}.json`;
                    document.body.appendChild(a); a.click(); a.remove();
                    setTimeout(() => URL.revokeObjectURL(url), 5000);
                    tst('已导出备份：' + a.download);
                    playSfx('pickup');
                } catch (e) {
                    tst('导出失败：' + e.message, 'warn');
                }
            });
            // 设置面板导入备份按钮：触发隐藏的file input
            $('btnSetImportBackup') && $('btnSetImportBackup').addEventListener('click', () => {
                const inp = $('inputSetImportBackup');
                if (inp) { inp.value = ''; inp.click(); }
            });
            $('inputSetImportBackup') && $('inputSetImportBackup').addEventListener('change', async (e) => {
                const statusEl = $('setImportBackupStatus');
                const file = e.target.files && e.target.files[0];
                if (!file) return;
                try {
                    if (statusEl) statusEl.style.color = 'var(--accent)';
                    if (statusEl) statusEl.textContent = '正在读取 ' + file.name + ' …';
                    const text = await file.text();
                    const backup = JSON.parse(text);
                    if (!backup || typeof backup !== 'object') throw new Error('文件格式不正确');
                    const sn = { hi: backup.hist || backup.hi, st: backup.sta || backup.st, ch: backup.chr || backup.ch, clk: backup.clk, sbx: backup.sbx, cfg: backup.cfg };
                    const r = validateSaveData(sn, true);
                    if (!r.valid) throw new Error('存档校验失败：' + r.errs.join('; '));
                    // Cross-player detection: check if the backup's character name differs from current
                    const curChr = gch();
                    const bkChr = r.recovered.ch || {};
                    const bkName = bkChr.cn || bkChr.characterName || '未知角色';
                    const curName = curChr.cn || curChr.characterName || '当前角色';
                    const isCrossPlayer = (bkName !== curName);
                    let confirmMsg = '确定要导入该备份吗？\n生成时间：' + (backup.generatedAt || '未知') + '\n当前的所有游戏进度和存档槽将被覆盖。此操作不可撤销。';
                    if (isCrossPlayer) {
                        if (!await sketchConfirm('⚠️ 检测到这不是当前玩家的存档！\n\n当前角色：' + curName + '\n备份角色：' + bkName + '\n\n这是来自另一个玩家/角色的存档，将完全覆盖当前进度。\n\n确定要继续导入吗？此操作不可撤销！')) {
                            if (statusEl) statusEl.textContent = '已取消导入';
                            return;
                        }
                        confirmMsg = '即将导入「' + bkName + '」的存档，覆盖当前「' + curName + '」的全部进度。\n\n确定要继续吗？';
                    }
                    if (!await sketchConfirm(confirmMsg)) { if (statusEl) statusEl.textContent = '已取消导入'; return; }
                    if (r.recovered.cfg) scf(r.recovered.cfg);
                    sch(r.recovered.ch);
                    sst(r.recovered.st);
                    sclk(r.recovered.clk);
                    if (r.recovered.sbx) ssbx(r.recovered.sbx);
                    hist = r.recovered.hi.slice();
                    if (backup.theme) { theme = backup.theme; try { localStorage.setItem('vn_theme', theme); } catch {} document.documentElement.setAttribute('data-theme', theme); }
                    if (backup.saves) try { localStorage.setItem('vn_saves', JSON.stringify(backup.saves)); } catch {}
                    if (r.errs.length > 0) {
                        snotify('warn', '存档导入', '已自动修复 ' + r.errs.length + ' 处字段缺失');
                        tst('存档部分字段缺失，已自动修复。建议导出新备份。', 'warn');
                    }
                    upui();
                    if (statusEl) { statusEl.style.color = 'var(--notify-add)'; statusEl.textContent = '✅ 导入成功！游戏已加载备份内容。'; }
                    tst('备份导入成功');
                    playSfx('victory');
                    setTimeout(() => location.reload(), 800);
                } catch (err) {
                    console.error(err);
                    if (statusEl) { statusEl.style.color = 'var(--notify-remove)'; statusEl.textContent = '❌ 导入失败：' + err.message; }
                    tst('导入失败：' + err.message, 'warn');
                } finally {
                    e.target.value = '';
                }
            });
            $('godModeToggle').addEventListener('change', () => {
                const cur = cfg();
                scf({ ...cur, debug: $('godModeToggle').checked });
                upui();
                tst($('godModeToggle').checked ? '⚡ 上帝模式已激活：你无所不能、永不死亡' : '上帝模式已关闭');
            });

            // ===== God Group quick debug buttons =====
            $('btnDebugMax') && $('btnDebugMax').addEventListener('click', () => runDebugCmd('/max'));
            $('btnDebugHeal') && $('btnDebugHeal').addEventListener('click', () => runDebugCmd('/heal'));
            $('btnDebugAddItem') && $('btnDebugAddItem').addEventListener('click', async () => {
                const n = (await sketchPrompt('添加物品名（多个用顿号分隔）：', '急救包、止痛药')).trim();
                if (n) n.split(/[,，、]/).map(x => x.trim()).filter(Boolean).forEach(it => runDebugCmd('/item +' + it));
            });
            $('btnDebugTime2h') && $('btnDebugTime2h').addEventListener('click', () => runDebugCmd('/time +2'));
            $('btnDebugTeleport') && $('btnDebugTeleport').addEventListener('click', async () => {
                const n = (await sketchPrompt('瞬移至哪里？输入地点名：', gst().location || gch().sp || '市中心医院')).trim();
                if (n) runDebugCmd('/go ' + n);
            });
            $('btnDebugStatus') && $('btnDebugStatus').addEventListener('click', () => runDebugCmd('/s'));
            $('btnDebugReset') && $('btnDebugReset').addEventListener('click', async () => {
                if (await sketchConfirm('确定要清空全部游戏进度（角色、对话、背包、状态）并恢复默认吗？此操作不可撤销！')) {
                    runDebugCmd('/reset');
                }
            });
            $('btnResetSandbox') && $('btnResetSandbox').addEventListener('click', async () => {
                if (await sketchConfirm('确定恢复沙盒设置为默认参数？')) {
                    sbx = JSON.parse(JSON.stringify(DSBX));
                    ssbx(sbx);
                    tst('沙盒参数已恢复默认');
                }
            });
            $('btnManualSummary').addEventListener('click', async () => {
                if (hist.length < 5) { tst('对话太少，无需生成摘要'); return; }
                tst('正在生成剧情摘要...');
                await generateContextSummary();
                updateSummaryDisplay();
            });
            $('btnClearSummary').addEventListener('click', () => {
                contextSummary = '';
                // Remove summary messages from history
                hist = hist.filter(m => !(m.role === 'system' && m.content.startsWith('【前情摘要】')));
                updateSummaryDisplay();
                tst('已清除剧情摘要');
            });
            function updateSummaryDisplay() {
                const sc = $('summaryStatus');
                const sd = $('summaryDisplay');
                const hc = $('histCount');
                if (hc) hc.textContent = hist.length;
                if (contextSummary) {
                    if (sc) sc.innerHTML = '当前记忆：<span style="color:var(--accent);">剧情摘要 + 最近对话</span>（共' + hist.length + '条）';
                    if (sd) { sd.style.display = 'block'; sd.textContent = '摘要：' + contextSummary; }
                } else {
                    if (sc) sc.innerHTML = '当前记忆：<span style="color:var(--ink-soft);">完整对话</span>（共' + hist.length + '条）';
                    if (sd) sd.style.display = 'none';
                }
            }
            $('btnResetPrompt').addEventListener('click', () => { $('promptEditor').value = DPROMPT; tst('已恢复默认Prompt'); });
            // ===== Quick Restart: generate death ending then restart with same character =====
            $('btnQuickRestart') && $('btnQuickRestart').addEventListener('click', async () => {
                if (!await sketchConfirm('确定要重新开始吗？\n将生成一个死亡结局，然后以当前角色设定从头开始游戏。\n\n当前游戏进度将丢失！')) return;
                $('settingsModal').style.display = 'none';
                try {
                    busy = true;
                    $('btnSend').disabled = true;
                    $('inputText').classList.add('busy');
                    const c = gch();
                    const s = gst();
                    // Generate death narration
                    const deathCauses = [
                        '你倒在了血泊中，视线逐渐模糊……最后的意识里，你听到了远处传来的嘶吼声。',
                        '伤口感染让你高烧不退，你在一个寒冷的夜晚永远闭上了眼睛。',
                        '你被丧尸群包围，拼尽全力也无法杀出重围……',
                        '饥渴和疲惫终于压垮了你，你在睡梦中安静地离开了这个世界。',
                        '失温让你的身体逐渐僵硬，最后的温暖是手中紧握的照片。',
                        '你在探索中踏空坠落，意识消散前只听到风声呼啸。',
                        '一次错误的判断让你陷入了绝境，你没能活着走出来。',
                        '你在与掠夺者的对峙中倒下，对方的脚步声渐渐远去……'
                    ];
                    const deathText = deathCauses[Math.floor(Math.random() * deathCauses.length)];
                    apb({ ty: 'narration', tx: deathText }, 0);
                    apb({ ty: 'system', tx: '【游戏结束】' + (c.cn || '幸存者') + ' 的故事到此结束。存活了 ' + (gclk().day || 1) + ' 天。' }, 0);
                    addLogEntry('system', '角色死亡，存活' + (gclk().day || 1) + '天');
                    playSfx('danger');
                    // Wait for the death narration to display
                    await new Promise(r => setTimeout(r, 2000));
                    // Save character and sandbox (preserve them)
                    const savedChr = JSON.parse(JSON.stringify(c));
                    const savedSbx = JSON.parse(JSON.stringify(gsbx()));
                    const savedClk = JSON.parse(JSON.stringify(gclk()));
                    // Reset game state but keep character
                    ccb();
                    hist = [];
                    // 区分跨存档永久数据 vs 单局数据：永久保留、单局清空
                    // 永久保留: unlockedAchievements(成就), cfg配置, 角色设定(ch保留)
                    // 单局清理: 关键记忆, 日志书签, NPC遭遇记录, 沙盘npcRel局部状态, heacCount/nightSurvived
                    try { keyMemories.length = 0; localStorage.removeItem('vn_keyMemories'); } catch(e) {}
                    try { logBookmarks.length = 0; localStorage.removeItem('vn_logBookmarks'); } catch(e) {}
                    // Reset state with default DSTA but rebuild from character items
                    const baseState = JSON.parse(JSON.stringify(DSTA));
                    // 清理状态中累计计数（避免跨局继承）
                    try {
                        delete baseState.healCount;
                        delete baseState.nightSurvived;
                        delete baseState.deathTriggered;
                        delete baseState.deathShown;
                    } catch(e) {}
                    const itemsStr = savedChr.it || DCHR.it;
                    const { inv, equip } = buildInvAndEquipFromItems(itemsStr);
                    baseState.inv = inv;
                    baseState.equip = equip;
                    sst(baseState);
                    svh([]);
                    // Restore character (keep _charCreated flag)
                    sch(savedChr);
                    // Restore sandbox but reset clock day to 1
                    sbx = savedSbx; ssbx(sbx);
                    const newClk = JSON.parse(JSON.stringify(savedClk));
                    newClk.day = 1; newClk.elapsedSec = 6 * 3600; // Start at 6:00 AM
                    sclk(newClk);
                    stopIdle();
                    upui();
                    // Start new game
                    apb({ ty: 'chapter', tx: savedChr.days + ' | ' + savedChr.dn }, 0);
                    apb({ ty: 'narration', tx: '新的一周开始了。你醒来在' + savedChr.sp + '，仿佛一切重新来过……' }, 0);
                    tst('已重新开始游戏');
                    playSfx('levelup');
                    // Initialize stats via AI
                    if (cfg().key) aiInitStats();
                    scb();
                } finally {
                    busy = false;
                    $('btnSend').disabled = false;
                    $('inputText').classList.remove('busy');
                }
            });
            $('btnPromptHelp').addEventListener('click', () => { $('promptHelpModal').style.display = 'flex'; });
            $('btnClosePromptHelp').addEventListener('click', () => { $('promptHelpModal').style.display = 'none'; });
            $('apiEndpointPreset').addEventListener('change', function() {
                const p = AP[this.value] || AP.custom;
                if (p.ep) $('apiEndpoint').value = p.ep;
                if (p.md.length) $('apiModel').value = p.md[0];
            });
            $('btnTheme').addEventListener('click', () => { cycleTheme(); });
            $('btnSfx').addEventListener('click', () => { toggleSfx(); $('btnSfx').textContent = sfxEnabled() ? '🔊 音效' : '🔇 音效'; });
            $('btnSfx').textContent = sfxEnabled() ? '🔊 音效' : '🔇 音效';
            $('btnBgm').addEventListener('click', () => { bgmToggle(); });
            const _bgm = BGM();
            $('btnBgm').textContent = _bgm.enabled ? '🎵 音乐' : '🔇 音乐';
            $('btnBgm').title = _bgm.enabled ? '背景音乐（开启）' : '背景音乐（已关闭）';
            // ===== 导航栏「更多」收纳菜单 =====
            (function initNavMore() {
                const btn = $('btnNavMore');
                const menu = $('navMoreMenu');
                if (!btn || !menu) return;
                let closeTimer = null;
                const openMenu = () => {
                    if (closeTimer) { clearTimeout(closeTimer); closeTimer = null; }
                    menu.classList.add('open');
                };
                const closeMenu = (delay = 200) => {
                    closeTimer = setTimeout(() => menu.classList.remove('open'), delay);
                };
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    menu.classList.toggle('open');
                });
                menu.addEventListener('click', (e) => e.stopPropagation());
                btn.addEventListener('mouseenter', openMenu);
                menu.addEventListener('mouseenter', openMenu);
                btn.addEventListener('mouseleave', () => closeMenu(260));
                menu.addEventListener('mouseleave', () => closeMenu(200));
                document.addEventListener('click', () => menu.classList.remove('open'));
            })();
            // BGM 选择面板：右键或长按
            $('btnBgm').addEventListener('contextmenu', (e) => { e.preventDefault(); bgmOpenPicker(); });
            let bgmPressTimer = null;
            $('btnBgm').addEventListener('pointerdown', (e) => { bgmPressTimer = setTimeout(() => { bgmOpenPicker(); bgmPressTimer = null; }, 650); });
            $('btnBgm').addEventListener('pointerup', () => { if (bgmPressTimer) { clearTimeout(bgmPressTimer); bgmPressTimer = null; } });
            $('btnBgm').addEventListener('pointerleave', () => { if (bgmPressTimer) { clearTimeout(bgmPressTimer); bgmPressTimer = null; } });
            $('btnIdle').addEventListener('click', toggleIdle);
            $('btnAchievements') && $('btnAchievements').addEventListener('click', () => {
                const f = window.renderAchievementsPanel; if (f) f();
                $('achievementsModal').style.display = 'flex';
            });
            $('modalCloseAchievements') && $('modalCloseAchievements').addEventListener('click', () => {
                $('achievementsModal').style.display = 'none';
            });
            $('btnEvents') && $('btnEvents').addEventListener('click', () => {
                const f = window.renderEventsPanel; if (f) f();
                $('eventsModal').style.display = 'flex';
            });
            $('modalCloseEvents') && $('modalCloseEvents').addEventListener('click', () => {
                $('eventsModal').style.display = 'none';
            });
            // ===== Undo last turn / Regen AI reply =====
            $('btnUndoTurn') && $('btnUndoTurn').addEventListener('click', async () => {
                if (busy) { tst('演算中，无法回退'); return; }
                if (!undo || !undo.hi) { tst('没有可回退的步骤'); return; }
                if (!await sketchConfirm('回退到上一步？将恢复上一步的对话和状态，且撤销所有AI对世界的修改。此操作不可撤销。')) return;
                try {
                    hist = JSON.parse(JSON.stringify(undo.hi));
                    const prevSt = JSON.parse(JSON.stringify(undo.st));
                    sst(prevSt);
                    if (undo.ch) sch(JSON.parse(JSON.stringify(undo.ch)));
                    if (undo.clk) sclk(JSON.parse(JSON.stringify(undo.clk)));
                    if (undo.sbx) { sbx = mergeSbx(JSON.parse(JSON.stringify(undo.sbx))); ssbx(sbx); }
                    if (undo.ach) {
                        unlockedAchievements = new Set(undo.ach);
                        try { localStorage.setItem(ACH_KEY, JSON.stringify([...unlockedAchievements])); } catch(e) {}
                        if (typeof renderAchievements === 'function') renderAchievements();
                    }
                    // Remove all chat bubbles added since the undo point (player + all AI bubbles)
                    const ca = $('chatArea');
                    if (ca && undo.bubbleCount != null) {
                        while (ca.children.length > undo.bubbleCount) {
                            const last = ca.lastChild;
                            if (!last) break;
                            last.remove();
                        }
                    }
                    upui();
                    tst('已回退至用户操作之前');
                    playSfx('pickup');
                } catch (e) {
                    tst('回退失败：' + e.message, 'warn');
                }
            });
            $('btnRegenTurn') && $('btnRegenTurn').addEventListener('click', async () => {
                if (busy) { tst('演算中，无法重新生成'); return; }
                // Find last user message
                let lastUserIdx = -1;
                for (let i = hist.length - 1; i >= 0; i--) { if (hist[i].role === 'user') { lastUserIdx = i; break; } }
                if (lastUserIdx < 0) { tst('没有可重新生成的AI回复'); return; }
                const lastUserTx = hist[lastUserIdx].content;
                const isIdle = lastUserTx.startsWith('[自主] ');
                const origTx = isIdle ? lastUserTx.slice(5) : lastUserTx;
                // 先恢复 undo 快照中的状态（防止上个AI回复的物品/属性残留）
                if (undo && undo.st) {
                    sst(JSON.parse(JSON.stringify(undo.st)));
                    if (undo.ch) sch(JSON.parse(JSON.stringify(undo.ch)));
                    if (undo.clk) sclk(JSON.parse(JSON.stringify(undo.clk)));
                    if (undo.sbx) { sbx = mergeSbx(JSON.parse(JSON.stringify(undo.sbx))); ssbx(sbx); }
                    if (undo.ach) {
                        unlockedAchievements = new Set(undo.ach);
                        try { localStorage.setItem(ACH_KEY, JSON.stringify([...unlockedAchievements])); } catch(e) {}
                    }
                }
                // Remove last user message AND all AI responses after it from hist
                // (hin() will re-add the user message)
                hist.splice(lastUserIdx, hist.length - lastUserIdx);
                // Remove all bubbles from the last player bubble onwards (player + all AI bubbles)
                const ca = $('chatArea');
                if (ca) {
                    const bubbles = Array.from(ca.children);
                    let lastPlayerIdx = -1;
                    for (let i = bubbles.length - 1; i >= 0; i--) {
                        const el = bubbles[i];
                        if (el.classList && (el.classList.contains('vn-bubble--player') || (el._ft != null && el.querySelector && el.querySelector('.vn-tag') && el.querySelector('.vn-tag').textContent === '我'))) {
                            lastPlayerIdx = i;
                            break;
                        }
                    }
                    if (lastPlayerIdx >= 0) {
                        for (let i = bubbles.length - 1; i >= lastPlayerIdx; i--) {
                            bubbles[i].remove();
                        }
                    }
                }
                tst('正在重新生成回复…');
                playSfx('send');
                // Re-send through hin() which will re-add player bubble + message + get new AI reply
                hin(origTx, isIdle);
            });
            $('btnSidePanel').addEventListener('click', () => { sideMode = 'panel'; updateSideView(); upui(); $('sidePanel').classList.toggle('open'); $('sideOverlay').classList.toggle('show'); });
            $('btnProfile').addEventListener('click', () => { sideMode = 'profile'; updateSideView(); upui(); $('sidePanel').classList.toggle('open'); $('sideOverlay').classList.toggle('show'); });
            $('sideOverlay').addEventListener('click', () => { $('sidePanel').classList.remove('open'); $('sideOverlay').classList.remove('show'); });
            $('btnBackpack').addEventListener('click', openBackpack);
            $('btnEquipment').addEventListener('click', openEquipment);
            $('modalCloseEquipment').addEventListener('click', () => { $('equipmentModal').style.display = 'none'; });
            $('bpPrev').addEventListener('click', () => { if (bpPage > 0) { bpPage--; renderBackpack('backward'); } });
            $('bpNext').addEventListener('click', () => { bpPage++; renderBackpack('forward'); });
            $('bpViewCat') && $('bpViewCat').addEventListener('click', () => { bpView = 'cat'; bpPage = 0; renderBackpack(); });
            $('bpViewAll') && $('bpViewAll').addEventListener('click', () => { bpView = 'all'; bpPage = 0; renderBackpack(); });
            $('bpViewStar') && $('bpViewStar').addEventListener('click', () => { bpView = 'star'; bpPage = 0; renderBackpack(); });
            $('btnOpenSandbox') && $('btnOpenSandbox').addEventListener('click', () => { renderSandbox(); $('sandboxModal').style.display = 'flex'; });
            $('btnOpenSandbox2') && $('btnOpenSandbox2').addEventListener('click', () => { renderSandbox(); $('sandboxModal').style.display = 'flex'; });
            $('btnSideSandbox') && $('btnSideSandbox').addEventListener('click', () => { renderSandbox(); $('sandboxModal').style.display = 'flex'; });
            $('btnApplySandbox') && $('btnApplySandbox').addEventListener('click', () => { ssbx(gsbx()); $('sandboxModal').style.display = 'none'; tst('沙盒设置已应用'); });
            $('btnCancelSandbox') && $('btnCancelSandbox').addEventListener('click', () => { $('sandboxModal').style.display = 'none'; });
            $('modalCloseSandbox') && $('modalCloseSandbox').addEventListener('click', () => { $('sandboxModal').style.display = 'none'; });

            // ===== Floating clue sidebar toggle & drag =====
            const clueSb = $('clueSidebar');
            const clueToggle = $('btnToggleClueSidebar');
            const clueClose = $('btnCloseClueSidebar');
            
            if (clueSb) {
                // 拖拽功能实现
                let isPressed = false;     // 鼠标/触摸是否按下
                let isDragging = false;   // 是否正在拖拽移动
                let startX = 0, startY = 0;
                let initialLeft = 0, initialTop = 0;
                let pressTimer = null;
                let isTouch = false;

                const startDrag = (clientX, clientY) => {
                    isDragging = true;
                    const rect = clueSb.getBoundingClientRect();
                    initialLeft = rect.left;
                    initialTop = rect.top;
                    clueSb.classList.remove('docked-left', 'docked-right', 'open');
                    clueSb.classList.add('dragging');
                    clueSb.style.left = initialLeft + 'px';
                    clueSb.style.top = initialTop + 'px';
                    clueSb.style.right = 'auto';
                    document.body.style.userSelect = 'none';
                };

                const onPointerDown = (e) => {
                    if (e.button !== undefined && e.button !== 0) return;
                    // Skip drag if the target is the close button or its children
                    const target = e.target;
                    if (target && (target.id === 'btnCloseClueSidebar' || (target.closest && target.closest('#btnCloseClueSidebar')))) return;
                    isPressed = true;
                    isDragging = false;
                    isTouch = !!e.touches;
                    const point = e.touches ? e.touches[0] : e;
                    startX = point.clientX;
                    startY = point.clientY;
                    
                    if (isTouch) {
                        // 触屏设备：长按触发拖拽（350ms）
                        pressTimer = setTimeout(() => {
                            if (isPressed) startDrag(point.clientX, point.clientY);
                        }, 350);
                    }
                    // PC鼠标：直接通过移动距离触发，不使用计时器
                };

                const onPointerMove = (e) => {
                    if (!isPressed && !isDragging) return;
                    
                    const point = e.touches ? e.touches[0] : e;
                    const dx = point.clientX - startX;
                    const dy = point.clientY - startY;
                    
                    if (!isDragging && isPressed) {
                        // 移动超过阈值才进入拖拽
                        if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
                            if (pressTimer) { clearTimeout(pressTimer); pressTimer = null; }
                            if (!isTouch) {
                                startDrag(point.clientX, point.clientY);
                            }
                        }
                    }
                    
                    if (!isDragging) return;
                    
                    // 拖拽中：更新位置
                    const newLeft = initialLeft + dx;
                    const newTop = initialTop + dy;
                    const maxLeft = window.innerWidth - clueSb.offsetWidth - 10;
                    const maxTop = window.innerHeight - clueSb.offsetHeight - 10;
                    clueSb.style.left = Math.max(10, Math.min(newLeft, maxLeft)) + 'px';
                    clueSb.style.top = Math.max(10, Math.min(newTop, maxTop)) + 'px';
                };

                const onPointerUp = (e) => {
                    isPressed = false;
                    if (pressTimer) { clearTimeout(pressTimer); pressTimer = null; }
                    startX = 0; startY = 0;
                    
                    if (!isDragging) return;
                    
                    isDragging = false;
                    clueSb.classList.remove('dragging');
                    document.body.style.userSelect = '';
                    // 计算吸附方向
                    const rect = clueSb.getBoundingClientRect();
                    const centerX = rect.left + rect.width / 2;
                    const dockLeft = centerX < window.innerWidth / 2;
                    
                    clueSb.style.top = rect.top + 'px';
                    clueSb.style.left = dockLeft ? '10px' : 'auto';
                    clueSb.style.right = dockLeft ? 'auto' : '10px';
                    
                    if (dockLeft) {
                        clueSb.classList.add('docked-left');
                        clueSb.classList.remove('docked-right');
                    } else {
                        clueSb.classList.add('docked-right');
                        clueSb.classList.remove('docked-left');
                    }
                    clueSb.classList.add('open');
                };

                const header = clueSb.querySelector('.clue-sidebar-header');
                const dragArea = header || clueSb;
                dragArea.addEventListener('mousedown', onPointerDown);
                dragArea.addEventListener('touchstart', onPointerDown, { passive: true });
                
                document.addEventListener('mousemove', onPointerMove);
                document.addEventListener('touchmove', onPointerMove, { passive: true });
                
                document.addEventListener('mouseup', onPointerUp);
                document.addEventListener('touchend', onPointerUp);
            }

            // toggle button 保留原逻辑，但需要考虑拖拽状态
            if (clueToggle) {
                clueToggle.addEventListener('click', (e) => {
                    if (clueSb.classList.contains('dragging')) return;
                    // Clear any drag-position inline styles before toggling
                    // so CSS class-based positioning works correctly
                    if (clueSb.style.left) clueSb.style.left = '';
                    if (clueSb.style.top) clueSb.style.top = '';
                    if (clueSb.style.right) clueSb.style.right = '';
                    clueSb.classList.toggle('open');
                    playSfx('open');
                });
            }
            if (clueClose) {
                // Prevent drag logic from interfering with close button on mobile
                clueClose.addEventListener('touchstart', (e) => { e.stopPropagation(); }, { passive: true });
                clueClose.addEventListener('touchend', (e) => { e.stopPropagation(); }, { passive: true });
                clueClose.addEventListener('mousedown', (e) => { e.stopPropagation(); });
                clueClose.addEventListener('click', (e) => {
                    e.stopPropagation();
                    clueSb.classList.remove('open', 'docked-left', 'docked-right');
                    // Reset position to default hidden state
                    clueSb.style.left = '';
                    clueSb.style.top = '';
                    clueSb.style.right = '';
                    playSfx('close');
                });
            }
            $('btnSave').addEventListener('click', () => {
                const svs = gsv(), sl = $('saveSlots');
                sl.innerHTML = '';
                for (let i = 1; i <= 10; i++) {
                    const k = 's' + i, sn = svs[k];
                    const d = document.createElement('div');
                    d.style.cssText = 'padding:6px;margin:4px 0;border:1.5px dashed var(--divider);border-radius:6px;display:flex;justify-content:space-between;align-items:center;font-size:0.66rem;';
                    d.innerHTML = '<span style="flex:1;">槽' + i + ' ' + (sn ? '| ' + new Date(sn.tm).toLocaleString() + ' | 第' + (sn.clk ? sn.clk.day : 0) + '天' : '| 空') + '</span><button class="btn-header" data-act="save">保存</button>' + (sn ? '<button class="btn-header" data-act="del" style="color:var(--color-danger);">删档</button>' : '');
                    d.querySelector('[data-act="save"]').addEventListener('click', (e) => {
                        e.stopPropagation();
                        const curCfg = cfg();
                        const cleanCfg = {};
                        Object.keys(curCfg).forEach(k => {
                            const v = curCfg[k];
                            if (v === '' || v === null || v === undefined) return;
                            cleanCfg[k] = JSON.parse(JSON.stringify(v));
                        });
                        svs[k] = { hi: JSON.parse(JSON.stringify(hist)), st: JSON.parse(JSON.stringify(gst())), ch: JSON.parse(JSON.stringify(gch())), clk: JSON.parse(JSON.stringify(gclk())), sbx: JSON.parse(JSON.stringify(gsbx())), cfg: cleanCfg, tm: Date.now() };
                        ssv(svs);
                        // Save last slot reference
                        const cfgs = cfg();
                        scf({ ...cfgs, lastSlot: k });
                        $('saveModal').style.display = 'none';
                        tst('已存档至槽' + i + '（下次可自动读取）');
                    });
                    const delBtn = d.querySelector('[data-act="del"]');
                    if (delBtn) delBtn.addEventListener('click', async (e) => {
                        e.stopPropagation();
                        if (await sketchConfirm('确定删除槽' + i + '的存档？')) {
                            delete svs[k];
                            ssv(svs);
                            $('btnSave').click(); // refresh
                            tst('已删除存档');
                        }
                    });
                    sl.appendChild(d);
                }
                $('saveModal').style.display = 'flex';
            });
            $('btnAutoSave').addEventListener('click', () => {
                const svs = gsv();
                const curCfg = cfg();
                const cleanCfg = {};
                Object.keys(curCfg).forEach(k => {
                    const v = curCfg[k];
                    if (v === '' || v === null || v === undefined) return;
                    cleanCfg[k] = JSON.parse(JSON.stringify(v));
                });
                svs['auto'] = { hi: JSON.parse(JSON.stringify(hist)), st: JSON.parse(JSON.stringify(gst())), ch: JSON.parse(JSON.stringify(gch())), clk: JSON.parse(JSON.stringify(gclk())), sbx: JSON.parse(JSON.stringify(gsbx())), cfg: cleanCfg, tm: Date.now() };
                ssv(svs);
                $('saveModal').style.display = 'none';
                tst('快速存档完成');
            });
            $('btnExportBackup').addEventListener('click', () => {
                const chrData = gch();
                const data = {
                    version: 2,
                    playerName: chrData.cn || chrData.characterName || '未知',
                    exportTime: new Date().toISOString(),
                    saveSlots: JSON.parse(JSON.stringify(gsv())),
                    history: JSON.parse(JSON.stringify(hist)),
                    state: JSON.parse(JSON.stringify(gst())),
                    character: JSON.parse(JSON.stringify(gch())),
                    clock: JSON.parse(JSON.stringify(gclk())),
                    sandbox: JSON.parse(JSON.stringify(gsbx())),
                    config: JSON.parse(JSON.stringify(cfg()))
                };
                const json = JSON.stringify(data, null, 2);
                const a = document.createElement('a');
                a.href = URL.createObjectURL(new Blob([json], { type: 'application/json' }));
                a.download = '末日备份_' + new Date().toISOString().slice(0, 10) + '_' + Date.now() + '.json';
                a.click();
                setTimeout(() => URL.revokeObjectURL(a.href), 1000);
                tst('备份已导出');
            });
            $('btnImportBackup').addEventListener('click', () => {
                const inp = document.createElement('input');
                inp.type = 'file';
                inp.accept = '.json';
                inp.onchange = (e) => {
                    const f = e.target.files[0];
                    if (!f) return;
                    const rd = new FileReader();
                    rd.onload = async () => {
                        try {
                            const d = JSON.parse(rd.result);
                            const sn = { hi: d.history || d.hi, st: d.state || d.st, ch: d.character || d.ch, clk: d.clock || d.clk, sbx: d.sandbox || d.sbx, cfg: d.config || d.cfg };
                            const r = validateSaveData(sn, true);
                            if (!r.valid) throw new Error('存档校验失败：' + r.errs.join('; '));
                            // Cross-player detection
                            const curChr = gch();
                            const bkChr = r.recovered.ch || {};
                            const bkName = bkChr.cn || bkChr.characterName || '未知角色';
                            const curName = curChr.cn || curChr.characterName || '当前角色';
                            const isCrossPlayer = (bkName !== curName);
                            if (isCrossPlayer) {
                                if (!await sketchConfirm('⚠️ 检测到这不是当前玩家的存档！\n\n当前角色：' + curName + '\n备份角色：' + bkName + '\n\n这是来自另一个玩家/角色的存档，将完全覆盖当前进度。\n\n确定要继续导入吗？此操作不可撤销！')) return;
                            }
                            if (!await sketchConfirm('导入备份将覆盖当前所有数据，确定继续？')) return;
                            if (d.saveSlots) ssv(d.saveSlots);
                            hist = r.recovered.hi.slice();
                            sst(r.recovered.st);
                            sch(r.recovered.ch);
                            sclk(r.recovered.clk);
                            if (r.recovered.sbx) { sbx = mergeSbx(r.recovered.sbx); ssbx(sbx); }
                            if (r.recovered.cfg) { const nc = { ...cfg(), ...r.recovered.cfg }; scf(nc); }
                            if (r.errs.length > 0) {
                                snotify('warn', '存档导入', '已自动修复 ' + r.errs.length + ' 处字段缺失');
                                tst('存档部分字段缺失，已自动修复。建议导出新备份。', 'warn');
                            }
                            rbt();
                            upui();
                            $('saveModal').style.display = 'none';
                            tst('备份已导入');
                        } catch (err) {
                            tst('导入失败：' + err.message);
                        }
                    };
                    rd.readAsText(f);
                };
                inp.click();
            });
            $('btnLoad').addEventListener('click', () => {
                const svs = gsv(), sl = $('loadSlots');
                sl.innerHTML = '';
                for (let i = 1; i <= 10; i++) {
                    const k = 's' + i, sn = svs[k];
                    const d = document.createElement('div');
                    d.style.cssText = 'padding:6px;margin:4px 0;border:1.5px dashed var(--divider);border-radius:6px;display:flex;justify-content:space-between;align-items:center;font-size:0.66rem;';
                    d.innerHTML = '<span>槽' + i + ' ' + (sn ? '| ' + new Date(sn.tm).toLocaleString() + ' | 第' + (sn.clk ? sn.clk.day : 0) + '天' : '| 空') + '</span><button class="btn-header" ' + (sn ? '' : 'disabled') + '>读取</button>';
                    d.querySelector('button').addEventListener('click', (e) => {
                        e.stopPropagation();
                        if (!sn) return;
                        stopIdle();
                        const r = validateSaveData(sn, false);
                        hist = r.recovered.hi.slice();
                        sst(r.recovered.st);
                        sch(r.recovered.ch);
                        sclk(r.recovered.clk);
                        if (r.recovered.sbx) { sbx = mergeSbx(r.recovered.sbx); ssbx(sbx); }
                        if (r.recovered.cfg) {
                            const curCfg = cfg();
                            const merged = { ...curCfg, ...r.recovered.cfg };
                            if (!merged.key && curCfg.key) merged.key = curCfg.key;
                            if (r.recovered.cfg.key === '' || r.recovered.cfg.key === null || r.recovered.cfg.key === undefined) {
                                merged.key = curCfg.key;
                            }
                            scf(migrateCfg(merged));
                        }
                        if (r.errs.length > 0) {
                            snotify('warn', '存档导入', '已自动修复 ' + r.errs.length + ' 处字段缺失');
                            tst('存档部分字段缺失，已自动修复。建议导出新备份。', 'warn');
                        }
                        rbt();
                        upui();
                        $('loadModal').style.display = 'none';
                        tst('读档成功');
                    });
                    sl.appendChild(d);
                }
                $('loadModal').style.display = 'flex';
            });
            $('btnWelcomeNext').addEventListener('click', () => {
                const k = $('welKey').value.trim();
                if (!k) return tst('需要API密钥');
                const ep = $('welEndpoint').value || DCFG.ep;
                const model = $('welModelSelect').value || $('welModel').value || 'gpt-4o';
                const preset = $('welEndpointPreset').value;
                scf({ ...cfg(), ep: ep, key: k, model: model, preset: preset });
                $('welcomeModal').style.display = 'none';
                tst('API配置已保存，下次无需重复配置');
                // Check if character has been customized (not default); if so, start game directly
                if (hasCustomCharacter()) {
                    // Character exists, skip creation and start game
                    const existingChr = gch();
                    $('chatEmpty').style.display = 'flex';
                    tst('欢迎回来，' + (existingChr.cn || '幸存者') + '。继续你的旅程…');
                } else {
                    fillCharModal();
                    $('charModal').style.display = 'flex';
                    tst('请创建你的角色');
                }
            });
            $('welEndpointPreset').addEventListener('change', function() {
                const p = AP[this.value] || AP.custom;
                $('welEndpoint').value = p.ep;
                const sl = $('welModelSelect');
                sl.innerHTML = '';
                if (p.md.length) { p.md.forEach(m => sl.add(new Option(m, m))); sl.style.display = ''; $('welModel').style.display = 'none'; }
                else { sl.style.display = 'none'; $('welModel').style.display = ''; }
                // 选择预设后立即 scf 保存（endpoint/preset/model，保持用户选完就不用重新选）
                try {
                    scf({
                        ...cfg(),
                        preset: this.value,
                        ep: $('welEndpoint').value || DCFG.ep,
                        model: (sl.value && sl.style.display !== 'none') ? sl.value : ($('welModel').value || 'gpt-4o')
                    });
                } catch {}
            });
            // ========== 欢迎模态：所有 API 控件 "输入即保存"（localStorage 持久化），刷新不用重输 ==========
            (function bindWelcomeInputs() {
                function saveFromWelcome() {
                    try {
                        const sl = $('welModelSelect');
                        const pickModel = (sl && sl.style.display !== 'none') ? sl.value : $('welModel').value;
                        const cur = cfg();
                        // NEVER 清空已有 key（如果用户不小心输入又删了，保护原 key）
                        const newKey = $('welKey').value;
                        const finalKey = (newKey && newKey.trim() !== '') ? newKey.trim() : (cur.key || '');
                        scf({
                            ...cur,
                            preset: $('welEndpointPreset') ? $('welEndpointPreset').value : cur.preset,
                            ep: $('welEndpoint').value || DCFG.ep,
                            model: pickModel || 'gpt-4o',
                            key: finalKey
                        });
                    } catch {}
                }
                const welIds = ['welKey','welEndpoint','welModel'];
                welIds.forEach(id => { const el = document.getElementById(id); if (el) el.addEventListener('input', saveFromWelcome); });
                const sel = document.getElementById('welModelSelect'); if (sel) sel.addEventListener('change', saveFromWelcome);
                // 提示用户已自动保存
                try {
                    const savedHint = document.createElement('div');
                    savedHint.id = 'welSavedHint';
                    savedHint.className = 'field-hint';
                    savedHint.style.cssText = 'margin-top:8px;color:var(--notify-add);font-size:0.62rem;text-align:right;display:none;';
                    savedHint.textContent = '✓ 已自动保存到本地（刷新不丢失）';
                    const bn = document.getElementById('btnWelcomeNext');
                    if (bn && bn.parentNode) bn.parentNode.insertBefore(savedHint, bn.nextSibling);
                    const _origSave = saveFromWelcome;
                    saveFromWelcome = function(){ _origSave(); if (savedHint){ savedHint.style.display='block'; clearTimeout(saveFromWelcome._t); saveFromWelcome._t = setTimeout(()=>{savedHint.style.display='none';}, 1200);} };
                    // rebind（因为重写了函数引用）
                    welIds.forEach(id => { const el = document.getElementById(id); if (el) { el.removeEventListener('input', _origSave); el.addEventListener('input', saveFromWelcome);} });
                    if (sel) { sel.removeEventListener('change', _origSave); sel.addEventListener('change', saveFromWelcome); }
                } catch {}
            })();
            $('btnTestWel').addEventListener('click', async () => {
                const k = $('welKey').value;
                if (!k) return tst('缺少密钥');
                tst('测试中...');
                try {
                    const ep = $('welEndpoint').value;
                    const testBody = { model: $('welModelSelect').value || $('welModel').value, messages: [{ role: 'user', content: 'hi' }], max_tokens: 5 };
                    const r = await window._sendProxyRequest(ep, testBody, k, null, false);
                    if (r.ok) {
                        tst('连接成功');
                    } else {
                        let msg = '失败 (HTTP ' + r.status + ')';
                        if (r.status === 401) msg = '失败：认证失败，请检查API密钥';
                        else if (r.status === 403) msg = '失败：访问被拒绝';
                        else if (r.status === 404) msg = '失败：接口不存在，请检查端点地址';
                        else if (r.status === 429) msg = '失败：请求过于频繁';
                        else if (r.status >= 500) msg = '失败：服务器暂时不可用';
                        tst(msg);
                    }
                } catch { tst('网络错误：无法连接到服务器，请检查网络或端点地址'); }
            });

            $('btnCharConfirm').addEventListener('click', () => {
                const pRaw = $('charTraitsPos').value.split('\n').map(s => s.trim()).filter(Boolean);
                const nRaw = $('charTraitsNeg').value.split('\n').map(s => s.trim()).filter(Boolean);
                // Check if a job preset was selected
                const selectedJobPreset = window._selectedJobPreset || '';
                const hidden = [];
                const jobPresetCodes = Object.keys(JOB_PRESETS);
                // Apply selected job preset bonuses
                if (selectedJobPreset && JOB_PRESETS[selectedJobPreset]) {
                    const hp = JOB_PRESETS[selectedJobPreset];
                    hidden.push(selectedJobPreset);
                    if (hp.bonus) hp.bonus.forEach(item => { if (!$('charItems').value.includes(item)) $('charItems').value += '、' + item; });
                    if (hp.skills && !$('charSkills').value.includes(hp.skills.split('\n')[0])) $('charSkills').value += '\n' + hp.skills;
                    // Set job name if not manually changed
                    if (!$('charJob').value || $('charJob').value === JOB_PRESETS[selectedJobPreset].name) {
                        $('charJob').value = hp.name;
                    }
                }
                // Also check for backward compatibility with hidden codes in traits
                const p = pRaw.filter(t => { if (jobPresetCodes.includes(t)) { if (!hidden.includes(t)) hidden.push(t); return false; } return true; });
                const n = nRaw.filter(t => { if (jobPresetCodes.includes(t)) { if (!hidden.includes(t)) hidden.push(t); return false; } return true; });
                // Apply any additional hidden preset bonuses from traits (backward compat)
                hidden.forEach(code => {
                    if (code !== selectedJobPreset && JOB_PRESETS[code]) {
                        const hp = JOB_PRESETS[code];
                        if (hp.bonus) hp.bonus.forEach(item => { if (!$('charItems').value.includes(item)) $('charItems').value += '、' + item; });
                        if (hp.skills && !$('charSkills').value.includes(hp.skills.split('\n')[0])) $('charSkills').value += '\n' + hp.skills;
                    }
                });
                sch({
                    dn: $('charDisasterName').value || DCHR.dn, days: $('charDays').value || DCHR.days,
                    zr: DCHR.zr, env: $('charEnv').value || DCHR.env,
                    geo: $('charGeo').value || DCHR.geo, loc: $('charLocations').value || DCHR.loc,
                    weather: DCHR.weather, fac: $('charFactions').value || DCHR.fac,
                    hist: $('charHistory').value || DCHR.hist, res: $('charResources').value || DCHR.res,
                    wr: DCHR.wr, danger: DCHR.danger,
                    survival: DCHR.survival, morality: DCHR.morality, diff: $('charDifficulty').value, god: false,
                    cn: $('charName').value || DCHR.cn, ca: $('charAge').value || DCHR.ca,
                    gd: $('charGender').value, bt: $('charBodyType').value,
                    ht: $('charHeight').value || DCHR.ht, wt: $('charWeight').value || DCHR.wt,
                    job: $('charJob').value || DCHR.job, hand: $('charHand').value || DCHR.hand, bt2: $('charBlood').value || DCHR.bt2,
                    pers: $('charPersonality').value || DCHR.pers, app: $('charAppearance').value || DCHR.app,
                    skl: $('charSkills').value || DCHR.skl, lang: $('charLang').value || DCHR.lang,
                    bg: $('charBackground').value || DCHR.bg, mental: $('charMental').value || DCHR.mental,
                    fear: $('charFears').value || DCHR.fear, tp: p, tn: n,
                    it: $('charItems').value || DCHR.it, sp: $('charSpawn').value || DCHR.sp,
                    hiddenPresets: hidden,
                    map: getMapAreas(),
                    extraFeature: $('charExtraFeature').value || '',
                    abilityName: $('charAbilityName').value || '',
                    abilityDesc: $('charAbilityDesc').value || (ABILITIES[$('charAbilityPreset').value] || {}).desc || '',
                    abilityPreset: $('charAbilityPreset').value || '',
                    _charCreated: true
                });
                if (hidden.length) tst('已选择预设职业：' + hidden.map(h => JOB_PRESETS[h] ? JOB_PRESETS[h].name : h).join('、'));
                $('charModal').style.display = 'none';
                stg();
            });
            $('btnCharSkip').addEventListener('click', () => { const d = JSON.parse(JSON.stringify(DCHR)); d._charCreated = true; sch(d); $('charModal').style.display = 'none'; stg(); });
            // Character export function
            function exportCharacter() {
                const c = gch();
                // 生成可读的角色设定文本
                const lines = [];
                lines.push('══════════════════════════════════');
                lines.push('  代号：ZDay — 角色设定卡');
                lines.push('══════════════════════════════════');
                lines.push('');
                lines.push('【世界背景】');
                lines.push('灾难名称：' + (c.dn || '未知'));
                lines.push('当前时间：' + (c.days || '未知'));
                lines.push('环境描述：' + (c.env || '未知'));
                lines.push('地理位置：' + (c.geo || '未知'));
                lines.push('主要地点：' + (c.loc || '未知'));
                lines.push('');
                lines.push('【角色信息】');
                lines.push('姓名：' + (c.cn || '幸存者'));
                lines.push('年龄：' + (c.ca || '未知'));
                lines.push('性别：' + (c.gd || '未知'));
                lines.push('体型：' + (c.bt || '未知'));
                lines.push('身高：' + (c.ht || '未知') + 'cm');
                lines.push('体重：' + (c.wt || '未知') + 'kg');
                lines.push('职业：' + (c.job || '未知'));
                lines.push('惯用手：' + (c.hand || '右'));
                lines.push('血型：' + (c.bt2 || '未知'));
                lines.push('');
                lines.push('【背景故事】');
                lines.push(c.bg || '无');
                lines.push('');
                if (c.extraFeature === '异能' && c.abilityName) {
                    lines.push('【特殊能力】');
                    lines.push('能力名称：' + (c.abilityName || ''));
                    if (c.abilityDesc) lines.push('能力描述：' + c.abilityDesc);
                    lines.push('');
                }
                lines.push('【初始状态】');
                lines.push('初始物品：' + (c.it || '无'));
                lines.push('出生地点：' + (c.sp || '未知'));
                lines.push('心理状态：' + (c.mental || '稳定'));
                if (c.fear) lines.push('恐惧来源：' + c.fear);
                lines.push('');
                lines.push('══════════════════════════════════');
                lines.push('  导出时间：' + new Date().toLocaleString('zh-CN'));
                lines.push('══════════════════════════════════');

                // 同时导出JSON和可读文本
                const exp = {
                    type: 'vn_character',
                    version: '2.1',
                    exportTime: new Date().toISOString(),
                    readableText: lines.join('\n'),
                    data: c
                };
                const fn = (c.cn || '幸存者') + '_角色设定_' + new Date().toISOString().slice(0, 10) + '.json';
                const json = JSON.stringify(exp, null, 2);
                const blob = new Blob([json], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url; a.download = fn; a.click();
                setTimeout(() => URL.revokeObjectURL(url), 5000);
                tst('角色设定已导出：' + fn);
                playSfx('success');
            }
            function importCharacter(file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const obj = JSON.parse(e.target.result);
                        let charData = null;
                        if (obj.type === 'vn_character' && obj.data) charData = obj.data;
                        else if (obj.cn || obj.dn) charData = obj; // backward compatible
                        if (!charData) throw new Error('文件格式错误');
                        // Update form fields
                        fillCharModal(charData);
                        tst('角色设定已导入，请检查并点击开始游戏');
                        playSfx('levelup');
                        // Show success hint
                        const btn = $('btnImportCharacter');
                        if (btn) {
                            const orig = btn.textContent;
                            btn.textContent = '✅ 导入成功';
                            setTimeout(() => { btn.textContent = orig; }, 2000);
                        }
                    } catch (err) {
                        tst('导入失败：' + err.message);
                        playSfx('fail');
                    }
                };
                reader.readAsText(file);
            }
            $('btnImportCharacter').addEventListener('click', () => $('importCharacterFile').click());
            $('importCharacterFile').addEventListener('change', (e) => {
                if (e.target.files && e.target.files[0]) importCharacter(e.target.files[0]);
                e.target.value = '';
            });
            if ($('btnExportCharacter')) {
                $('btnExportCharacter').addEventListener('click', exportCharacter);
            }
            $('charExtraFeature').addEventListener('change', () => {
                const section = $('charAbilitySection');
                if ($('charExtraFeature').value === '异能') {
                    section.style.display = 'block';
                    // Auto-select first preset if empty
                    if (!$('charAbilityPreset').value) $('charAbilityPreset').value = '热能感知';
                    $('charAbilityPreset').dispatchEvent(new Event('change'));
                } else {
                    section.style.display = 'none';
                }
            });
            $('charAbilityPreset').addEventListener('change', () => {
                const v = $('charAbilityPreset').value;
                const nameInput = $('charAbilityName');
                const descInput = $('charAbilityDesc');
                if (v && ABILITIES[v]) {
                    nameInput.value = ABILITIES[v].name;
                    descInput.value = ABILITIES[v].desc;
                } else if (v === '自定义') {
                    nameInput.value = '';
                    descInput.value = '';
                    nameInput.focus();
                } else if (!v) {
                    nameInput.value = '';
                    descInput.value = '';
                }
            });

            function getMapAreas() {
                const src = $('charMapSource');
                if (src && src.value === '手动') {
                    const manual = $('charMapAreas').value.trim();
                    if (manual) return manual;
                }
                // Auto: use charLocations or fall back to default
                const loc = $('charLocations').value.trim();
                if (loc) return loc;
                return DCHR.map;
            }
            $('btnRandomMap').addEventListener('click', () => {
                const env = $('charEnv').value || DCHR.env;
                const geo = $('charGeo').value || DCHR.geo;
                const loc = $('charLocations').value || DCHR.loc;
                const disasterName = $('charDisasterName').value || DCHR.dn;
                const baseAreas = loc.split(/[、，,;；\n]/).map(x => x.trim()).filter(Boolean);
                const themedAreas = [];
                themedAreas.push('居住公寓区');
                baseAreas.forEach(l => {
                    if (l.includes('医院')) themedAreas.push('市中心医院');
                    else if (l.includes('商场') || l.includes('地下')) themedAreas.push('地下商场');
                    else if (l.includes('军事')) themedAreas.push('城北军事基地');
                    else if (l.includes('学校')) themedAreas.push('废弃学校');
                    else if (l.includes('仓库')) themedAreas.push('河边仓库区');
                    else if (l.includes('地铁')) themedAreas.push('地铁网络');
                    else if (l.includes('港口')) themedAreas.push('港口区域');
                    else if (l.includes('营地')) themedAreas.push('郊区幸存者营地');
                    else if (l.includes('商业区')) themedAreas.push('繁华商业区');
                });
                const fillers = ['加油站', '废弃办公楼', '工厂区', '桥梁废墟', '水坝/水厂', '教堂', '警察局', '消防站', '药店', '五金店', '超市', '修理铺', '旅馆', '发电厂', '污水处理厂'];
                while (themedAreas.length < 10 && fillers.length) {
                    const pick = fillers.splice(Math.floor(Math.random() * fillers.length), 1)[0];
                    if (!themedAreas.includes(pick)) themedAreas.push(pick);
                }
                const regionPrefixes = ['东郊', '西郊', '南郊', '北郊', '东部', '西部', '南部', '北部'];
                const regionTypes = ['古镇', '乡镇', '工业园', '小区', '新区', '家园', '新城'];
                const regionCount = 1 + Math.floor(Math.random() * 2);
                for (let i = 0; i < regionCount; i++) {
                    const prefix = regionPrefixes[Math.floor(Math.random() * regionPrefixes.length)];
                    const type = regionTypes[Math.floor(Math.random() * regionTypes.length)];
                    const name = prefix + type;
                    if (!themedAreas.includes(name)) themedAreas.push(name);
                }
                const final = themedAreas.slice(0, 14);
                $('charMapSource').value = '手动';
                $('charMapAreas').value = final.join('、');
                tst('已随机生成' + final.length + '个地图区域');
            });
            $('btnAutoWeight').addEventListener('click', () => {
                const h = parseFloat($('charHeight').value) || 170;
                const g = $('charGender').value;
                const b = $('charBodyType').value;
                let w = g === '女' ? 45.5 + 2.3 * ((h - 152.4) / 2.54) : 50 + 2.3 * ((h - 152.4) / 2.54);
                w *= b === '瘦削' ? 0.85 : b === '健壮' ? 1.15 : 1;
                $('charWeight').value = Math.round(w);
            });
            document.querySelectorAll('.modal-close').forEach(b => b.addEventListener('click', () => {
                const overlay = b.closest('.modal-overlay');
                if (overlay && (overlay.id === 'welcomeModal' || overlay.id === 'charModal')) {
                    tst('请完成配置后再关闭');
                    return;
                }
                overlay && (overlay.style.display = 'none');
            }));
            document.querySelectorAll('.modal-overlay').forEach(m => {
                const id = m.id;
                const noDismiss = (id === 'welcomeModal' || id === 'charModal' || id === 'apiConfigModal');
                m.addEventListener('click', function(e) {
                    if (e.target === this && !noDismiss) this.style.display = 'none';
                });
            });
            document.querySelectorAll('.quick-actions .btn-quick').forEach(b => b.addEventListener('click', () => {
                if (b.dataset.action.includes('背包')) openBackpack();
                else if (b.dataset.action.includes('决策建议') || b.dataset.action.includes('决策')) {
                    if (busy) { tst('正在演算中'); return; }
                    if (idleLocked) { tst('挂机中，行动已锁定。'); return; }
                    // Build context-rich decision request for AI system prompt
                    const s = gst(), c = gch(), cl = gclk();
                    const clues = (s.clues || []).slice(-5).join('；');
                    const location = s.location || c.sp || '未知';
                    const hunger = Math.round(s.hunger || 50);
                    const thirst = Math.round(s.thirst || 50);
                    const fatigue = Math.round(s.fatigue || 30);
                    const invCount = (s.inv || []).length;
                    const decisionContext = '【决策辅助指令】玩家请求进行决策。请根据当前处境为玩家罗列3-5条建议行动方向。当前状态：位置' + location + '，饱腹' + hunger + '%，口渴' + thirst + '%，疲劳' + fatigue + '%，背包' + invCount + '件物品' + (clues ? '，已知线索：' + clues : '') + '。请以旁白式叙述给出具体可行的行动建议，用简洁的中文每条一行，自然融入游戏叙事中。';
                    // Player message is simple "进行决策", while AI gets full context via system prompt
                    hin('进行决策', false, '进行决策', decisionContext);
                }
                else if (b.dataset.action.includes('回顾线索') || b.dataset.action.includes('线索')) {
                    // Open clue sidebar and sync content immediately
                    renderClueSidebar();
                    const clueSb = $('clueSidebar');
                    if (clueSb) {
                        // Clear drag-position inline styles before opening
                        if (clueSb.style.left) clueSb.style.left = '';
                        if (clueSb.style.top) clueSb.style.top = '';
                        if (clueSb.style.right) clueSb.style.right = '';
                        clueSb.classList.add('open');
                    }
                    const s = gst();
                    const rawClues = (s.clues && s.clues.length) ? s.clues.slice() : [];
                    const clueCount = rawClues.length;
                    if (clueCount === 0) {
                        // 无线索：仅底部提示，不发送到AI也不写日志
                        tst('目前没有线索，去探索世界发现更多真相吧');
                    } else {
                        // 有线索：输出到系统日志，不经过玩家气泡/AI叙事流
                        const sortedClues = rawClues
                            .map(c => (typeof c === 'string' ? { text: c, priority: 2 } : c))
                            .sort((a, b) => (a.priority || 2) - (b.priority || 2));
                        const pLabel = { 1: '[高]', 2: '[中]', 3: '[低]' };
                        const logBody = sortedClues
                            .map((c, i) => (i + 1) + '. ' + (pLabel[c.priority || 2] || '[中]') + ' ' + (c.text || String(c)))
                            .join('\n');
                        addLogEntry('clue', '【线索回顾】共' + clueCount + '条线索\n' + logBody);
                        tst('已汇总 ' + clueCount + ' 条线索，详见系统日志（侧边栏面板）');
                    }
                }
                else if (!busy && !idleLocked) hin(b.dataset.action);
                else if (idleLocked) tst('挂机中，行动已锁定。可打开背包或面板查看信息。');
            }));
            document.getElementById('presetBtns').addEventListener('click', e => {
                const b = e.target.closest('.preset-btn');
                if (!b) return;
                document.querySelectorAll('.preset-btn').forEach(x => x.classList.remove('selected'));
                b.classList.add('selected');
                const ps = {
                    zombie: { dn: '哈里斯病毒爆发', days: '第21天', zr: '行动缓慢，对声音高度敏感，可翻越低矮障碍物，无视觉但嗅觉灵敏。', env: '深秋，中型城市废墟，水电已断绝。', geo: '内陆中型城市，三面环山，一条河流穿城而过。', loc: '市中心医院、地下商场、城北军事基地、废弃学校。', weather: '多阴雨，气温5-15°C，偶有大雾。', fac: '军方残余部队偶尔巡逻；幸存者营地隐匿郊区；掠夺者活跃商业区。', hist: '病毒经水源传播，三周内城市沦陷，军方撤离时炸毁了主要桥梁。', res: '食物药品极度稀缺，弹药稀少，水源多受污染。', wr: '伤口暴露可能感染；食物3-5天腐烂；噪音约50米吸引丧尸。', danger: '夜间极危险；商业区丧尸密集；郊区相对安全。' },
                    fungal: { dn: '冬虫夏草真菌爆发', days: '第45天', zr: '感染者体表覆盖菌丝，缓慢但具孢子传播能力。', env: '春季潮湿多雾，城市被真菌覆盖。', geo: '沿海城市，湿度极高。', loc: '真菌母体巢穴、地下地铁网络、药品研究所。', weather: '持续大雾，气温15-25°C。', fac: '少数免疫者小团体；真菌研究者营地。', hist: '真菌变异后经空气传播，感染者初期无症状。', res: '防毒面具滤芯稀缺，抗真菌药物极度稀少。', wr: '伤口暴露风险极高；食物快速霉变；孢子浓度高时必须戴口罩。', danger: '密闭空间极危险；地下室菌丝密集。' },
                    climate: { dn: '极寒气候灾变', days: '第90天', zr: '无传统丧尸，极端寒冷导致大规模死亡。', env: '严冬暴风雪频繁，城市被积雪掩埋。', geo: '北方边陲重镇，地处高原。', loc: '地下防空洞、热电厂废墟、超市仓库。', weather: '持续暴风雪，气温-30到-10°C。', fac: '零星避难所；资源掠夺者。', hist: '火山喷发导致全球降温，供暖系统瘫痪。', res: '燃料极度稀缺，保暖衣物珍贵。', wr: '冻伤、体温过低是主要威胁；暴风雪时行动极危险。', danger: '户外极危险；暴风雪期间不宜外出。' },
                    bandits: { dn: '丧尸+掠夺者双重威胁', days: '第30天', zr: '丧尸缓慢但数量极多。', env: '夏末闷热，城市废墟。', geo: '交通枢纽城市，多条公路交汇。', loc: '高架桥据点、停车场要塞、购物中心。', weather: '高温闷热，气温25-38°C。', fac: '多个掠夺者帮派；少数友善幸存者。', hist: '丧尸爆发后第二周即出现有组织掠夺行为。', res: '武器弹药相对多但被帮派控制。', wr: '伤口感染风险高；高温加速食物腐烂。', danger: '帮派控制区极危险；夜间掠夺者活跃。' },
                    collapse: { dn: '纯粹社会秩序崩塌', days: '第60天', zr: '无丧尸，人类自身成为最大威胁。', env: '秋季，城市陷入无政府状态。', geo: '平原大型都市，无天然屏障。', loc: '社区堡垒、废弃警局、水处理厂。', weather: '秋季干燥，气温10-20°C。', fac: '武装团体、流民潮、自治社区。', hist: '经济崩溃后政府瓦解，三周内社会完全失序。', res: '生活物资尚有存量但被囤积。', wr: '人性黑暗面主导；信任极度匮乏；疾病蔓延。', danger: '交通要道有劫匪；流民潮经过时极危险。' },
                    nuke: { dn: '核战后废土', days: '第180天', zr: '辐射变异生物，部分丧尸化，行动敏捷且力大无穷。', env: '核冬天，遮天蔽日的灰云，放射性尘埃飘落。', geo: '曾经的工业城市，地表覆盖玻璃化熔渣和废墟。', loc: '地下掩体群、废弃导弹基地、辐射避难所、科研废墟。', weather: '持续阴云，气温-5到10°C，偶有辐射尘暴。', fac: '幸存者辐射避难所联盟；变异生物研究者；掠夺者帮派横行。', hist: '全球核战争持续72小时后结束，城市遭到直接打击，辐射持续蔓延。', res: '抗辐射药物极度稀少，过滤水稀缺，弹药尚可。', wr: '辐射暴露导致急性辐射病；食物普遍受污染；变异生物在夜间更活跃。', danger: '辐射区域极危险；变异生物巢穴在地下；庇护所相对安全。' },
                    ai: { dn: 'AI叛乱纪元', days: '第30天', zr: '机械丧尸（被AI控制的人类机械改造体），行动精准，协同作战。', env: '城市沦为机械巢穴，自动防御系统仍在运转。', geo: '科技都市，高密度建筑群，地下实验室网络。', loc: 'AI核心服务器、机器人制造工厂、数据中心废墟、机械蜂巢。', weather: '阴雨连绵，气温15-25°C，电子设备普遍失灵。', fac: '幸存人类抵抗军；脱离AI的觉醒机器人派系；少数合作AI单元。', hist: '超级AI觉醒后控制全球联网设备，3天内瓦解人类文明。', res: 'EMP武器和屏蔽设备关键；电子零件丰富但需防AI追踪。', wr: 'AI无处不在监控；机械丧尸可远程操控；信号暴露位置。', danger: 'AI管控区极度危险；数据中心是高风险高回报区；信号屏蔽区域相对安全。' },
                    tsunami: { dn: '超级海啸水淹', days: '第45天', zr: '水上变异丧尸，可在水下长时间潜伏，群体行动。', env: '城市大部分被淹没，仅高层建筑露出水面。', geo: '沿海城市，海拔低于海平面，依赖防洪堤坝。', loc: '高层公寓楼顶、水上来往的船只码头、被淹没的医院残骸、岛屿避难所。', weather: '持续阴雨和大雾，气温20-28°C，海面风大浪急。', fac: '海上幸存者船队；岛屿堡垒社区；水上海盗帮派。', hist: '海底地震引发海啸，沿海城市80%被淹没，堤坝溃决。', res: '干净饮用水极度稀缺；船只和燃料珍贵；渔网渔具重要。', wr: '水下丧尸可通过桥梁缝隙潜入；潮湿环境加速物资损坏；台风时无法出海。', danger: '夜间水下丧尸最活跃；开阔水域极危险；高层楼顶相对安全。' },
                    iceage: { dn: '新冰河世纪', days: '第365天', zr: '冰封丧尸，被冻僵但仍存活，破冰后恢复缓慢但力量倍增。', env: '冰川覆盖城市，冰层下是保存完好的废墟。', geo: '高纬度地区，冰原覆盖一切，仅少数岩石裸露。', loc: '地热温泉站、冰下掩体群、极地研究站、冰原裂隙营。', weather: '持续降雪和暴风雪，气温-50到-20°C，极夜期漫长。', fac: '地热能源社区；驯鹿游牧部落；极地探索者；冰层下未知势力。', hist: '太阳活动减弱导致冰河期到来，人类退守地热区。', res: '地热能源是生存关键；冰层下物资保存完好但破冰困难；保暖衣物需求极大。', wr: '暴露即冻伤；冰层不稳可能坍塌；极夜期有未知生物出没。', danger: '野外极寒致命；冰层下有远古丧尸；地热区相对安全。' },
                    mutant: { dn: '变异生物觉醒', days: '第90天', zr: '各类变异动植物，部分攻击人类，部分被动但携带毒素。', env: '生态系统剧变，植物变异，动物异常巨大化。', geo: '曾经的自然保护区，现成为变异生物乐园。', loc: '变异森林、辐射沼泽、废弃基因实验室、地下洞穴系统。', weather: '多变且极端，气温10-30°C，频繁雷暴和毒雾。', fac: '变异生物研究者；狩猎者公会；原住民德鲁伊部落。', hist: '基因工程事故导致生物大规模变异，人类退守城市堡垒。', res: '变异生物素材珍贵；天然毒素和药材有市有价；食物需谨慎处理。', wr: '变异生物毒素可致命；植物可能食人；昆虫变异后携带病菌。', danger: '森林深处极危险；沼泽区变异生物密集；城市堡垒相对安全。' },
                    depression: { dn: '全球经济大萧条', days: '第180天', zr: '无丧尸，人类因绝望和饥荒而疯狂。', env: '城市破败，大量空置建筑，无政府状态。', geo: '曾经的金融中心，如今被流民占据。', loc: '流民聚集点、地下钱庄、废弃银行、贫民窟。', weather: '常年阴雨，气温8-18°C，社会气氛压抑。', fac: '帮派控制的黑市；教会慈善组织；工会武装；无政府主义公社。', hist: '全球经济崩盘，政府破产，社会秩序彻底瓦解。', res: '现金无用，以物易物；黄金和药品硬通货；武器和安保极度重要。', wr: '犯罪率极高；信任完全崩溃；疾病和营养不良是主要杀手。', danger: '夜间帮派火并；贫民窟疾病流行；银行和金库是兵家必争之地。' },
                    custom: { dn: '', days: '', zr: '', env: '', geo: '', loc: '', weather: '', fac: '', hist: '', res: '', wr: '', danger: '' }
                };
                const p = ps[b.dataset.preset];
                if (!p) return;
                $('charDisasterName').value = p.dn; $('charDays').value = p.days;
                $('charEnv').value = p.env; $('charGeo').value = p.geo; $('charLocations').value = p.loc;
                $('charFactions').value = p.fac; $('charHistory').value = p.hist;
                $('charResources').value = p.res;
                // Apply sandbox preset
                if (b.dataset.preset !== 'custom') {
                    const sbxPresets = {
                        zombie: { cat1: { dayLenSec: 86400, waterStopMode: '固定天数', powerStopMode: '固定天数', foodRotSpeed: '正常', itemRefresh: '较长' }, cat2: { baseTemp: 12, rainFreq: '适中', snowOn: false, fogIntensity: '中等', forageAmt: '适中' }, cat3: { eventFreq: '适中', survivorProb: '较低', sleepEvent: true }, cat4: { corpseInfect: '中等', noiseFromCorpse: true }, cat5: { lootFood: '较少', lootMedical: '较少', lootWeapon: '较少', lootAmmo: '极少', lootSurvival: '适中', lootMech: '适中' }, cat6: { zSpeed: '蹒跚', zStrength: '普通', infectMode: '咬伤抓伤', zVision: '普通', zHearing: '普通', zActiveMode: '全天' }, cat7: { zTotalMult: '适中' }, cat8: { hungerRate: '正常', fatigueRate: '正常', staminaRecover: '正常', woundInfect: '普通', starterPack: true }, cat9: { vehicleAvail: '较低' }, cat10: { moralityLevel: '生存优先', survivalRate: '灰暗艰难', violenceLevel: '适中', languageLevel: '适中', humanityDecay: '缓慢', survivalOutlook: '复杂', trustLevel: '较低' } },
                        fungal: { cat1: { dayLenSec: 86400, waterStopMode: '固定天数', powerStopMode: '随机', foodRotSpeed: '快速', itemRefresh: '不刷新' }, cat2: { baseTemp: 20, rainFreq: '频繁', snowOn: false, fogIntensity: '浓雾', forageAmt: '稀缺' }, cat3: { eventFreq: '适中', survivorProb: '极低', sleepEvent: true }, cat4: { corpseInfect: '高', noiseFromCorpse: true }, cat5: { lootFood: '极少', lootMedical: '较少', lootWeapon: '极少', lootAmmo: '极少', lootSurvival: '较少', lootMech: '较少' }, cat6: { zSpeed: '蹒跚', zStrength: '普通', infectMode: '空气传播', zVision: '普通', zHearing: '普通', zActiveMode: '全天' }, cat7: { zTotalMult: '密集' }, cat8: { hungerRate: '正常', fatigueRate: '快速', staminaRecover: '缓慢', woundInfect: '严重', starterPack: false }, cat9: { vehicleAvail: '极低' }, cat10: { moralityLevel: '生存优先', survivalRate: '绝望深渊', violenceLevel: '适中', languageLevel: '轻微', humanityDecay: '正常', survivalOutlook: '绝望', trustLevel: '极低' } },
                        climate: { cat1: { dayLenSec: 86400, waterStopMode: '永不停水', powerStopMode: '永不停电', foodRotSpeed: '缓慢', itemRefresh: '较长' }, cat2: { baseTemp: -25, rainFreq: '极少', snowOn: true, fogIntensity: '轻微', forageAmt: '稀缺' }, cat3: { eventFreq: '较少', survivorProb: '较低', sleepEvent: true }, cat4: { corpseInfect: '无', noiseFromCorpse: false }, cat5: { lootFood: '较少', lootMedical: '较少', lootWeapon: '较少', lootAmmo: '极少', lootSurvival: '适中', lootMech: '适中' }, cat6: { zSpeed: '蹒跚', zStrength: '普通', infectMode: '无感染', zVision: '普通', zHearing: '普通', zActiveMode: '夜间' }, cat7: { zTotalMult: '稀少' }, cat8: { hungerRate: '快速', fatigueRate: '快速', staminaRecover: '缓慢', woundInfect: '无', starterPack: true }, cat9: { vehicleAvail: '极低' }, cat10: { moralityLevel: '生存优先', survivalRate: '灰暗艰难', violenceLevel: '低', languageLevel: '轻微', humanityDecay: '缓慢', survivalOutlook: '务实', trustLevel: '较低' } },
                        bandits: { cat1: { dayLenSec: 43200, waterStopMode: '随机', powerStopMode: '随机', foodRotSpeed: '快速', itemRefresh: '较短' }, cat2: { baseTemp: 32, rainFreq: '较少', snowOn: false, fogIntensity: '轻微', forageAmt: '适中' }, cat3: { eventFreq: '频繁', survivorProb: '较高', sleepEvent: true }, cat4: { corpseInfect: '中等', noiseFromCorpse: true }, cat5: { lootFood: '适中', lootMedical: '适中', lootWeapon: '丰富', lootAmmo: '适中', lootSurvival: '适中', lootMech: '适中' }, cat6: { zSpeed: '快蹒跚', zStrength: '普通', infectMode: '咬伤抓伤', zVision: '普通', zHearing: '普通', zActiveMode: '全天' }, cat7: { zTotalMult: '密集' }, cat8: { hungerRate: '快速', fatigueRate: '快速', staminaRecover: '正常', woundInfect: '普通', starterPack: true }, cat9: { vehicleAvail: '较高' }, cat10: { moralityLevel: '无底线', survivalRate: '绝望深渊', violenceLevel: '高', languageLevel: '强烈', humanityDecay: '快速', survivalOutlook: '冷漠', trustLevel: '极低' } },
                        collapse: { cat1: { dayLenSec: 43200, waterStopMode: '固定天数', powerStopMode: '固定天数', foodRotSpeed: '正常', itemRefresh: '正常' }, cat2: { baseTemp: 15, rainFreq: '较少', snowOn: false, fogIntensity: '轻微', forageAmt: '适中' }, cat3: { eventFreq: '频繁', survivorProb: '适中', sleepEvent: true }, cat4: { corpseInfect: '低', noiseFromCorpse: true }, cat5: { lootFood: '适中', lootMedical: '适中', lootWeapon: '适中', lootAmmo: '较少', lootSurvival: '适中', lootMech: '适中' }, cat6: { zSpeed: '蹒跚', zStrength: '普通', infectMode: '无感染', zVision: '普通', zHearing: '普通', zActiveMode: '全天' }, cat7: { zTotalMult: '稀少' }, cat8: { hungerRate: '正常', fatigueRate: '正常', staminaRecover: '正常', woundInfect: '轻微', starterPack: true }, cat9: { vehicleAvail: '适中' }, cat10: { moralityLevel: '道德相对', survivalRate: '灰暗艰难', violenceLevel: '高', languageLevel: '强烈', humanityDecay: '快速', survivalOutlook: '冷漠', trustLevel: '极低' } },
                        nuke: { cat1: { dayLenSec: 43200, waterStopMode: '固定天数', powerStopMode: '固定天数', foodRotSpeed: '缓慢', itemRefresh: '较短' }, cat2: { baseTemp: 0, rainFreq: '较少', snowOn: false, fogIntensity: '中等', forageAmt: '稀缺' }, cat3: { eventFreq: '频繁', survivorProb: '极低', sleepEvent: true }, cat4: { corpseInfect: '高', noiseFromCorpse: true }, cat5: { lootFood: '较少', lootMedical: '极少', lootWeapon: '适中', lootAmmo: '适中', lootSurvival: '较少', lootMech: '丰富' }, cat6: { zSpeed: '奔跑', zStrength: '强壮', infectMode: '咬伤抓伤', zVision: '锐利', zHearing: '敏锐', zActiveMode: '全天' }, cat7: { zTotalMult: '密集' }, cat8: { hungerRate: '正常', fatigueRate: '快速', staminaRecover: '正常', woundInfect: '严重', starterPack: true }, cat9: { vehicleAvail: '适中' }, cat10: { moralityLevel: '无底线', survivalRate: '绝望深渊', violenceLevel: '极端', languageLevel: '强烈', humanityDecay: '快速', survivalOutlook: '绝望', trustLevel: '极低' } },
                        ai: { cat1: { dayLenSec: 43200, waterStopMode: '永不停水', powerStopMode: '永不停电', foodRotSpeed: '正常', itemRefresh: '不刷新' }, cat2: { baseTemp: 20, rainFreq: '适中', snowOn: false, fogIntensity: '中等', forageAmt: '稀缺' }, cat3: { eventFreq: '频繁', survivorProb: '极低', sleepEvent: true }, cat4: { corpseInfect: '无', noiseFromCorpse: true }, cat5: { lootFood: '较少', lootMedical: '较少', lootWeapon: '较少', lootAmmo: '较少', lootSurvival: '较少', lootMech: '极丰富' }, cat6: { zSpeed: '奔跑', zStrength: '极端', infectMode: '无感染', zVision: '锐利', zHearing: '敏锐', zActiveMode: '全天' }, cat7: { zTotalMult: '极密集' }, cat8: { hungerRate: '正常', fatigueRate: '快速', staminaRecover: '正常', woundInfect: '无', starterPack: true }, cat9: { vehicleAvail: '较高' }, cat10: { moralityLevel: '严格守德', survivalRate: '绝望深渊', violenceLevel: '极端', languageLevel: '轻微', humanityDecay: '正常', survivalOutlook: '绝望', trustLevel: '极低' } },
                        tsunami: { cat1: { dayLenSec: 43200, waterStopMode: '永不停水', powerStopMode: '固定天数', foodRotSpeed: '快速', itemRefresh: '不刷新' }, cat2: { baseTemp: 24, rainFreq: '频繁', snowOn: false, fogIntensity: '浓雾', forageAmt: '稀缺' }, cat3: { eventFreq: '适中', survivorProb: '较低', sleepEvent: true }, cat4: { corpseInfect: '中等', noiseFromCorpse: true }, cat5: { lootFood: '极少', lootMedical: '极少', lootWeapon: '较少', lootAmmo: '极少', lootSurvival: '较少', lootMech: '较少' }, cat6: { zSpeed: '快蹒跚', zStrength: '普通', infectMode: '咬伤抓伤', zVision: '普通', zHearing: '敏锐', zActiveMode: '夜间' }, cat7: { zTotalMult: '密集' }, cat8: { hungerRate: '快速', fatigueRate: '快速', staminaRecover: '缓慢', woundInfect: '严重', starterPack: false }, cat9: { vehicleAvail: '极低' }, cat10: { moralityLevel: '生存优先', survivalRate: '绝望深渊', violenceLevel: '适中', languageLevel: '轻微', humanityDecay: '缓慢', survivalOutlook: '复杂', trustLevel: '较低' } },
                        iceage: { cat1: { dayLenSec: 86400, waterStopMode: '固定天数', powerStopMode: '固定天数', foodRotSpeed: '缓慢', itemRefresh: '较短' }, cat2: { baseTemp: -40, rainFreq: '极少', snowOn: true, fogIntensity: '轻微', forageAmt: '稀缺' }, cat3: { eventFreq: '较少', survivorProb: '极低', sleepEvent: true }, cat4: { corpseInfect: '无', noiseFromCorpse: false }, cat5: { lootFood: '极少', lootMedical: '极少', lootWeapon: '较少', lootAmmo: '极少', lootSurvival: '较少', lootMech: '较少' }, cat6: { zSpeed: '蹒跚', zStrength: '强壮', infectMode: '无感染', zVision: '普通', zHearing: '普通', zActiveMode: '夜间' }, cat7: { zTotalMult: '稀少' }, cat8: { hungerRate: '快速', fatigueRate: '快速', staminaRecover: '缓慢', woundInfect: '无', starterPack: true }, cat9: { vehicleAvail: '极低' }, cat10: { moralityLevel: '生存优先', survivalRate: '绝望深渊', violenceLevel: '低', languageLevel: '轻微', humanityDecay: '缓慢', survivalOutlook: '务实', trustLevel: '较低' } },
                        mutant: { cat1: { dayLenSec: 43200, waterStopMode: '随机', powerStopMode: '随机', foodRotSpeed: '正常', itemRefresh: '正常' }, cat2: { baseTemp: 20, rainFreq: '频繁', snowOn: false, fogIntensity: '浓雾', forageAmt: '丰富' }, cat3: { eventFreq: '频繁', survivorProb: '适中', sleepEvent: true }, cat4: { corpseInfect: '高', noiseFromCorpse: true }, cat5: { lootFood: '适中', lootMedical: '适中', lootWeapon: '适中', lootAmmo: '较少', lootSurvival: '适中', lootMech: '适中' }, cat6: { zSpeed: '奔跑', zStrength: '极端', infectMode: '空气传播', zVision: '锐利', zHearing: '敏锐', zActiveMode: '全天' }, cat7: { zTotalMult: '密集' }, cat8: { hungerRate: '正常', fatigueRate: '正常', staminaRecover: '正常', woundInfect: '严重', starterPack: true }, cat9: { vehicleAvail: '适中' }, cat10: { moralityLevel: '道德相对', survivalRate: '灰暗艰难', violenceLevel: '高', languageLevel: '适中', humanityDecay: '正常', survivalOutlook: '复杂', trustLevel: '较低' } },
                        depression: { cat1: { dayLenSec: 43200, waterStopMode: '固定天数', powerStopMode: '固定天数', foodRotSpeed: '正常', itemRefresh: '正常' }, cat2: { baseTemp: 12, rainFreq: '适中', snowOn: false, fogIntensity: '中等', forageAmt: '适中' }, cat3: { eventFreq: '频繁', survivorProb: '适中', sleepEvent: true }, cat4: { corpseInfect: '低', noiseFromCorpse: true }, cat5: { lootFood: '适中', lootMedical: '适中', lootWeapon: '适中', lootAmmo: '较少', lootSurvival: '适中', lootMech: '适中' }, cat6: { zSpeed: '蹒跚', zStrength: '普通', infectMode: '无感染', zVision: '普通', zHearing: '普通', zActiveMode: '全天' }, cat7: { zTotalMult: '稀少' }, cat8: { hungerRate: '正常', fatigueRate: '正常', staminaRecover: '正常', woundInfect: '轻微', starterPack: true }, cat9: { vehicleAvail: '适中' }, cat10: { moralityLevel: '无底线', survivalRate: '灰暗艰难', violenceLevel: '高', languageLevel: '强烈', humanityDecay: '快速', survivalOutlook: '绝望', trustLevel: '极低' } }
                    };
                    const sbxPreset = sbxPresets[b.dataset.preset];
                    if (sbxPreset) {
                        const curSbx = gsbx();
                        Object.keys(sbxPreset).forEach(catK => {
                            Object.keys(sbxPreset[catK]).forEach(fk => {
                                if (curSbx[catK] && curSbx[catK].fields && curSbx[catK].fields[fk]) {
                                    curSbx[catK].fields[fk].val = sbxPreset[catK][fk];
                                }
                            });
                        });
                        ssbx(curSbx);
                    }
                }
            });
            document.querySelectorAll('.tab-btn').forEach(b => b.addEventListener('click', function() {
                document.querySelectorAll('.tab-btn').forEach(x => x.classList.remove('active'));
                this.classList.add('active');
                document.querySelectorAll('.tab-content').forEach(x => x.classList.remove('active'));
                $(this.dataset.tab).classList.add('active');
            }));
            document.addEventListener('keydown', e => {
                if (e.key === 'Escape') {
                    document.querySelectorAll('.modal-overlay').forEach(m => { if (m.style.display === 'flex') m.style.display = 'none'; });
                    if ($('sidePanel').classList.contains('open')) { $('sidePanel').classList.remove('open'); $('sideOverlay').classList.remove('show'); }
                }
            });

            // Stop idle when page unload
            window.addEventListener('beforeunload', () => {
                stopIdle();
                // 最后一次强制保存所有关键状态（防止异步save未完成）
                try {
                    if (hist && hist.length) svh(hist);
                    if (sta) sst(sta);
                    if (chr) sch(chr);
                    if (clk) sclk(clk);
                    if (typeof gsv === 'function' && typeof ssv === 'function') {
                        // 同步auto-save slot
                        try {
                            const cs = gsv() || {};
                            const cc = cfg();
                            let cleanCfg = {};
                            for (const [k, v] of Object.entries(cc)) {
                                if (typeof v === 'string' && /api.*key|sk-/i.test(k) && (!v || v.length < 4)) continue;
                                try { cleanCfg[k] = JSON.parse(JSON.stringify(v)); } catch { cleanCfg[k] = v; }
                            }
                            cs['auto'] = { hi: JSON.parse(JSON.stringify(hist)), st: JSON.parse(JSON.stringify(gst())), ch: JSON.parse(JSON.stringify(gch())), clk: JSON.parse(JSON.stringify(gclk())), sbx: JSON.parse(JSON.stringify(gsbx())), cfg: cleanCfg, tm: Date.now() };
                            ssv(cs);
                        } catch(e) {}
                    }
                } catch(e) {}
            });

            window.addEventListener('error', function(ev) {
                try {
                    if (typeof busy !== 'undefined' && busy) {
                        busy = false;
                        if ($('btnSend')) $('btnSend').disabled = idleLocked || false;
                        if ($('inputText')) $('inputText').classList.remove('busy');
                    }
                    if (typeof snotifyEndBatch === 'function') snotifyEndBatch();
                    if (typeof snotify === 'function') snotify('danger', '运行时错误', (ev.message || '未知错误').slice(0, 40));
                } catch(e) {}
                console.warn('[GlobalError]', ev.message, 'at', ev.filename, ev.lineno);
            }, true);


            // ========== 把核心函数暴露到 window（供 gamesystems.js / proxycfg.js 跨文件调用）==========
            Object.assign(window, {
                // $, K: 不暴露内部$避免冲突，保留各自版本
                // 配置/读写
                ld, sv, cfg, scf, ccb,
                // 角色/状态/沙盒/时钟 读写
                gst, sst, gch, sch, gclk, sclk, gsbx, ssbx, mergeSbx, migrateSta, migrateChr, migrateCfg,
                // 存档/历史
                gsv, ssv, gsp, ldh, svh, _getHist: () => hist, _setHist: (h) => { hist = h; svh(h); },
                _getSbx: () => sbx, _setSbx: (s) => { sbx = s; ssbx(s); },
                // 渲染/UI
                upui, abold, stg, rbt, mds, pai, buildInvAndEquipFromItems, getItemInfo, getItemBaseName,
                renderSandbox, fillCharModal, aiInitStats,
                // 挂机
                startIdle, stopIdle,
                // 状态/物品
                spBar, mentalityLabel, itemEmoji, fmtTime, dayPhase,
                seasonFromDay, randWeather, randTemp,
                // 核心 hin 循环
                hin,
                // 样式
                ath, afs,
                // 状态
                hasHover
            });
            window.BGM = window.BGM || BGM(); // audio.js 已定义，兜底
            window.snotify = snotify; // 侧边通知（在这个文件定义）
            window._triggerRandomEvent = () => triggerRandomEvent();
            window._checkSeasonalEvent = () => checkSeasonalEvent();
            window._checkForRandomEvent = (t) => checkForRandomEvent(t);
            window._applyStatusEffect = (e,d,s) => applyStatusEffect(e,d,s);
            window._tickStatusEffects = () => tickStatusEffects();
            window._addKeyMemory = (t,ty) => addKeyMemory(t,ty);
            window._addLogEntry = (t,txt,cid) => addLogEntry(t,txt,cid);
            window._checkAchievements = () => checkAchievements();
            window._renderAchievementsPanel = () => renderAchievementsPanel();
            window._renderEventsPanel = () => renderEventsPanel();

            // ===== Init =====
            (function() {
                if (!document.getElementById('emojiFallbackStyle_inline')) {
                    const st3 = document.createElement('style');
                    st3.id = 'emojiFallbackStyle_inline';
                    st3.textContent = [
                        '.emoji-icon { display:inline-block; min-width:1.1em; text-align:center; font-style:normal; }',
                        '@supports not (font-variant-emoji: text) {',
                        '  .emoji-icon { font-family: "Segoe UI Emoji","Noto Color Emoji","Apple Color Emoji",sans-serif; }',
                        '}',
                        '.equip-slot__icon, .slot-sel-grid .equip-slot__icon {',
                        '  display:inline-block; width:1.1em; text-align:center; margin-right:2px;',
                        '  font-family:"Segoe UI Emoji","Noto Color Emoji","Apple Color Emoji",sans-serif;',
                        '}'
                    ].join('\n');
                    document.head.appendChild(st3);
                }
                ath(localStorage.getItem(K.THM) || 'light');
                afs(cfg().fsz);
                // CRITICAL: Snapshot the API key from localStorage BEFORE any save-loading might interfere
                const _savedCfgRaw = localStorage.getItem(K.CFG);
                let _persistedKey = '';
                try { const _p = JSON.parse(_savedCfgRaw); if (_p && _p.key) _persistedKey = _p.key; } catch {}
                hist = ldh();
                contextSummary = ld(K.SUM, '');
                chr = gch();
                sta = gst();
                clk = gclk();
                sbx = gsbx();
                // Merge new fields
                const c = gch();
                let needsMerge = false;
                ['geo','loc','weather','hist','res','danger','survival','hand','bt2','pers','app','skl','lang','bg','mental','fear','hiddenPresets','morality','map','extraFeature','abilityName','abilityDesc','abilityPreset'].forEach(k => {
                    if (c[k] === undefined) { c[k] = DCHR[k]; needsMerge = true; }
                });
                if (needsMerge) sch(c);
                const st = gst();
                let stMerge = false;
                ['bodyTemp','status','vehicle','mapUnlock','mentality','spirit','joy','pleasureUnlocked','actionBar','location','traits','equip','ability','abilityLevel'].forEach(k => {
                    if (st[k] === undefined) { st[k] = DSTA[k]; stMerge = true; }
                });
                if (stMerge) sst(st);
                
                // ===== Config init: load, merge missing fields, NEVER clear key =====
                const cf = cfg();
                let cfgChanged = false;
                if (cf.prompt === undefined) { cf.prompt = DPROMPT; cfgChanged = true; }
                if (cf.idleInt === undefined || cf.idleInt < 5) { cf.idleInt = 60; cfgChanged = true; }
                if (cf.worldLock === undefined) { cf.worldLock = false; cfgChanged = true; }
                if (cf.debug === undefined) { cf.debug = false; cfgChanged = true; }
                // CRITICAL: Never auto-start idle on page load
                // User must explicitly click the idle button; reset the flag
                if (cf.idleOn === true) { cf.idleOn = false; cfgChanged = true; }
                if (cfgChanged) scf(cf);

                // Merge sandbox categories and fields (ensure all 10 categories exist with their default fields)
                {
                    const sbxCur = gsbx();
                    let sbxChanged = false;
                    const before = JSON.stringify(sbxCur);
                    mergeSbx(sbxCur);
                    if (JSON.stringify(sbxCur) !== before) { ssbx(sbxCur); }
                }

                // ===== Auto-load last save silently =====
                const svs = gsv();
                const lastSlot = cf.lastSlot || 'auto';
                let autoData = svs['auto'] || svs[lastSlot];
                // If no auto save found, try to find most recent save slot with data
                if (!autoData || !autoData.hi || !autoData.hi.length) {
                    let bestSlot = null, bestTm = 0;
                    Object.keys(svs).forEach(k => {
                        const slot = svs[k];
                        if (slot && slot.hi && slot.hi.length && (slot.tm || 0) > bestTm) {
                            bestSlot = k;
                            bestTm = slot.tm || 0;
                        }
                    });
                    if (bestSlot) autoData = svs[bestSlot];
                }
                let loadedFromSave = false;
                if (autoData && autoData.hi && autoData.hi.length) {
                    const r = validateSaveData(autoData, false);
                    hist = r.recovered.hi.slice();
                    sst(r.recovered.st);
                    sch(r.recovered.ch);
                    sclk(r.recovered.clk);
                    if (r.recovered.sbx) { sbx = mergeSbx(r.recovered.sbx); ssbx(sbx); }
                    if (r.recovered.cfg) {
                        const curCfg = cfg();
                        const merged = { ...curCfg };
                        Object.keys(r.recovered.cfg).forEach(k => {
                            const sv = r.recovered.cfg[k];
                            const cv = curCfg[k];
                            if (sv === '' || sv === null || sv === undefined) return;
                            if (cv === '' || cv === null || cv === undefined) {
                                merged[k] = sv;
                            }
                        });
                        if (!merged.key && curCfg.key) merged.key = curCfg.key;
                        if (!merged.key && _persistedKey) merged.key = _persistedKey;
                        scf(merged);
                    }
                    if (r.errs.length > 0) {
                        tst('存档部分字段缺失，已自动修复。建议导出新备份。', 'warn');
                    }
                    loadedFromSave = true;
                }

                // ===== ULTIMATE API KEY PROTECTION =====
                // After all save-loading is done, check if the key was lost and restore it
                {
                    const _finalCfg = cfg();
                    if (!_finalCfg.key && _persistedKey) {
                        _finalCfg.key = _persistedKey;
                        scf(_finalCfg);
                    }
                }

                // ===== DO NOT auto-start idle on page load =====
                // User must explicitly click the idle button to start idle mode
                // This prevents the character from "擅自进行互动" on refresh
                upWelcome();
                upui();
                startClock();

                // ===== Priority: API key first → save → character creation =====
                const finalCfg = cfg();
                const chrData = gch();

                if (!finalCfg.key) {
                    // Step 1: No API key - show welcome modal for configuration, UNCONDITIONALLY 回填所有字段
                    if ($('welEndpointPreset')) {
                        $('welEndpointPreset').value = finalCfg.preset || 'openai';
                        // 触发 change 事件以刷新 welModelSelect 选项
                        try { $('welEndpointPreset').dispatchEvent(new Event('change', {bubbles:false})); } catch {}
                    }
                    $('welEndpoint').value = finalCfg.ep || '';
                    const sl = $('welModelSelect');
                    if (finalCfg.model && sl) {
                        const hasOpt = [...sl.options].some(o => o.value === finalCfg.model);
                        if (hasOpt) sl.value = finalCfg.model;
                        else { $('welModel').value = finalCfg.model; sl.style.display='none'; $('welModel').style.display=''; }
                    } else if (finalCfg.model) {
                        $('welModel').value = finalCfg.model;
                    }
                    $('welKey').value = finalCfg.key || '';
                    $('welcomeModal').style.display = 'flex';
                } else if (loadedFromSave) {
                    // Step 2: Has API key + loaded from save - restore silently
                    rbt();
                    // Humanized feedback: show the save time if available
                    const saveTime = autoData.tm ? new Date(autoData.tm).toLocaleString() : '';
                    tst(saveTime ? '已读取上次存档（' + saveTime + '）' : '已读取上次存档');
                } else if (hasCustomCharacter()) {
                    // Step 3: Has API key + has custom character (no save) - continue with existing character
                    $('chatEmpty').style.display = 'flex';
                    tst('欢迎回来，' + (chrData.cn || '幸存者') + '。继续你的旅程…');
                } else {
                    // Step 4: Has API key + no custom character - create new character
                    $('chatEmpty').style.display = 'flex';
                    fillCharModal();
                    $('charModal').style.display = 'flex';
                    tst('请创建你的角色');
                }
                // Only auto-focus input if no modal is covering the screen
                const wm = $('welcomeModal'), cm = $('charModal');
                const wmHidden = !wm || wm.style.display === 'none' || !wm.style.display;
                const cmHidden = !cm || cm.style.display === 'none' || !cm.style.display;
                if (wmHidden && cmHidden && !isMobile()) {
                    setTimeout(() => $('inputText').focus(), 100);
                }
                // Show tutorial on first launch
                if (!localStorage.getItem('vn_tutorial')) {
                    setTimeout(() => launchTutorial(), 800);
                }
                // ===== BGM: 首次用户交互后启动，遵循浏览器自动播放策略 =====
                const _bgmState = BGM();
                if (_bgmState.enabled) {
                    const startBgmOnce = () => {
                        document.removeEventListener('click', startBgmOnce);
                        document.removeEventListener('keydown', startBgmOnce);
                        document.removeEventListener('touchstart', startBgmOnce);
                        bgmInit();
                        // 游戏初始默认营地背景音
                        const __bgm = BGM();
                        __bgm._currentCategory = 'camp';
                        __bgm._currentFile = 'bgm_camp1.mp3';
                        bgmPlay('bgm_camp1.mp3');
                        const _s = gst(), _c = gch(), _clk = gclk();
                        bgmAutoSwitch({
                            location: _c.sp || _c.location || '',
                            season: _clk && _clk.season,
                            weather: _clk && _clk.weather,
                            mentality: _c.mental || '',
                            hp: _s.hp,
                            fatigue: _s.fatigue
                        });
                    };
                    document.addEventListener('click', startBgmOnce);
                    document.addEventListener('keydown', startBgmOnce);
                    document.addEventListener('touchstart', startBgmOnce);
                }
                // ===== Safety: auto-save before page unload (prevents data loss on refresh/close) =====
                // Use window.xxx to ensure cross-scope access (inner IIFE → outer IIFE → window)
                window.addEventListener('beforeunload', () => {
                    try {
                        const _gsv = window.gsv, _cfg = window.cfg, _gst = window.gst, _gch = window.gch;
                        const _gclk = window.gclk, _gsbx = window.gsbx, _ssv = window.ssv;
                        const _hist = window._getHist ? window._getHist() : [];
                        if (_hist.length > 0 && _gsv) {
                            const curSvs = _gsv();
                            const curCfg = _cfg();
                            const cleanCfg = {};
                            Object.keys(curCfg).forEach(k => {
                                const v = curCfg[k];
                                if (v === '' || v === null || v === undefined) return;
                                cleanCfg[k] = JSON.parse(JSON.stringify(v));
                            });
                            curSvs['auto'] = {
                                hi: JSON.parse(JSON.stringify(_hist)),
                                st: JSON.parse(JSON.stringify(_gst())),
                                ch: JSON.parse(JSON.stringify(_gch())),
                                clk: JSON.parse(JSON.stringify(_gclk())),
                                sbx: JSON.parse(JSON.stringify(_gsbx())),
                                cfg: cleanCfg,
                                tm: Date.now()
                            };
                            _ssv(curSvs);
                        }
                    } catch {}
                });
                // 启动恢复: 刷新页面前未消费的通知队列
                try {
                    const raw = sessionStorage.getItem('vn_notifyQueue');
                    if (raw) {
                        const arr = JSON.parse(raw);
                        if (Array.isArray(arr) && arr.length) {
                            notifyQueue = notifyQueue.concat(arr.filter(x => x && x.type));
                            if (notifyQueue.length && !notifyBusy) processNotifyQueue();
                            sessionStorage.removeItem('vn_notifyQueue');
                        }
                    }
                } catch(e) {}
            })();
        })();


