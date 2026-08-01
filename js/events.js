/**
 * 突发事件系统数据文件
 * --------------------------------------------------------------------------
 * 本文件存放所有随机突发事件的定义与触发逻辑。
 * 数据通过 window.RANDOM_EVENTS 和 window.EVENT_TRIGGERS 全局暴露。
 *
 * 数据结构说明：
 *   RANDOM_EVENTS[i] = {
 *     id:       事件唯一标识
 *     name:     事件名称
 *     desc:     事件描述
 *     icon:     显示图标
 *     weight:   触发权重
 *     minDay:   最早触发天数
 *     maxDay:   最晚触发天数
 *     category: 事件分类 (danger/info/survival/social/discovery)
 *     trigger:  触发条件函数，返回 true 时可触发。依赖 window.gst() / window.gclk()
 *     execute:  事件执行函数
 *   }
 *
 *   EVENT_TRIGGERS: 定时检查函数集合，定期扫描触发条件。
 *
 * 新增事件时直接在 RANDOM_EVENTS 数组或 EVENT_TRIGGERS 对象中追加即可。
 * --------------------------------------------------------------------------
 */
(function () {
    'use strict';

    const RANDOM_EVENTS = [
        // ===== 危险类事件 =====
        { id: 'zombie_horde', name: '尸群来袭', desc: '一群丧尸正在接近', icon: '🧟', weight: 10, minDay: 2, category: 'danger',
          trigger: () => { const s = window.gst(); return s && s.hp < 70 && Math.random() < 0.15; },
          execute: () => { window.snotify('danger', '危机', '尸群正在逼近！立即寻找掩体或准备战斗！'); } },
        { id: 'bandit_ambush', name: '匪徒伏击', desc: '遭遇匪徒埋伏', icon: '🔫', weight: 6, minDay: 5, category: 'danger',
          trigger: () => { const s = window.gst(); return s && s.money > 200 && Math.random() < 0.08; },
          execute: () => { window.snotify('danger', '袭击', '前方有匪徒设伏，要求交出财物！'); } },
        { id: 'fire_accident', name: '火灾事故', desc: '附近发生火灾', icon: '🔥', weight: 3, minDay: 3, category: 'danger',
          trigger: () => Math.random() < 0.03,
          execute: () => { window.snotify('danger', '灾难', '附近建筑起火，浓烟滚滚，注意安全！'); } },
        { id: 'gas_leak', name: '燃气泄漏', desc: '检测到燃气泄漏', icon: '💨', weight: 2, minDay: 4, category: 'danger',
          trigger: () => Math.random() < 0.02,
          execute: () => { window.snotify('danger', '警告', '检测到燃气泄漏，请立即通风！'); } },
        { id: 'storm_warning', name: '风暴预警', desc: '即将有暴风雨', icon: '⛈️', weight: 5, minDay: 1, category: 'danger',
          trigger: () => { const clk = window.gclk(); return clk && clk.weather === '晴' && Math.random() < 0.06; },
          execute: () => { window.snotify('warn', '天气', '气象预警：暴风雨即将来临，请注意防范！'); } },
        { id: 'sniper_attack', name: '狙击手', desc: '远处传来枪响', icon: '🎯', weight: 3, minDay: 7, category: 'danger',
          trigger: () => { const s = window.gst(); return s && s.hp < 50 && Math.random() < 0.05; },
          execute: () => { window.snotify('danger', '威胁', '远处有狙击手开火！寻找掩体躲避！'); } },

        // ===== 生存类事件 =====
        { id: 'fresh_water', name: '清洁水源', desc: '发现清洁的水源', icon: '💧', weight: 5, minDay: 1, category: 'survival',
          trigger: () => { const s = window.gst(); return s && s.thirst > 60 && Math.random() < 0.12; },
          execute: () => { window.snotify('info', '发现', '你发现了一处清洁水源，补充了水分。'); } },
        { id: 'abandoned_car', name: '废弃车辆', desc: '发现一辆废弃汽车', icon: '🚗', weight: 4, minDay: 3, category: 'survival',
          trigger: () => Math.random() < 0.04,
          execute: () => { window.snotify('info', '发现', '路边有一辆废弃车辆，可能藏有物资。'); } },
        { id: 'supply_drop', name: '空投物资', desc: '军方空投物资', icon: '📦', weight: 1, minDay: 10, category: 'survival',
          trigger: () => { const c = window.gclk(); return c && c.day >= 10 && Math.random() < 0.01; },
          execute: () => { window.snotify('info', '空投', '军方空投物资已到达区域，速速前往拾取！'); } },
        { id: 'wild_herb', name: '野生草药', desc: '发现野生草药', icon: '🌿', weight: 4, minDay: 1, category: 'survival',
          trigger: () => Math.random() < 0.05,
          execute: () => { window.snotify('info', '发现', '你发现了野生草药，可以采摘备用。'); } },
        { id: 'animal_trap', name: '陷阱', desc: '踩到陷阱', icon: '🪤', weight: 2, minDay: 2, category: 'survival',
          trigger: () => Math.random() < 0.025,
          execute: () => { window.snotify('warn', '危险', '你踩到了一个旧陷阱，造成了伤害！'); } },
        { id: 'food_cache', name: '食物储藏', desc: '发现一批罐头', icon: '🥫', weight: 3, minDay: 2, category: 'survival',
          trigger: () => { const s = window.gst(); return s && s.hunger < 40 && Math.random() < 0.08; },
          execute: () => { window.snotify('info', '发现', '你在柜子里发现了一批未过期的罐头！'); } },
        { id: 'old_radio', name: '旧收音机', desc: '捡到旧收音机', icon: '📻', weight: 2, minDay: 3, category: 'survival',
          trigger: () => Math.random() < 0.03,
          execute: () => { window.snotify('info', '发现', '你捡到一台旧收音机，或许还能收到信号。'); } },
        { id: 'medical_supply', name: '医疗补给', desc: '发现医疗包', icon: '💊', weight: 2, minDay: 2, category: 'survival',
          trigger: () => { const s = window.gst(); return s && s.hp < 60 && Math.random() < 0.06; },
          execute: () => { window.snotify('info', '发现', '你找到一个急救包，内含绷带和药品！'); } },

        // ===== 社交类事件 =====
        { id: 'friendly_survivor', name: '友好幸存者', desc: '遇到友好的幸存者', icon: '👋', weight: 4, minDay: 2, category: 'social',
          trigger: () => Math.random() < 0.05,
          execute: () => { window.snotify('info', '相遇', '你遇到一位友好的幸存者，他愿意与你交流。'); } },
        { id: 'merchant_visit', name: '商人到访', desc: '旅行商人来访', icon: '💰', weight: 3, minDay: 4, category: 'social',
          trigger: () => { const c = window.gclk(); return c && c.day >= 4 && Math.random() < 0.03; },
          execute: () => { window.snotify('info', '商人', '一位旅行商人来到附近，你可以交易物资。'); } },
        { id: 'lost_child', name: '走失儿童', desc: '发现走失的孩子', icon: '👶', weight: 2, minDay: 3, category: 'social',
          trigger: () => Math.random() < 0.02,
          execute: () => { window.snotify('warn', '求助', '你发现一个走失的孩子在哭泣！'); } },
        { id: 'secret_meeting', name: '秘密会议', desc: '发现秘密会议', icon: '🕯️', weight: 2, minDay: 5, category: 'social',
          trigger: () => { const clk = window.gclk(); return clk && clk.dayPhase === 'night' && Math.random() < 0.04; },
          execute: () => { window.snotify('info', '发现', '你偶然发现一场秘密会议，可能有关重要情报。'); } },
        { id: 'distress_signal', name: '求救信号', desc: '收到求救信号', icon: '📡', weight: 2, minDay: 3, category: 'social',
          trigger: () => Math.random() < 0.025,
          execute: () => { window.snotify('warn', '求救', '你收到了微弱的求救信号，有人在求救！'); } },

        // ===== 发现类事件 =====
        { id: 'hidden_cache', name: '隐藏储藏', desc: '发现隐藏的储藏点', icon: '🗝️', weight: 3, minDay: 3, category: 'discovery',
          trigger: () => Math.random() < 0.035,
          execute: () => { window.snotify('info', '发现', '你找到了一个被遗弃的储藏点！'); } },
        { id: 'old_letter', name: '旧信件', desc: '发现一封旧信', icon: '✉️', weight: 2, minDay: 1, category: 'discovery',
          trigger: () => Math.random() < 0.03,
          execute: () => { window.snotify('info', '发现', '你发现一封旧信件，可能包含重要线索。'); } },
        { id: 'map_fragment', name: '地图碎片', desc: '发现地图碎片', icon: '🗺️', weight: 2, minDay: 2, category: 'discovery',
          trigger: () => Math.random() < 0.025,
          execute: () => { window.snotify('info', '发现', '你找到了一张地图碎片，标记了未知地点！'); } },
        { id: 'safe_house', name: '安全屋', desc: '发现安全屋', icon: '🏠', weight: 1, minDay: 5, category: 'discovery',
          trigger: () => { const c = window.gclk(); return c && c.day >= 5 && Math.random() < 0.015; },
          execute: () => { window.snotify('info', '发现', '你找到了一处结构完好的安全屋！'); } },
        { id: 'weapon_cache', name: '武器库', desc: '发现武器藏匿点', icon: '🔫', weight: 1, minDay: 7, category: 'discovery',
          trigger: () => { const c = window.gclk(); return c && c.day >= 7 && Math.random() < 0.01; },
          execute: () => { window.snotify('info', '发现', '你发现了一个藏匿的武器库！'); } },
        { id: 'bunker', name: '地下掩体', desc: '发现地下掩体', icon: '🏚️', weight: 1, minDay: 4, category: 'discovery',
          trigger: () => { const c = window.gclk(); return c && c.day >= 4 && Math.random() < 0.015; },
          execute: () => { window.snotify('info', '发现', '你发现了一座地下掩体，可以避难！'); } },

        // ===== 信息类事件 =====
        { id: 'military_broadcast', name: '军方广播', desc: '收到军方广播', icon: '📢', weight: 3, minDay: 1, category: 'info',
          trigger: () => Math.random() < 0.04,
          execute: () => { window.snotify('info', '广播', '你收到军方广播，传达了最新指令。'); } },
        { id: 'weather_change', name: '天气突变', desc: '天气突然变化', icon: '🌤️', weight: 5, minDay: 1, category: 'info',
          trigger: () => { const clk = window.gclk(); return clk && Math.random() < 0.08; },
          execute: () => { window.snotify('info', '天气', '天气发生了变化，注意调整行动。'); } },
        { id: 'new_day', name: '新的一天', desc: '时间流逝', icon: '🌅', weight: 10, minDay: 1, category: 'info',
          trigger: () => { const clk = window.gclk(); return clk && clk.elapsedSec > 0 && clk.elapsedSec % 86400 < 60; },
          execute: () => { window.snotify('info', '日志', '新的一天开始了。'); } },
        { id: 'moon_phase', name: '月相变化', desc: '月相转变', icon: '🌙', weight: 2, minDay: 7, category: 'info',
          trigger: () => { const clk = window.gclk(); return clk && clk.day % 7 === 0 && Math.random() < 0.5; },
          execute: () => { window.snotify('info', '天象', '满月之夜降临，注意安全。'); } },
        { id: 'animal_sound', name: '动物叫声', desc: '听到动物声音', icon: '🦊', weight: 3, minDay: 1, category: 'info',
          trigger: () => Math.random() < 0.04,
          execute: () => { window.snotify('info', '声音', '你听到了远处动物的叫声，可能有野生动物。'); } }
    ];

    const EVENT_TRIGGERS = {
        onLowHealth: () => {
            const s = window.gst();
            if (!s) return;
            if (s.hp < 30 && Math.random() < 0.25) {
                window.snotify('danger', '警告', '生命值严重偏低！');
            }
        },
        onLowHunger: () => {
            const s = window.gst();
            if (!s) return;
            if (s.hunger < 20 && Math.random() < 0.35) {
                window.snotify('warn', '警告', '饥饿难耐！需要立即寻找食物！');
            }
        },
        onLowThirst: () => {
            const s = window.gst();
            if (!s) return;
            if (s.thirst < 20 && Math.random() < 0.4) {
                window.snotify('warn', '警告', '严重脱水！急需补充水分！');
            }
        },
        onNightfall: () => {
            const clk = window.gclk();
            if (!clk) return;
            const phase = clk.dayPhase || '';
            if ((phase === 'dusk' || phase === 'night') && Math.random() < 0.1) {
                window.snotify('info', '夜晚', '夜幕降临，注意安全！');
            }
        },
        onZombieThreat: () => {
            const s = window.gst();
            if (!s) return;
            if (s.hp < 50 && s.infection > 20 && Math.random() < 0.2) {
                window.snotify('danger', '威胁', '尸群正在逼近！');
            }
        },
        onDawn: () => {
            const clk = window.gclk();
            if (!clk) return;
            const phase = clk.dayPhase || '';
            if (phase === 'dawn' && Math.random() < 0.08) {
                window.snotify('info', '黎明', '晨光渐亮，新的一天开始了。');
            }
        },
        onInfection: () => {
            const s = window.gst();
            if (!s) return;
            if (s.infection > 50 && Math.random() < 0.3) {
                window.snotify('danger', '警告', '感染加剧！需要立即治疗！');
            }
        },
        onFatigue: () => {
            const s = window.gst();
            if (!s) return;
            if (s.fatigue > 70 && Math.random() < 0.2) {
                window.snotify('warn', '警告', '疲劳过度！需要休息！');
            }
        },
        onSpiritDrop: () => {
            const s = window.gst();
            if (!s) return;
            if (s.spirit < 30 && Math.random() < 0.15) {
                window.snotify('warn', '心理', '精神状态低落，需要调整心态！');
            }
        },
        onAutoRandomEvent: () => {
            const clk = window.gclk();
            if (!clk) return;
            const day = clk.day || 0;
            const available = RANDOM_EVENTS.filter(e => day >= (e.minDay || 0) && (!e.trigger || e.trigger()));
            if (available.length === 0) return;
            const totalWeight = available.reduce((sum, e) => sum + e.weight, 0);
            let r = Math.random() * totalWeight;
            for (const event of available) {
                r -= event.weight;
                if (r <= 0) {
                    try { event.execute(); } catch(e) { console.error('事件执行错误:', e); }
                    break;
                }
            }
        }
    };

    // 暴露到全局
    // 注意：不覆盖 data.js 的 window.RANDOM_EVENTS（string-trigger 格式，供 gamesystems.js 使用）
    // 改用 RANDOM_EVENTS_EXT 暴露 function-trigger 格式的事件
    window.RANDOM_EVENTS_EXT = RANDOM_EVENTS;
    window.EVENT_TRIGGERS_EXT = EVENT_TRIGGERS;
})();