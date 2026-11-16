/* ============================================================================
 * dz_features.js — DZ 扩展功能模块 v1
 * 依赖（window 全局，由 main.js 等暴露）：
 *   cfg / scf / gst / sst / gch / sch / apb / pai / ptg / mds / gsp
 *   _sendProxyRequest / _getHist / upui / MEMORY_SYSTEM / WRITING_GUIDELINES
 * 功能：
 *   1. 世界书（设定作为词条与参考，按关键词命中注入上下文）
 *   2. 变量官（专家模式：每轮结束后单独结算数值状态，经状态闸门验证）
 *   3. 双模型正文（第一模型推演 → 第二模型重组表达，不替玩家做决定）
 *   4. 记忆模式开关 + 记忆档案查看器
 *   5. 叙事与阅读（三档字号滑杆 + 实时预览 + 台词高亮）
 *   6. 布局（PC 侧边栏 / 主从分栏 / 可拖拽分隔条 / 移动端抽屉适配）
 *   7. 开局第四步（AI 与功能：API 配置 + AI 总开关 + 专家模式），全部静默保存
 * ==========================================================================*/
(function () {
    'use strict';

    /* ================= 小工具 ================= */
    const $ = function (id) { return document.getElementById(id); };
    const esc = function (s) {
        return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
        });
    };
    const cfg = function () { return window.cfg(); };
    const scf = window.scf;
    const isDesktop = function () { return window.innerWidth >= 1024; };
    const debounce = function (fn, ms) {
        let t = null;
        return function () {
            const ctx = this, args = arguments;
            if (t) clearTimeout(t);
            t = setTimeout(function () { t = null; fn.apply(ctx, args); }, ms);
        };
    };
    /* 与 main.js 顶部 AP 预设保持一致（此处独立副本，避免依赖内部变量） */
    const AP = {
        openai: { ep: 'https://api.openai.com/v1/chat/completions', md: ['gpt-4o', 'gpt-4o-mini', 'gpt-4.1', 'gpt-4.1-mini', 'gpt-4-turbo', 'gpt-3.5-turbo'] },
        deepseek: { ep: 'https://api.deepseek.com/v1/chat/completions', md: ['deepseek-chat', 'deepseek-reasoner'] },
        moonshot: { ep: 'https://api.moonshot.cn/v1/chat/completions', md: ['moonshot-v1-128k', 'moonshot-v1-32k', 'moonshot-v1-8k'] },
        zhipu: { ep: 'https://open.bigmodel.cn/api/paas/v4/chat/completions', md: ['glm-4-plus', 'glm-4-0520', 'glm-4-air', 'glm-4-airx', 'glm-4-long', 'glm-4-flashx'] },
        qwen: { ep: 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions', md: ['qwen-plus', 'qwen-turbo', 'qwen-max', 'qwen2.5-72b-instruct', 'qwen3-max'] },
        siliconflow: { ep: 'https://api.siliconflow.cn/v1/chat/completions', md: ['deepseek-ai/DeepSeek-V3', 'deepseek-ai/DeepSeek-R1', 'Qwen/Qwen2.5-72B-Instruct', 'Qwen/Qwen3-Max'] },
        groq: { ep: 'https://api.groq.com/openai/v1/chat/completions', md: ['llama-3.3-70b-versatile', 'llama-3.1-70b-versatile', 'llama-3.1-8b-instant'] },
        ernie: { ep: 'https://qianfan.baidubce.com/v2/chat/completions', md: ['ernie-4.5-turbo', 'ernie-4.0-turbo', 'ernie-3.5-8k'] },
        minimax: { ep: 'https://api.minimax.chat/v1/chat/completions', md: ['abab6.5s-chat', 'abab6.5g-chat', 'abab5.5-chat'] },
        doubao: { ep: 'https://ark.cn-beijing.volces.com/api/v3/chat/completions', md: ['doubao-seed-1-6-251228', 'doubao-1-5-pro-32k-250715', 'doubao-1-5-pro-250715', 'doubao-1-5-lite-32k-250615'] },
        ollama: { ep: 'http://localhost:11434/v1/chat/completions', md: ['llama3', 'mistral', 'qwen2.5', 'qwen3', 'gemma3', 'deepseek-v3'] },
        custom: { ep: '', md: [] }
    };

    /* ================================================================
     * 1. 世界书（Worldbook）
     * ================================================================ */
    const WB_KEY = 'zday_worldbook_v1';
    let _wbCache = null;
    let _wbVer = 0; // 数据版本号（供 gsp 缓存 hash 使用）

    function wbLoad() {
        if (_wbCache) return _wbCache;
        try {
            const raw = localStorage.getItem(WB_KEY);
            _wbCache = raw ? JSON.parse(raw) : { v: 1, entries: [] };
            if (!_wbCache.entries) _wbCache.entries = [];
        } catch (e) { _wbCache = { v: 1, entries: [] }; }
        return _wbCache;
    }
    function wbSave() {
        try {
            localStorage.setItem(WB_KEY, JSON.stringify(wbLoad()));
            _wbVer++;
        } catch (e) {}
    }
    function wbId() { return 'wb' + Date.now().toString(36) + Math.floor(Math.random() * 1e4).toString(36); }
    function wbSplitKeys(str) {
        return String(str || '').split(/[,，、;；\s]+/).map(function (k) { return k.trim(); })
            .filter(function (k) { return k.length >= 2; });
    }

    const worldbook = {
        version: function () { return _wbVer; },
        list: function () { return wbLoad().entries; },
        count: function () { return wbLoad().entries.length; },
        enabledCount: function () {
            return wbLoad().entries.filter(function (e) { return e.on !== false; }).length;
        },
        add: function (entry) {
            const data = wbLoad();
            const e = {
                id: wbId(),
                title: (entry.title || '未命名词条').slice(0, 60),
                keys: (Array.isArray(entry.keys) ? entry.keys : wbSplitKeys(entry.keys)),
                content: String(entry.content || '').slice(0, 4000),
                on: entry.on !== false,
                src: entry.src || 'manual',
                ts: Date.now()
            };
            if (!e.keys.length) e.keys = [e.title]; // 至少用标题触发
            data.entries.push(e);
            wbSave();
            return e;
        },
        update: function (id, patch) {
            const data = wbLoad();
            for (let i = 0; i < data.entries.length; i++) {
                if (data.entries[i].id === id) {
                    if (patch.title !== undefined) data.entries[i].title = String(patch.title).slice(0, 60);
                    if (patch.keys !== undefined) {
                        data.entries[i].keys = Array.isArray(patch.keys) ? patch.keys : wbSplitKeys(patch.keys);
                        if (!data.entries[i].keys.length) data.entries[i].keys = [data.entries[i].title];
                    }
                    if (patch.content !== undefined) data.entries[i].content = String(patch.content).slice(0, 4000);
                    if (patch.on !== undefined) data.entries[i].on = !!patch.on;
                    wbSave();
                    return data.entries[i];
                }
            }
            return null;
        },
        remove: function (id) {
            const data = wbLoad();
            data.entries = data.entries.filter(function (e) { return e.id !== id; });
            wbSave();
        },
        clearAuto: function () {
            const data = wbLoad();
            data.entries = data.entries.filter(function (e) { return e.src !== 'char'; });
            wbSave();
        },
        clear: function () {
            wbLoad().entries = [];
            wbSave();
        },

        /* 从「创建角色与世界」的设定生成词条（自动词条，重开局时重建） */
        seedFromCharacter: function (chr) {
            try {
                if (!chr) return 0;
                worldbook.clearAuto();
                let n = 0;
                const add = function (title, keys, content) {
                    if (!content || String(content).replace(/\s/g, '').length < 2) return;
                    worldbook.add({ title: title, keys: keys, content: content, src: 'char' });
                    n++;
                };
                const dn = chr.dn || '灾变';
                add('世界 · ' + dn, [dn, '世界', '灾难'],
                    '灾难名称：' + dn + (chr.env ? '\n环境设定：' + chr.env : '') +
                    (chr.wr ? '\n世界规则：' + chr.wr : '') + (chr.danger ? '\n危险等级：' + chr.danger : ''));
                add('地理与据点', ['位置', '地点', '地理'].concat(wbSplitKeys((chr.loc || '') + '，' + (chr.geo || ''))),
                    (chr.geo ? '地理概貌：' + chr.geo + '\n' : '') + (chr.loc ? '已知地点：' + chr.loc : ''));
                if (chr.fac) add('势力与组织', ['势力', '组织', '阵营'].concat(wbSplitKeys(chr.fac)), '主要势力：' + chr.fac);
                if (chr.hist) add('历史背景', ['历史', '背景', '从前'], chr.hist);
                if (chr.res) add('资源分布', ['资源', '物资', '补给'], chr.res);
                if (chr.cn) add('角色 · ' + chr.cn, [chr.cn, '主角', '我'],
                    '名字：' + chr.cn + (chr.job ? '\n职业：' + chr.job : '') + (chr.bg ? '\n背景：' + chr.bg : '') +
                    (chr.pers ? '\n性格：' + chr.pers : '') + (chr.skl ? '\n技能：' + chr.skl : '') +
                    (chr.fear ? '\n恐惧：' + chr.fear : '') + (chr.mental ? '\n精神锚点：' + chr.mental : ''));
                return n;
            } catch (e) { return 0; }
        },

        /* 扫描最近对话，返回需要注入的世界书文本（未命中返回 ''） */
        matchContext: function () {
            try {
                const entries = wbLoad().entries.filter(function (e) { return e.on !== false; });
                if (!entries.length) return '';
                const hist = window._getHist ? window._getHist() : [];
                const tail = hist.slice(-8);
                if (!tail.length) return '';
                const text = tail.map(function (m) { return m && m.content ? String(m.content) : ''; }).join('\n');
                const low = text.toLowerCase();
                const hits = [];
                for (let i = 0; i < entries.length; i++) {
                    const keys = entries[i].keys || [];
                    let hit = false;
                    for (let k = 0; k < keys.length; k++) {
                        const key = String(keys[k] || '').trim().toLowerCase();
                        if (key.length >= 2 && low.indexOf(key) !== -1) { hit = true; break; }
                    }
                    if (hit && hits.length < 6) hits.push(entries[i]);
                }
                if (!hits.length) return '';
                hits.sort(function (a, b) { return (a.src === 'manual' ? -1 : 1) - (b.src === 'manual' ? -1 : 1); });
                let out = '【世界书 · 命中参考（自动检索，视为既定设定）】\n';
                hits.forEach(function (e) {
                    out += '■ ' + e.title + '\n' + e.content + '\n';
                });
                return out;
            } catch (e) { return ''; }
        },

        /* 世界书词条索引（供 AI 读取并按需新增） */
        keyIndex: function () {
            try {
                const entries = wbLoad().entries;
                if (!entries.length) return '';
                let out = '【世界书词条索引（AI 可读取；正文出现重要新设定时可用 [设定:新增-标题=内容] 记录为词条）】\n';
                entries.slice(0, 20).forEach(function (e) {
                    out += '- ' + e.title + '（关键词：' + (e.keys || []).join('/') + '）\n';
                });
                if (entries.length > 20) out += '…共 ' + entries.length + ' 条，可在「世界书」面板查看全部\n';
                return out;
            } catch (e) { return ''; }
        },

        /* AI 标签写入：[设定:新增-标题=内容] / [设定:标题=内容] */
        addFromTag: function (title, content) {
            try {
                const data = wbLoad();
                for (let i = 0; i < data.entries.length; i++) {
                    if (data.entries[i].title === title) {
                        data.entries[i].content = String(content).slice(0, 4000);
                        wbSave();
                        return data.entries[i];
                    }
                }
                return worldbook.add({ title: title, keys: title, content: content, src: 'ai' });
            } catch (e) { return null; }
        },

        /* 渲染世界书管理面板 */
        renderUI: function () {
            const box = $('worldbookContainer');
            if (!box) return;
            const entries = wbLoad().entries;
            if (!entries.length) {
                box.innerHTML = '<div class="wb-empty">暂无词条。创建角色后自动从设定导入；也可在下方手动添加。</div>';
                return;
            }
            box.innerHTML = '';
            entries.forEach(function (e) {
                const row = document.createElement('div');
                row.className = 'wb-entry' + (e.on === false ? ' wb-off' : '');
                const head = document.createElement('div');
                head.className = 'wb-entry-head';
                const ck = document.createElement('input');
                ck.type = 'checkbox'; ck.checked = e.on !== false;
                ck.addEventListener('change', function () {
                    worldbook.update(e.id, { on: ck.checked });
                    row.classList.toggle('wb-off', !ck.checked);
                });
                const t = document.createElement('span');
                t.className = 'wb-entry-title'; t.textContent = e.title;
                const ks = document.createElement('span');
                ks.className = 'wb-entry-keys';
                ks.textContent = (e.src === 'char' ? '[设定] ' : e.src === 'ai' ? '[AI] ' : '') + (e.keys || []).join(' / ');
                const btns = document.createElement('div');
                btns.className = 'wb-entry-btns';
                const bDel = document.createElement('button');
                bDel.textContent = '删除';
                bDel.addEventListener('click', function () {
                    worldbook.remove(e.id);
                    worldbook.renderUI();
                });
                btns.appendChild(bDel);
                head.appendChild(ck); head.appendChild(t); head.appendChild(ks); head.appendChild(btns);
                const ta = document.createElement('textarea');
                ta.rows = 3; ta.value = e.content;
                ta.addEventListener('change', debounce(function () {
                    worldbook.update(e.id, { content: ta.value });
                }, 400));
                row.appendChild(head); row.appendChild(ta);
                box.appendChild(row);
            });
        }
    };

    /* ================================================================
     * 2. 变量官（VarJudge）—— 专家模式：数值状态单独结算
     * ================================================================ */
    const VJ_NUM_KEYS = [
        ['饱腹', 'sa'], ['口渴', 'th'], ['疲劳', 'fa'], ['血量', 'hp'],
        ['精神', 'men'], ['体温', 'bt'], ['负重', 'wei']
    ];
    function vjSnapshot() {
        const s = window.gst();
        const o = {};
        VJ_NUM_KEYS.forEach(function (p) { o[p[0]] = s[p[1]]; });
        o['伤势'] = s.wd;
        o['心态'] = s.mood;
        return o;
    }
    const varJudge = {
        isEnabled: function () {
            try { const c = cfg(); return !!(c.expertMode && c.varJudge && c.key); } catch (e) { return false; }
        },
        /* 供 ptg() 判定：变量官开启时，正文里的数值标签交给变量官处理 */
        proseTagsBypassed: function () {
            return !!(window._vjApplying); // 变量官自己应用标签时放行
        },
        _systemPrompt: function () {
            return [
                '你是「变量官」——一个严格、公正的数据结算器，负责生存游戏中的数值状态裁定。',
                '【规则】',
                '1. 只输出标签行本身，不要任何解释、寒暄或多余文字；无变化时输出：[无]',
                '2. 可用标签（全部为绝对值，0-100，体温 30-45）：[饱腹:xx] [口渴:xx] [疲劳:xx] [血量:xx] [精神:xx] [体温:xx] [负重:xx]',
                '3. 可选文字标签：[伤势:文字] [心态:文字]',
                '4. 幅度参考：常规行动 1-5 点，剧烈/极端行动 5-15 点，休息恢复 5-15 点；一切以剧情合理性为准，禁止无理由大幅跳变。',
                '5. 正文中已发生的事实优先（吃了东西→饱腹上升；奔跑→疲劳上升；受伤→伤势恶化），不要否定正文。',
                '6. 只结算“本轮正文”造成的变化，基于给出的当前状态做增量或绝对值裁定。'
            ].join('\n');
        },
        run: async function (fullTx) {
            const c = cfg();
            const s = window.gst();
            const hist = window._getHist ? window._getHist() : [];
            let lastUser = '';
            for (let i = hist.length - 1; i >= 0; i--) {
                if (hist[i] && hist[i].role === 'user') { lastUser = String(hist[i].content || ''); break; }
            }
            const cur = [];
            VJ_NUM_KEYS.forEach(function (p) { cur.push(p[0] + ':' + s[p[1]]); });
            const user = [
                '【当前状态】' + cur.join(' ') + ' 伤势:' + (s.wd || '无') + ' 心态:' + (s.mood || '平静'),
                '【玩家行动】' + (lastUser || '（无明显行动）').slice(0, 500),
                '【本轮正文】\n' + String(fullTx || '').slice(0, 2500),
                '请输出本轮结算标签行（可多行）。'
            ].join('\n');
            const body = {
                model: c.model,
                messages: [
                    { role: 'system', content: varJudge._systemPrompt() },
                    { role: 'user', content: user }
                ],
                max_tokens: 160,
                temperature: 0.15,
                stream: false
            };
            const before = vjSnapshot();
            let out = '';
            for (let attempt = 0; attempt < 2 && !out; attempt++) {
                try {
                    const resp = await window._sendProxyRequest(c.ep, body, c.key, null, false);
                    const d = await resp.json();
                    out = (d && d.choices && d.choices[0] && d.choices[0].message && d.choices[0].message.content) || '';
                    if (out) break;
                } catch (e) { /* 重试一次 */ }
            }
            if (!out) {
                window.apb({ ty: 'system', tx: '⚖ 变量官结算失败，本轮跳过（网络或配置问题，不影响剧情）。' }, 0);
                return;
            }
            if (out.indexOf('[无]') !== -1 || !/\[[^\]]+\]/.test(out)) {
                window.apb({ ty: 'varblock', tx: '本轮无数值变化。' }, 0);
                return;
            }
            // 应用标签（放行标记：变量官输出不被 vjOn 拦截）
            window._vjApplying = true;
            try { window.ptg(out, false); } catch (e) {} finally { window._vjApplying = false; }
            // 结算标签写回最后一条 assistant 历史（重放/撤销时可一致复现）
            try {
                const hist = window._getHist ? window._getHist() : [];
                const tagList = (String(out).match(/\[[^\]\n]+\]/g) || []).filter(function (t) { return t.indexOf('[无]') === -1; });
                const vjText = tagList.map(function (t) {
                    const inner = t.slice(1, -1).replace(/：/g, ':').replace(/:\s+/g, ':');
                    const eq = inner.indexOf(':');
                    if (eq <= 0) return '';
                    return '[变量官:' + inner.slice(0, eq).trim() + '=' + inner.slice(eq + 1).trim() + ']';
                }).join('');
                for (let i = hist.length - 1; i >= 0; i--) {
                    if (hist[i] && hist[i].role === 'assistant') {
                        if (vjText) {
                            hist[i].content = String(hist[i].content || '') + '\n' + vjText.slice(0, 300);
                            if (typeof window.svh === 'function') window.svh(hist);
                        }
                        break;
                    }
                }
            } catch (e) {}
            // 结算差异展示
            const after = vjSnapshot();
            const lines = [];
            VJ_NUM_KEYS.forEach(function (p) {
                const a = before[p[0]], b = after[p[0]];
                if (typeof a === 'number' && typeof b === 'number' && a !== b) {
                    const d = b - a;
                    lines.push(p[0] + ' ' + a + ' → ' + b + '（' + (d > 0 ? '+' : '') + d + '）');
                }
            });
            if (before['伤势'] !== after['伤势']) lines.push('伤势 → ' + after['伤势']);
            if (before['心态'] !== after['心态']) lines.push('心态 → ' + after['心态']);
            window.apb({
                ty: 'varblock',
                tx: (lines.length ? lines.join('\n') : '本轮数值无变化。') + '\n· 已通过状态闸门验证'
            }, 0);
        }
    };

    /* ================================================================
     * 3. 双模型正文（推演 + 重组表达）
     * ================================================================ */
    const dual = {
        isEnabled: function () {
            try {
                const c = cfg();
                return !!(c.expertMode && c.dualModel && c.model2 && c.model2.trim() && c.key);
            } catch (e) { return false; }
        },
        _systemPrompt: function () {
            return [
                '你是专职的文笔师（第二模型）。你的唯一任务：重组下面这段正文的表达，让画面感、节奏与文学性更好。',
                '【铁律】',
                '1. 不增删任何事实：人物、物品、地点、数量、时间、事件顺序与结果必须与原文完全一致。',
                '2. 不替玩家做任何决定，不推进新剧情，不新增选项或状态标签。',
                '3. 输入正文中已有的结构标签（如 [panel:标题]…[/panel]、[monologue]）必须原样保留，除此之外不输出任何 [方括号] 标签、[choice] 选项或括号注释。',
                '4. 保持原文人称与段落结构，总长度与原文相当（±20% 以内）。'
            ].join('\n');
        },
        /* 返回 Promise<string>；失败抛出由调用方回退 */
        rewrite: async function (narrative) {
            const c = cfg();
            const body = {
                model: c.model2.trim(),
                messages: [
                    { role: 'system', content: dual._systemPrompt() },
                    { role: 'user', content: '【待重组正文】\n' + String(narrative || '').slice(0, 8000) + '\n\n输出重组后的正文（仅正文）：' }
                ],
                max_tokens: Math.max(1200, parseInt(c.maxT, 10) || 2000),
                temperature: 0.7,
                stream: false
            };
            let lastErr = null;
            for (let attempt = 0; attempt < 2; attempt++) {
                try {
                    const resp = await window._sendProxyRequest(c.ep, body, c.key, null, false);
                    const d = await resp.json();
                    const out = (d && d.choices && d.choices[0] && d.choices[0].message && d.choices[0].message.content) || '';
                    const clean = String(out).replace(/^\s*```[a-z]*\s*/i, '').replace(/```\s*$/, '').trim();
                    if (clean.length >= Math.max(30, narrative.length * 0.3)) return clean;
                    lastErr = new Error('润色结果过短');
                } catch (e) { lastErr = e; }
            }
            throw lastErr || new Error('双模型润色失败');
        }
    };

    /* ================================================================
     * 4. 记忆模式（开关 + 档案查看器）
     * ================================================================ */
    const memory = {
        isEnabled: function () {
            try { return cfg().memMode !== 'off'; } catch (e) { return true; }
        },
        _keyMems: function () {
            try { return JSON.parse(localStorage.getItem('vn_keyMemories') || '[]'); } catch (e) { return []; }
        },
        stats: function () {
            try {
                const rec = window.MEMORY_SYSTEM && typeof window.MEMORY_SYSTEM.loadRecords === 'function'
                    ? window.MEMORY_SYSTEM.loadRecords() : null;
                if (!rec) return null;
                return {
                    turn: (rec.turns || []).length,
                    longTerm: (rec.longTerm || []).length,
                    key: memory._keyMems().length
                };
            } catch (e) { return null; }
        },
        statsText: function () {
            const s = memory.stats();
            if (!s) return '记忆系统未初始化';
            return '一级记忆 ' + s.turn + ' 条 · 长期归档 ' + s.longTerm + ' 条 · 关键记忆 ' + s.key + ' 条';
        },
        renderViewer: function () {
            const box = $('dzMemoryContent');
            const bar = $('dzMemoryStatsBar');
            if (!box) return;
            try {
                const rec = window.MEMORY_SYSTEM.loadRecords();
                if (bar) bar.textContent = '当前模式：' + (memory.isEnabled() ? '总结式记忆（开启）' : '关闭（不记录新记忆）') + ' · ' + memory.statsText();
                box.innerHTML = '';
                const sec = function (title, rows, cls) {
                    if (!rows || !rows.length) return;
                    const h = document.createElement('div');
                    h.style.cssText = 'font-size:0.7rem;font-weight:700;color:var(--accent);margin:10px 0 6px;';
                    h.textContent = '「' + title + '」共 ' + rows.length + ' 条';
                    box.appendChild(h);
                    rows.slice().reverse().forEach(function (m) {
                        const row = document.createElement('div');
                        row.className = 'dz-mem-row' + (cls ? ' ' + cls : '');
                        const b = document.createElement('b');
                        if (m.turnRange) b.textContent = '第' + m.turnRange[0] + '-' + m.turnRange[1] + '轮：';
                        else if (m.turn) b.textContent = '第' + m.turn + '轮：';
                        else b.textContent = m.type ? '[' + m.type + '] ' : '';
                        row.appendChild(b);
                        row.appendChild(document.createTextNode(m.text || m.summary || ''));
                        box.appendChild(row);
                    });
                };
                sec('关键记忆（不可遗忘）', memory._keyMems(), 'dz-mem-key');
                sec('一级记忆（逐轮总结）', rec.turns || []);
                sec('长期归档（整合压缩）', rec.longTerm || []);
                if (!box.children.length) box.innerHTML = '<div class="wb-empty">暂无记忆。进行游戏后，每轮会自动生成总结式记忆。</div>';
            } catch (e) {
                box.innerHTML = '<div class="wb-empty">记忆数据读取失败</div>';
            }
        },
        clear: function () {
            try {
                if (window.MEMORY_SYSTEM && typeof window.MEMORY_SYSTEM.reset === 'function') window.MEMORY_SYSTEM.reset();
                try { localStorage.removeItem('vn_keyMemories'); } catch (e) {}
                memory.renderViewer();
            } catch (e) {}
        },
        exportJSON: function () {
            try {
                const rec = window.MEMORY_SYSTEM.loadRecords();
                const blob = new Blob([JSON.stringify({ records: rec, keyMemories: memory._keyMems() }, null, 2)], { type: 'application/json' });
                const a = document.createElement('a');
                a.href = URL.createObjectURL(blob);
                a.download = 'zday_memory_' + new Date().toISOString().slice(0, 10) + '.json';
                a.click();
                setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
            } catch (e) {}
        }
    };

    /* ================================================================
     * 5. 叙事与阅读（字号 + 台词高亮）
     * ================================================================ */
    const reading = {
        apply: function (c) {
            try {
                if (!c) c = cfg();
                const narr = parseInt(String(c.fsz || '15px'), 10) || 15;
                const panel = parseInt(c.fszPanel, 10) || 15;
                const ui = parseInt(c.fszUI, 10) || 14;
                const root = document.documentElement;
                root.style.setProperty('--font-narr', narr + 'px');
                root.style.setProperty('--font-panel', panel + 'px');
                root.style.setProperty('--font-ui', ui + 'px');
                document.body.classList.toggle('dz-hl-dialogue', c.hlDialogue !== false);
            } catch (e) {}
        },
        applyFromCfg: function () { reading.apply(null); },
        /* 三组滑杆（设置面板 / 叙事面板各一份）联动 + 实时预览 + 静默保存 */
        bindSliders: function () {
            const groups = [
                { narr: 'fontSizeNarr', panel: 'fontSizePanel', ui: 'fontSizeUi', hl: 'setHlDialogue',
                  outs: ['fontSizeNarrVal', 'fontSizePanelVal', 'fontSizeUiVal'] },
                { narr: 'fontSizeNarr2', panel: 'fontSizePanel2', ui: 'fontSizeUi2', hl: 'setHlDialogue2',
                  outs: ['fontSizeNarrVal2', 'fontSizePanelVal2', 'fontSizeUiVal2'] }
            ];
            const persist = debounce(function () {
                try {
                    const c = cfg();
                    scf(Object.assign({}, c, {
                        fsz: (parseInt($('fontSizeNarr').value, 10) || 15) + 'px',
                        fszPanel: parseInt($('fontSizePanel').value, 10) || 15,
                        fszUI: parseInt($('fontSizeUi').value, 10) || 14,
                        hlDialogue: !!($('setHlDialogue').checked)
                    }));
                } catch (e) {}
            }, 500);
            groups.forEach(function (g, gi) {
                const syncOther = function () {
                    const other = groups[1 - gi];
                    if (g.narr && $(other.narr)) $(other.narr).value = $(g.narr).value;
                    if (g.panel && $(other.panel)) $(other.panel).value = $(g.panel).value;
                    if (g.ui && $(other.ui)) $(other.ui).value = $(g.ui).value;
                    if (g.hl && $(other.hl)) $(other.hl).checked = $(g.hl).checked;
                    if (gi === 0) return;
                    // 从叙事面板同步到设置面板后同样持久化
                    try {
                        const c = cfg();
                        scf(Object.assign({}, c, {
                            fsz: (parseInt($('fontSizeNarr2').value, 10) || 15) + 'px',
                            fszPanel: parseInt($('fontSizePanel2').value, 10) || 15,
                            fszUI: parseInt($('fontSizeUi2').value, 10) || 14,
                            hlDialogue: !!($('setHlDialogue2').checked)
                        }));
                    } catch (e) {}
                };
                [g.narr, g.panel, g.ui].forEach(function (id, idx) {
                    const el = $(id);
                    if (!el) return;
                    el.addEventListener('input', function () {
                        if ($(g.outs[idx])) $(g.outs[idx]).textContent = el.value;
                        const o = groups[1 - gi].outs[idx];
                        if ($(groups[1 - gi].narr)) {
                            const otherEl = $([groups[1 - gi].narr, groups[1 - gi].panel, groups[1 - gi].ui][idx]);
                            if (otherEl) otherEl.value = el.value;
                            const oo = $(o);
                            if (oo) oo.textContent = el.value;
                        }
                        reading.apply({
                            fsz: ($('fontSizeNarr') || $('fontSizeNarr2')).value + 'px',
                            fszPanel: ($('fontSizePanel') || $('fontSizePanel2')).value,
                            fszUI: ($('fontSizeUi') || $('fontSizeUi2')).value,
                            hlDialogue: ($('setHlDialogue') || $('setHlDialogue2')).checked
                        });
                        persist();
                    });
                });
                if (g.hl && $(g.hl)) {
                    $(g.hl).addEventListener('change', function () {
                        syncOther();
                        document.body.classList.toggle('dz-hl-dialogue', $(g.hl).checked);
                        persist();
                    });
                }
            });
        },
        /* 打开设置/叙事面板时同步滑杆显示 */
        syncSliders: function () {
            try {
                const c = cfg();
                const narr = parseInt(String(c.fsz || '15px'), 10) || 15;
                const panel = parseInt(c.fszPanel, 10) || 15;
                const ui = parseInt(c.fszUI, 10) || 14;
                [['fontSizeNarr', narr, 'fontSizeNarrVal'], ['fontSizeNarr2', narr, 'fontSizeNarrVal2'],
                 ['fontSizePanel', panel, 'fontSizePanelVal'], ['fontSizePanel2', panel, 'fontSizePanelVal2'],
                 ['fontSizeUi', ui, 'fontSizeUiVal'], ['fontSizeUi2', ui, 'fontSizeUiVal2']].forEach(function (p) {
                    if ($(p[0])) $(p[0]).value = p[1];
                    if ($(p[2])) $(p[2]).textContent = p[1];
                });
                if ($('setHlDialogue')) $('setHlDialogue').checked = c.hlDialogue !== false;
                if ($('setHlDialogue2')) $('setHlDialogue2').checked = c.hlDialogue !== false;
            } catch (e) {}
        }
    };

    /* ================================================================
     * 6. 布局（侧边栏 / 主从分栏 / 可拖拽分隔条 / 移动端抽屉）
     * ================================================================ */
    const LAYOUT_KEY = 'zday_dz_layout_v1';
    const layout = {
        pref: { sidebar: 'open', panelW: 340 },
        _load: function () {
            try {
                const raw = localStorage.getItem(LAYOUT_KEY);
                if (raw) layout.pref = Object.assign(layout.pref, JSON.parse(raw));
            } catch (e) {}
            layout.applyPanelW();
        },
        _save: debounce(function () {
            try { localStorage.setItem(LAYOUT_KEY, JSON.stringify(layout.pref)); } catch (e) {}
        }, 400),
        isSidebarOpen: function () { return document.body.classList.contains('dz-sidebar-open'); },
        setSidebar: function (open, remember) {
            document.body.classList.toggle('dz-sidebar-open', open);
            if (!open) document.body.classList.add('dz-sidebar-collapsed');
            else document.body.classList.remove('dz-sidebar-collapsed');
            if (isDesktop()) {
                if (remember !== false) { layout.pref.sidebar = open ? 'open' : 'closed'; layout._save(); }
            } else {
                document.body.classList.remove('dz-sidebar-collapsed');
            }
        },
        applyPanelW: function () {
            document.documentElement.style.setProperty('--dz-panel-w', (parseInt(layout.pref.panelW, 10) || 340) + 'px');
        },
        init: function () {
            layout._load();
            // 桌面端默认展开侧栏（记住偏好），移动端默认收起
            layout.setSidebar(isDesktop() ? layout.pref.sidebar !== 'closed' : false, false);
            document.body.classList.toggle('dz-panel-dock', isDesktop());
            // 汉堡 / 关闭 / 遮罩
            const nav = $('btnNavMenu');
            if (nav) nav.addEventListener('click', function () {
                layout.setSidebar(!layout.isSidebarOpen(), isDesktop());
            });
            const close = $('dzSidebarClose');
            if (close) close.addEventListener('click', function () { layout.setSidebar(false, isDesktop()); });
            const ov = $('dzNavOverlay');
            if (ov) ov.addEventListener('click', function () { layout.setSidebar(false, false); });
            // 侧栏镜像按钮 → 委托触发原按钮
            document.querySelectorAll('[data-mirror]').forEach(function (btn) {
                btn.addEventListener('click', function () {
                    const orig = $(btn.getAttribute('data-mirror'));
                    if (orig) {
                        orig.click();
                        setTimeout(function () { layout.syncMirror(btn); }, 60);
                        if (!isDesktop()) layout.setSidebar(false, false); // 移动端点按后收起抽屉
                    }
                });
            });
            layout.syncAllMirrors();
            layout.observeOrigins();
            // 从面板停靠宽度拖拽
            const bar = $('dzDragbar');
            if (bar) {
                let dragging = false;
                const onDown = function (ev) {
                    dragging = true;
                    bar.classList.add('dragging');
                    document.body.classList.add('dz-dragging');
                    ev.preventDefault();
                };
                const onMove = function (ev) {
                    if (!dragging) return;
                    const main = $('dzMain');
                    if (!main) return;
                    const rect = main.getBoundingClientRect();
                    const x = (ev.touches ? ev.touches[0].clientX : ev.clientX);
                    const w = Math.round(rect.right - x);
                    const clamped = Math.max(240, Math.min(w, Math.min(720, Math.round(window.innerWidth * 0.6))));
                    layout.pref.panelW = clamped;
                    layout.applyPanelW();
                };
                const onUp = function () {
                    if (!dragging) return;
                    dragging = false;
                    bar.classList.remove('dragging');
                    document.body.classList.remove('dz-dragging');
                    layout._save();
                };
                bar.addEventListener('mousedown', onDown);
                bar.addEventListener('touchstart', onDown, { passive: false });
                window.addEventListener('mousemove', onMove);
                window.addEventListener('touchmove', onMove, { passive: true });
                window.addEventListener('mouseup', onUp);
                window.addEventListener('touchend', onUp);
                bar.addEventListener('dblclick', function () {
                    const sp = $('sidePanel');
                    if (sp) {
                        sp.classList.remove('open');
                        const so = $('sideOverlay');
                        if (so) so.classList.remove('show');
                    }
                });
            }
            // 从面板关闭按钮
            const spc = $('btnCloseSidePanel');
            if (spc) spc.addEventListener('click', function () {
                const sp = $('sidePanel');
                if (sp) sp.classList.remove('open');
                const so = $('sideOverlay');
                if (so) so.classList.remove('show');
            });
            // 响应式切换
            window.addEventListener('resize', debounce(function () {
                document.body.classList.toggle('dz-panel-dock', isDesktop());
                if (!isDesktop()) document.body.classList.remove('dz-sidebar-collapsed');
                else if (layout.pref.sidebar !== 'closed') layout.setSidebar(true, false);
            }, 200));
        },
        syncMirror: function (btn) {
            const orig = $(btn.getAttribute('data-mirror'));
            if (!orig || !btn) return;
            const t = (orig.textContent || '').trim();
            if (t) {
                // 保留镜像按钮的图标前缀（原按钮文本一般自带 emoji）
                btn.textContent = t;
            }
        },
        syncAllMirrors: function () {
            document.querySelectorAll('[data-mirror]').forEach(layout.syncMirror);
        },
        /* 挂机/主题/音效等按钮文本会动态变化 → 用 MutationObserver 保持镜像同步 */
        observeOrigins: function () {
            ['btnIdle', 'btnTheme', 'btnSfx', 'btnBgm', 'btnNewGame'].forEach(function (id) {
                const orig = $(id);
                if (!orig) return;
                try {
                    const mo = new MutationObserver(function () {
                        document.querySelectorAll('[data-mirror="' + id + '"]').forEach(layout.syncMirror);
                    });
                    mo.observe(orig, { childList: true, subtree: true, characterData: true, attributes: true });
                } catch (e) {}
            });
        }
    };

    /* ================================================================
     * 7. 专家模式 UI 同步
     * ================================================================ */
    const expert = {
        on: function () { try { return !!cfg().expertMode; } catch (e) { return false; } },
        syncUI: function () {
            const on = expert.on();
            ['charExpertBlock', 'setExpertBlock'].forEach(function (id) {
                const el = $(id);
                if (el) el.style.display = on ? 'block' : 'none';
            });
        }
    };

    /* ================================================================
     * 8. 开局第四步：AI 与功能（表单 ↔ cfg，全部静默保存）
     * ================================================================ */
    const charStep4 = {
        _save: debounce(function () {
            try {
                const c = cfg();
                const newKey = $('charKey') ? $('charKey').value : '';
                const finalKey = (newKey && newKey.trim() !== '') ? newKey.trim() : (c.key || '');
                const pickModel = ($('charModelSelect') && $('charModelSelect').style.display !== 'none')
                    ? $('charModelSelect').value : (($('charModel') && $('charModel').style.display !== 'none') ? $('charModel').value : c.model);
                scf(Object.assign({}, c, {
                    aiEnabled: !!($('charAiEnabled') && $('charAiEnabled').checked),
                    expertMode: !!($('charExpertMode') && $('charExpertMode').checked),
                    preset: ($('charApiPreset') || {}).value || c.preset,
                    ep: (($('charEndpoint') || {}).value || '').trim() || c.ep,
                    model: (pickModel || '').trim() || c.model,
                    key: finalKey,
                    dualModel: !!($('charDualModel') && $('charDualModel').checked),
                    model2: (($('charModel2') || {}).value || '').trim(),
                    varJudge: !!($('charVarJudge') && $('charVarJudge').checked),
                    memMode: ($('charMemMode') && $('charMemMode').checked) ? 'summary' : 'off',
                    modelMem: (($('charModelMem') || {}).value || '').trim()
                }));
                expert.syncUI();
            } catch (e) {}
        }, 250),

        fill: function () {
            try {
                const c = cfg();
                if ($('charAiEnabled')) $('charAiEnabled').checked = c.aiEnabled !== false;
                if ($('charExpertMode')) $('charExpertMode').checked = !!c.expertMode;
                // 预设
                const presetSel = $('charApiPreset');
                if (presetSel) {
                    presetSel.value = AP[c.preset] ? c.preset : 'custom';
                }
                if ($('charEndpoint')) $('charEndpoint').value = c.ep || '';
                // 模型下拉 + 自定义输入
                const p = AP[c.preset] || AP.custom;
                const sl = $('charModelSelect'), mi = $('charModel');
                if (sl && mi) {
                    sl.innerHTML = '';
                    if (p.md && p.md.length) {
                        p.md.forEach(function (m) { sl.add(new Option(m, m)); });
                        if (c.model && p.md.indexOf(c.model) === -1) sl.add(new Option(c.model, c.model));
                        sl.value = c.model || p.md[0];
                        sl.style.display = '';
                        mi.style.display = 'none';
                    } else {
                        sl.style.display = 'none';
                        mi.style.display = '';
                        mi.value = c.model || '';
                    }
                }
                if ($('charKey')) $('charKey').value = c.key || '';
                if ($('charDualModel')) $('charDualModel').checked = !!c.dualModel;
                if ($('charModel2')) $('charModel2').value = c.model2 || '';
                if ($('charVarJudge')) $('charVarJudge').checked = !!c.varJudge;
                if ($('charMemMode')) $('charMemMode').checked = c.memMode !== 'off';
                if ($('charModelMem')) $('charModelMem').value = c.modelMem || '';
                expert.syncUI();
            } catch (e) {}
        },

        bind: function () {
            const presetSel = $('charApiPreset');
            if (presetSel) presetSel.addEventListener('change', function () {
                const p = AP[presetSel.value] || AP.custom;
                if ($('charEndpoint')) $('charEndpoint').value = p.ep;
                const sl = $('charModelSelect'), mi = $('charModel');
                if (sl && mi) {
                    sl.innerHTML = '';
                    if (p.md && p.md.length) {
                        p.md.forEach(function (m) { sl.add(new Option(m, m)); });
                        sl.value = p.md[0];
                        sl.style.display = '';
                        mi.style.display = 'none';
                    } else {
                        sl.style.display = 'none';
                        mi.style.display = '';
                    }
                }
                charStep4._save();
            });
            ['charAiEnabled', 'charExpertMode', 'charDualModel', 'charVarJudge', 'charMemMode'].forEach(function (id) {
                if ($(id)) $(id).addEventListener('change', charStep4._save);
            });
            ['charEndpoint', 'charModel', 'charModel2', 'charModelMem', 'charKey'].forEach(function (id) {
                if ($(id)) $(id).addEventListener('input', charStep4._save);
            });
            const sl = $('charModelSelect');
            if (sl) sl.addEventListener('change', charStep4._save);
            // 测试连接
            const test = $('btnCharTestApi');
            if (test) test.addEventListener('click', async function () {
                const hint = $('charTestHint');
                if (hint) { hint.textContent = '⏳ 正在测试连接…'; hint.style.color = 'var(--text-muted)'; }
                try {
                    const c = cfg();
                    const body = { model: c.model, messages: [{ role: 'user', content: 'hi' }], max_tokens: 8, stream: false };
                    const resp = await window._sendProxyRequest(c.ep, body, c.key, null, false);
                    if (resp.ok) {
                        const d = await resp.json().catch(function () { return null; });
                        if (hint) { hint.textContent = '✓ 连接成功' + (d && d.model ? '（' + d.model + '）' : ''); hint.style.color = 'var(--notify-add)'; }
                    } else {
                        if (hint) { hint.textContent = '✗ 连接失败：HTTP ' + resp.status + (resp.status === 401 ? '（密钥无效）' : ''); hint.style.color = 'var(--notify-remove)'; }
                    }
                } catch (e) {
                    if (hint) { hint.textContent = '✗ 连接失败：' + (e && e.message ? e.message : '网络错误'); hint.style.color = 'var(--notify-remove)'; }
                }
            });
            // 拉取模型列表
            const fetchBtn = $('btnCharFetchModels');
            if (fetchBtn) fetchBtn.addEventListener('click', async function () {
                const sl2 = $('charModelSelect');
                if (!sl2) return;
                try {
                    const c = cfg();
                    const modelsUrl = String(c.ep || '').replace(/\/chat\/completions\/?$/, '/models');
                    const base = modelsUrl.startsWith('http') ? modelsUrl : (c.ep || '').replace(/\/[^/]*$/, '/models');
                    const resp = await window._sendProxyRequest(base, null, c.key, 'GET', false);
                    const d = await resp.json();
                    const ids = (d && d.data || []).map(function (m) { return m.id; }).filter(Boolean);
                    if (ids.length) {
                        sl2.innerHTML = '';
                        ids.forEach(function (m) { sl2.add(new Option(m, m)); });
                        sl2.style.display = '';
                        if ($('charModel')) $('charModel').style.display = 'none';
                        sl2.value = ids.indexOf(c.model) !== -1 ? c.model : ids[0];
                        charStep4._save();
                    }
                } catch (e) {}
            });
        },

        /* 开局确认时调用：确保最终值已落盘 + 用设定种入世界书 */
        onConfirm: function (chr) {
            charStep4._save();
            try { worldbook.seedFromCharacter(chr); } catch (e) {}
        }
    };

    /* ================================================================
     * 9. 系统提示注入（gsp 每轮调用）
     * ================================================================ */
    function buildSystemNote() {
        const parts = [];
        try {
            const c = cfg();
            // 世界书命中参考
            const wb = worldbook.matchContext();
            if (wb) parts.push(wb);
            // 词条索引（读取能力）——限制长度，命中参考已经很长时不重复注入
            if (worldbook.count() && parts.join('').length < 2600) {
                const idx = worldbook.keyIndex();
                if (idx) parts.push(idx);
            }
            // 自定义变量快照（读取 + 修改能力）
            const s = window.gst();
            if (s && s.customVars && Object.keys(s.customVars).length) {
                const pairs = Object.keys(s.customVars).map(function (k) { return k + '=' + s.customVars[k]; }).join('；');
                parts.push('【自定义变量（可读可写，用 [变量:名=值] 标签创建/修改）】\n' + pairs.slice(0, 600));
            }
            if (c.expertMode && c.varJudge) {
                parts.push('【变量官规则】数值状态（饱腹/口渴/疲劳/血量/精神/体温/伤势/负重）由独立的「变量官」在本轮结束后结算，你不必输出这些数值标签，专注叙事即可；事实类标签（物品/线索/地图/事件/关系/时间/心态等）照常输出。');
            }
            if (dual.isEnabled()) {
                parts.push('【双模型写作模式】你的正文将由第二模型重组润色。请优先保证：推演逻辑清晰、事实与状态标签完整、事件结果明确；文笔从简，不必雕琢词藻。');
            }
            if (c.aiEnabled === false) {
                parts.push('【AI 已关闭】当前为本地模式，任何 AI 请求都不会发送。');
            }
        } catch (e) {}
        return parts.join('\n');
    }
    function systemNoteHash() {
        try {
            const c = cfg();
            const s = window.gst();
            return [
                _wbVer,
                worldbook.count(),
                c.expertMode ? 1 : 0,
                c.varJudge ? 1 : 0,
                c.dualModel ? 1 : 0,
                c.aiEnabled === false ? 1 : 0,
                c.memMode === 'off' ? 1 : 0,
                s && s.customVars ? Object.keys(s.customVars).length : 0
            ].join('-');
        } catch (e) { return 'dz'; }
    }

    /* ================================================================
     * 10. 模态框：打开/关闭/遮罩
     * ================================================================ */
    function bindModal(overlayId, closeBtnId, onOpen) {
        const ov = $(overlayId);
        if (!ov) return;
        ov.addEventListener('click', function (ev) { if (ev.target === ov) ov.style.display = 'none'; });
        const cb = $(closeBtnId);
        if (cb) cb.addEventListener('click', function () { ov.style.display = 'none'; });
        if (onOpen) {
            // 外部通过 dzOpen 打开时回调
            ov.addEventListener('dz:open', function () { onOpen(); });
        }
    }
    function openModal(id) {
        const ov = $(id);
        if (!ov) return;
        ov.style.display = 'flex';
        ov.dispatchEvent(new CustomEvent('dz:open'));
    }

    /* ================================================================
     * 11. 叙事与阅读面板（字号 + 写作准绳 + 目标字数）
     * ================================================================ */
    const narrative = {
        open: function () {
            reading.syncSliders();
            try {
                // 写作准绳渲染到第二容器（复用 writing_guidelines 的渲染器）
                const box = $('writingGuidelinesContainer2');
                if (box && window.WRITING_GUIDELINES && typeof window.WRITING_GUIDELINES.renderSettings === 'function') {
                    window.WRITING_GUIDELINES.renderSettings(box);
                }
                const c = cfg();
                const sel = $('targetWordCountSelect2');
                if (sel) sel.value = String(c.targetWordCount || 0);
            } catch (e) {}
            openModal('narrativeModal');
        },
        bind: function () {
            const ok = $('btnNarrativeOk');
            if (ok) ok.addEventListener('click', function () {
                try {
                    const c = cfg();
                    const v = parseInt(($('targetWordCountSelect2') || {}).value, 10) || 0;
                    scf(Object.assign({}, c, { targetWordCount: v }));
                    const orig = $('targetWordCountSelect');
                    if (orig) orig.value = String(v);
                } catch (e) {}
                $('narrativeModal').style.display = 'none';
            });
        }
    };

    /* ================================================================
     * 12. 设置面板联动（AI 功能/专家模式/记忆开关在设置里也可改）
     * ================================================================ */
    const settingsHooks = {
        bind: function () {
            const ai = $('setAiEnabled');
            if (ai) ai.addEventListener('change', debounce(function () {
                const c = cfg(); scf(Object.assign({}, c, { aiEnabled: ai.checked }));
            }, 250));
            const ex = $('setExpertMode');
            if (ex) ex.addEventListener('change', debounce(function () {
                const c = cfg(); scf(Object.assign({}, c, { expertMode: ex.checked }));
                expert.syncUI();
            }, 250));
            const dm = $('setDualModel');
            if (dm) dm.addEventListener('change', debounce(function () {
                const c = cfg(); scf(Object.assign({}, c, { dualModel: dm.checked }));
            }, 250));
            const m2 = $('setModel2');
            if (m2) m2.addEventListener('input', debounce(function () {
                const c = cfg(); scf(Object.assign({}, c, { model2: m2.value.trim() }));
            }, 400));
            const vj = $('setVarJudge');
            if (vj) vj.addEventListener('change', debounce(function () {
                const c = cfg(); scf(Object.assign({}, c, { varJudge: vj.checked }));
            }, 250));
            const mm = $('setModelMem');
            if (mm) mm.addEventListener('input', debounce(function () {
                const c = cfg(); scf(Object.assign({}, c, { modelMem: mm.value.trim() }));
            }, 400));
            const mem = $('setMemMode');
            if (mem) mem.addEventListener('change', debounce(function () {
                const c = cfg(); scf(Object.assign({}, c, { memMode: mem.checked ? 'summary' : 'off' }));
                settingsHooks.syncMemUI();
            }, 250));
            const mv = $('btnOpenMemoryViewer');
            if (mv) mv.addEventListener('click', function () {
                memory.renderViewer();
                openModal('memoryModal');
            });
            // 注：打开设置面板时的 syncAll 由 main.js 的 btnSettings 处理器调用，此处不重复绑定
        },
        syncAll: function () {
            try {
                const c = cfg();
                if ($('setAiEnabled')) $('setAiEnabled').checked = c.aiEnabled !== false;
                if ($('setExpertMode')) $('setExpertMode').checked = !!c.expertMode;
                if ($('setDualModel')) $('setDualModel').checked = !!c.dualModel;
                if ($('setModel2')) $('setModel2').value = c.model2 || '';
                if ($('setVarJudge')) $('setVarJudge').checked = !!c.varJudge;
                if ($('setModelMem')) $('setModelMem').value = c.modelMem || '';
                if ($('setMemMode')) $('setMemMode').checked = c.memMode !== 'off';
                reading.syncSliders();
                expert.syncUI();
                settingsHooks.syncMemUI();
            } catch (e) {}
        },
        syncMemUI: function () {
            const el = $('dzMemStats');
            if (el) el.textContent = memory.statsText();
        }
    };

    /* ================================================================
     * 13. 对外暴露 + 初始化
     * ================================================================ */
    window.DZ = {
        worldbook: worldbook,
        varJudge: varJudge,
        dual: dual,
        memory: memory,
        reading: reading,
        layout: layout,
        expert: expert,
        charStep4: charStep4,
        narrative: narrative,
        settingsHooks: settingsHooks,
        buildSystemNote: buildSystemNote,
        systemNoteHash: systemNoteHash,
        openModal: openModal
    };

    function init() {
        try { wbLoad(); } catch (e) {}
        reading.applyFromCfg();
        layout.init();
        charStep4.bind();
        narrative.bind();
        settingsHooks.bind();
        expert.syncUI();
        // 新模态框
        bindModal('worldbookModal', 'modalCloseWorldbook', worldbook.renderUI);
        bindModal('narrativeModal', 'modalCloseNarrative');
        bindModal('memoryModal', 'modalCloseMemory');
        // 侧栏按钮
        const wb = $('dzBtnWorldbook');
        if (wb) wb.addEventListener('click', function () { worldbook.renderUI(); openModal('worldbookModal'); });
        const nr = $('dzBtnNarrative');
        if (nr) nr.addEventListener('click', function () { narrative.open(); });
        const mm2 = $('dzBtnMemory');
        if (mm2) mm2.addEventListener('click', function () { memory.renderViewer(); openModal('memoryModal'); });
        // 世界书新增/导入
        const add = $('btnWbAdd');
        if (add) add.addEventListener('click', function () {
            const title = ($('wbNewTitle') || {}).value;
            const keys = ($('wbNewKeys') || {}).value;
            const content = ($('wbNewContent') || {}).value;
            if (!title || !content) { return; }
            worldbook.add({ title: title, keys: keys || title, content: content, src: 'manual' });
            $('wbNewTitle').value = ''; $('wbNewKeys').value = ''; $('wbNewContent').value = '';
            worldbook.renderUI();
        });
        const seed = $('btnWbSeedFromChar');
        if (seed) seed.addEventListener('click', function () {
            const n = worldbook.seedFromCharacter(window.gch());
            worldbook.renderUI();
        });
        // 记忆档案按钮
        const mclear = $('btnMemoryClear');
        if (mclear) mclear.addEventListener('click', memory.clear);
        const mexp = $('btnMemoryExport');
        if (mexp) mexp.addEventListener('click', memory.exportJSON);
        // 周期性同步记忆统计（轻量）
        setInterval(function () {
            try {
                if ($('settingsModal') && $('settingsModal').style.display !== 'none') settingsHooks.syncMemUI();
            } catch (e) {}
        }, 5000);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
