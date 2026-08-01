/**
 * 成就系统数据文件
 * --------------------------------------------------------------------------
 * 本文件存放所有成就的定义与判定逻辑，独立于 main.js 主逻辑。
 * 数据通过 window.ACHIEVEMENTS 全局暴露，main.js 启动时读取。
 *
 * 数据结构说明：
 *   ACHIEVEMENTS[i] = {
 *     id:    成就唯一标识
 *     name:  成就名称
 *     desc:  成就描述
 *     icon:  显示图标
 *     check: 判定函数，返回 true 时解锁。依赖 window.gst() / window.gclk()
 *   }
 *
 * 新增成就时直接在此追加即可，无需改动 main.js 业务代码。
 * --------------------------------------------------------------------------
 */
(function () {
    'use strict';

    const ACHIEVEMENTS = [
        // ===== 战斗成就 =====
        { id: 'first_blood', name: '初露锋芒', desc: '首次击倒敌人', icon: '⚔️', check: () => { const s = window.gst(); return s && s.totalKills >= 1; } },
        { id: 'badass', name: '狠角色', desc: '击杀10名敌人', icon: '💀', check: () => { const s = window.gst(); return s && (s.totalKills || 0) >= 10; } },
        { id: 'slayer', name: '屠尸者', desc: '击杀50名敌人', icon: '🗡️', check: () => { const s = window.gst(); return s && (s.totalKills || 0) >= 50; } },
        { id: 'exterminator', name: '终结者', desc: '击杀100名敌人', icon: '☠️', check: () => { const s = window.gst(); return s && (s.totalKills || 0) >= 100; } },
        { id: 'legendary_slayer', name: '传奇猎手', desc: '击杀200名敌人', icon: '🏹', check: () => { const s = window.gst(); return s && (s.totalKills || 0) >= 200; } },
        { id: 'headshot', name: '神射手', desc: '10次爆头击杀', icon: '🎯', check: () => { const s = window.gst(); return s && (s.headshots || 0) >= 10; } },
        { id: 'combat_survivor', name: '战斗生还者', desc: '在低于20HP时战胜敌人', icon: '🛡️', check: () => { const s = window.gst(); return s && (s.lowHpWins || 0) >= 1; } },

        // ===== 生存成就 =====
        { id: 'survivor_3', name: '三日幸存者', desc: '存活3天', icon: '🌅', check: () => { const c = window.gclk(); return c && c.day >= 3; } },
        { id: 'survivor_7', name: '一周幸存者', desc: '存活7天', icon: '🏆', check: () => { const c = window.gclk(); return c && c.day >= 7; } },
        { id: 'survivor_30', name: '月度幸存者', desc: '存活30天', icon: '👑', check: () => { const c = window.gclk(); return c && c.day >= 30; } },
        { id: 'survivor_100', name: '百日传说', desc: '存活100天', icon: '🌟', check: () => { const c = window.gclk(); return c && c.day >= 100; } },
        { id: 'hardcore', name: '硬核玩家', desc: '存活5天且从未感染', icon: '🔥', check: () => { const s = window.gst(); const c = window.gclk(); return s && (s.infection || 0) === 0 && c && c.day >= 5; } },
        { id: 'untouchable', name: '无伤战神', desc: '存活10天且从未重伤', icon: '💎', check: () => { const s = window.gst(); const c = window.gclk(); return s && (s.totalDamageTaken || 0) < 50 && c && c.day >= 10; } },
        { id: 'night_owl', name: '夜行者', desc: '在夜间存活5天', icon: '🌙', check: () => { const s = window.gst(); return s && (s.nightSurvived || 0) >= 5; } },
        { id: 'dawn_watcher', name: '守夜人', desc: '在夜间存活15天', icon: '🌌', check: () => { const s = window.gst(); return s && (s.nightSurvived || 0) >= 15; } },
        { id: 'weather_warrior', name: '天气斗士', desc: '在暴雨中生存超过2小时', icon: '🌧️', check: () => { const s = window.gst(); return s && (s.rainSurvived || 0) >= 2; } },
        { id: 'frost_resistant', name: '耐寒者', desc: '在暴风雪中存活', icon: '❄️', check: () => { const s = window.gst(); return s && s.snowSurvived; } },

        // ===== 收集/制造成就 =====
        { id: 'first_craft', name: '手艺初成', desc: '首次成功合成', icon: '🔨', check: () => { const s = window.gst(); return s && (s.crafts || 0) >= 1; } },
        { id: 'craft_master', name: '制造大师', desc: '累计合成10件物品', icon: '⚒️', check: () => { const s = window.gst(); return s && (s.crafts || 0) >= 10; } },
        { id: 'craft_legend', name: '传奇工匠', desc: '累计合成50件物品', icon: '🏭', check: () => { const s = window.gst(); return s && (s.crafts || 0) >= 50; } },
        { id: 'collector', name: '收藏家', desc: '收集20种不同物品', icon: '📦', check: () => { const s = window.gst(); return s && new Set((s.inv || []).map(i => i.replace(/\s*(x\d+|\d+\.?\d*\s*[kKmMgGlL升克千克]?)$/i, '').trim())).size >= 20; } },
        { id: 'hoarder', name: '囤积狂', desc: '收集50种不同物品', icon: '🎒', check: () => { const s = window.gst(); return s && new Set((s.inv || []).map(i => i.replace(/\s*(x\d+|\d+\.?\d*\s*[kKmMgGlL升克千克]?)$/i, '').trim())).size >= 50; } },
        { id: 'museum', name: '博物馆馆长', desc: '收集80种不同物品', icon: '🏛️', check: () => { const s = window.gst(); return s && new Set((s.inv || []).map(i => i.replace(/\s*(x\d+|\d+\.?\d*\s*[kKmMgGlL升克千克]?)$/i, '').trim())).size >= 80; } },
        { id: 'gear_head', name: '装备达人', desc: '同时装备4件物品', icon: '🛡️', check: () => { const s = window.gst(); const eq = s && s.equip; if (!eq) return false; return Object.values(eq).filter(v => v && v.trim()).length >= 4; } },
        { id: 'fully_geared', name: '全副武装', desc: '同时装备6件物品', icon: '🦾', check: () => { const s = window.gst(); const eq = s && s.equip; if (!eq) return false; return Object.values(eq).filter(v => v && v.trim()).length >= 6; } },
        { id: 'weapon_enthusiast', name: '武器爱好者', desc: '拥有5种不同武器', icon: '🔫', check: () => { const s = window.gst(); const inv = (s && s.inv) || []; const weapons = new Set(); inv.forEach(i => { const name = i.replace(/\s*x\d+$/i, '').trim(); if (/枪|刀|斧|弓|弩|剑|锤|棍|棒|矛|炮|刃/.test(name)) weapons.add(name); }); return weapons.size >= 5; } },
        { id: 'armor_collector', name: '盔甲收藏家', desc: '拥有5件不同防具', icon: '🥋', check: () => { const s = window.gst(); const inv = (s && s.inv) || []; const armors = new Set(); inv.forEach(i => { const name = i.replace(/\s*x\d+$/i, '').trim(); if (/甲|帽|靴|套|衣|服|盾|盔|披/.test(name)) armors.add(name); }); return armors.size >= 5; } },

        // ===== 探索成就 =====
        { id: 'explorer', name: '探索者', desc: '解锁10个地点', icon: '🗺️', check: () => { const s = window.gst(); return s && (s.mapUnlock || []).length >= 10; } },
        { id: 'navigator', name: '导航员', desc: '解锁20个地点', icon: '🧭', check: () => { const s = window.gst(); return s && (s.mapUnlock || []).length >= 20; } },
        { id: 'cartographer', name: '制图师', desc: '解锁30个地点', icon: '📜', check: () => { const s = window.gst(); return s && (s.mapUnlock || []).length >= 30; } },
        { id: 'urban_explorer', name: '都市探索者', desc: '搜索50次物资', icon: '🏙️', check: () => { const s = window.gst(); return s && (s.searchCount || 0) >= 50; } },
        { id: 'clue_master', name: '线索大师', desc: '收集10条线索', icon: '🔍', check: () => { const s = window.gst(); return s && (s.clues || []).length >= 10; } },
        { id: 'truth_seeker', name: '真相追寻者', desc: '收集30条线索', icon: '🕵️', check: () => { const s = window.gst(); return s && (s.clues || []).length >= 30; } },

        // ===== 社交成就 =====
        { id: 'peacemaker', name: '调解者', desc: '建立2个以上NPC的信任关系', icon: '🤝', check: () => { const s = window.gst(); const rels = (s && s.npcRel) || {}; return Object.values(rels).filter(r => r && r.trust >= 50).length >= 2; } },
        { id: 'social_butterfly', name: '社交达人', desc: '与5个以上NPC建立关系', icon: '💬', check: () => { const s = window.gst(); const rels = (s && s.npcRel) || {}; return Object.keys(rels).length >= 5; } },
        { id: 'diplomat', name: '外交官', desc: '与10个NPC建立关系', icon: '🌐', check: () => { const s = window.gst(); const rels = (s && s.npcRel) || {}; return Object.keys(rels).length >= 10; } },
        { id: 'trustworthy', name: '值得信赖', desc: '获得3个NPC的完全信任', icon: '💖', check: () => { const s = window.gst(); const rels = (s && s.npcRel) || {}; return Object.values(rels).filter(r => r && r.trust >= 80).length >= 3; } },
        { id: 'rebel', name: '叛逆者', desc: '与3个NPC关系破裂', icon: '💔', check: () => { const s = window.gst(); const rels = (s && s.npcRel) || {}; return Object.values(rels).filter(r => r && r.trust <= 0).length >= 3; } },
        { id: 'leader', name: '领袖', desc: '成为5个NPC的领导者', icon: '👑', check: () => { const s = window.gst(); const rels = (s && s.npcRel) || {}; return Object.values(rels).filter(r => r && r.role === 'leader').length >= 5; } },

        // ===== 特殊成就 =====
        { id: 'bookworm', name: '书虫', desc: '收藏5条重要记录', icon: '📖', check: () => { const s = window.gst(); return s && (s.bookmarks || []).length >= 5; } },
        { id: 'medic', name: '战地医生', desc: '治愈3次受伤状态', icon: '💊', check: () => { const s = window.gst(); return s && (s.healCount || 0) >= 3; } },
        { id: 'senior_medic', name: '名医', desc: '治愈15次受伤状态', icon: '⚕️', check: () => { const s = window.gst(); return s && (s.healCount || 0) >= 15; } },
        { id: 'vehicle_master', name: '车手', desc: '获得载具', icon: '🚗', check: () => { const s = window.gst(); return s && s.vehicle && s.vehicle !== '无'; } },
        { id: 'mechanic', name: '机械师', desc: '拥有2辆可用载具', icon: '🔧', check: () => { const s = window.gst(); return s && (s.vehicleCount || 0) >= 2; } },
        { id: 'first_aid', name: '急救员', desc: '使用10次医疗物品', icon: '🩹', check: () => { const s = window.gst(); return s && (s.medicineUsed || 0) >= 10; } },
        { id: 'survivor_naturalist', name: '博物学家', desc: '识别5种不同的植物', icon: '🌿', check: () => { const s = window.gst(); return s && (s.plantsFound || 0) >= 5; } },
        { id: 'hunter', name: '猎人', desc: '成功狩猎5次', icon: '🦌', check: () => { const s = window.gst(); return s && (s.huntCount || 0) >= 5; } },
        { id: 'fisher', name: '渔夫', desc: '成功钓鱼5次', icon: '🎣', check: () => { const s = window.gst(); return s && (s.fishCount || 0) >= 5; } },
        { id: 'gardener', name: '园艺师', desc: '种植5种作物', icon: '🌱', check: () => { const s = window.gst(); return s && (s.cropsGrown || 0) >= 5; } },
        { id: 'scavenger', name: '拾荒者', desc: '拾取100件物资', icon: '📥', check: () => { const s = window.gst(); return s && (s.itemsPickedUp || 0) >= 100; } },
        { id: 'salvage_king', name: '拾荒之王', desc: '拾取500件物资', icon: '👑', check: () => { const s = window.gst(); return s && (s.itemsPickedUp || 0) >= 500; } },
        { id: 'fast_learner', name: '敏捷学者', desc: '学会3种技能', icon: '📚', check: () => { const s = window.gst(); const skills = s && s.skills ? Object.keys(s.skills) : []; return skills.length >= 3; } },
        { id: 'polyglot', name: '多面手', desc: '学会8种技能', icon: '🎓', check: () => { const s = window.gst(); const skills = s && s.skills ? Object.keys(s.skills) : []; return skills.length >= 8; } },
        { id: 'wealthy', name: '小富翁', desc: '累计拥有1000货币', icon: '💰', check: () => { const s = window.gst(); return s && (s.money || 0) >= 1000; } },
        { id: 'tycoon', name: '大富翁', desc: '累计拥有10000货币', icon: '💎', check: () => { const s = window.gst(); return s && (s.money || 0) >= 10000; } },

        // ===== 隐藏/特殊成就 =====
        { id: 'pacifist', name: '和平主义者', desc: '存活10天且零击杀', icon: '🕊️', check: () => { const s = window.gst(); const c = window.gclk(); return s && (s.totalKills || 0) === 0 && c && c.day >= 10; } },
        { id: 'speed_runner', name: '速通玩家', desc: '3天内通关', icon: '⚡', check: () => { const s = window.gst(); return s && s.endingReached && (s.endingDay || 999) <= 3; } },
        { id: 'no_death_run', name: '不死鸟', desc: '完成游戏且从未死亡', icon: '🔥', check: () => { const s = window.gst(); return s && s.endingReached && (s.deaths || 0) === 0; } },
        { id: 'completionist', name: '完美主义', desc: '解锁所有其他成就', icon: '🏆', check: () => {
            const unlocked = window._unlockedAchievements || new Set();
            const baseIds = ['first_blood', 'survivor_3', 'first_craft', 'collector', 'explorer', 'peacemaker', 'badass', 'hardcore', 'gear_head', 'night_owl', 'clue_master', 'medic', 'vehicle_master'];
            return baseIds.every(id => unlocked.has(id));
        } },
        { id: 'eagle_eye', name: '鹰眼', desc: '发现隐藏区域', icon: '🦅', check: () => { const s = window.gst(); return s && s.secretsFound && s.secretsFound.length >= 1; } },
        { id: 'treasure_hunter', name: '宝藏猎人', desc: '发现5处隐藏宝藏', icon: '💝', check: () => { const s = window.gst(); return s && s.treasuresFound && s.treasuresFound.length >= 5; } },
        { id: 'craft_explorer', name: '工艺探索者', desc: '解锁10种配方', icon: '🧪', check: () => { const s = window.gst(); return s && (s.recipesUnlocked || 0) >= 10; } },
        { id: 'weapon_master', name: '武器大师', desc: '精通5种武器使用', icon: '⚔️', check: () => { const s = window.gst(); const wmastered = s && s.weaponsMastered ? Object.keys(s.weaponsMastered) : []; return wmastered.length >= 5; } },
        { id: 'iron_will', name: '钢铁意志', desc: '精神值保持在80以上超过3天', icon: '💪', check: () => { const s = window.gst(); return s && (s.ironWillDays || 0) >= 3; } },
        { id: 'clean_hand', name: '双手不沾血', desc: '通过非暴力手段解决冲突', icon: '🤲', check: () => { const s = window.gst(); return s && (s.nonViolentSolves || 0) >= 3; } },
        { id: 'forager', name: '觅食者', desc: '采集20次野生资源', icon: '🌾', check: () => { const s = window.gst(); return s && (s.forageCount || 0) >= 20; } },
        { id: 'survival_teacher', name: '生存导师', desc: '指导新人5次', icon: '👨‍🏫', check: () => { const s = window.gst(); return s && (s.taughtCount || 0) >= 5; } },
        { id: 'endurance_runner', name: '耐力跑者', desc: '一次性移动超过10公里', icon: '🏃', check: () => { const s = window.gst(); return s && (s.maxDistance || 0) >= 10000; } },
        { id: 'stealth_master', name: '潜行大师', desc: '潜行通过10次敌人区域', icon: '👤', check: () => { const s = window.gst(); return s && (s.stealthSuccess || 0) >= 10; } }
    ];

    // 暴露到全局
    window.ACHIEVEMENTS = ACHIEVEMENTS;
})();