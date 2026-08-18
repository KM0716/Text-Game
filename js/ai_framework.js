// =====================================================================
//  AI 调用框架 / 模板系统  (ai_framework.js)
//  暴露全局 window.AI_FRAMEWORK
//  目的：为 AI 提供标准不变的输出模式、标签白名单、校验修正、兜底补齐
//  避免 AI 调用错误，减少人工清洗、减少 token 浪费
// =====================================================================
(function () {
    'use strict';

    const AF = {};

    // ============================================================
    //  1. OUTPUT_TEMPLATES: 标准三段式输出模板（供系统Prompt嵌入）
    // ============================================================
    AF.OUTPUT_TEMPLATES = {
        STANDARD: `
■ 剧情正文：
  100-400 字连续叙述，纯中文、分段自然。不带括号注释与场外说明。
  角色说话用引号，环境描写用客观句。

■ 行动选项（3-4 条，单条正文不超过 14 个汉字）：
  [choice]选项1|选项2|选项3[/choice]
  ⚠ 选项只能写纯行动短句，禁止任何标签序号括号。

■ 状态标签（仅在剧情正文末尾追加，格式严格如下）：
  [饱腹:70][口渴:65][疲劳:25][时间:+1h]
  [物品:+罐头][物品:-绷带][线索:密码是1234]
  [地图:解锁-医院][地点:医院大厅][天气:晴]
`.trim(),

        COMPACT: `
【输出三段式，严格遵守，缺一不可】
1. 剧情正文：100-400字。
2. 选项：[choice]动作1|动作2|动作3[/choice]，每个动作≤14字，无序号。
3. 标签：状态变化用[XX:值]，无变化可省略，仅末尾一行。
`.trim()
    };

    // ============================================================
    //  2. ALLOWED_TAGS: 标签白名单（键=标签前缀，值={type, pattern, 说明}）
    //     未在白名单中的标签将被过滤，避免 AI 乱写
    // ============================================================
    AF.ALLOWED_TAGS = new Map([
        // 数值状态（数字/范围）
        ['饱腹',       { type: 'number', range: [0, 100], key: 'hunger' }],
        ['口渴',       { type: 'number', range: [0, 100], key: 'thirst' }],
        ['疲劳',       { type: 'number', range: [0, 100], key: 'fatigue' }],
        ['体温',       { type: 'float',  range: [30, 45], key: 'bodyTemp' }],
        ['伤势',       { type: 'string', key: 'injury' }],
        ['负重',       { type: 'float',  min: 0, key: 'enc' }],
        ['血量',       { type: 'number', range: [0, 100], key: 'hp' }],
        ['精神',       { type: 'number', range: [0, 100], key: 'spirit' }],
        ['感染',       { type: 'number', range: [0, 100], key: 'infection' }],
        // 物品
        ['物品:+',     { type: 'item_add',  alias: ['获得物品:+', '物品获得:+'] }],
        ['物品:-',     { type: 'item_rem',  alias: ['丢弃物品:-', '物品丢失:-'] }],
        // 线索
        ['线索',       { type: 'clue_add', alias: ['新增线索', 'clue'] }],
        ['线索删除',   { type: 'clue_rem' }],
        // 地图/地点
        ['地图:解锁-', { type: 'map_unlock', alias: ['地图:解锁'] }],
        ['地图:新增-', { type: 'map_newarea' }],
        ['地图:扩展-', { type: 'map_expand' }],
        ['地点',       { type: 'location', alias: ['位置', 'location'] }],
        // 天气/时间
        ['天气',       { type: 'weather', alias: ['weather'] }],
        ['气温',       { type: 'temp' }],
        ['时间:+',     { type: 'adv_time', alias: ['时间推进', '推进时间'] }],
        // 特质/技能/装备
        ['特质+',      { type: 'trait_add' }],
        ['特质-',      { type: 'trait_rem' }],
        ['技能+',      { type: 'skill_add' }],
        ['技能-',      { type: 'skill_rem' }],
        ['装备',       { type: 'equip' }],
        // 载具/异能
        ['载具',       { type: 'vehicle' }],
        ['异能:升级',  { type: 'ability_up' }],
        ['异能:等级-', { type: 'ability_level' }]
    ]);

    // 查找标签（考虑别名），返回 [规范前缀, ALLOWED_TAGS 定义]
    function _findTagDef(rawTag) {
        if (!rawTag) return null;
        for (const [prefix, def] of AF.ALLOWED_TAGS) {
            if (rawTag.startsWith(prefix)) return [prefix, def];
            if (def.alias) {
                for (const a of def.alias) {
                    if (rawTag.startsWith(a)) return [prefix, def];
                }
            }
        }
        return null;
    }

    // ============================================================
    //  3. VALIDATORS: 输出校验 + 自动修正
    // ============================================================
    AF.VALIDATORS = {};

    /**
     * validateChoices(arr): 校验选项
     * - 数量 2-6 条
     * - 单条 ≤ 14 个汉字（纯中文），超长截断加省略号
     * - 去除残留标签/序号，调用 _normalizeChoiceText（若可用）
     * - 去重、去空
     */
    AF.VALIDATORS.validateChoices = function (choices) {
        try {
            let arr = Array.isArray(choices) ? choices.slice() : [];
            // 1) 清洗/去标签/去序号
            const normFn = (typeof window._normalizeChoiceText === 'function')
                ? window._normalizeChoiceText
                : (s) => {
                    if (!s) return '';
                    let x = String(s);
                    for (let i = 0; i < 3; i++) {
                        const b = x;
                        x = x.replace(/[\[【\(（<][^\[\]【】\(\)（）<>]{0,40}[\]】\)）>]/g, ' ');
                        if (x === b) break;
                    }
                    x = x.replace(/^\s*[\d①-⑳A-Za-z一二三四五六七八九十]+\s*[.、)）\]】:：]?\s*/, '');
                    x = x.trim();
                    return x;
                };
            arr = arr.map(c => normFn(c)).filter(Boolean);
            // 2) 去重（小写化中文文本比较）
            const seen = new Set();
            arr = arr.filter(c => {
                const k = String(c).toLowerCase().replace(/\s+/g, '');
                if (seen.has(k)) return false;
                seen.add(k); return true;
            });
            // 3) 字数硬限 14 汉字
            arr = arr.map(c => String(c).length > 15 ? String(c).slice(0, 13) + '…' : c);
            // 4) 数量保护
            if (arr.length < 2) {
                const fb = AF.FALLBACKS && AF.FALLBACKS.fallbackChoices
                    ? AF.FALLBACKS.fallbackChoices({ reason: '选项不足' })
                    : ['观察周围环境', '检查随身装备', '原地警戒片刻'];
                arr = [...arr, ...fb].slice(0, 4);
            } else if (arr.length > 6) {
                arr = arr.slice(0, 6);
            }
            return arr;
        } catch (e) {
            console.warn('[AI_FRAMEWORK.validateChoices] error:', e);
            return ['观察周围环境', '检查随身装备', '原地警戒片刻'];
        }
    };

    /**
     * validateTags(text): 从文本中提取 [标签:值]，仅保留白名单合法标签，过滤非法的
     * 返回 { cleanedText: 文本（非法标签去掉括号）, tagTokens: [合法rawTagStr,...] }
     */
    AF.VALIDATORS.validateTags = function (text) {
        if (!text) return { cleanedText: '', tagTokens: [] };
        const tokens = [];
        const cleaned = String(text).replace(/\[([^\]]+)\]/g, (m, raw) => {
            const norm = raw.replace(/：/g, ':').replace(/:\s+/g, ':');
            const hit = _findTagDef(norm);
            if (hit) {
                tokens.push('[' + norm + ']');
                return m; // 合法标签保留
            }
            // 非法标签：去掉括号，内容作为普通文本保留（减少AI输出丢失）
            return '（' + raw + '）';
        });
        return { cleanedText: cleaned, tagTokens: tokens };
    };

    /**
     * validateOutput(text): 校验AI完整输出，缺失选项则用fallback补齐
     * 返回 { narrative, choices, tagsText, fullText }
     */
    AF.VALIDATORS.validateOutput = function (rawText) {
        try {
            const t = (rawText || '').trim();
            // 1) 切分 choice 块
            let choices = null;
            let body = t;
            const chMatch = t.match(/\[choice\]([\s\S]*?)\[\/choice\]/i);
            if (chMatch) {
                const raw = chMatch[1];
                // 用 safeSplitChoices（若 window 有）或自带分割
                const splitFn = (typeof window.safeSplitChoices === 'function')
                    ? window.safeSplitChoices
                    : (r) => {
                        if (!r) return [];
                        let x = r;
                        if (/[、；;\|\r\n]/.test(x)) {
                            return x.split(/[、；;\|\r\n]+/).map(s => s.trim()).filter(Boolean);
                        }
                        return [x.trim()];
                      };
                choices = splitFn(raw);
                body = (t.slice(0, chMatch.index) + t.slice(chMatch.index + chMatch[0].length)).trim();
            }
            // 2) 校验/补齐选项
            choices = AF.VALIDATORS.validateChoices(choices || []);
            // 3) 校验标签
            const tagRes = AF.VALIDATORS.validateTags(body);
            let narrative = tagRes.cleanedText.replace(/\n{3,}/g, '\n\n').trim();
            // 4) 如果没有剧情（空），用兜底叙事
            if (!narrative) {
                narrative = (AF.FALLBACKS && AF.FALLBACKS.fallbackNarrative)
                    ? AF.FALLBACKS.fallbackNarrative({})
                    : '你停顿了一会儿，整理了一下思绪。';
            }
            // 5) 重组成标准完整文本（带 choice 块，保持AI原格式）
            const fullText = narrative + '\n\n' + '[choice]' + choices.join('|') + '[/choice]' +
                (tagRes.tagTokens.length ? '\n' + tagRes.tagTokens.join('') : '');
            return { narrative, choices, tagsText: tagRes.tagTokens.join(''), fullText };
        } catch (e) {
            console.warn('[AI_FRAMEWORK.validateOutput] error:', e);
            const fb = ['观察周围环境', '检查随身装备', '原地警戒片刻'];
            return { narrative: rawText || '剧情推进中…', choices: fb, tagsText: '', fullText: (rawText || '') + '\n[choice]' + fb.join('|') + '[/choice]' };
        }
    };

    // ============================================================
    //  4. FALLBACKS: 兜底补齐
    // ============================================================
    AF.FALLBACKS = {};

    /**
     * fallbackChoices(ctx): 根据玩家当前状态智能生成中性选项
     * ctx: { s: gst(), c: gch(), clk: gclk(), reason: string }
     */
    AF.FALLBACKS.fallbackChoices = function (ctx) {
        try {
            const base = ['观察周围环境', '检查随身装备', '原地警戒片刻'];
            const s = (ctx && ctx.s) || (typeof window.gst === 'function' ? window.gst() : null);
            const clk = (ctx && ctx.clk) || (typeof window.gclk === 'function' ? window.gclk() : null);
            if (s) {
                if (s.hunger != null && s.hunger < 40) base.push('寻找食物补给');
                if (s.thirst != null && s.thirst < 40) base.push('寻找清洁水源');
                if (s.hp != null && s.hp < 70) base.push('检查并处理伤势');
                if (s.fatigue != null && s.fatigue > 70) base.push('找地点稍作休息');
            }
            if (clk) {
                const phase = clk.dayPhase || (typeof window.dayPhase === 'function' ? window.dayPhase(clk.elapsedSec) : '');
                if (phase === 'night' || phase === 'dusk') base.push('寻找过夜的地点');
                if (phase === 'dawn') base.push('趁着晨光出发');
            }
            // 去重
            const seen = new Set();
            return base.filter(c => { if (seen.has(c)) return false; seen.add(c); return true; }).slice(0, 4);
        } catch (e) {
            return ['观察周围环境', '检查随身装备', '原地警戒片刻'];
        }
    };

    /**
     * fallbackNarrative(ctx): AI 返回空/错误时，生成自然过渡剧情
     */
    AF.FALLBACKS.fallbackNarrative = function (ctx) {
        try {
            const s = (ctx && ctx.s) || (typeof window.gst === 'function' ? window.gst() : null);
            const clk = (ctx && ctx.clk) || (typeof window.gclk === 'function' ? window.gclk() : null);
            const loc = (s && s.location) ? s.location : '这片区域';
            const w = (clk && clk.weather) ? clk.weather : '多云';
            const temps = ['一阵风吹过，空气里带着尘土的气息。',
                           '远处传来一阵若有若无的声响，让你绷紧了神经。',
                           '你停下脚步，仔细辨认周围的环境。',
                           '时间在静默中缓缓流逝，你强迫自己保持冷静。'];
            const pick = temps[Math.floor(Math.random() * temps.length)];
            return `你正位于${loc}附近，天气${w}。${pick}`;
        } catch (_) {
            return '你停下来短暂思考，观察并确认了周围的情况。';
        }
    };

    // ============================================================
    //  5. buildTagHelpers: 快速构建合法标签（给主逻辑/调试用）
    // ============================================================
    AF.buildTagHelpers = function (s) {
        const h = {};
        const mkNum = (prefix, range) => v => {
            if (range) v = Math.max(range[0], Math.min(range[1], v));
            return `[${prefix}:${v}]`;
        };
        h.hunger = mkNum('饱腹', [0, 100]);
        h.thirst = mkNum('口渴', [0, 100]);
        h.fatigue = mkNum('疲劳', [0, 100]);
        h.bodyTemp = v => `[体温:${Math.max(30, Math.min(45, Number(v) || 37))}]`;
        h.hp = mkNum('血量', [0, 100]);
        h.addItem = name => `[物品:+${String(name || '').trim()}]`;
        h.remItem = name => `[物品:-${String(name || '').trim()}]`;
        h.addClue = text => `[线索:${String(text || '').trim()}]`;
        h.mapUnlock = area => `[地图:解锁-${String(area || '').trim()}]`;
        h.location = loc => `[地点:${String(loc || '').trim()}]`;
        h.weather = w => `[天气:${String(w || '').trim()}]`;
        h.advTime = h => `[时间:+${Number(h) || 1}h]`;
        h.traitAdd = t => `[特质+${String(t || '')}]`;
        h.traitRem = t => `[特质-${String(t || '')}]`;
        return h;
    };

    // ============================================================
    //  6. 触发计数：避免同一个剧情里重复调用兜底（减少噪音）
    // ============================================================
    AF._callCount = { validateOutput: 0, fallbackChoices: 0 };
    AF.getStats = () => JSON.parse(JSON.stringify(AF._callCount));

    // 暴露
    window.AI_FRAMEWORK = AF;
})();
