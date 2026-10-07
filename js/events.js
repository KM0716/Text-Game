/**
 * 突发事件系统数据文件 v2  —— 重做：不再只是 snotify 通知，而是
 *   1) 触发后**直接产生真实效果**（状态增减/物品加减/线索/地图/天气/位置）
 *   2) 支持 options 交互选择：玩家确认/选择后 apply 不同效果分支
 *   3) 按 weight + minDay 加权随机，由 main.js 的 advTime() 入口按沙盒 eventFreq 概率触发
 *
 * 数据通过 window.RANDOM_EVENTS_EXT / window.EVENT_TRIGGERS_EXT / window.applyEventEffects
 * 全局暴露。
 *
 * 数据结构说明：
 *   RANDOM_EVENTS_EXT[i] = {
 *     id/name/desc/icon/weight/minDay/category/trigger: 同上
 *     effects:  { hp:-15, hunger:+5, invAdd:['罐头'], invRem:['绷带'], clues:['xx'],
 *                 mapUnlock:['医院'], weather:'大雨', temp:8, location:'XX', infection:+20,
 *                 spirit:-10, bodyTemp:-3, fatigue:+15, logText:'...', sfx:'danger', bgmCategory:'danger' }
 *     options:  [ { label:'躲避迎战', effects:{...} }, { label:'直接逃跑', effects:{...} }, ... ]
 *     execute:  (ctx) => Promise<void>  — 统一执行（自动处理 effects + options 弹窗）
 *   }
 */
(function () {
    'use strict';

    // =============================================================
    //  applyEventEffects(effects):  通用效果解析器
    //  作用：修改 gst() 状态 / invAdd / 线索 / 地图 / snotify / addLogEntry
    // =============================================================
    async function applyEventEffects(effects, ctx) {
        try {
            if (!effects || typeof effects !== 'object') return;
            const s = (typeof window.gst === 'function') ? window.gst() : null;
            const clk = (typeof window.gclk === 'function') ? window.gclk() : null;
            const invAdd  = window.invAdd;   // main.js L905
            const invRemove = window.invRemove; // main.js L946
            const snotify = window.snotify;   // main.js L1700
            const addLogEntry = window.addLogEntry; // main.js L3818
            const playSfx = window.playSfx;
            const bgmPlayCategory = window.bgmPlayCategory;

            // ---- 数值状态 ----
            if (s) {
                const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
                let mutated = false;
                if (effects.hp != null)       { s.hp = clamp((s.hp ?? 100) + Number(effects.hp), 0, 100); mutated = true; }
                if (effects.hunger != null)   { s.hunger = clamp((s.hunger ?? 50) + Number(effects.hunger), 0, 100); mutated = true; }
                if (effects.thirst != null)   { s.thirst = clamp((s.thirst ?? 50) + Number(effects.thirst), 0, 100); mutated = true; }
                if (effects.fatigue != null)  { s.fatigue = clamp((s.fatigue ?? 30) + Number(effects.fatigue), 0, 100); mutated = true; }
                if (effects.spirit != null)   { s.spirit = clamp((s.spirit ?? 80) + Number(effects.spirit), 0, 100); mutated = true; }
                if (effects.infection != null){ s.infection = clamp((s.infection ?? 0) + Number(effects.infection), 0, 100); mutated = true; }
                if (effects.bodyTemp != null) { s.bodyTemp = clamp((s.bodyTemp ?? 36.8) + Number(effects.bodyTemp), 30, 45); mutated = true; }
                if (effects.enc != null)      { s.enc = Math.max(0, (s.enc ?? 0) + Number(effects.enc)); mutated = true; }
                if (effects.location)         { s.location = String(effects.location); mutated = true; }
                // ===== 修复：injury / statusAdd / statusRem / traitsRem 之前未处理 =====
                if (effects.injury)           { s.injury = String(effects.injury); mutated = true; }
                if (effects.joy != null)      { s.joy = clamp((s.joy ?? 0) + Number(effects.joy), 0, 100); if (Number(effects.joy) > 0) s.pleasureUnlocked = true; mutated = true; }
                if (effects.mentality)       { s.mentality = String(effects.mentality); mutated = true; }
                // 状态增减（如「流血」「感染」「中毒」等 Buff/Debuff）
                if (Array.isArray(effects.statusAdd) && effects.statusAdd.length) {
                    if (!s.status) s.status = [];
                    for (const st of effects.statusAdd) {
                        if (typeof st === 'string' && !s.status.includes(st)) s.status.push(st);
                    }
                    mutated = true;
                }
                if (Array.isArray(effects.statusRem) && effects.statusRem.length) {
                    if (s.status) {
                        for (const st of effects.statusRem) {
                            s.status = s.status.filter(x => x !== st);
                        }
                    }
                    mutated = true;
                }
                // 单个状态增减（便捷写法）
                if (typeof effects.statusAdd === 'string') {
                    if (!s.status) s.status = [];
                    if (!s.status.includes(effects.statusAdd)) s.status.push(effects.statusAdd);
                    mutated = true;
                }
                if (typeof effects.statusRem === 'string') {
                    if (s.status) s.status = s.status.filter(x => x !== effects.statusRem);
                    mutated = true;
                }
                if (mutated && typeof window.sst === 'function') window.sst(s);
                if (mutated && typeof window.upui === 'function') window.upui();
            }

            // ---- 物品：加/减 ----
            if (Array.isArray(effects.invAdd) && effects.invAdd.length && invAdd) {
                for (const it of effects.invAdd) {
                    try { invAdd(it, 1); } catch (e) { console.warn('[event] invAdd fail:', it, e); }
                }
            }
            if (Array.isArray(effects.invRem) && effects.invRem.length && invRemove) {
                for (const it of effects.invRem) {
                    try { invRemove(it, 1); } catch (e) { console.warn('[event] invRem fail:', it, e); }
                }
            }

            // ---- 线索 ----
            if (Array.isArray(effects.clues) && effects.clues.length && s) {
                if (!s.clues) s.clues = [];
                for (const clText of effects.clues) {
                    try {
                        const exist = s.clues.some(c =>
                            (typeof c === 'string' ? c === clText : (c && c.text === clText)));
                        if (!exist) {
                            const id = 'clue_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6);
                            const time = (clk ? (clk.day || 1) + '日 ' + (typeof window.fmtTime === 'function' ? window.fmtTime(clk.elapsedSec) : '') : '');
                            s.clues.push({ text: String(clText), priority: 2, id, time });
                        }
                    } catch (_) {}
                }
                if (typeof window.sst === 'function') window.sst(s);
                if (typeof window.renderClueSidebar === 'function') window.renderClueSidebar();
                if (snotify) snotify('clue', '', effects.clues[effects.clues.length - 1]);
            }

            // ---- 地图解锁 ----
            if (Array.isArray(effects.mapUnlock) && effects.mapUnlock.length && s) {
                if (!s.mapUnlock) s.mapUnlock = [];
                for (const area of effects.mapUnlock) {
                    if (!s.mapUnlock.includes(area)) s.mapUnlock.push(area);
                    if (snotify) snotify('map', '', area);
                }
                if (typeof window.sst === 'function') window.sst(s);
            }

            // ---- 地图新增（写入角色 ch.map 而非 s.mapUnlock）----
            if (Array.isArray(effects.mapNew) && effects.mapNew.length) {
                try {
                    const ch = (typeof window.gch === 'function') ? window.gch() : null;
                    if (ch) {
                        const curMap = (ch.map || '').split(/[、，,;；\n]/).map(x => x.trim()).filter(Boolean);
                        for (const area of effects.mapNew) {
                            if (area && !curMap.includes(area)) curMap.push(area);
                        }
                        ch.map = curMap.join('、');
                        if (typeof window.sch === 'function') window.sch(ch);
                    }
                } catch (_) {}
            }

            // ---- 天气/气温 ----
            if ((effects.weather || effects.temp != null) && clk) {
                if (effects.weather) clk.weather = String(effects.weather);
                if (effects.temp != null)   clk.temp = Number(effects.temp);
                if (typeof window.sclk === 'function') window.sclk(clk);
                if (snotify) {
                    if (effects.weather) snotify('status', '天气', effects.weather);
                    if (effects.temp != null) snotify('status', '气温', effects.temp + '°C');
                }
            }

            // ---- 特质增减 ----
            if (s && Array.isArray(effects.traitsAdd) && effects.traitsAdd.length) {
                if (!s.traits) s.traits = [];
                for (const t of effects.traitsAdd) {
                    if (!s.traits.includes(t)) s.traits.push(t);
                    if (snotify) snotify('trait_add', '', t);
                }
                if (typeof window.sst === 'function') window.sst(s);
            }
            if (s && Array.isArray(effects.traitsRem) && effects.traitsRem.length) {
                if (s.traits) {
                    for (const t of effects.traitsRem) {
                        s.traits = s.traits.filter(x => x !== t);
                        if (snotify) snotify('trait_rem', '', t);
                    }
                    if (typeof window.sst === 'function') window.sst(s);
                }
            }

            // ---- 创伤 ----
            if (effects.trauma && s) {
                if (!s.traumas) s.traumas = [];
                if (!s.traumas.includes(effects.trauma)) s.traumas.push(effects.trauma);
                if (s.spirit != null) s.spirit = Math.max(0, s.spirit - 10);
                s.injury = (s.injury === '无' || !s.injury) ? '心理创伤' : (s.injury + '（心理创伤）');
                if (addLogEntry) addLogEntry('trauma', '创伤事件：' + effects.trauma);
                if (playSfx) playSfx('danger');
                if (typeof window.sst === 'function') window.sst(s);
            }

            // ---- 日志 ----
            if (effects.logText && addLogEntry) {
                try { addLogEntry('event', String(effects.logText)); } catch (_) {}
            }

            // ---- 音效 ----
            if (effects.sfx && playSfx) { try { playSfx(effects.sfx); } catch (_) {} }
            // ---- BGM 切换 ----
            if (effects.bgmCategory && bgmPlayCategory) {
                try { bgmPlayCategory(effects.bgmCategory, false); } catch (_) {}
            }

        } catch (e) {
            console.warn('[applyEventEffects] error:', e);
        }
    }

    // 工具：抽一个事件（可用列表 + 加权）
    function pickWeighted(list) {
        if (!list || !list.length) return null;
        const total = list.reduce((s, e) => s + (Number(e.weight) || 1), 0);
        let r = Math.random() * total;
        for (const ev of list) { r -= (Number(ev.weight) || 1); if (r <= 0) return ev; }
        return list[list.length - 1];
    }

    // =============================================================
    //  事件定义（每个事件新增 effects/options 真实效果分支）
    // =============================================================
    const RANDOM_EVENTS = [
        // ===== 危险类：通常带 options 让玩家二选一应对 =====
        { id: 'zombie_horde', name: '尸群来袭', desc: '一群丧尸正在接近', icon: '🧟', weight: 10, minDay: 2, category: 'danger',
          trigger: () => { const s = window.gst(); return s && s.hp < 70 && Math.random() < 0.3; },
          effects: { hp:-10, fatigue:+10, spirit:-5, sfx:'death', bgmCategory:'chaos',
                     logText:'遭遇尸群：受到轻伤并紧急撤离。' },
          options: [
            { label:'躲避掩体',   effects:{ hp:-5,  fatigue:+18, logText:'躲避掩体：体力消耗较大，但伤势较轻。' } },
            { label:'强行突破',   effects:{ hp:-20, infection:+10, fatigue:+5, traitsAdd:['战斗经验'],
                                             logText:'强行突围：付出重伤代价，感染风险上升，却赢得了实战经验。' } },
            { label:'投掷诱饵转移', effects:{ invRem:['罐头','压缩饼干'], hp:-2, logText:'投掷物资引开丧尸：损失部分补给，成功撤离。' } }
          ]
        },
        { id: 'bandit_ambush', name: '匪徒伏击', desc: '遭遇匪徒埋伏', icon: '🔫', weight: 6, minDay: 5, category: 'danger',
          trigger: () => { const s = window.gst(); return s && (s.money > 200 || (s.inv && s.inv.length > 8)) && Math.random() < 0.25; },
          effects: { hp:-12, spirit:-8, sfx:'death', bgmCategory:'action', logText:'遭遇匪徒埋伏：被迫对峙。' },
          options: [
            { label:'交出部分物资', effects:{ invRem:['压缩饼干','绷带'], hp:-3, spirit:-3, logText:'交出部分物资换取放行。' } },
            { label:'正面冲突',     effects:{ hp:-22, infection:+5, invAdd:['匕首','现金x100'], spirit:+5,
                                               traitsAdd:['胆识过人'], logText:'击退匪徒：重伤，但缴获匕首和现金。' } },
            { label:'尝试谈判',     effects:{ spirit:-8, logText:'与匪徒谈判：精神受到胁迫，但保住了物资。' } }
          ]
        },
        { id: 'fire_accident', name: '火灾事故', desc: '附近发生火灾', icon: '🔥', weight: 3, minDay: 3, category: 'danger',
          trigger: () => Math.random() < 0.15,
          effects: { bodyTemp:+2, thirst:-8, spirit:-3, sfx:'death', bgmCategory:'chaos',
                     logText:'附近建筑起火：高温与浓烟造成不适。' },
          options: [
            { label:'快速撤离',     effects:{ fatigue:+15, logText:'快速撤离火灾区域：疲劳大幅增加。' } },
            { label:'抢救物资冲入', effects:{ hp:-8, bodyTemp:+2, invAdd:['灭火器','药盒'], infection:+3,
                                               logText:'冒险冲入火场：受伤，但抢救出灭火器与药盒。' } }
          ]
        },
        { id: 'gas_leak', name: '燃气泄漏', desc: '检测到燃气泄漏', icon: '💨', weight: 2, minDay: 4, category: 'danger',
          trigger: () => Math.random() < 0.12,
          effects: { thirst:-4, spirit:-4, bodyTemp:+1, logText:'燃气泄漏：吸入少量气体。' },
          options: [
            { label:'关闭阀门再通风', effects:{ fatigue:+12, logText:'冒险关闭阀门再通风：体力消耗较大。' } },
            { label:'立刻远离现场',   effects:{ fatigue:+6, spirit:-2, logText:'撤离到安全区域。' } }
          ]
        },
        { id: 'storm_warning', name: '暴风雨来临', desc: '即将有暴风雨', icon: '⛈️', weight: 5, minDay: 1, category: 'danger',
          trigger: () => { const clk = window.gclk(); return clk && clk.weather === '晴' && Math.random() < 0.3; },
          effects: { weather:'暴雨', temp:-4, bodyTemp:-2, sfx:'event', bgmCategory:'rain',
                     logText:'暴风雨来袭：气温骤降。' },
          options: [
            { label:'寻找避雨处',   effects:{ fatigue:+8, spirit:+3, logText:'找到避雨处休整，精神略有恢复。' } },
            { label:'冒雨继续前进', effects:{ bodyTemp:-3, fatigue:+15, thirst:+5, logText:'冒雨前进：严重失温但时间未被延误。' } }
          ]
        },
        { id: 'sniper_attack', name: '远处枪击', desc: '远处传来枪响', icon: '🎯', weight: 3, minDay: 7, category: 'danger',
          trigger: () => { const s = window.gst(); return s && s.hp < 50 && Math.random() < 0.2; },
          effects: { hp:-18, spirit:-10, sfx:'death', bgmCategory:'danger', logText:'远处枪击：不幸中弹！' },
          options: [
            { label:'立刻卧倒隐蔽', effects:{ hp:-8, fatigue:+8, logText:'卧倒躲避：避开致命一击。' } },
            { label:'观察反击',     effects:{ hp:-5, invAdd:['步枪子弹x3'], traitsAdd:['战术眼光'],
                                               logText:'冷静观察并反击：缴获子弹，获得战术眼光。' } }
          ]
        },

        // ===== 生存类事件：大部分直接 apply 正面效果 =====
        { id: 'fresh_water', name: '清洁水源', desc: '发现清洁水源', icon: '💧', weight: 5, minDay: 1, category: 'survival',
          trigger: () => { const s = window.gst(); return s && s.thirst > 60 && Math.random() < 0.5; },
          effects: { thirst:+35, invAdd:['半瓶水','半瓶水'], sfx:'pickup', logText:'发现清洁水源，补充了饮水并装瓶。' }
        },
        { id: 'abandoned_car', name: '废弃车辆', desc: '发现一辆废弃汽车', icon: '🚗', weight: 4, minDay: 3, category: 'survival',
          trigger: () => Math.random() < 0.3,
          effects: { invAdd:['工具包','地图碎片'], mapUnlock:['环城公路'], clues:['车尾箱夹层有未寄出的信'], sfx:'pickup',
                     logText:'搜索废弃车辆：获得工具包与地图碎片，并解锁环城公路。' }
        },
        { id: 'supply_drop', name: '军方空投', desc: '军方空投物资', icon: '📦', weight: 1, minDay: 10, category: 'survival',
          trigger: () => { const c = window.gclk(); return c && (c.day || 1) >= 10 && Math.random() < 0.12; },
          effects: { invAdd:['军用罐头x2','急救包','步枪子弹x10','军用雨衣'], mapUnlock:['军方空投点'], sfx:'pickup',
                     bgmCategory:'hope', logText:'军方空投已开箱：获得大量补给，空投点位置已标记。' }
        },
        { id: 'wild_herb', name: '野生草药', desc: '发现野生草药', icon: '🌿', weight: 4, minDay: 1, category: 'survival',
          trigger: () => Math.random() < 0.35,
          effects: { invAdd:['药草','药草'], infection:-5, spirit:+2, sfx:'pickup', logText:'采到野生草药：感染略微缓解。' }
        },
        { id: 'animal_trap', name: '踩到陷阱', desc: '踩到旧陷阱', icon: '🪤', weight: 2, minDay: 2, category: 'survival',
          trigger: () => Math.random() < 0.18,
          effects: { hp:-10, injury:'右腿轻伤', fatigue:+10, sfx:'death', logText:'踩到旧捕兽夹：右腿受伤。' },
          options: [
            { label:'暴力撬开锁扣', effects:{ hp:-3, fatigue:+8, invAdd:['捕兽夹'], logText:'撬开捕兽夹：再次受伤，但获得捕兽夹作为战利品。' } },
            { label:'耐心解扣取出', effects:{ fatigue:+15, logText:'耐心解扣：费时费力但保住了脚。' } }
          ]
        },
        { id: 'food_cache', name: '罐头储藏', desc: '发现一批罐头', icon: '🥫', weight: 3, minDay: 2, category: 'survival',
          trigger: () => { const s = window.gst(); return s && s.hunger < 40 && Math.random() < 0.4; },
          effects: { invAdd:['罐头x3','压缩饼干x2'], hunger:+25, sfx:'pickup', logText:'找到罐头储藏点：饱餐一顿并收获物资。' }
        },
        { id: 'old_radio', name: '旧收音机', desc: '捡到旧收音机', icon: '📻', weight: 2, minDay: 3, category: 'survival',
          trigger: () => Math.random() < 0.2,
          effects: { invAdd:['旧收音机'], clues:['军方广播频道为142.5MHz'], spirit:+5, sfx:'pickup',
                     logText:'拾到旧收音机：从残留电量中听到了广播频率。' }
        },
        { id: 'medical_supply', name: '医疗补给', desc: '发现急救包', icon: '💊', weight: 2, minDay: 2, category: 'survival',
          trigger: () => { const s = window.gst(); return s && s.hp < 60 && Math.random() < 0.35; },
          effects: { invAdd:['急救包','绷带x3','抗生素'], hp:+15, infection:-10, sfx:'pickup',
                     logText:'找到医疗补给：恢复生命并减少感染。' }
        },

        // ===== 社交类事件 =====
        { id: 'friendly_survivor', name: '友好幸存者', desc: '遇到友好幸存者', icon: '👋', weight: 4, minDay: 2, category: 'social',
          trigger: () => Math.random() < 0.3,
          effects: { spirit:+8, sfx:'event', logText:'遇见友好幸存者，短暂交流。' },
          options: [
            { label:'交换物资',     effects:{ invRem:['绷带'], invAdd:['打火机','蜡烛'], logText:'以绷带换取打火机与蜡烛。' } },
            { label:'交换情报',     effects:{ clues:['市中心医院三楼药房尚未被搜过','西北方向有未标记的地堡'],
                                               mapUnlock:['医院药房','西北地堡'], logText:'交换情报：获得两条关键线索。' } },
            { label:'礼貌告别离开', effects:{ spirit:+3, logText:'简短告别继续前行。' } }
          ]
        },
        { id: 'merchant_visit', name: '旅行商人', desc: '旅行商人来访', icon: '💰', weight: 3, minDay: 4, category: 'social',
          trigger: () => { const c = window.gclk(); return c && (c.day || 1) >= 4 && Math.random() < 0.25; },
          effects: { mapUnlock:['商人营地'], sfx:'event', bgmCategory:'cultural', logText:'遇见旅行商人，营地已标记。' },
          options: [
            { label:'购买补给包',   effects:{ invAdd:['食品补给包','急救包'], invRem:['现金x100'], logText:'购入补给包。' } },
            { label:'询问情报',     effects:{ clues:['未来3天政府军会轰炸老城区'], logText:'商人透露了关键情报。' } },
            { label:'只是看看离开', effects:{ logText:'暂不交易，继续赶路。' } }
          ]
        },
        { id: 'lost_child', name: '走失儿童', desc: '发现走失的孩子', icon: '👶', weight: 2, minDay: 3, category: 'social',
          trigger: () => Math.random() < 0.15,
          effects: { spirit:-3, sfx:'event', logText:'发现哭泣的走失儿童。' },
          options: [
            { label:'护送寻找家人', effects:{ fatigue:+20, spirit:+15, invAdd:['家庭照片'], traitsAdd:['仁心'],
                                               mapUnlock:['住宅区12号楼'], logText:'护送孩子回家：体力消耗但精神充实，获得邻里感谢。' } },
            { label:'留下食物离开', effects:{ invRem:['压缩饼干'], spirit:+4, logText:'留下压缩饼干，默默离开。' } },
            { label:'装作没看见',   effects:{ spirit:-8, traitsAdd:['冷漠'], logText:'转身离开：内心承受着阴影。' } }
          ]
        },
        { id: 'secret_meeting', name: '秘密会议', desc: '发现秘密会议', icon: '🕯️', weight: 2, minDay: 5, category: 'social',
          trigger: () => { const clk = window.gclk(); return clk && (clk.dayPhase === 'night') && Math.random() < 0.3; },
          effects: { clues:['幸存者议会每周三在旧教堂地下室议事','反抗军计划两周后突袭掠夺者据点'], sfx:'event',
                     spirit:+3, mapUnlock:['旧教堂地下室'], logText:'偷听到秘密会议：两条高价值线索。' }
        },
        { id: 'distress_signal', name: '求救信号', desc: '收到求救信号', icon: '📡', weight: 2, minDay: 3, category: 'social',
          trigger: () => Math.random() < 0.18,
          effects: { spirit:-2, sfx:'event', logText:'收到微弱求救信号。' },
          options: [
            { label:'前往施救',     effects:{ hp:-10, fatigue:+18, invAdd:['对讲机','军用背心'],
                                               traitsAdd:['见义勇为'], mapUnlock:['求救信号源'],
                                               logText:'前往救援：击退了威胁者，救出幸存者并收获装备。' } },
            { label:'忽略继续赶路', effects:{ spirit:-5, logText:'选择不冒险：内心留下阴影。' } }
          ]
        },

        // ===== 发现类事件 =====
        { id: 'hidden_cache', name: '隐藏储藏点', desc: '发现被遗弃的储藏', icon: '🗝️', weight: 3, minDay: 3, category: 'discovery',
          trigger: () => Math.random() < 0.22,
          effects: { invAdd:['压缩饼干x2','半瓶水','绷带x2','打火机'], mapUnlock:['林中储藏点'], sfx:'pickup',
                     logText:'找到隐藏储藏点：基础生存物资一套。' }
        },
        { id: 'old_letter', name: '旧信件', desc: '发现一封旧信', icon: '✉️', weight: 2, minDay: 1, category: 'discovery',
          trigger: () => Math.random() < 0.2,
          effects: { clues:['旧信提到："第三净水站闸门钥匙在钟楼雕像底座下"'], invAdd:['旧信件'],
                     mapUnlock:['第三净水站','老城区钟楼'], logText:'阅读旧信：发现关于净水站的关键线索。' }
        },
        { id: 'map_fragment', name: '地图碎片', desc: '发现地图碎片', icon: '🗺️', weight: 2, minDay: 2, category: 'discovery',
          trigger: () => Math.random() < 0.18,
          effects: { invAdd:['地图碎片'], mapUnlock:['北郊隧道','河畔仓储'], clues:['北郊隧道未受破坏可通行'],
                     sfx:'pickup', logText:'获得地图碎片：解锁两个新区域。' }
        },
        { id: 'safe_house', name: '安全屋', desc: '发现结构完好的安全屋', icon: '🏠', weight: 1, minDay: 5, category: 'discovery',
          trigger: () => { const c = window.gclk(); return c && (c.day || 1) >= 5 && Math.random() < 0.12; },
          effects: { mapUnlock:['安全屋（门窗完好）'], hunger:+10, thirst:+10, fatigue:-30, spirit:+15,
                     logText:'找到结构完好的安全屋，饱食、饮水并休整一夜。',
                     invAdd:['罐头','半瓶水','毛毯'], sfx:'pickup' }
        },
        { id: 'weapon_cache', name: '武器藏匿点', desc: '发现武器藏匿点', icon: '🔫', weight: 1, minDay: 7, category: 'discovery',
          trigger: () => { const c = window.gclk(); return c && (c.day || 1) >= 7 && Math.random() < 0.08; },
          effects: { invAdd:['手枪','手枪子弹x20','砍刀','防刺背心'], mapUnlock:['武器藏匿点'],
                     traitsAdd:['武装齐备'], sfx:'equip-open', logText:'发现武器藏匿点：全副武装！' }
        },
        { id: 'bunker', name: '地下掩体', desc: '发现地下掩体', icon: '🏚️', weight: 1, minDay: 4, category: 'discovery',
          trigger: () => { const c = window.gclk(); return c && (c.day || 1) >= 4 && Math.random() < 0.1; },
          effects: { mapUnlock:['地下掩体'], spirit:+10,
                     invAdd:['罐头x3','急救包','防尘面具x2','军用手册'], sfx:'pickup',
                     logText:'发现地下掩体：可以用作长期避难所。' }
        },

        // ===== 信息类事件（轻量，多为直接提示或小幅天气变化） =====
        { id: 'military_broadcast', name: '军方广播', desc: '收到军方广播', icon: '📢', weight: 3, minDay: 1, category: 'info',
          trigger: () => Math.random() < 0.25,
          effects: { clues:['军方48小时后将在南郊广场组织撤离车队'], mapUnlock:['南郊撤离广场'], spirit:+8, sfx:'event',
                     logText:'接收到军方广播：撤离计划已公布。' }
        },
        { id: 'weather_change', name: '天气突变', desc: '天气突然变化', icon: '🌤️', weight: 5, minDay: 1, category: 'info',
          trigger: () => Math.random() < 0.35,
          effects: { weather: (['晴','多云','阴','小雨','雾'][Math.floor(Math.random()*5)]),
                     logText:'天气变化：云层与风速都在改变。' }
        },
        { id: 'moon_phase', name: '满月之夜', desc: '月相转变', icon: '🌙', weight: 2, minDay: 7, category: 'info',
          trigger: () => { const clk = window.gclk(); return clk && (clk.day || 1) % 7 === 0 && Math.random() < 0.5; },
          effects: { spirit:-6, clues:['满月之夜丧尸异常活跃且敏锐'], bgmCategory:'horror', sfx:'event',
                     logText:'满月降临：空气里弥漫着异常气息。' }
        },
        { id: 'animal_sound', name: '动物叫声', desc: '听到远处动物叫声', icon: '🦊', weight: 3, minDay: 1, category: 'info',
          trigger: () => Math.random() < 0.25,
          effects: { clues:['东侧林子里有活物活动迹象（可能是野犬，也可能是野兽）'], spirit:+1,
                     mapUnlock:['东侧林子'], logText:'远处动物叫声：记录下了方位。' }
        }
    ];

    // =============================================================
    //  EVENT_TRIGGERS_EXT: 状态提醒触发器（主循环调用，仅 snotify，不改事件逻辑）
    // =============================================================
    const EVENT_TRIGGERS = {
        onLowHealth: () => {
            const s = window.gst();
            if (!s) return;
            if (s.hp < 30 && Math.random() < 0.5 && window.snotify) window.snotify('danger', '警告', '生命值严重偏低！');
        },
        onLowHunger: () => {
            const s = window.gst();
            if (!s) return;
            if (s.hunger < 20 && Math.random() < 0.6 && window.snotify) window.snotify('warn', '警告', '饥饿难耐！需要立即寻找食物！');
        },
        onLowThirst: () => {
            const s = window.gst();
            if (!s) return;
            if (s.thirst < 20 && Math.random() < 0.65 && window.snotify) window.snotify('warn', '警告', '严重脱水！急需补充水分！');
        },
        onNightfall: () => {
            const clk = window.gclk();
            if (!clk) return;
            const phase = clk.dayPhase || (typeof window.dayPhase === 'function' ? window.dayPhase(clk.elapsedSec) : '');
            if ((phase === 'dusk' || phase === 'night') && Math.random() < 0.2 && window.snotify)
                window.snotify('info', '夜晚', '夜幕降临，注意安全！');
        },
        onZombieThreat: () => {
            const s = window.gst();
            if (!s) return;
            if (s.hp < 50 && (s.infection || 0) > 20 && Math.random() < 0.3 && window.snotify)
                window.snotify('danger', '威胁', '尸群正在逼近！');
        },
        onInfection: () => {
            const s = window.gst();
            if (!s) return;
            if ((s.infection || 0) > 50 && Math.random() < 0.4 && window.snotify)
                window.snotify('danger', '警告', '感染加剧！需要立即治疗！');
        },
        onFatigue: () => {
            const s = window.gst();
            if (!s) return;
            if (s.fatigue > 70 && Math.random() < 0.3 && window.snotify)
                window.snotify('warn', '警告', '疲劳过度！需要休息！');
        },
        onSpiritDrop: () => {
            const s = window.gst();
            if (!s) return;
            if (s.spirit < 30 && Math.random() < 0.25 && window.snotify)
                window.snotify('warn', '心理', '精神状态低落，需要调整心态！');
        },
        // ========== 主入口：加权随机抽 1 个事件（advTime 里按概率调用） ==========
        // 频率概率（极少2%/较少6%/适中12%/频繁20%）在 main.js 的 advTime 控制
        onAutoRandomEvent: (freqLabel) => {
            const clk = window.gclk();
            if (!clk) return null;
            const day = clk.day || 1;
            const available = RANDOM_EVENTS.filter(e =>
                day >= (e.minDay || 0) && (!e.trigger || !!e.trigger()));
            if (!available.length) return null;
            const ev = pickWeighted(available);
            return ev || null;
        }
    };

    // =============================================================
    //  每个事件挂统一的 execute（effects 直接apply；有options弹sketchConfirm让玩家选）
    // =============================================================
    for (const ev of RANDOM_EVENTS) {
        ev.execute = async function (ctx) {
            try {
                // 1) 先发顶部 snotify 让玩家知道发生了什么
                if (window.snotify) {
                    const lbl = (ev.category === 'danger' || ev.category === 'warn') ? '突发事件' :
                                (ev.category === 'survival' ? '发现' :
                                 ev.category === 'social' ? '相遇' :
                                 ev.category === 'discovery' ? '发现' : '提示');
                    window.snotify(
                        (ev.category === 'danger') ? 'danger' :
                        (ev.category === 'warn' || ev.category === 'survival' && ev.id === 'animal_trap') ? 'warn' : 'event',
                        lbl,
                        (ev.icon ? (ev.icon + ' ') : '') + ev.name
                    );
                }
                // 事件BGM切换（有danger/action之类的bgmCategory就切）
                if (ev.effects && ev.effects.bgmCategory && typeof window.bgmPlayCategory === 'function') {
                    try { window.bgmPlayCategory(ev.effects.bgmCategory, false); } catch (_) {}
                }

                // 2) 如果有 options，弹确认框让玩家选择（每次行动最多触发一次options事件）
                let chosen = null;
                if (Array.isArray(ev.options) && ev.options.length > 0 && typeof window.sketchConfirm === 'function') {
                    // 构造选择文本
                    const optsText = ev.options.map((o, i) => `${i + 1}. ${o.label}`).join('\n');
                    const confirmText = `【${ev.icon || '★'} ${ev.name}】\n${ev.desc || ''}\n\n请选择应对方式（点击 确定=按第一条；取消=最后一条）：\n\n${optsText}\n\n（推荐：直接在输入框回复 1/2/3 或输入自定义行动更自然。此处为快速分支）`;
                    // 我们用 sketchPrompt 让玩家输入数字，这样比 sketchConfirm 更灵活
                    let pickIdx = 0;
                    try {
                        const rawPick = await window.sketchPrompt(confirmText, '1', ev.name);
                        const num = parseInt(String(rawPick || '').replace(/[^\d]/g, ''), 10);
                        pickIdx = (isNaN(num) || num < 1) ? 0 : Math.min(ev.options.length - 1, num - 1);
                        chosen = ev.options[pickIdx];
                    } catch (_) { chosen = ev.options[0]; }
                }

                // 3) 先 apply 基础 effects（如果有）
                if (ev.effects) await applyEventEffects(ev.effects, ctx || {});
                // 4) 再 apply 选项的 effects（如果选择了分支）
                if (chosen && chosen.effects) await applyEventEffects(chosen.effects, ctx || {});
                // 5) addLogEntry 事件名+desc（logText已经在effects里）
                if (typeof window.addLogEntry === 'function') {
                    try { window.addLogEntry('event', ev.name + '：' + (ev.desc || '')); } catch (_) {}
                }
                return chosen;
            } catch (e) {
                console.warn('[event.execute] error:', ev.id, e);
                return null;
            }
        };
    }

    // =============================================================
    //  暴露到全局
    // =============================================================
    window.RANDOM_EVENTS_EXT = RANDOM_EVENTS;
    window.EVENT_TRIGGERS_EXT = EVENT_TRIGGERS;
    window.applyEventEffects = applyEventEffects; // 外部也可以直接调用
    window.pickWeightedEvent = (list) => pickWeighted(list || RANDOM_EVENTS);
    // 按频率触发一次（main.js 的 advTime 调用此函数）
    window.tryTriggerRandomEvent = async function (freqLabel) {
        try {
            const ev = EVENT_TRIGGERS.onAutoRandomEvent(freqLabel);
            if (!ev) return false;
            await ev.execute({ from: 'advTime', freq: freqLabel });
            return true;
        } catch (e) {
            console.warn('[tryTriggerRandomEvent] error:', e);
            return false;
        }
    };

})();
