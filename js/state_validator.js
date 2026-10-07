// ================================================================
// 状态验证闸门（State Validator & Gatekeeper）
// 功能：
// 1. 每个状态变量有【范围】【单轮最大变化幅度】定义
// 2. AI 标签只是"建议"——超出变化幅度的直接被截断或忽略
// 3. 自动衰减：每轮行动后按沙盒参数执行程序化衰减（不依赖 AI 输出）
// 4. AI 每回合可做小幅校准（±5），但大变动需通过物品/事件逻辑触发
// 5. 玩家可点击任意状态值进行修改（作弊面板）
// 依赖：main.js 的 gst/sst/cfg/gclk/gsbx 等函数
// ================================================================
(function () {
    'use strict';

    // ===== 状态变量定义：范围 + 单轮最大变化 =====
    const VAR_DEFS = {
        hp:       { min: 0, max: 100, maxDelta: 40,  label: '血量',   unit: '%' },
        hunger:   { min: 0, max: 100, maxDelta: 25,  label: '饱腹',   unit: '%' },
        thirst:   { min: 0, max: 100, maxDelta: 25,  label: '口渴',   unit: '%' },
        fatigue:  { min: 0, max: 100, maxDelta: 25,  label: '疲劳',   unit: '%' },
        spirit:   { min: 0, max: 100, maxDelta: 20,  label: '精神',   unit: '%' },
        joy:      { min: 0, max: 100, maxDelta: 15,  label: '欢愉',   unit: '%' },
        bodyTemp: { min: 30, max: 45, maxDelta: 3,   label: '体温',   unit: '°C' },
        enc:      { min: 0, max: 999, maxDelta: 50,  label: '负重',   unit: 'kg' },
    };

    // ===== AI 校准幅度：AI 每回合可微调的范围（超出则被截断）=====
    const AI_CALIBRATION_LIMIT = {
        hp: 8, hunger: 8, thirst: 8, fatigue: 8, spirit: 8, joy: 5, bodyTemp: 1.5, enc: 10
    };

    // ===== 获取旧值快照（在 mds 执行前调用）=====
    function snapshot() {
        try {
            const s = (typeof gst === 'function') ? gst() : (window.gst ? window.gst() : {});
            return {
                hp: s.hp, hunger: s.hunger, thirst: s.thirst, fatigue: s.fatigue,
                spirit: s.spirit, joy: s.joy, bodyTemp: s.bodyTemp, enc: s.enc
            };
        } catch (e) { return {}; }
    }

    // ===== 核心：验证 AI 建议的状态变更 =====
    // 返回验证后的安全值
    function validateChange(field, aiSuggestedValue, oldValue, context) {
        const def = VAR_DEFS[field];
        if (!def) return aiSuggestedValue; // 未定义的变量不做验证

        let newVal = Number(aiSuggestedValue);
        if (isNaN(newVal)) return oldValue; // 无效值不变

        // 1. 范围限制
        newVal = Math.max(def.min, Math.min(def.max, newVal));

        // 2. 变化幅度限制
        const delta = newVal - (oldValue != null ? Number(oldValue) : newVal);
        const absDelta = Math.abs(delta);
        const maxDelta = def.maxDelta;

        // 3. 上下文豁免：如果 context 中有物品使用/事件触发等正当理由，放宽限制
        //    hasItemUse: 吃东西/喝水/使用药品 → hunger/thirst/hp 允许大变化
        //    hasEventEffect: 事件效果 → 允许大变化
        //    hasCombatResult: 战斗结果 → hp 允许大变化
        if (context) {
            if (context.hasItemUse && (field === 'hunger' || field === 'thirst' || field === 'hp' || field === 'spirit')) {
                return newVal; // 物品使用豁免
            }
            if (context.hasEventEffect) {
                return newVal; // 事件效果豁免
            }
            if (context.hasCombatResult && field === 'hp') {
                return newVal; // 战斗伤害豁免
            }
            if (context.hasSleep && (field === 'fatigue' || field === 'spirit' || field === 'hp')) {
                return newVal; // 睡眠恢复豁免
            }
        }

        // 4. 正常情况下截断变化幅度
        if (absDelta > maxDelta) {
            // 超出最大变化幅度：截断到边界
            if (delta > 0) newVal = (oldValue != null ? Number(oldValue) : 0) + maxDelta;
            else newVal = (oldValue != null ? Number(oldValue) : 0) - maxDelta;
            newVal = Math.max(def.min, Math.min(def.max, newVal));

            // 记录日志（调试模式）
            try {
                if ((typeof cfg === 'function' ? cfg().debug : false) && typeof addLogEntry === 'function') {
                    addLogEntry('system', '[闸门] ' + def.label + ' 变化' + delta.toFixed(1) + '→截断为' + maxDelta + def.unit);
                }
            } catch (e) {}
        }

        return newVal;
    }

    // ===== AI 校准：处理 AI 输出的标签值，在 mds() 之前执行 =====
    // 返回验证后的 ch 对象（部分字段可能被截断）
    function validateAIChanges(ch, oldSnapshot, context) {
        const validated = {};
        Object.keys(VAR_DEFS).forEach(field => {
            if (ch[field] !== undefined) {
                validated[field] = validateChange(field, ch[field], oldSnapshot[field], context);
            }
        });
        return validated;
    }

    // ===== 自动衰减：每轮行动后程序化执行（不依赖 AI 标签）=====
    // hours: 本次行动推进的小时数
    function autoDecay(hours) {
        if (!hours || hours <= 0) return null;
        try {
            const s = (typeof gst === 'function') ? gst() : (window.gst ? window.gst() : {});
            const bx = (typeof gsbx === 'function') ? gsbx() : (window.gsbx ? window.gsbx() : {});
            const c = (typeof gclk === 'function') ? gclk() : (window.gclk ? window.gclk() : {});

            // 从沙盒参数读取衰减倍率
            const cat8 = bx.cat8 && bx.cat8.fields ? bx.cat8.fields : {};
            const hungerMult = { '缓慢': 0.6, '正常': 1, '快速': 1.5, '极快': 2.2 }[cat8.hungerRate ? cat8.hungerRate.val : '正常'] || 1;
            const thirstMult = hungerMult; // 口渴同倍率
            const fatigueMult = { '缓慢': 0.6, '正常': 1, '快速': 1.5, '极快': 2.2 }[cat8.fatigueRate ? cat8.fatigueRate.val : '正常'] || 1;

            const curH = Math.floor((c.elapsedSec || 0) / 3600) % 24;
            const isNight = curH >= 20 || curH < 6;

            // 饥饿衰减（夜间代谢减缓）
            const hungerDrain = 0.8 * hours * hungerMult * (isNight ? 0.7 : 1);
            // 口渴衰减（白天加速）
            const thirstDrain = 0.9 * hours * thirstMult * (isNight ? 0.6 : 1.2);
            // 疲劳增长（夜间恢复）
            const fatigueChange = isNight ? -1.5 * hours * fatigueMult : 1.0 * hours * fatigueMult;
            // 精神缓慢波动（夜间略微恢复，白天略微消耗）
            const spiritChange = isNight ? 0.5 * hours : -0.3 * hours;

            const result = {
                hunger: Math.max(0, Math.min(100, (s.hunger ?? 50) - hungerDrain)),
                thirst: Math.max(0, Math.min(100, (s.thirst ?? 50) - thirstDrain)),
                fatigue: Math.max(0, Math.min(100, (s.fatigue ?? 20) + fatigueChange)),
                spirit: Math.max(0, Math.min(100, (s.spirit ?? 80) + spiritChange)),
            };

            return result;
        } catch (e) {
            return null;
        }
    }

    // ===== 合并自动衰减和 AI 校准值 =====
    // 策略：先执行自动衰减，然后 AI 标签值在衰减后的基础上做小幅微调
    function mergeChanges(autoDecayResult, aiValidated, oldSnapshot) {
        const merged = {};
        Object.keys(VAR_DEFS).forEach(field => {
            const oldVal = oldSnapshot[field];
            const autoVal = autoDecayResult ? autoDecayResult[field] : null;
            const aiVal = aiValidated ? aiValidated[field] : null;

            if (autoVal != null && aiVal != null) {
                // 两者都有：AI 值作为校准，但不能偏离自动衰减结果太多
                const aiLimit = AI_CALIBRATION_LIMIT[field] || 5;
                const diff = aiVal - autoVal;
                if (Math.abs(diff) <= aiLimit) {
                    merged[field] = aiVal; // 在校准范围内，采用 AI 值
                } else {
                    // 超出校准范围：采用自动衰减值 + 最大校准
                    merged[field] = autoVal + (diff > 0 ? aiLimit : -aiLimit);
                }
            } else if (autoVal != null) {
                merged[field] = autoVal;
            } else if (aiVal != null) {
                merged[field] = aiVal;
            }
        });
        return merged;
    }

    // ===== 玩家作弊面板：点击状态值修改 =====
    function openCheatPanel(field, currentValue, label, unit) {
        const def = VAR_DEFS[field];
        if (!def) return;

        // 创建浮动输入面板
        let panel = document.getElementById('cheatPanel');
        if (panel) panel.remove();
        panel = document.createElement('div');
        panel.id = 'cheatPanel';
        panel.style.cssText = 'position:fixed;z-index:9998;background:var(--bg-paper,#1a1a2e);border:2px solid var(--accent,#c8a96a);border-radius:8px;padding:12px 16px;box-shadow:0 4px 20px rgba(0,0,0,0.3);min-width:200px;';

        panel.innerHTML = `
            <div style="font-size:0.8rem;font-weight:bold;margin-bottom:8px;color:var(--ink,#e0d8c8);">修改 ${label}</div>
            <div style="font-size:0.65rem;color:var(--ink-soft,#8a8a8a);margin-bottom:6px;">范围: ${def.min} ~ ${def.max} ${unit}</div>
            <div style="display:flex;gap:6px;align-items:center;">
                <input type="number" id="cheatInput" value="${currentValue}" min="${def.min}" max="${def.max}" step="${field === 'bodyTemp' ? 0.1 : 1}" style="flex:1;width:80px;padding:4px 6px;font-size:0.8rem;background:var(--bg-input,#2a2a3e);border:1px solid var(--divider,#3a3a4e);border-radius:4px;color:var(--ink,#e0d8c8);">
                <span style="font-size:0.7rem;color:var(--ink-soft,#8a8a8a);">${unit}</span>
            </div>
            <div style="display:flex;gap:6px;margin-top:8px;">
                <button id="cheatApply" style="flex:1;padding:4px 8px;font-size:0.7rem;background:var(--accent,#c8a96a);color:var(--bg-paper,#1a1a2e);border:none;border-radius:4px;cursor:pointer;">确认</button>
                <button id="cheatCancel" style="flex:1;padding:4px 8px;font-size:0.7rem;background:transparent;color:var(--ink-soft,#8a8a8a);border:1px solid var(--divider,#3a3a4e);border-radius:4px;cursor:pointer;">取消</button>
            </div>
            <div style="font-size:0.6rem;color:var(--ink-soft,#6a6a7a);margin-top:6px;text-align:center;">↑↓ 滚轮可快速调整</div>
        `;

        // 定位到屏幕中央
        panel.style.left = '50%';
        panel.style.top = '50%';
        panel.style.transform = 'translate(-50%, -50%)';
        document.body.appendChild(panel);

        const input = panel.querySelector('#cheatInput');
        if (input) {
            input.focus();
            input.select();
            // 滚轮快速调整
            input.addEventListener('wheel', (e) => {
                e.preventDefault();
                const step = field === 'bodyTemp' ? 0.1 : 1;
                let v = parseFloat(input.value) || 0;
                v += (e.deltaY < 0 ? step : -step);
                v = Math.max(def.min, Math.min(def.max, v));
                input.value = field === 'bodyTemp' ? v.toFixed(1) : Math.round(v);
            });
            // 回车确认
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') { panel.querySelector('#cheatApply').click(); }
                if (e.key === 'Escape') { panel.querySelector('#cheatCancel').click(); }
            });
        }

        panel.querySelector('#cheatApply').addEventListener('click', () => {
            // AI 生成中禁止修改状态
            if (document.body.classList.contains('ai-locked')) {
                tst('⚠️ AI 演算进行中，无法修改状态，请稍候…');
                return;
            }
            const v = parseFloat(input.value);
            if (isNaN(v)) { tst('请输入有效数字'); return; }
            const clamped = Math.max(def.min, Math.min(def.max, v));
            try {
                const s = (typeof gst === 'function') ? gst() : window.gst();
                s[field] = clamped;
                (typeof sst === 'function' ? sst : window.sst)(s);
                if (typeof upui === 'function') upui();
                else if (window.upui) window.upui();
                tst('✅ ' + label + ' 已修改为 ' + clamped + unit);
                playSfx('pickup');
                if (typeof addLogEntry === 'function') {
                    addLogEntry('system', '[作弊] ' + label + ' → ' + clamped + unit);
                }
                // ===== 手动校准后自动存档 =====
                if (window.autoSaveAll && typeof window.autoSaveAll === 'function') {
                    window.autoSaveAll('cheat');
                }
            } catch (e) {
                tst('修改失败：' + e.message);
            }
            panel.remove();
        });
        panel.querySelector('#cheatCancel').addEventListener('click', () => panel.remove());

        // 点击外部关闭
        setTimeout(() => {
            document.addEventListener('click', function closeHandler(e) {
                if (!panel.contains(e.target)) {
                    panel.remove();
                    document.removeEventListener('click', closeHandler);
                }
            });
        }, 100);
    }

    // ===== 渲染时给状态值添加点击事件 =====
    function bindStatClickListeners() {
        // 遍历所有带 data-stat-field 的元素
        document.querySelectorAll('[data-stat-field]').forEach(el => {
            if (el._cheatBound) return;
            el._cheatBound = true;
            el.style.cursor = 'pointer';
            el.title = '点击修改（作弊）';
            el.addEventListener('click', (e) => {
                e.stopPropagation();
                const field = el.dataset.statField;
                const def = VAR_DEFS[field];
                if (!def) return;
                const s = (typeof gst === 'function') ? gst() : window.gst();
                const cur = s[field] != null ? s[field] : 0;
                openCheatPanel(field, cur, def.label, def.unit);
            });
        });
    }

    // ===== 导出 =====
    window.STATE_VALIDATOR = {
        VAR_DEFS,
        AI_CALIBRATION_LIMIT,
        snapshot,
        validateChange,
        validateAIChanges,
        autoDecay,
        mergeChanges,
        openCheatPanel,
        bindStatClickListeners
    };
})();
