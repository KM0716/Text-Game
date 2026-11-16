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
                // ===== DZ：优先使用「记忆模型」（f.modelMem），留空沿用主模型 =====
                model: (f.modelMem && f.modelMem.trim()) || f.model || 'gpt-4o-mini',
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
                // ===== DZ：优先使用「记忆模型」（f.modelMem），留空沿用主模型 =====
                model: (f.modelMem && f.modelMem.trim()) || f.model || 'gpt-4o-mini',
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
        // ===== DZ 记忆模式关闭：跳过记录与压缩 =====
        try {
            const f = window.cfg();
            if (f && f.memMode === 'off') return '';
        } catch(e) {}
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

    // ================================================================
    // DZ 记忆诊断与补录：扫描缺失总结 → 并发补齐 → 二次压缩 → 手动补录 → 安全重建
    // ================================================================

    // ===== 从对话历史提取第 n 轮的正文（玩家输入 + AI 回复）；缺失返回 null =====
    function getTurnBody(turnNum) {
        try {
            if (!(turnNum > 0)) return null;
            const hist = window._getHist ? window._getHist() : [];
            let count = 0;
            for (let i = 0; i < hist.length; i++) {
                const m = hist[i];
                if (!m || m.role !== 'user') continue;
                count++;
                if (count === turnNum) {
                    let ai = '';
                    for (let j = i + 1; j < hist.length; j++) {
                        if (hist[j] && hist[j].role === 'assistant') { ai = hist[j].content || ''; break; }
                        if (hist[j] && hist[j].role === 'user') break;
                    }
                    if (!ai) return null; // 没有正文（AI 回复缺失）无法自动总结
                    return { user: m.content || '', ai: ai };
                }
            }
        } catch (e) {}
        return null;
    }

    // ===== 诊断：范围内缺失总结的轮次（二次压缩覆盖的不算缺失）=====
    function diagnose(fromTurn, toTurn) {
        const records = loadRecords();
        const curTurn = getCurrentTurn();
        const from = Math.max(1, Math.floor(fromTurn) || 1);
        const to = Math.min(Math.floor(toTurn) > 0 ? Math.floor(toTurn) : curTurn, curTurn);
        const missing = [], missingNoBody = [];
        for (let n = from; n <= to; n++) {
            const inTurns = records.turns.some(r => r.turn === n);
            const inLongTerm = records.longTerm.some(lt => lt.turnRange && lt.turnRange[0] <= n && lt.turnRange[1] >= n);
            if (inTurns || inLongTerm) continue; // 二次压缩覆盖的轮次不算缺失
            (getTurnBody(n) ? missing : missingNoBody).push(n);
        }
        // 够条件做二次压缩的记录数（早于保护窗且未被长期记忆覆盖）
        const compressible = records.turns.filter(r => r.turn <= curTurn - RECENT_TURNS);
        const mergeable = compressible.filter(r => !records.longTerm.some(lt => lt.turnRange && lt.turnRange[1] >= r.turn)).length;
        return { currentTurn: curTurn, from, to, missing, missingNoBody, mergeable };
    }

    // ===== 严格版压缩：不走本地兜底，失败抛错（安全重建用：成功才替换）=====
    async function compressTurnAI(userMsg, aiResponse, turnNum) {
        const f = (typeof cfg === 'function') ? cfg() : (window.cfg ? window.cfg() : {});
        if (!f.key || !f.ep) throw new Error('未配置记忆接口（API）');
        const sysPrompt = `你是事实记录员。把一轮文字冒险的交互压缩成 ${SHORT_LEN[0]}~${SHORT_LEN[1]} 字的事实记录。
要求：
1. 只记录客观事实：发生了什么行动、遇到谁、说了什么关键话、得到了/失去了什么、状态怎么变
2. 去掉所有修辞描写、心理活动、环境渲染——只留骨架
3. 保留关键数字（物品数量、状态数值变化）
4. 不评价、不推测、不总结
5. 输出纯文本，不要标题不要分节标记
6. 控制在 ${SHORT_LEN[0]}~${SHORT_LEN[1]} 字以内`;
        const userPrompt = `【第${turnNum}轮】\n玩家行动：${(userMsg || '').slice(0, 800)}\nAI回复：${(aiResponse || '').slice(0, 2000)}\n---\n请压缩为事实记录：`;
        const body = {
            model: (f.modelMem && f.modelMem.trim()) || f.model || 'gpt-4o-mini',
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
        const text = ((data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) || '').trim();
        if (!text) throw new Error('记忆接口返回空');
        return text.slice(0, SHORT_LEN[1] + 50);
    }

    // ===== 把够条件的旧记录做二次压缩，直到再没有可做的活 =====
    async function tryMergeExtra(cancelRef) {
        const records = loadRecords();
        let guard = 0;
        while (guard++ < 20) {
            if (cancelRef && cancelRef.stop) break;
            const curTurn = getCurrentTurn();
            const compressible = records.turns.filter(r => r.turn <= curTurn - RECENT_TURNS);
            const unmerged = compressible.filter(r => !records.longTerm.some(lt => lt.turnRange && lt.turnRange[1] >= r.turn));
            if (unmerged.length < MERGE_EVERY) break;
            const toMerge = unmerged.slice(0, MERGE_EVERY);
            const longText = await mergeToLongTerm(toMerge);
            const range = [toMerge[0].turn, toMerge[toMerge.length - 1].turn];
            records.longTerm.push({ turnRange: range, text: longText, ts: Date.now() });
            const mergedSet = new Set(toMerge.map(r => r.turn));
            records.turns = records.turns.filter(r => !mergedSet.has(r.turn));
            saveRecords(records);
        }
        return guard - 1; // 实际合并批数
    }

    // ===== 补录：并发把指定轮次补齐（每完成即存，取消保留已完成项）=====
    async function backfillTurns(turnList, onProgress, cancelRef) {
        const records = loadRecords();
        const total = turnList.length;
        let done = 0, ok = 0, fail = 0;
        const queue = turnList.slice();
        const worker = async () => {
            while (queue.length) {
                if (cancelRef && cancelRef.stop) return;
                const tn = queue.shift();
                const body = getTurnBody(tn);
                let text = '';
                if (body) {
                    try { text = await compressTurn(body.user, body.ai, tn); } catch (e) { text = ''; }
                }
                if (cancelRef && cancelRef.stop) return;
                if (text) {
                    records.turns.push({ turn: tn, text: text, ts: Date.now(), backfilled: true });
                    records.turns.sort((a, b) => a.turn - b.turn);
                    saveRecords(records);
                    ok++;
                } else fail++;
                done++;
                try { if (onProgress) onProgress(done, total, tn, ok, fail); } catch (e) {}
            }
        };
        await Promise.all([worker(), worker(), worker()]);
        let merged = 0;
        if (!(cancelRef && cancelRef.stop)) {
            merged = await tryMergeExtra(cancelRef); // 补齐后再做够条件的二次压缩
        }
        return { total, done, ok, fail, merged };
    }

    // ===== 手动补录事实：无需 AI，直接写入该轮总结（已有同轮总结则替换）=====
    function backfillFact(turnNum, text) {
        if (!(turnNum > 0) || !text || !String(text).trim()) return false;
        const records = loadRecords();
        const t = Math.floor(turnNum);
        records.turns = records.turns.filter(r => r.turn !== t);
        records.turns.push({ turn: t, text: String(text).trim().slice(0, 400), ts: Date.now(), manual: true });
        records.turns.sort((a, b) => a.turn - b.turn);
        saveRecords(records);
        return true;
    }

    // ===== 安全重建：范围内已有总结逐轮重生成，成功才替换，失败保留旧记忆 =====
    async function rebuildRange(fromTurn, toTurn, onProgress, cancelRef) {
        const records = loadRecords();
        const curTurn = getCurrentTurn();
        const from = Math.max(1, Math.floor(fromTurn) || 1);
        const to = Math.min(Math.floor(toTurn) > 0 ? Math.floor(toTurn) : curTurn, curTurn);
        const targets = records.turns.filter(r => r.turn >= from && r.turn <= to).sort((a, b) => a.turn - b.turn);
        const total = targets.length;
        let done = 0, ok = 0, fail = 0;
        const queue = targets.slice();
        const worker = async () => {
            while (queue.length) {
                if (cancelRef && cancelRef.stop) return;
                const rec = queue.shift();
                const body = getTurnBody(rec.turn);
                let replaced = false;
                if (body) {
                    try {
                        const nt = await compressTurnAI(body.user, body.ai, rec.turn);
                        if (nt && nt.length >= 20) { rec.text = nt; rec.rebuilt = true; replaced = true; }
                    } catch (e) { /* 失败保留旧记忆 */ }
                }
                if (replaced) { ok++; saveRecords(records); } else fail++;
                done++;
                try { if (onProgress) onProgress(done, total, rec.turn, ok, fail); } catch (e) {}
            }
        };
        await Promise.all([worker(), worker(), worker()]);
        saveRecords(records); // 取消时也保留已重建项
        return { total, done, ok, fail };
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
        // DZ 记忆诊断与补录
        getTurnBody,
        diagnose,
        backfillTurns,
        backfillFact,
        rebuildRange,
        tryMergeExtra,
        STORAGE_KEY,
        RECENT_TURNS,
        MERGE_EVERY
    };
})();
