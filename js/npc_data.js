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
     * NPC 主数据表
     * 新增 NPC 时直接在此追加即可，无需改动 main.js 业务代码。
     */
    const NPC_DATA = {
        '老张': {
            trust: 30, affinity: 50, faction: 'military',
            personality: '谨慎老练', occupation: '前军人',
            dialogue: { low: '别烦我。', mid: '我们合作吧。', high: '我信你，跟你分享些秘密。' },
            gifts: ['香烟', '白酒', '水果罐头'], unlockLevel: 60,
            backstory: '参加过三次战争的老兵，现在只想安稳过日子',
            notes: ['战术经验', '枪支熟练', '领导力', '爱国', '保守']
        },
        '莉莉': {
            trust: 40, affinity: 60, faction: 'medical',
            personality: '热情善良', occupation: '前护士',
            dialogue: { low: '（她对你笑了笑）', mid: '你好，需要帮助吗？', high: '我愿意跟你一起走！' },
            gifts: ['药品', '绷带', '巧克力'], unlockLevel: 70,
            backstory: '市立医院外科护士，灾难当天值夜班逃了出来',
            notes: ['医疗知识', '急救技能', '善良', '乐观', '值得信赖']
        },
        '陈默': {
            trust: 50, affinity: 70, faction: 'engineer',
            personality: '沉默寡言', occupation: '前工程师',
            dialogue: { low: '（点头）', mid: '嗯，可以。', high: '我把我的发明给你。' },
            gifts: ['零件', '工具', '电池'], unlockLevel: 80,
            backstory: '航天工程师，擅长制作各种设备，女儿在灾难中去世',
            notes: ['机械天才', '电子专家', '内向', '专注', '丧女之痛']
        },
        '小美': {
            trust: 20, affinity: 40, faction: 'solo',
            personality: '多疑善变', occupation: '前会计',
            dialogue: { low: '走开！', mid: '你还可以。', high: '我……只信任你。' },
            gifts: ['现金', '首饰', '香水'], unlockLevel: 75,
            backstory: '曾是注册会计师，携款逃离城市时被抢劫一空',
            notes: ['精明', '不信任人', '金钱至上', '受过伤害', '善变']
        },
        '大刘': {
            trust: 35, affinity: 55, faction: 'military',
            personality: '豪爽直率', occupation: '前警察',
            dialogue: { low: '你不是坏人？', mid: '一起干！', high: '兄弟！我的命就是你的！' },
            gifts: ['白酒', '香烟', '午餐肉罐头'], unlockLevel: 65,
            backstory: '刑警队队长，救过很多人的命',
            notes: ['正义感', '武力值高', '豪爽', '重义气', '前刑警']
        },
        '老王': {
            trust: 15, affinity: 25, faction: 'trader',
            personality: '吝啬油滑', occupation: '杂货店主',
            dialogue: { low: '想买什么？现金交易！', mid: '老顾客了，给你打个折。', high: '这批货只给你看。' },
            gifts: ['食盐', '糖', '打火机'], unlockLevel: 70,
            backstory: '开了三十年杂货铺，末世更是精于算计的商人，存活至今',
            notes: ['精明商人', '利欲熏心', '信息灵通', '吝啬', '生存智慧']
        },
        '小芳': {
            trust: 25, affinity: 45, faction: 'student',
            personality: '乐观开朗', occupation: '大学生',
            dialogue: { low: '（警惕地看着你）', mid: '学长/学姐好！', high: '我把你当亲哥哥/姐姐！' },
            gifts: ['矿泉水', '巧克力', '笔记本'], unlockLevel: 60,
            backstory: '医学院大三学生，学医的，懂一些急救知识',
            notes: ['医学知识', '学生', '乐观', '纯真', '有活力']
        },
        '陈医生': {
            trust: 45, affinity: 55, faction: 'medical',
            personality: '理性冷静', occupation: '前外科医生',
            dialogue: { low: '有什么病？', mid: '坐下，我看看。', high: '来吧，我教你手术。' },
            gifts: ['医疗包', '抗生素', '止痛药'], unlockLevel: 75,
            backstory: '医院主任级医生，因救了很多幸存者的朋友',
            notes: ['顶级医术', '冷静', '理性', '救人无数', '权威']
        },
        '铁头': {
            trust: 5, affinity: 15, faction: 'bandit',
            personality: '凶狠残暴', occupation: '掠夺者头目',
            dialogue: { low: '滚！小心老子砍你！', mid: '上次的东西留下，这次放过你。', high: '以后跟我混！' },
            gifts: ['金条', '白酒', '香烟'], unlockLevel: 90,
            backstory: '原是建筑工人，拉起了一支掠夺者小队，杀人越货无恶不作',
            notes: ['暴力', '残忍', '犯罪组织', '头目', '极度危险']
        }
    };

    /**
     * NPC 关系网络
     * 描述 NPC 之间的既有关系，影响剧情互动与派系判定。
     * level: 关系强度 0-100
     */
    const NPC_RELATIONSHIPS = [
        { from: '老张', to: '大刘', type: '战友', level: 80 },
        { from: '莉莉', to: '小美', type: '同事', level: 60 },
        { from: '陈默', to: '老张', type: '邻居', level: 40 },
        { from: '大刘', to: '陈默', type: '酒友', level: 50 },
        { from: '陈医生', to: '莉莉', type: '师徒', level: 85 },
        { from: '小芳', to: '陈医生', type: '救命恩人', level: 70 },
        { from: '老王', to: '铁头', type: '供货关系', level: 30 },
        { from: '大刘', to: '铁头', type: '仇人', level: 10 }
    ];

    // 暴露到全局，供 main.js 读取
    window.NPC_FACTIONS = NPC_FACTIONS;
    window.NPC_DATA = NPC_DATA;
    window.NPC_RELATIONSHIPS = NPC_RELATIONSHIPS;
})();