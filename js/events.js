/**
 * 事件系统数据文件
 * --------------------------------------------------------------------------
 * 本文件存放所有突发事件触发器的定义，独立于 main.js 主逻辑。
 * 数据通过 window.EVENT_TRIGGERS 全局暴露，main.js 的 checkRandomEvents
 * 函数会遍历所有触发器并执行。
 *
 * 数据结构说明：
 *   EVENT_TRIGGERS[triggerName] = (state, clock) => { ... }
 *   触发器接收当前游戏状态 s 和时钟 clk 两个参数，
 *   内部通过安全调用访问 window.snotify / window.logEvent / window.addLogEntry。
 *
 * 新增触发器时直接在此追加即可，无需改动 main.js 业务代码。
 * --------------------------------------------------------------------------
 */
(function () {
    'use strict';

    // ===== 安全调用包装（防止外部依赖未就绪时报错） =====
    const _notify = (type, title, msg) => { try { if (window.snotify) window.snotify(type, title, msg); } catch (e) {} };
    const _log = (type, msg) => { try { if (window.logEvent) window.logEvent(type, msg); } catch (e) {} };
    const _addLog = (type, msg) => { try { if (window.addLogEntry) window.addLogEntry(type, msg); } catch (e) {} };

    /**
     * 事件触发器表
     * 每个触发器在 checkRandomEvents 中被遍历调用，接收 (s, clk) 参数。
     * 触发器内部通过概率控制触发频率，避免频繁打扰玩家。
     */
    const EVENT_TRIGGERS = {
        // 生命值偏低警告
        onLowHealth: (s) => {
            if (s.hp < 30 && Math.random() < 0.3) {
                _notify('warn', '警告', '生命值偏低！');
                _log('warning', '生命值偏低！');
                _addLog('event', '事件：生命危机');
            }
        },
        // 饥饿警告
        onLowHunger: (s) => {
            if (s.hunger < 20 && Math.random() < 0.4) {
                _notify('warn', '警告', '饥饿难耐！');
                _log('warning', '饥饿难耐！');
                _addLog('event', '事件：严重饥饿');
            }
        },
        // 脱水警告
        onLowThirst: (s) => {
            if ((s.thirst ?? 50) < 15 && Math.random() < 0.4) {
                _notify('warn', '警告', '严重脱水！');
                _log('warning', '严重脱水！');
                _addLog('event', '事件：严重脱水');
            }
        },
        // 疲劳过度
        onHighFatigue: (s) => {
            if ((s.fatigue ?? 30) > 85 && Math.random() < 0.35) {
                _notify('warn', '警告', '疲劳过度，行动力下降');
                _log('warning', '疲劳过度');
                _addLog('event', '事件：极度疲劳');
            }
        },
        // 感染扩散
        onInfection: (s) => {
            if ((s.infection || 0) > 50 && Math.random() < 0.25) {
                _notify('danger', '感染', '感染正在扩散，急需治疗');
                _log('danger', '感染扩散中');
                _addLog('event', '事件：感染恶化');
            }
        },
        // 体温异常
        onExtremeTemp: (s) => {
            if ((s.bodyTemp ?? 37) < 34 || (s.bodyTemp ?? 37) > 39) {
                if (Math.random() < 0.3) {
                    const msg = (s.bodyTemp ?? 37) < 34 ? '体温过低，有失温风险' : '体温过高，可能发烧';
                    _notify('warn', '体温异常', msg);
                    _log('warning', msg);
                }
            }
        },
        // 精神崩溃边缘
        onLowSpirit: (s) => {
            if ((s.spirit ?? 80) < 20 && Math.random() < 0.3) {
                _notify('warn', '精神', '精神状态濒临崩溃');
                _log('warning', '精神状态极低');
                _addLog('event', '事件：精神崩溃边缘');
            }
        },
        // 夜幕降临
        onNightfall: (clk) => {
            if (clk && clk.elapsedSec && (clk.elapsedSec % 86400 > 64800) && (clk.elapsedSec % 86400 < 72000)) {
                if (Math.random() < 0.15) {
                    _notify('info', '夜晚', '夜幕降临，注意安全');
                    _log('info', '夜幕降临，注意安全');
                }
            }
        },
        // 黎明到来
        onDawn: (clk) => {
            if (clk && clk.elapsedSec && (clk.elapsedSec % 86400 > 21600) && (clk.elapsedSec % 86400 < 25200)) {
                if (Math.random() < 0.12) {
                    _notify('info', '黎明', '天边泛起微光，新的一天开始了');
                    _log('info', '黎明到来');
                }
            }
        },
        // 尸群逼近
        onZombieThreat: (s) => {
            if (s.hp < 50 && s.infection > 30 && Math.random() < 0.2) {
                _notify('danger', '威胁', '尸群正在逼近！');
                _log('danger', '尸群正在逼近！');
                _addLog('event', '事件：尸群逼近');
            }
        },
        // 超重警告：负重接近上限影响行动
        onOverload: (s) => {
            const maxEnc = 20; // 默认负重上限参考
            if ((s.enc || 0) > maxEnc * 0.9 && Math.random() < 0.3) {
                _notify('warn', '负重', '负重接近上限，行动迟缓、奔跑困难');
                _log('warning', '负重过高，行动受限');
            }
        },
        // 饥饿濒死：饱腹<5 触发虚脱警告
        onStarvation: (s) => {
            if ((s.hunger ?? 50) < 5 && Math.random() < 0.5) {
                _notify('danger', '濒死', '极度饥饿，角色即将虚脱昏厥');
                _log('danger', '极度饥饿，濒临昏厥');
                _addLog('event', '事件：饥饿濒死');
            }
        },
        // 脱水濒死：口渴<5 触发虚脱警告
        onDehydration: (s) => {
            if ((s.thirst ?? 50) < 5 && Math.random() < 0.5) {
                _notify('danger', '濒死', '极度脱水，角色意识模糊');
                _log('danger', '极度脱水，意识模糊');
                _addLog('event', '事件：脱水濒死');
            }
        },
        // 精神崩溃：精神<10 触发幻觉预警
        onMentalCrisis: (s) => {
            if ((s.spirit ?? 80) < 10 && Math.random() < 0.4) {
                _notify('danger', '精神崩溃', '角色产生幻觉，判断力严重受损');
                _log('danger', '精神崩溃，出现幻觉');
                _addLog('event', '事件：精神崩溃');
            }
        },
        // 感染变异前兆：感染>70 触发变异警告
        onInfectionCritical: (s) => {
            if ((s.infection || 0) > 70 && Math.random() < 0.35) {
                _notify('danger', '变异前兆', '感染扩散至临界，出现高热与瞳孔异常');
                _log('danger', '感染临界，变异前兆显现');
                _addLog('event', '事件：感染变异前兆');
            }
        },
        // 夜间外出警告：22:00-6:00 在室外时提醒
        onNightWarning: (s, clk) => {
            if (!clk || !clk.elapsedSec) return;
            const hour = (clk.elapsedSec % 86400) / 3600;
            const isNight = hour >= 22 || hour < 6;
            const isIndoor = /室内|公寓|楼|房|地下室|避难|据点|营地|仓库/.test(s.location || '');
            if (isNight && !isIndoor && Math.random() < 0.25) {
                _notify('warn', '夜间危险', '夜间丧尸活跃，身处室外风险极高，建议寻找掩体');
                _log('warning', '夜间身处室外，丧尸活跃');
            }
        },
        // 恶劣天气预警：暴雨/暴雪/大雾
        onBadWeather: (s, clk) => {
            const w = (clk && clk.weather) || s.weather || '';
            if (/暴雨|暴雪|大雾|台风|沙尘/.test(w) && Math.random() < 0.3) {
                _notify('warn', '天气', '恶劣天气持续，视线受阻、行动困难');
                _log('warning', '恶劣天气：' + w);
            }
        }
    };

    // 暴露到全局
    window.EVENT_TRIGGERS = EVENT_TRIGGERS;
})();
