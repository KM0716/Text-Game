// ================================================================
// 记忆系统（Memory System）
// 功能：
// 1. 每轮把已发生的事实压成短记录（200-250 字）——用副模型压缩
// 2. 注入上下文时用压缩记录原地替换掉该轮旧正文
// 3. 每 5 条压缩记录再合成一条 350-500 字的长期记忆（二次压缩）
// 4. 只动早于 25 轮的记录，最近 25 轮原样保留
// 依赖：main.js 的 cfg/gst/sst/hist 等函数，需在 main.js 之后执行
// ================================================================
(function () {
    'use strict';

    const STORAGE_KEY = 'vn_memory_records';
    // 不可压缩的最近轮次（保护当前上下文窗口内的完整对话）
    const RECENT_TURNS = 25;
    // 每 N 条压缩记录合成为 1 条长期记忆
    const MERGE_EVERY = 5;
    // 压缩目标字数
    const SHORT_LEN = [200, 250];
    const LONG_LEN = [350, 500];

    // ===== 读取/保存记忆记录 =====
    function loadRecords() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) return JSON.parse(raw) || { turns: [], longTerm: [] };
        } catch (e) {}
        return { turns: [], longTerm: [] };
    }
    function saveRecords(data) {
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch (e) {}
    }

    // ===== 获取当前轮次号 =====
    function getCurrentTurn() {
        try {
            const s = (typeof gst === 'function') ? gst() : (window.gst ? window.gst() : null);
            if (s && s.turnCount != null) return s.turnCount;
            // 回退：用 hist 长度估算
            if (typeof hist !== 'undefined' && hist) return Math.floor(hist.length / 2);
        } catch (e) {}
        return 0;
    }

    // ===== 调用副模型压缩一轮对话为事实记录 =====
    async function compressTurn(userMsg, aiResponse, turnNum) {
        const f = (typeof cfg === 'function') ? cfg() : (window.cfg ? window.cfg() : {});
        if (!f.key || !f.ep) {
            // 无 API 配置：用本地摘要兜底
            return localFallbackCompress(userMsg, aiResponse);
        }
        const sysPrompt = `你是事实记录员。把一轮文字冒险的交互压缩成 ${SHORT_LEN[0]}~${SHORT_LEN[1]} 字的事实记录。
要求：
1. 只记录客观事实：发生了什么行动、遇到谁、说了什么关键话、得到了/失去了什么、状态怎么变
2. 去掉所有修辞描写、心理活动、环境渲染——只留骨架
3. 保留关键数字（物品数量、状态数值变化）
4. 不评价、不推测、不总结
5. 输出纯文本，不要标题不要分节标记
6. 控制在 ${SHORT_LEN[0]}~${SHORT_LEN[1]} 字以内`;

        const userPrompt = `【第${turnNum}轮】
玩家行动：${(userMsg || '').slice(0, 800)}
AI回复：${(aiResponse || '').slice(0, 2000)}
---
请压缩为事实记录：`;

        try {
            const body = {
                model: f.model || 'gpt-4o-mini',
                messages: [
                    { role: 'system', content: sysPrompt },
                    { role: 'user', content: userPrompt }
                ],
                temperature: 0.1,
                max_tokens: 400
            };
            const resp = await (window._sendProxyRequest || async function(url, b, key) {
                return fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + key }, body: JSON.stringify(b) });
            })(f.ep, body, f.key, null, false);
            if (!resp.ok) throw new Error('HTTP ' + resp.status);
            const data = await resp.json();
            const text = data.choices?.[0]?.message?.content || '';
            return text.trim().slice(0, SHORT_LEN[1] + 50);
        } catch (e) {
            return localFallbackCompress(userMsg, aiResponse);
        }
    }

    // ===== 无 API 时的本地兜底压缩 =====
    function localFallbackCompress(userMsg, aiResponse) {
        const action = (userMsg || '').slice(0, 60);
        // 提取 AI 回复中的关键句子（首尾 + 中间一句）
        const sentences = (aiResponse || '').split(/[。！？\n]/).filter(s => s.trim().length > 5);
        let summary = '';
        if (sentences.length > 0) summary += sentences[0].trim().slice(0, 80);
        if (sentences.length > 2) summary += '。' + sentences[Math.floor(sentences.length / 2)].trim().slice(0, 80);
        if (sentences.length > 1) summary += '。' + sentences[sentences.length - 1].trim().slice(0, 80);
        summary = (action + ' → ' + summary).slice(0, SHORT_LEN[1]);
        return summary;
    }

    // ===== 合成长期记忆（每 5 条压缩记录 → 1 条长期记忆）=====
    async function mergeToLongTerm(records) {
        const f = (typeof cfg === 'function') ? cfg() : (window.cfg ? window.cfg() : {});
        const combined = records.map((r, i) => `[第${r.turn}轮] ${r.text}`).join('\n\n');
        if (!f.key || !f.ep) {
            // 本地兜底：拼接截断
            return combined.slice(0, LONG_LEN[1]);
        }
        const sysPrompt = `你是记忆整合器。把多条事实记录合并为一条 ${LONG_LEN[0]}~${LONG_LEN[1]} 字的长期记忆。
要求：
1. 按时间线整合，去重去冗
2. 保留关键转折点、重要NPC关系、重大状态变化
3. 丢失次要细节（琐碎的搜索动作、日常对话）
4. 输出纯文本叙述，不列表不编号`;
        const userPrompt = `请整合以下事实记录：\n\n${combined}\n\n---\n长期记忆：`;
        try {
            const body = {
                model: f.model || 'gpt-4o-mini',
                messages: [
                    { role: 'system', content: sysPrompt },
                    { role: 'user', content: userPrompt }
                ],
                temperature: 0.15,
                max_tokens: 800
            };
            const resp = await (window._sendProxyRequest)(f.ep, body, f.key, null, false);
            if (!resp.ok) throw new Error('HTTP ' + resp.status);
            const data = await resp.json();
            return (data.choices?.[0]?.message?.content || '').trim().slice(0, LONG_LEN[1] + 50);
        } catch (e) {
            return combined.slice(0, LONG_LEN[1]);
        }
    }

    // ===== 主入口：一轮结束后调用，记录压缩 =====
    async function recordTurn(userMsg, aiResponse) {
        const records = loadRecords();
        const turnNum = getCurrentTurn() + 1;
        // 更新轮次计数
        try {
            const s = gst();
            s.turnCount = turnNum;
            sst(s);
        } catch(e) {}

        // 压缩当前轮
        const text = await compressTurn(userMsg, aiResponse, turnNum);
        records.turns.push({ turn: turnNum, text, ts: Date.now() });

        // 检查是否需要二次合并（每 MERGE_EVERY 条，且只动早于 RECENT_TURNS 轮的）
        const compressible = records.turns.filter(r => r.turn <= turnNum - RECENT_TURNS);
        const unmerged = compressible.filter(r => {
            // 检查是否已经在长期记忆中
            return !records.longTerm.some(lt => lt.turnRange && lt.turnRange[1] >= r.turn);
        });
        if (unmerged.length >= MERGE_EVERY) {
            // 取最早的 MERGE_EVERY 条合并
            const toMerge = unmerged.slice(0, MERGE_EVERY);
            const longText = await mergeToLongTerm(toMerge);
            const range = [toMerge[0].turn, toMerge[toMerge.length - 1].turn];
            records.longTerm.push({ turnRange: range, text: longText, ts: Date.now() });
            // 从 turns 中移除已合并的记录（保留引用以防撤回需要）
            const mergedSet = new Set(toMerge.map(r => r.turn));
            records.turns = records.turns.filter(r => !mergedSet.has(r.turn));
        }

        saveRecords(records);
        return text;
    }

    // ===== 注入上下文：生成记忆摘要文本，替换 hist 中的旧正文 =====
    function getMemoryContext(hist, ctxWindow) {
        const records = loadRecords();
        let lines = [];
        // 1. 长期记忆放最前面
        if (records.longTerm.length) {
            lines.push('◆ 长期记忆（旧事摘要）');
            records.longTerm.forEach(lt => {
                lines.push(`[第${lt.turnRange[0]}-${lt.turnRange[1]}轮] ${lt.text}`);
            });
            lines.push('');
        }
        // 2. 压缩记录（早于 RECENT_TURNS 轮的）
        const curTurn = getCurrentTurn();
        const compressed = records.turns.filter(r => r.turn <= curTurn - RECENT_TURNS);
        if (compressed.length) {
            lines.push('◆ 事实记录（每轮摘要）');
            compressed.forEach(r => {
                lines.push(`[第${r.turn}轮] ${r.text}`);
            });
            lines.push('');
        }
        return lines.length ? '【记忆系统】\n以下为已发生的旧事摘要，用于保持上下文连贯。最近' + RECENT_TURNS + '轮的完整对话保留在下方。\n\n' + lines.join('\n') : '';
    }

    // ===== 撤回：恢复到某个轮次（删除该轮之后的记忆）=====
    function rollbackTo(turnNum) {
        const records = loadRecords();
        records.turns = records.turns.filter(r => r.turn < turnNum);
        records.longTerm = records.longTerm.filter(lt => lt.turnRange[0] < turnNum);
        saveRecords(records);
        // 更新轮次计数
        try {
            const s = gst();
            s.turnCount = Math.max(0, turnNum - 1);
            sst(s);
        } catch(e) {}
    }

    // ===== 完整快照（供回合撤回使用）=====
    function snapshot() {
        return JSON.parse(JSON.stringify(loadRecords()));
    }
    function restore(snap) {
        if (snap) saveRecords(snap);
    }

    // ===== 重置 =====
    function reset() {
        saveRecords({ turns: [], longTerm: [] });
        try {
            const s = gst();
            s.turnCount = 0;
            sst(s);
        } catch(e) {}
    }

    // ===== 导出到全局 =====
    window.MEMORY_SYSTEM = {
        recordTurn,
        getMemoryContext,
        rollbackTo,
        snapshot,
        restore,
        reset,
        loadRecords,
        STORAGE_KEY,
        RECENT_TURNS,
        MERGE_EVERY
    };
})();
