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
        { id: 'first_blood', name: '初露锋芒', desc: '首次击倒敌人', icon: '⚔️', check: () => { const s = window.gst(); return s && s.totalKills >= 1; } },
        { id: 'survivor_3', name: '三日幸存者', desc: '存活3天', icon: '🌅', check: () => { const c = window.gclk(); return c && c.day >= 3; } },
        { id: 'survivor_7', name: '一周幸存者', desc: '存活7天', icon: '🏆', check: () => { const c = window.gclk(); return c && c.day >= 7; } },
        { id: 'survivor_30', name: '月度幸存者', desc: '存活30天', icon: '👑', check: () => { const c = window.gclk(); return c && c.day >= 30; } },
        { id: 'survivor_100', name: '百日传说', desc: '存活100天', icon: '🌟', check: () => { const c = window.gclk(); return c && c.day >= 100; } },
        { id: 'first_craft', name: '手艺初成', desc: '首次成功合成', icon: '🔨', check: () => { const s = window.gst(); return s && (s.crafts || 0) >= 1; } },
        { id: 'craft_master', name: '制造大师', desc: '累计合成10件物品', icon: '⚒️', check: () => { const s = window.gst(); return s && (s.crafts || 0) >= 10; } },
        { id: 'collector', name: '收藏家', desc: '收集20种不同物品', icon: '📦', check: () => { const s = window.gst(); return s && new Set((s.inv || []).map(i => i.replace(/\s*(x\d+|\d+\.?\d*\s*[kKmMgGlL升克千克]?)$/i, '').trim())).size >= 20; } },
        { id: 'hoarder', name: '囤积狂', desc: '收集50种不同物品', icon: '🎒', check: () => { const s = window.gst(); return s && new Set((s.inv || []).map(i => i.replace(/\s*(x\d+|\d+\.?\d*\s*[kKmMgGlL升克千克]?)$/i, '').trim())).size >= 50; } },
        { id: 'explorer', name: '探索者', desc: '解锁10个地点', icon: '🗺️', check: () => { const s = window.gst(); return s && (s.mapUnlock || []).length >= 10; } },
        { id: 'navigator', name: '导航员', desc: '解锁20个地点', icon: '🧭', check: () => { const s = window.gst(); return s && (s.mapUnlock || []).length >= 20; } },
        { id: 'peacemaker', name: '调解者', desc: '建立2个以上NPC的信任关系', icon: '🤝', check: () => { const s = window.gst(); const rels = (s && s.npcRel) || {}; return Object.values(rels).filter(r => r && r.trust >= 50).length >= 2; } },
        { id: 'social_butterfly', name: '社交达人', desc: '与5个以上NPC建立关系', icon: '💬', check: () => { const s = window.gst(); const rels = (s && s.npcRel) || {}; return Object.keys(rels).length >= 5; } },
        { id: 'badass', name: '狠角色', desc: '击杀10名敌人', icon: '💀', check: () => { const s = window.gst(); return s && (s.totalKills || 0) >= 10; } },
        { id: 'slayer', name: '屠尸者', desc: '击杀50名敌人', icon: '🗡️', check: () => { const s = window.gst(); return s && (s.totalKills || 0) >= 50; } },
        { id: 'hardcore', name: '硬核玩家', desc: '存活5天且从未感染', icon: '🔥', check: () => { const s = window.gst(); const c = window.gclk(); return s && (s.infection || 0) === 0 && c && c.day >= 5; } },
        { id: 'gear_head', name: '装备达人', desc: '同时装备4件物品', icon: '🛡️', check: () => { const s = window.gst(); const eq = s && s.equip; if (!eq) return false; return Object.values(eq).filter(v => v && v.trim()).length >= 4; } },
        { id: 'fully_geared', name: '全副武装', desc: '同时装备6件物品', icon: '🦾', check: () => { const s = window.gst(); const eq = s && s.equip; if (!eq) return false; return Object.values(eq).filter(v => v && v.trim()).length >= 6; } },
        { id: 'night_owl', name: '夜行者', desc: '在夜间存活5天', icon: '🌙', check: () => { const s = window.gst(); return s && (s.nightSurvived || 0) >= 5; } },
        { id: 'clue_master', name: '线索大师', desc: '收集10条线索', icon: '🔍', check: () => { const s = window.gst(); return s && (s.clues || []).length >= 10; } },
        { id: 'bookworm', name: '收藏家', desc: '收藏5条重要记录', icon: '📖', check: () => { const s = window.gst(); return s && (s.bookmarks || []).length >= 5; } },
        { id: 'medic', name: '战地医生', desc: '治愈3次受伤状态', icon: '💊', check: () => { const s = window.gst(); return s && (s.healCount || 0) >= 3; } },
        { id: 'vehicle_master', name: '车手', desc: '获得载具', icon: '🚗', check: () => { const s = window.gst(); return s && s.vehicle && s.vehicle !== '无'; } }
    ];

    // 暴露到全局
    window.ACHIEVEMENTS = ACHIEVEMENTS;
})();
