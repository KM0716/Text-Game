/**
 * NPC 信息数据文件
 * --------------------------------------------------------------------------
 * 本文件存放所有 NPC 的基础信息与关系网络，独立于 main.js 主逻辑。
 * 数据通过 window.NPC_DATA / window.NPC_RELATIONSHIPS / window.NPC_FACTIONS 全局暴露。
 *
 * 数据结构说明：
 *   NPC_DATA[name] = {
 *     trust:        初始信任度 (0-100)
 *     affinity:     初始好感度 (0-100)
 *     personality:  性格特征描述
 *     occupation:   末世前职业
 *     faction:      所属势力 (参考 NPC_FACTIONS)
 *     dialogue:     { low/mid/high } 三档信任度对应台词
 *     gifts:        偏好礼物列表
 *     unlockLevel:  解锁高级互动所需的信任阈值
 *     backstory:    背景故事
 *     notes:        AI 可理解的关键特征标签数组
 *   }
 *   NPC_RELATIONSHIPS[i] = { from, to, type, level }
 *
 *   NPC_FACTIONS: 势力定义，AI 可根据此区分和归类 NPC
 *     key:        势力标识
 *     name:       势力名称
 *     icon:       势力图标
 *     desc:       势力描述（供 AI 理解行为模式）
 *     traits:     势力特征标签
 *     hostility:  对玩家的默认敌意 (0-100)
 *   }
 * --------------------------------------------------------------------------
 */
(function () {
    'use strict';

    /**
     * NPC 势力定义
     * AI 根据此区分不同势力 NPC 的行为模式
     */
    const NPC_FACTIONS = {
        military: {
            name: '军方幸存者', icon: '🎖️',
            desc: '前军警人员组成的势力，纪律严明，拥有武器和战术训练。对陌生人保持警惕，但对信任的人会提供保护和物资支持。',
            traits: ['纪律', '战术', '武器', '组织化', '保护倾向'],
            hostility: 40
        },
        medical: {
            name: '医疗团队', icon: '⚕️',
            desc: '由医护人员组成，致力于救治伤员和维护健康。通常友好、乐于助人，但资源有限，可能需要物资交换。',
            traits: ['医疗', '救援', '药品', '友好', '善良'],
            hostility: 15
        },
        engineer: {
            name: '技术工匠', icon: '🔧',
            desc: '由工程师和技术人员组成，擅长修理和制造。性格通常较内向，通过技术能力换取物资。',
            traits: ['技术', '制造', '修理', '理性', '沉默'],
            hostility: 20
        },
        trader: {
            name: '商人流派', icon: '💰',
            desc: '以交易为核心的势力，看重物资价值和利益交换。可能友好但唯利是图。',
            traits: ['交易', '利益', '物资', '精明', '灵活'],
            hostility: 35
        },
        student: {
            name: '学生群体', icon: '📚',
            desc: '年轻幸存者组成的势力，充满活力但经验不足。通常乐观、好学，但可能缺乏战斗经验。',
            traits: ['年轻', '乐观', '学习', '缺乏经验', '活力'],
            hostility: 10
        },
        bandit: {
            name: '掠夺者', icon: '🗡️',
            desc: '暴力武装势力，以抢劫和勒索为生。高度敌对，遇到时需谨慎应对，除非展示足够价值或武力。',
            traits: ['暴力', '掠夺', '武装', '贪婪', '危险'],
            hostility: 80
        },
        solo: {
            name: '独行者', icon: '👤',
            desc: '单独行动的幸存者，没有组织或派系。通常友好但保持距离，不轻易信任他人。',
            traits: ['独立', '警惕', '生存', '灵活', '低调'],
            hostility: 25
        },
        hidden: {
            name: '隐藏势力', icon: '🕸️',
            desc: '信息不明的神秘势力，可能是间谍组织、科研小组或其他秘密团体。需深入调查才能了解。',
            traits: ['神秘', '隐藏', '情报', '秘密', '未知'],
            hostility: 50
        }
    };

    /**
     * NPC 势力信息扩展表
     * 为 data.js 中已有 NPC 添加 faction 和 notes 字段。
     * 名称映射：npc_data.js 简称 → data.js 全名
     */
    const NPC_NAME_MAP = {
        '小美': '苏梅', '老王': '王金贵', '小芳': '林晓芳', '陈医生': '陈志远'
    };

    // 为 data.js 的 NPC 添加 faction 和 notes
    const NPC_FACTION_DATA = {
        '老张':       { faction: 'military', notes: ['战术经验', '枪支熟练', '领导力', '爱国', '保守'] },
        '莉莉':       { faction: 'medical',  notes: ['医疗知识', '急救技能', '善良', '乐观', '值得信赖'] },
        '陈默':       { faction: 'engineer', notes: ['机械天才', '电子专家', '内向', '专注', '丧女之痛'] },
        '苏梅':       { faction: 'solo',     notes: ['精明', '不信任人', '金钱至上', '受过伤害', '善变'] },
        '大刘':       { faction: 'military', notes: ['正义感', '武力值高', '豪爽', '重义气', '前刑警'] },
        '王金贵':     { faction: 'trader',   notes: ['精明商人', '利欲熏心', '信息灵通', '吝啬', '生存智慧'] },
        '林晓芳':     { faction: 'student',  notes: ['医学知识', '学生', '乐观', '纯真', '有活力'] },
        '陈志远':     { faction: 'medical',  notes: ['顶级医术', '冷静', '理性', '救人无数', '权威'] },
        '铁头':       { faction: 'bandit',   notes: ['暴力', '残忍', '犯罪组织', '头目', '极度危险'] },
        '赵寡妇':     { faction: 'solo',     notes: ['独立', '坚韧', '社区关系', '谨慎', '务实'] },
        '阿彬':       { faction: 'engineer', notes: ['手艺精湛', '忠厚', '学习能力强', '年轻', '感恩'] },
        '周老师':     { faction: 'student',  notes: ['知识渊博', '教育者', '温和', '智慧', '文化传承'] }
    };

    // 合并到 data.js 已有的 NPC_DATA（添加 faction 和 notes，不覆盖已有字段）
    const NPC_DATA = window.NPC_DATA || {};
    Object.keys(NPC_FACTION_DATA).forEach(name => {
        if (NPC_DATA[name]) {
            // data.js 已有此 NPC，添加 faction 和 notes
            if (!NPC_DATA[name].faction) NPC_DATA[name].faction = NPC_FACTION_DATA[name].faction;
            if (!NPC_DATA[name].notes) NPC_DATA[name].notes = NPC_FACTION_DATA[name].notes;
        } else {
            // data.js 没有此 NPC，创建基础条目
            NPC_DATA[name] = {
                trust: 20, affinity: 30,
                faction: NPC_FACTION_DATA[name].faction,
                personality: '未知', occupation: '未知',
                dialogue: { low: '……', mid: '……', high: '……' },
                gifts: [], unlockLevel: 60,
                backstory: '信息未知',
                notes: NPC_FACTION_DATA[name].notes
            };
        }
    });

    // 暴露到全局，供 main.js 读取
    // NPC_DATA 已在上方合并完成（引用 data.js 的对象，添加了 faction/notes）
    // NPC_RELATIONSHIPS 保留 data.js 的版本（更详细），仅在 data.js 没有时使用 npc_data.js 的
    window.NPC_FACTIONS = NPC_FACTIONS;
    window.NPC_DATA = NPC_DATA;
    if (!window.NPC_RELATIONSHIPS) {
        window.NPC_RELATIONSHIPS = [
            { from: '老张', to: '大刘', type: '战友', level: 80 },
            { from: '莉莉', to: '苏梅', type: '同事', level: 60 },
            { from: '陈默', to: '老张', type: '邻居', level: 40 },
            { from: '大刘', to: '陈默', type: '酒友', level: 50 },
            { from: '陈志远', to: '莉莉', type: '师徒', level: 85 },
            { from: '林晓芳', to: '陈志远', type: '救命恩人', level: 70 },
            { from: '王金贵', to: '铁头', type: '供货关系', level: 30 },
            { from: '大刘', to: '铁头', type: '仇人', level: 10 }
        ];
    }
})();