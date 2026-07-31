/**
 * 物品信息数据文件
 * --------------------------------------------------------------------------
 * 本文件存放末世常见物品的分类模板与基础属性，供 AI 生成物资时参考、
 * 亦可供合成系统/交易系统查询。数据通过 window.ITEM_DATA 全局暴露。
 *
 * 数据结构说明：
 *   ITEM_DATA[category][itemName] = {
 *     name:     物品名称
 *     emoji:    显示图标
 *     rarity:   稀有度 (常见/普通/稀有/珍贵/传说)
 *     weight:   重量(kg) 参考，用于负重计算
 *     desc:     物品描述
 *     tags:     功能标签 (食用/饮用/医疗/工具/武器/防具/材料/贵重)
 *     effects:  使用效果参考 { 饱腹, 口渴, 疲劳, 精神, 体温, 感染, 生命 }
 *   }
 *
 * 说明：本表为"参考模板"，AI 在叙事中仍可动态生成表外物品，
 *       但应参考本表的稀有度与效果量级保持平衡。
 * --------------------------------------------------------------------------
 */
(function () {
    'use strict';

    const ITEM_DATA = {
        // ===== 食物类 =====
        food: {
            '压缩饼干': { emoji: '🍪', rarity: '常见', weight: 0.2, desc: '军用压缩口粮，耐储存', tags: ['食用'], effects: { 饱腹: 25 } },
            '午餐肉罐头': { emoji: '🥫', rarity: '常见', weight: 0.3, desc: '开罐即食的肉罐头', tags: ['食用'], effects: { 饱腹: 30 } },
            '水果罐头': { emoji: '🍑', rarity: '普通', weight: 0.4, desc: '糖水水果罐头，可补充糖分', tags: ['食用'], effects: { 饱腹: 15, 精神: 5 } },
            '巧克力': { emoji: '🍫', rarity: '普通', weight: 0.1, desc: '高热量零食，快速补充体力', tags: ['食用'], effects: { 饱腹: 12, 精神: 8 } },
            '干粮袋': { emoji: '🎒', rarity: '常见', weight: 0.5, desc: '混合干粮，应急口粮', tags: ['食用'], effects: { 饱腹: 20 } },
            '方便面': { emoji: '🍜', rarity: '常见', weight: 0.1, desc: '需热水冲泡，干吃也可', tags: ['食用'], effects: { 饱腹: 18 } },
            '腊肉': { emoji: '🥓', rarity: '普通', weight: 0.4, desc: '腌制风干肉，耐储存', tags: ['食用'], effects: { 饱腹: 28 } }
        },

        // ===== 饮料类 =====
        drink: {
            '矿泉水': { emoji: '💧', rarity: '常见', weight: 0.5, desc: '500ml瓶装水', tags: ['饮用'], effects: { 口渴: 30 } },
            '运动饮料': { emoji: '🥤', rarity: '普通', weight: 0.5, desc: '补充电解质', tags: ['饮用'], effects: { 口渴: 25, 疲劳: -5 } },
            '罐装咖啡': { emoji: '☕', rarity: '普通', weight: 0.3, desc: '提神饮料', tags: ['饮用'], effects: { 口渴: 10, 疲劳: -10 } },
            '白酒': { emoji: '🍶', rarity: '普通', weight: 0.8, desc: '高度白酒，可消毒/饮用/送礼', tags: ['饮用', '医疗', '贵重'], effects: { 口渴: 5, 精神: 10, 体温: 1 } }
        },

        // ===== 医疗类 =====
        medical: {
            '绷带': { emoji: '🩹', rarity: '常见', weight: 0.1, desc: '基础包扎用品', tags: ['医疗'], effects: { 生命: 10 } },
            '止痛药': { emoji: '💊', rarity: '普通', weight: 0.05, desc: '缓解疼痛，暂时降低伤势影响', tags: ['医疗'], effects: { 疲劳: -8 } },
            '抗生素': { emoji: '💉', rarity: '稀有', weight: 0.05, desc: '抗感染药物，降低感染值', tags: ['医疗'], effects: { 感染: -25 } },
            '医疗包': { emoji: '🧰', rarity: '稀有', weight: 1.0, desc: '完整急救包，含多种用品', tags: ['医疗'], effects: { 生命: 30, 感染: -10 } },
            '消毒酒精': { emoji: '🧴', rarity: '普通', weight: 0.3, desc: '伤口消毒，可饮用（不推荐）', tags: ['医疗'], effects: { 感染: -15 } }
        },

        // ===== 工具类 =====
        tool: {
            '打火机': { emoji: '🔥', rarity: '常见', weight: 0.05, desc: '点火工具', tags: ['工具'] },
            '手电筒': { emoji: '🔦', rarity: '常见', weight: 0.3, desc: '夜间照明，需电池', tags: ['工具'] },
            '瑞士军刀': { emoji: '🔪', rarity: '普通', weight: 0.2, desc: '多功能小刀', tags: ['工具', '武器'] },
            '开锁器': { emoji: '🔑', rarity: '稀有', weight: 0.1, desc: '撬开锁住的门/箱', tags: ['工具'] },
            '望远镜': { emoji: '🔭', rarity: '稀有', weight: 0.4, desc: '远距离侦察', tags: ['工具'] },
            '收音机': { emoji: '📻', rarity: '普通', weight: 0.5, desc: '接收广播信号', tags: ['工具'] },
            '电池': { emoji: '🔋', rarity: '常见', weight: 0.1, desc: '为电子设备供电', tags: ['材料', '工具'] }
        },

        // ===== 武器类 =====
        weapon: {
            '消防斧': { emoji: '🪓', rarity: '普通', weight: 3.5, desc: '近战利器，威力大', tags: ['武器'] },
            '棒球棍': { emoji: '🏏', rarity: '常见', weight: 1.0, desc: '基础近战武器', tags: ['武器'] },
            '菜刀': { emoji: '🔪', rarity: '常见', weight: 0.5, desc: '厨房刀具，应急武器', tags: ['武器'] },
            '手枪': { emoji: '🔫', rarity: '稀有', weight: 1.0, desc: '需弹药，噪音大', tags: ['武器'] },
            '弩': { emoji: '🏹', rarity: '稀有', weight: 2.5, desc: '无声远程武器，需弩箭', tags: ['武器'] },
            '钢管': { emoji: '🦯', rarity: '常见', weight: 1.5, desc: '简易钝器', tags: ['武器'] }
        },

        // ===== 防具类 =====
        armor: {
            '头盔': { emoji: '🪖', rarity: '普通', weight: 1.2, desc: '头部防护', tags: ['防具'] },
            '防刺背心': { emoji: '🦺', rarity: '稀有', weight: 2.0, desc: '防咬防刺', tags: ['防具'] },
            '皮夹克': { emoji: '🧥', rarity: '常见', weight: 1.0, desc: '基础防护，保暖', tags: ['防具'] },
            '护目镜': { emoji: '🥽', rarity: '普通', weight: 0.1, desc: '保护眼睛', tags: ['防具'] },
            '防毒面具': { emoji: '😷', rarity: '稀有', weight: 0.8, desc: '过滤有毒气体', tags: ['防具'] }
        },

        // ===== 材料类 =====
        material: {
            '布料': { emoji: '🧵', rarity: '常见', weight: 0.2, desc: '制作绷带/衣物原料', tags: ['材料'] },
            '金属零件': { emoji: '⚙️', rarity: '普通', weight: 0.3, desc: '机械修理/制作原料', tags: ['材料'] },
            '木材': { emoji: '🪵', rarity: '常见', weight: 1.0, desc: '建筑/制作原料', tags: ['材料'] },
            '绳索': { emoji: '🪢', rarity: '常见', weight: 0.3, desc: '捆绑/攀爬用途', tags: ['材料'] },
            '胶带': { emoji: '🖇️', rarity: '常见', weight: 0.1, desc: '万能修补材料', tags: ['材料'] },
            '汽油': { emoji: '⛽', rarity: '稀有', weight: 0.8, desc: '载具燃料/燃烧瓶原料', tags: ['材料'] }
        },

        // ===== 贵重/交易类 =====
        valuable: {
            '金条': { emoji: '🪙', rarity: '传说', weight: 1.0, desc: '高价值交易物', tags: ['贵重'] },
            '现金': { emoji: '💵', rarity: '普通', weight: 0.05, desc: '末世中价值大减，但部分商人仍收', tags: ['贵重'] },
            '首饰': { emoji: '💍', rarity: '稀有', weight: 0.05, desc: '贵金属首饰，交易用', tags: ['贵重'] },
            '香烟': { emoji: '🚬', rarity: '普通', weight: 0.05, desc: '末世硬通货，可送礼/交易', tags: ['贵重'] }
        }
    };

    /**
     * 工具方法：按名称模糊查询物品信息
     * @param {string} name 物品名称（支持部分匹配）
     * @returns {object|null} 物品信息对象
     */
    function findItem(name) {
        if (!name) return null;
        const all = [];
        Object.values(ITEM_DATA).forEach(cat => {
            Object.entries(cat).forEach(([key, val]) => all.push({ key, ...val }));
        });
        // 精确匹配优先
        const exact = all.find(i => i.key === name || i.name === name);
        if (exact) return exact;
        // 部分匹配
        return all.find(i => i.key.includes(name) || (i.name && i.name.includes(name))) || null;
    }

    /**
     * 工具方法：按稀有度获取物品列表
     * @param {string} rarity 稀有度
     * @returns {Array} 物品列表
     */
    function itemsByRarity(rarity) {
        const result = [];
        Object.values(ITEM_DATA).forEach(cat => {
            Object.entries(cat).forEach(([key, val]) => {
                if (val.rarity === rarity) result.push({ key, ...val });
            });
        });
        return result;
    }

    // 暴露到全局
    window.ITEM_DATA = ITEM_DATA;
    window.findItem = findItem;
    window.itemsByRarity = itemsByRarity;
})();
