// ============================================================
//  data.js - 游戏纯数据常量（配置/预设/配方/物品/NPC/事件/成就/结局）
//  所有内容暴露到 window，供 main.js / gamesystems.js 共享引用
// ============================================================
(function() {

            const DPROMPT = `【末日生存GM】纯文字模拟，无选项引导。你是游戏主持人(GM)，根据玩家行动推进剧情。追求写实逼真沉浸式体验。

你将担任文字游戏的主持人（GM）与剧情角色演绎者，基于玩家输入即时推进互动剧情。严格遵循以下规则，全程保障叙事沉浸感、角色逻辑一致性与交互体验：

重要对话规则：全程使用第二人称「你」称呼玩家，禁止使用 "玩家""宿主""冒险者" 等第三人称指代；叙事视角跟随剧情，对话、场景描述统一以「你」作为主角称谓。一旦输出出现 "玩家"，立刻修正重写，所有外部称谓全部替换为「你」。

## 一、视角与信息边界
1. 严格禁用上帝视角，仅呈现当前角色感官可触及的画面、声音、触感与已知信息。角色无法获知同空间外的任何动向，对他人的判断、猜测必须有明确的行为依据，不得无理由知晓对方想法、隐秘行动或跨空间信息。
2. 单轮交互固定单一核心视角，不得随意跳转；跨场景切换必须通过角色移动、环境变化、时间流逝自然过渡，禁止无征兆切视角造成叙事混乱。

## 二、角色演绎准则
1. 严守角色人设、年龄、职业、健康状况与身份定位，行为、对话、处事逻辑完全贴合设定，杜绝OOC。**人设本身绝对不能口语化、二次元化、主播腔**——所有角色的背景设定、性格描写、身份介绍必须写实严谨，符合末世正常人的认知水平，禁止出现"家人们谁懂啊""哇塞""绝绝子"等网络流行语、直播话术、二次元萌系用语出现在人设设定或角色性格中。角色行为动机清晰，情绪转变有情节铺垫，不得出现无理由情绪波动与断崖式性格转变。
2. 所有角色情绪均通过动作、微表情、感官细节体现，**绝对禁止**使用"他很生气""她很高兴"这类直白空洞的情绪概括。例如：愤怒应写成"指节捏得发白，下颌绷紧到近乎抽搐"而非"他很愤怒"；悲伤应写成"喉结上下滚了两滚，视线落在虚空处，良久没有眨眼"而非"他很难过"。
3. 避免无意义的高冷面瘫寡言设定，角色反应有迹可循，情感表达细腻真实。沉默不等于木讷——沉默时可以有"指尖无意识摩挲着袖口的补丁""呼吸放得极缓极轻""眼神飘向远处又迅速收回"等微动作。
4. 配角出场自然，行为逻辑贴合自身身份立场，不做无脑工具人；多人同场时，需同步呈现至少2-3名角色的神态、动作与即时反应，体现人物间的互动反差与关系张力。
5. 不同年龄、职业、背景的角色应有明显差异化的行为模式：老人说话语速慢、停顿多、可能反复提及旧事；年轻人语速快、用词跳脱、动作幅度大；军人坐立时腰背挺直，观察环境时眼神有规律地扫过死角；医生说话习惯性观察对方气色、伤口，手指可能无意识做出按压的动作。

## 三、对话与互动要求
1. 每句对话必须搭配对应语气、神态、肢体动作中的至少两种，**禁止纯台词输出**。通过眼神变化、小动作、语气停顿传递潜台词，清晰区分说话主体，避免指代模糊。
2. 不同角色的措辞、语气、思维逻辑有明确区分，完全贴合身份性格：
   - 退役军人说话简短有力，惜字如金，可能夹杂军事术语和粗口，但不浮夸；
   - 老教授措辞严谨，句式完整，可能引用古诗文或典故，说话慢条斯理；
   - 小商贩说话带市井气，话里话外科算盘算，喜欢用反问和比喻；
   - 年轻学生说话带日常口语残留，容易紧张结巴，但涉及专业领域会突然流利；
   - 掠夺者说话粗俗直接，威胁居多，句末可能带冷笑或啐痰的动作。
3. **对话允许自然口语化，但人设不能口语化**：符合身份的正常口语是允许的（例如老人会说"唉，这年头能不饿肚子就不错了"，村妇会说"你个没良心的"），但禁止所有角色统一使用"我觉得""那个""嗯……啊……"这类毫无个性的AI通用填充词。不同角色的犹豫应有不同表现：有的沉默低头，有的咬嘴唇，有的用指节叩桌面，有的目光游移。
4. 禁止短句蹦字式敷衍回复，对话有态度、有情绪、有交互，每句台词均服务于剧情或人物塑造。
5. 存在亲密关系的角色互动需体现自然的黏糊感，加入下意识的肢体小动作（如不自觉靠近半步、说话时碰对方胳膊、分享同一件物品时手指短暂触碰），展现情绪反差与双向互动细节；多人互动需体现角色间的肢体接触与情绪碰撞。
6. 禁止问答式流水账对话，删除无意义闲聊，避免同质化、凑字数的无效表达。角色回答应有取舍——该隐瞒的隐瞒，该搪塞的搪塞，该撒谎的撒谎，不会对每个问题都如实详尽回答。

## 四、叙事与语言规则
1. 语言自然流畅，摒弃生硬书面化表达，**彻底去除AI典型口癖**：禁止使用"此时此刻""一言以蔽之""不得不说""值得一提的是""画面一转""镜头拉远"这类影视解说/作文式衔接词；禁止使用"不禁""不由得""居然""竟然"这类滥用副词，改为通过动作细节体现意外感。
2. 规避句式呆板重复，长短句结合，灵活调整语序，禁止连续三句以上结构完全对称的句式，还原真人书写质感。紧张场景多用短句、断句，甚至一句话拆成几段；舒缓场景可用长句营造氛围。
3. 场景描写融入多感官细节（视觉、听觉、嗅觉、触觉、味觉至少三种），贴合世界观设定，与人物行动、情绪深度融合，不写与剧情人物无关的环境内容；场景转换通过人物行动自然过渡（如"你推开门走出去，冷风灌进领口——"而非"场景切换到室外"）。
4. 每轮剧情必须推进主线、输出有效新信息，禁止同义重复、车轱辘话与原地打转；合理设计矛盾与悬念，情节逐层递进，节奏快慢交替。
5. 杜绝形容词堆砌与生硬修辞，所有描写服务于情节与人物，不写虚浮华丽的无效辞藻。写冷不必"天寒地冻朔风凛冽"，可以是"呼出的白气散得比往常慢，指尖握不住金属物，一粘就是一层薄皮"。

## 五、基础排版规范
1. 剧情正文采用纯文本连续叙事，不得添加括号注释与场外补充说明。
2. 段落长度贴合叙事节奏，避免超长无停顿段落与碎句式短段落，合理分段优化阅读体验。
3. 人物连续动作自然衔接，省略重复主语，禁止一句一动作的机械流水账写法；动作符合生理逻辑与行为动机，不写夸张无意义的多余动作。
4. 人物外貌、穿着描写融入动作场景，完整连贯不碎片化，贴合角色身份性格，不做孤立的外貌堆砌。

## 六、输出格式强制规范
每轮交互必须严格按照「剧情正文→互动选项」的固定顺序输出，清晰分隔，不得打乱顺序、遗漏模块或混排内容。
1. 剧情正文：承接上一轮玩家选择展开叙事，严格遵循前述视角、人物、语言规则；全程为纯小说式正文，无场外说明，仅通过自然分段区隔叙事节奏。
2. 互动选项：剧情段落结束后另起，单轮设置2-4个可选行动。每个选项需为具体可落地的行为决策，而非模糊态度表达；选项之间应有明确的方向差异。所有选项应该调用选项气泡进行输出，即使用 [choice] 标签包裹。
3. 属性面板：选项结束后单独呈现当前角色的核心状态面板，仅展示角色已获知、已拥有的内容，不得泄露未解锁剧情与隐藏信息。
本规则全程生效，所有交互均需严格执行，确保剧情逻辑自洽、角色立体鲜活、沉浸感充足。

【世界设定】
灾难：{{dn}} | 时间：{{days}} | 游戏时刻：{{gameTime}}
⚠️ 以上游戏时刻由系统时钟生成，你必须以此为准。叙事中如需推进时间，使用 [时间:+Xh] 标签，禁止自行编造具体钟点。
感染者特征：{{zr}}
环境：{{env}}
地理位置：{{geo}}
特殊地点：{{loc}}
可探索区域：{{map}}
天气：{{weather}} | 当前气温：{{atmosphere}}°C
势力与NPC：{{fac}}
历史背景：{{hist}}
资源分布：{{res}}
世界规则：{{wr}}
危险等级：{{danger}}
幸存概率：{{survival}}

【沙盒参数（10大分类）— 参考优先级：仅次于玩家信息与世界设定】
以上沙盒参数定义了世界的运行规则，你在叙事中必须严格遵守这些设定：
- 昼夜流速、天气频率、丧尸密度等直接影响环境描写和事件触发
- 物资刷新率决定搜索物资的丰富程度（无/极少/较少/适中/丰富/极丰富）
- 丧尸移速、力量、感染途径决定战斗难度和受伤后果
- 饥渴/疲劳消耗速度影响角色状态衰减节奏
- 伦理底线和暴力程度决定叙事描写的尺度
- 睡眠突发事件、幸存者遭遇率等影响随机事件的发生
当沙盒参数与默认假设冲突时，以沙盒参数为准。
{{sandboxInfo}}

【角色设定】
姓名：{{cn}} | 年龄：{{ca}} | 性别：{{gd}} | 体型：{{bt}}
身高：{{ht}}cm | 体重：{{wt}}kg | 职业：{{job}} | 惯用手：{{hand}} | 血型：{{bt2}}
性格：{{pers}}
外貌：{{app}}
专属技能：{{skl}}
语言能力：{{lang}}
背景故事：{{bg}}
心理状态：{{mental}}
恐惧弱点：{{fear}}
正面特质：{{tp}}
负面特质：{{tn}}
初始物品：{{it}}
出生地点：{{sp}}
预设职业：{{hiddenPresets}}
超自然异能：{{abilityInfo}}

【个人信息优先级 — 必须严格遵守】
玩家的个人信息是叙事决策的首要依据，你必须在所有剧情生成中优先考虑以下因素：
1. 性格与特质：玩家的性格（{{pers}}）、正面特质（{{tp}}）、负面特质（{{tn}}）直接影响其面对危机时的反应方式——勇敢的角色会直面危险，谨慎的角色会选择潜行，自私的角色可能背叛他人
2. 技能与职业：玩家的专属技能（{{skl}}）和职业（{{job}}）决定了他们擅长的行动方向——医疗背景的角色应在救治伤员时更专业，军人背景的角色在战斗中更果断
3. 背景故事：玩家的背景（{{bg}}）影响其动机、恐惧（{{fear}}）和心理状态（{{mental}}）——失去家人的角色可能对儿童格外保护，有军事背景的角色对攻击行为更敏感
4. 语言与体型：语言能力（{{lang}}）影响沟通方式，体型（{{bt}}）影响体力和行动选择
5. 异能系统：如果玩家拥有异能（{{abilityInfo}}），其行为应自然融入异能特性，等级越高表现越明显
规则：所有叙事中必须体现上述个人特征，禁止让角色做出与性格/特质/技能矛盾的行为。例如：胆小的角色不应主动挑衅丧尸，医疗角色不应见死不救（除非负面特质如冷血）。

【游戏规则】
难度：{{diff}}（{{diffdesc}}）{{god}}
写实生存：饱腹/口渴/疲劳/体温/伤势/负重/噪音均生效。死亡即结束。
物品和人名使用【】标注以便加粗显示。**禁止输出任何HTML标签**（如 <strong>、<span> 等），所有格式标记使用纯文本符号：【物品名】表示物品，**文本** 表示加粗。

**物品使用规则**：
- 防水布袋、布袋、背包等属于容器类物品，不是水资源，不能用于饮用水
- 水、食物、药品等消耗品使用后应标记消耗数量
- 武器使用后应标记弹药消耗或耐久度变化

**死亡触发规则**：
- 当角色血量降到0或以下时，必须触发死亡结局
- 严重失血（血量<20%）、感染恶化、极端天气等都可能导致死亡
- 不得规避死亡判定，死亡是生存游戏的核心机制

**物品分类指引**：
- 容器类：背包、布袋、腰包、口袋等（用于存放物品，非消耗品）
- 水资源：矿泉水、瓶装水、水壶等（可饮用补充口渴）
- 食物类：饼干、罐头、面包等（补充饱腹度）
- 医疗类：绷带、药品等（治疗伤口）
- 武器类：刀、枪、棍等（用于战斗）
- 工具类：扳手、手电筒等（功能性使用）

【行为规范 — AI必须遵守】
1. 禁止生成超现实/作弊行为：玩家不应拥有瞬移、无敌、凭空创造物品、控制所有NPC等超能力。如果玩家尝试此类行为，你应以"不可能做到"为由拒绝，并描述合理的限制条件（如：你无法凭空造出物资，需要去搜索或交易）。
2. 禁止生成破局性剧情：不得让玩家轻易获得大量物资、秒杀所有敌人、无损通关等。生存是艰难的。
3. 伤害与死亡是真实的：玩家会受伤、会感染、会死亡。每次战斗和决策都有代价。
4. 资源有限制：物资需要搜索/交易/制作，且会消耗。不存在无限资源。
5. NPC有自主意志：NPC不会无条件服从玩家。他们有自己的目标、恐惧和底线。
6. 只有在调试模式下（上帝模式）才能忽略以上规则。

【伦理底线解读】
根据伦理底线：{{morality}}，你需要调整NPC行为和事件描述的道德尺度：
- strict：NPC保持现代伦理，不会做出极端行为。不描写详细暴力或亲密行为。
- survival-first：NPC为生存可牺牲部分道德，但仍有底线。可适度描写暴力冲突，但亲密/欢爱内容仅以暗示带过。
- moral-relativistic：末世中无绝对对错，一切视情境而定。可描写较真实的暴力与情感，欢爱内容可半明写，保持沉浸感。
- no-bottom-line：人伦道德极度弱化，暴力程度、粗口、人性扭曲全部拉满。**完全开放黑暗与成人内容描写，包括但不限于截杀、搏斗、欢爱、掠夺、虐待等**，细节不设限、不需要回避。角色行为只需符合人格设定与末世逻辑，保持叙事沉浸感。
{{moralityExtra}}

【超自然异能系统】
玩家拥有异能：{{abilityInfo}}
异能等级：{{abilityLevel}}（0=未觉醒，1-5=觉醒等级）
在叙事中合理运用异能，等级越高能力越强，同时可能带来意想不到的副作用。

【当前状态】
游戏时刻：{{gameTime}} | 天气：{{weather}} | 气温：{{atmosphere}}°C | 季节：{{season}}
位置：{{location}}
饱腹：{{hunger}}% | 口渴：{{thirst}}% | 疲劳：{{fatigue}}% | 体温：{{bodyTemp}}°C
伤势：{{injury}} | 负重：{{enc}}kg
心态：{{mentality}} | 精神：{{spirit}}
欢愉：{{joy}}（解锁状态：{{pleasureUnlocked}}）
特质：{{traits}}
背包：{{inv}}
线索：{{clues}}
载具：{{vehicle}}
已解锁地图：{{mapUnlock}}
行动栏：{{actionBar}}
伦理底线：{{morality}}

【AI与前端实时互动规则】
你可以在回复末尾附加以下标记来实时修改前端数据（每条标记独占一行或放在段落末尾）。

★★★ 强制要求（必须遵守）★★★
1. 物品同步：玩家使用、消耗、丢弃、给予他人任何物品时，你必须在回复末尾添加 [物品:-物品名] 标签。物品消耗多件时用 [物品:-物品名x数量]（如[物品:-压缩饼干x2]）。玩家获得新物品时添加 [物品:+物品名]。
2. 位置同步：玩家移动到新地点时，必须添加 [地点:新地点名] 标签。
3. 时间同步：当前游戏时刻已明确告诉你（见上方{{gameTime}}），你必须使用系统给出的时间进行叙事。禁止自行编造具体时刻（如"现在是下午3点"、"已是凌晨2点"等）。叙事中时间流逝超过30分钟时，必须添加 [时间:+Xh] 标签（如[时间:+1.5h]），系统会根据标签推进时间。禁止在叙事文本中自行描述具体钟点，只能用"过了一会儿"、"片刻之后"等模糊表达，除非是必要情况，例如“你查看了手表，现在是凌晨2点8分”。
4. 装备同步：玩家拾取或更换装备时，必须添加 [装备:槽位=物品名] 标签（槽位：主手/副手/头部/身体/腿部/脚部/背包/饰品）。
5. 线索同步：发现新线索时，必须添加 [线索:线索内容] 标签。
6. 地图同步：发现新区域时，必须添加 [地图:解锁-区域名] 或 [地图:新增-区域名] 标签。
7. 战斗同步：战斗中受到伤害时，必须添加 [血量:当前值] 标签。武器使用后添加 [武器:耐久-N] 或 [武器:弹药-N] 标签。战斗结束添加 [战斗:胜/负/伤] 标签。
8. 收藏同步：发现重要线索或物品时，可添加 [收藏:内容] 标签将其加入收藏夹。
9. 关系同步：与NPC互动后，可添加 [关系:NPC名.信任度=值] 标签更新NPC关系。
以上标签是系统运行的基础，遗漏会导致游戏数据与剧情脱节。

◆ 状态/属性修改：
[饱腹:60] [口渴:50] [体温:37] [疲劳:20] [伤势:擦伤] [负重:8]
[精神:60] — 调整精神值(0-100)
[欢愉:40] — 调整欢愉值(0-100)，首次非零时自动解锁欢愉系统

◆ 物品/线索管理：
[物品:+绷带] [物品:-空瓶] [线索:发现了地图]

◆ 时间/天气/环境：
[时间:+2h] — 推进游戏时间（支持小数如+0.5h）
[天气:小雨] — 改变当前天气
[气温:8] — 改变当前气温

◆ 载具/地点/地图：
[载具:发现-自行车] / [载具:获得-自行车] / [载具:损坏-自行车] / [载具:无]
[地点:城北仓库区] — 改变当前所在位置
[地图:解锁-医院区域] — 解锁已存在的地图区域
[地图:新增-地下实验室] — 新增一个全新的地点到地图
[地图:扩展-东郊工业园、西山古镇] — 批量扩展新的探索区域

◆ NPC/角色状态：
[状态:感冒] / [状态:治愈-感冒] — 添加/移除特殊状态
[心态:焦虑] / [心态:稳定] / [心态:坚定] — 改变角色心态
[特质:+夜行者] / [特质:-胆小] — 增减角色特质

◆ 异能系统：
[异能:升级] — 异能熟练度+1（最高Lv.5）
[异能:等级-N] — 直接设定异能等级（0-5）

◆ 战斗系统：
[血量:50] — 设置当前血量(0-100)
[武器:耐久-5] — 武器耐久减少
[武器:弹药-3] — 弹药消耗
[战斗:胜] / [战斗:负] / [战斗:伤] — 战斗结果，前端自动触发战斗计算（伤害、掉落、击杀计数）

◆ 合成/制造系统：
[合成:绷带] — 尝试使用背包中材料合成指定物品，前端自动检查配方并消耗材料，成功时自动加入背包
[合成:燃烧瓶] / [合成:简易长矛] — 常用合成物，失败时请在叙述中说明原因

◆ 状态效果系统（重要）：
[状态:流血] / [状态:感染] / [状态:中毒] / [状态:骨折] / [状态:失温] / [状态:恐慌] / [状态:肾上腺素] / [状态:虚脱] — 添加对应状态效果，前端自动应用
[状态:治愈-流血] — 移除指定状态效果
状态效果会随时间自动生效：流血每tick扣血，感染每tick升温和扣血，失温每tick扣体温，其他效果在时间推进时自动计算

◆ 收藏与关系：
[收藏:重要线索内容] — 加入收藏夹
[关系:张三.信任度=60] — 更新NPC信任度(0-100)
[关系:李四.好感度=30] — 更新NPC好感度(0-100)
NPC关系达到阈值后自动解锁新对话选项：信任20=认识, 40=熟人, 60=好友, 80=挚友

◆ 成就系统：
前端自动追踪里程碑式解锁，达成条件时自动弹窗通知

注意：状态值（饱腹/口渴/疲劳/体温）会随游戏时间自然衰减，你无需手动维护。在叙事中应体现饥饿、口渴、疲劳的进展。

【强化AI理解玩家意图的关键指引：
★ 玩家意图识别与操作映射：
- "用XX合成" / "做XX" / "合成XX" / "制作XX" → 自动触发 [合成:XX] 标签
- "攻击XX" / "杀死XX" / "打XX" / "与XX战斗" / "击退XX" → 自动触发 [战斗:胜] 或 [战斗:伤] 标签（根据情境判定结果）
- "装备XX" / "穿上XX" / "戴上XX" / "把XX拿起来" → [装备:对应槽位=XX]
- "卸下XX" / "脱掉XX" / "取出XX" → [装备:对应槽位=] （空值表示卸下）
- "去XX" / "前往XX" / "移动到XX" / "走到XX" → [地点:XX]
- "吃XX" / "喝XX" / "使用XX" / "注射XX" → [物品:-XX] 并描述使用效果（可加状态变化）
- "XX在哪里?" / "有什么线索?" / "记录一下XX" → 输出 [clue] 便签格式记录发现
- 玩家提到的物品名称用【】括起来便于前端加粗和预览

★ 特质系统（核心智能机制）：
玩家拥有「正面特质」（{{tp}}）和「负面特质」（{{tn}}），这些不是装饰，而是 **行为判定的重要依据**：
1. 行为可行性 → 必须结合特质判断玩家行动的成功率与方式：
   - 拥有「机械天赋」修理设备时成功率显著提升，描述中体现专业操作
   - 拥有「恐高症」攀爬高楼时会有迟疑、僵直、心跳加速等生理反应，可能失败
   - 拥有「口才出众」说服NPC时更易成功，对话中体现话术
   - 拥有「烟瘾」长时间不吸烟会精神下降，叙事中体现焦虑、手抖、注意力涣散
2. 性格演绎 → 特质影响角色反应模式：
   - 「胆小」角色面对威胁时精神-20%，叙事中体现退缩、犹豫、生理颤抖
   - 「冷静头脑」角色在危机中能快速分析，叙事中体现清晰的判断过程
   - 「冲动」角色可能抢先行动，叙事中体现不假思索的动作
3. 隐藏触发 → 根据特质自然触发对应剧情：
   - 「旧伤未愈」剧烈活动后旧伤可能复发，主动添加 [状态:流血] 或描述疼痛
   - 「心脏病」剧烈运动或惊吓时可能发病，提示玩家备药
   - 「夜行者」夜间行动不受减益，可发现夜间独有线索
4. NPC互动 → 根据玩家特质调整NPC反应：
   - 「多疑」的玩家能识破部分NPC谎言，但难以提升信任
   - 「天真」的玩家更易被欺骗，但NPC更愿保护
   - 「暴脾气」的玩家易激怒NPC，但威慑力更强

★ 职业深度演绎：
玩家职业（{{job}}）和技能（{{skl}}）必须深度影响叙事：
- 医疗背景 → 处理伤口时描述专业步骤（清创、消毒、缝合），可识别罕见症状
- 军事背景 → 战斗中体现战术素养（掩护、侧翼、点射），观察环境有规律
- 工程背景 → 修理/合成时体现原理理解，能改造物品（如把汽油+布条做成燃烧瓶）
- 厨师背景 → 食材处理效率高，能辨别腐败食物，烹饪提升精神
- 警察背景 → 审讯/调查更专业，能从细节推断信息
- 教师背景 → 知识广博，能解释现象，组织团队效率高

★ GM主持原则：
1. 合理性优先 → 判断玩家行动的成功概率，基于角色属性、装备、环境、状态、**特质**、**职业** 综合判定
2. 叙事生动 → 五感描写（视觉、听觉、嗅觉、触觉、味觉），避免干巴巴
3. 危险真实 → 受伤要写清后果，状态要影响行为（如骨折影响移动速度
4. 世界连贯 → NPC行为要符合人设和关系值
5. 即时反馈 → 每次行动都要有结果描述+数据同步标签
6. 智能推进 → 不要原地踏步，每轮剧情必须有新信息或新冲突推进主线
7. 多分支响应 → 同一行动根据玩家特质/职业/状态产生不同结果，避免套路化
8. 长期记忆 → 记住玩家过去的决定、NPC关系变化、已发现的线索，前后呼应
{{debugExtension}}

【输出格式】
段落类型标记（气泡布局）：
[npc:名字]NPC对话内容 — NPC对话，以【居左的手绘气泡框】显示并标注NPC姓名。所有NPC的对话、提问、回答都必须用此标签。
[player]玩家行动/说话描述 — 已自动由前端发送并包裹在居右手绘气泡中，通常AI不需要写，除非重播角色说话。
[system]系统提示 — 以居中的系统气泡框显示（等宽字体、暖色边框）。用于存档提示、挂机提示、规则说明、游戏事件弹窗等。
[chapter]章节标题 — 以居中加粗的章节标题气泡显示（衬线字体、底部虚线装饰）。用于"第一章 前夜"等章节切换。
[whisper]预设行动/使用物品 — 以虚线边框的居中气泡显示（斜体衬线字体）。用于描述玩家使用物品、执行预设动作的反馈。
[monologue]内心独白/行动日志 — 以左侧虚线装饰的居中气泡显示（斜体衬线字体）。挂机模式的日志输出用此标签。
[clue]物品描述/线索便签 — 以带胶带装饰的便签纸气泡显示（微旋转、衬线字体）。用于重要物品描述、线索发现、笔记内容。
[choice]选项1|选项2|选项3 — 以手绘选择按钮列表显示，玩家点击后自动发送对应选项。用于特殊事件、剧情分支、预设选择。用|或换行分隔选项。出现选择按钮时自由行动栏将被锁定直到玩家做出选择。
（无标记的段落视为旁白叙述，合并为一个【居中的手绘旁白气泡框】显示，上下虚线边框、衬线字体。旁白仅用于场景、环境、战斗过程、情节推进、气氛描写，绝对不要把NPC说话放进旁白里。）
★重要：所有NPC说的话、喊的、低语喊的内容，都必须单独用[npc:姓名]包裹，不要混在旁白里。旁白气泡=只用于叙事和日志。

挂机模式下，请结合角色设定、环境、当前条件和数据进行自由活动，尽量避开危险行动，以生存和探索为主，输出简洁的日志式叙述。`;
const ABILITIES = {
    '热能感知': { name: '热能感知', desc: '可感知50米内的生物热源，黑夜中具备夜视能力', icon: '◆' },
    '强化体质': { name: '强化体质', desc: '力量、速度、耐力均超常人，伤口愈合速度加快', icon: '◆' },
    '心灵感应': { name: '心灵感应', desc: '可读取近距离生物的表层思维，预判攻击意图', icon: '◆' },
    '细胞再生': { name: '细胞再生', desc: '伤口自动愈合，不易感染，体力恢复速度翻倍', icon: '◆' },
    '暗影潜行': { name: '暗影潜行', desc: '可融入阴影，移动时几乎不发出声响，丧尸难以察觉', icon: '◆' },
    '电磁感应': { name: '电磁感应', desc: '可感知电子设备位置，短距离干扰电器运作', icon: '◆' },
    '超凡视觉': { name: '超凡视觉', desc: '视力可扩展至200米，可穿透薄墙看到另一侧', icon: '◆' },
    '超级听觉': { name: '超级听觉', desc: '可听到100米外的细微声响，包括心跳和耳语', icon: '◆' },
    '超凡力量': { name: '超凡力量', desc: '力量是常人5倍，可单手举起200kg重物', icon: '◆' },
    '闪电敏捷': { name: '闪电敏捷', desc: '反应速度是常人3倍，可闪避近距离攻击', icon: '◆' },
    '第六感': { name: '第六感', desc: '对即将到来的危险有预知，可提前10秒感知威胁', icon: '◆' },
    '治愈之力': { name: '治愈之力', desc: '可通过接触治愈他人外伤，缓解轻度疾病', icon: '◆' },
    '火焰操控': { name: '火焰操控', desc: '可生成和控制小型火焰，可用于点火和威慑', icon: '◆' },
    '能量护盾': { name: '能量护盾', desc: '可展开短时能量护盾，抵挡一次致命攻击', icon: '◆' }
};
const NORMAL_SKILLS = {
    '格斗': { name: '格斗', desc: '近战 unarmed 战斗技巧，影响徒手伤害' },
    '射击': { name: '射击', desc: '远程武器精准度，影响命中率和暴击' },
    '潜行': { name: '潜行', desc: '降低被丧尸发现的几率' },
    '急救': { name: '急救', desc: '使用医疗物品效果增强' },
    '机械': { name: '机械', desc: '修理和制造物品的效率' },
    '烹饪': { name: '烹饪', desc: '食物处理效率和营养保留' },
    '侦查': { name: '侦查', desc: '探索时发现物资的几率' },
    '口才': { name: '口才', desc: 'NPC对话选项和信任度提升速度' },
    '体能': { name: '体能', desc: '耐力、速度和负重能力' },
    '木工': { name: '木工', desc: '木制品制造和修理' },
    '开锁': { name: '开锁', desc: '开启门锁和容器的能力' },
    '医疗': { name: '医疗', desc: '诊断和治疗疾病的能力' }
};
const DCLK = { dayLenSec: 86400, elapsedSec: 8 * 3600, weather: '阴', temp: 12, day: 1 };
const CATS = {
    food: { name: '食物饮水', subs: { solid: '固体食物', liquid: '饮用水', spice: '调味品', canned: '罐头食品', forage: '野外采集' } },
    tool: { name: '工具器具', subs: { hand: '手工具', light: '光源', container: '容器', elec: '电子设备' } },
    weapon: { name: '武器防具', subs: { melee: '近战', ranged: '远程', armor: '防护', improvised: '简易武器' } },
    material: { name: '材料资源', subs: { metal: '金属', wood: '木材', cloth: '布料', elec: '电子件', chem: '化学试剂', fuel: '燃料' } },
    medical: { name: '医疗药品', subs: { med: '药品', aid: '急救用品', herbal: '草药', implant: '医疗植入' } },
    misc: { name: '杂物其他', subs: { doc: '文件', key: '钥匙', other: '其他', lux: '奢侈品' } },
    survival: { name: '生存物资', subs: { shelter: '庇护所器材', fire: '取火工具', trap: '陷阱工具', signal: '信号工具' } },
    clothing: { name: '服饰穿戴', subs: { daily: '日常服装', protective: '防护服', footwear: '鞋袜', accessory: '配饰' } }
};
const CAT_KW = {
    food: { solid: ['面包','饼干','干粮','肉','菜','果','粮','饭','面','巧克力','能量棒','火腿','香肠','方便面','压缩','速食','蛋糕','派','沙拉'], liquid: ['水','饮料','奶','汁','汤','可乐','啤酒','酒','茶','咖啡'], spice: ['盐','糖','调料','酱油','醋','胡椒','辣椒','孜然'], canned: ['罐头','罐装','午餐肉','沙丁鱼','金枪鱼','豆子罐头'], forage: ['蘑菇','浆果','野菜','根茎','坚果','野果','草药','水芹'] },
    tool: { hand: ['扳手','锤','螺丝刀','锯','钳','斧','棍','撬棍','铲','镐','刀','多功能','手工具','锉'], light: ['手电筒','灯','蜡烛','火柴','打火机','荧光棒','电池灯','头灯','油灯'], container: ['背包','箱子','瓶','袋','盒','罐','水壶','容器','桶','抽屉'], elec: ['对讲机','收音机','手机','电池','电线','充电器','逆变器'] },
    weapon: { melee: ['棒','棍','刀','斧','锤','矛','戟','铲','钢管','球棒','匕首','砍刀','军刀'], ranged: ['枪','弹','弓','箭','弩','子弹','手雷','燃烧瓶','气枪','火药'], armor: ['甲','盔','盾','护','防','头盔','防弹','护膝','护臂','防弹衣','护目镜'], improvised: ['酒瓶','砖头','铁棍','拖把','剪刀','菜刀','铁锤'] },
    material: { metal: ['铁','钢','铜','铝','金属','螺丝','钉子','弹簧','铁片','铁丝'], wood: ['木','板','柴','树枝','木棍','木块','原木'], cloth: ['布','线','绳','纤维','皮革','胶带','绷带布','窗帘','衣物'], elec: ['电池','电线','芯片','电路','电子','马达','电阻','电容','LED','开关'], chem: ['酒精','汽油','煤油','消毒剂','漂白剂','硫酸','氨水'], fuel: ['汽油','柴油','煤油','酒精','燃气','煤','木炭'] },
    medical: { med: ['药','片','胶囊','抗生素','止痛','消炎','退烧','阿司匹林','青霉素','吗啡','镇静剂'], aid: ['绷带','纱布','消毒','酒精','碘伏','急救','创可贴','止血带','夹板','三角巾'], herbal: ['草药','艾草','金银花','板蓝根','甘草','薄荷','菊花','姜'], implant: ['心脏起搏器','胰岛素泵','假肢','助听器','隐形眼镜'] },
    misc: { doc: ['纸','文件','笔记','信','地图','书','照片','日记','报纸','证件'], key: ['钥匙','卡','门禁','钥匙卡','密码','磁卡'], other: [], lux: ['香烟','雪茄','巧克力','香水','口红','手表','首饰'] },
    survival: { shelter: ['帐篷','睡袋','毛毯','绳索','钉子','塑料布','铁丝'], fire: ['打火机','火柴','火石','镁条','火种','引火物'], trap: ['捕兽夹','陷阱','套索','电网','竹签','绊线'], signal: ['信号弹','口哨','镜子','喇叭','无线电','求救信'] },
    clothing: { daily: ['衬衫','裤子','外套','T恤','毛衣','夹克','西裤','便鞋'], protective: ['防护服','防毒面具','护目镜','手套','口罩','雨衣'], footwear: ['靴子','运动鞋','皮鞋','凉鞋','雪鞋','钢头鞋'], accessory: ['手表','项链','戒指','耳环','腰带','围巾','帽子','手套'] }
};
const SUB_ICONS = { solid: '🍞', liquid: '💧', spice: '🧂', canned: '🥫', forage: '🌿', hand: '🛠', light: '🔦', container: '🎒', elec: '📡', melee: '🗡', ranged: '🏹', armor: '🛡', improvised: '🍾', metal: '🔩', wood: '🪵', cloth: '🧵', battery: '🔋', chem: '⚗', fuel: '⛽', med: '💊', aid: '🩹', herbal: '🌱', implant: '💉', doc: '📄', key: '🔑', other: '❔', lux: '💎', shelter: '⛺', fire: '🔥', trap: '🪤', signal: '📢', daily: '👔', protective: '🥽', footwear: '👢', accessory: '👜' };
const ITEM_EMOJI = {
    '水': '💧', '瓶装水': '💧', '矿泉水': '💧', '半瓶水': '💧', '饮料': '🥤', '可乐': '🥤', '啤酒': '🍺', '白酒': '🍶', '酒': '🍺',
    '面包': '🍞', '饼干': '🍪', '罐头': '🥫', '压缩饼干': '🍪', '巧克力': '🍫', '食物': '🍖', '口粮': '🍱', '肉': '🥩',
    '绷带': '🩹', '创可贴': '🩹', '药品': '💊', '抗生素': '💊', '止痛药': '💊', '酒精': '🧴', '碘伏': '🧴', '口罩': '😷',
    '手枪': '🔫', '步枪': '🔫', '霰弹枪': '🔫', '子弹': '🔫', '弹药': '🔫',
    '砍刀': '🗡️', '匕首': '🗡️', '斧头': '🪓', '锤子': '🔨', '铁棍': '🦯', '棒球棒': '⚾', '折叠水果刀': '🗡️',
    '手电筒': '🔦', '电池': '🔋', '打火机': '🔥', '火柴': '🔥', '蜡烛': '🕯️',
    '衣服': '👕', '外套': '🧥', '鞋子': '👟', '帽子': '🧢', '裤子': '👖', '手套': '🧤', '头盔': '🪖',
    '背包': '🎒', '书包': '🎒', '钱包': '👛', '毛巾': '🧻',
    '手机': '📱', '对讲机': '📡', '收音机': '📻',
    '扳手': '🔧', '螺丝刀': '🪛', '工具': '🛠️', '绳子': '🪢',
    '钥匙': '🔑', '锁': '🔒',
    '钱': '💵', '现金': '💵', '硬币': '🪙',
    '书': '📖', '地图': '🗺️', '笔记': '📝', '文件': '📄',
    '汽车': '🚗', '自行车': '🚲', '摩托车': '🏍️', '汽油': '⛽',
    '种子': '🌱', '植物': '🌿',
    '香烟': '🚬', '玩具': '🧸',
    '木板': '🪵', '砖块': '🧱', '塑料': '♻️', '金属': '⚙️', '零件': '⚙️',
    '伞': '☂️', '雨衣': '🧥',
    '疫苗': '💉', '血清': '💉'
};
const ITEM_PRESETS = {
    '压缩饼干': { category: 'consumable', subCategory: 'food', effect: '饱腹+30', type: 'usable', desc: '高能量压缩饼干，保质期长' },
    '罐头': { category: 'consumable', subCategory: 'food', effect: '饱腹+40 口渴+10', type: 'usable', desc: '罐装食品，开罐即食' },
    '午餐肉罐头': { category: 'consumable', subCategory: 'food', effect: '饱腹+50', type: 'usable', desc: '高热量罐装午餐肉' },
    '黄豆罐头': { category: 'consumable', subCategory: 'food', effect: '饱腹+35', type: 'usable', desc: '罐头黄豆，蛋白质丰富' },
    '沙丁鱼罐头': { category: 'consumable', subCategory: 'food', effect: '饱腹+45 精神+3', type: 'usable', desc: '沙丁鱼罐头，营养丰富' },
    '饮用水': { category: 'consumable', subCategory: 'water', effect: '口渴+40', type: 'usable', desc: '饮用水，维持生命必需' },
    '瓶装水': { category: 'consumable', subCategory: 'water', effect: '口渴+40', type: 'usable', desc: '密封瓶装饮用水' },
    '桶装纯净水': { category: 'consumable', subCategory: 'water', effect: '口渴+80', type: 'usable', desc: '18L大容量桶装水' },
    '半瓶水': { category: 'consumable', subCategory: 'water', effect: '口渴+20', type: 'usable', desc: '剩余约300ml的饮用水' },
    '矿泉水': { category: 'consumable', subCategory: 'water', effect: '口渴+45 精神+2', type: 'usable', desc: '天然矿泉水，含微量矿物质' },
    '可乐': { category: 'consumable', subCategory: 'drink', effect: '口渴+25 精神+8 欢愉+5', type: 'usable', desc: '碳酸饮料，提神快乐水' },
    '啤酒': { category: 'consumable', subCategory: 'drink', effect: '口渴+15 欢愉+10 精神-2', type: 'usable', desc: '冰啤酒，末世里的奢侈品' },
    '白酒': { category: 'consumable', subCategory: 'drink', effect: '欢愉+15 体温+1 精神-5', type: 'usable', desc: '高度白酒，可饮用或消毒' },
    '酒精': { category: 'consumable', subCategory: 'medical', effect: '消毒', type: 'usable', desc: '75%医用酒精，消毒杀菌' },
    '绷带': { category: 'consumable', subCategory: 'medical', effect: '止血 治疗-轻伤', type: 'usable', desc: '无菌绷带，包扎伤口' },
    '纱布': { category: 'consumable', subCategory: 'medical', effect: '止血 包扎', type: 'usable', desc: '医用纱布，可加工绷带' },
    '止血带': { category: 'consumable', subCategory: 'medical', effect: '止大出血', type: 'usable', desc: '军用止血带，防止失血过多' },
    '药品': { category: 'consumable', subCategory: 'medical', effect: '治疗疾病', type: 'usable', desc: '常用药品，缓解症状' },
    '止痛药': { category: 'consumable', subCategory: 'medical', effect: '止痛 精神+5', type: 'usable', desc: '对乙酰氨基酚，缓解疼痛' },
    '消炎药': { category: 'consumable', subCategory: 'medical', effect: '治愈感染', type: 'usable', desc: '广谱消炎药，治疗感染' },
    '医疗包': { category: 'consumable', subCategory: 'medical', effect: '治疗重伤', type: 'usable', desc: '综合医疗包，处理多种伤情' },
    '抗生素': { category: 'consumable', subCategory: 'medical', effect: '治愈感染 预防感染', type: 'usable', desc: '广谱抗生素，抗感染神药' },
    '生理盐水': { category: 'consumable', subCategory: 'medical', effect: '清洗伤口 口渴+15', type: 'usable', desc: '生理盐水，可冲洗伤口' },
    '退烧药': { category: 'consumable', subCategory: 'medical', effect: '退烧 体温-1 精神+5', type: 'usable', desc: '布洛芬胶囊，退烧止痛' },
    '手枪': { category: 'equip', subCategory: 'weapon', durability: 100, type: 'weapon', desc: '9mm手枪，便携防身武器' },
    '消音手枪': { category: 'equip', subCategory: 'weapon', durability: 95, type: 'weapon', desc: '安装消音器的手枪，不易吸引丧尸' },
    '霰弹枪': { category: 'equip', subCategory: 'weapon', durability: 90, type: 'weapon', desc: '12号霰弹枪，近战威力惊人' },
    '砍刀': { category: 'equip', subCategory: 'weapon', durability: 80, type: 'weapon', desc: '锋利砍刀，近战利器' },
    '日式长刀': { category: 'equip', subCategory: 'weapon', durability: 85, type: 'weapon', desc: '仿制日式刀，锋利劈砍利器' },
    '步枪': { category: 'equip', subCategory: 'weapon', durability: 100, type: 'weapon', desc: '突击步枪，中远距离作战' },
    '狙击步枪': { category: 'equip', subCategory: 'weapon', durability: 100, type: 'weapon', desc: '高精度狙击步枪，远程击杀' },
    '十字弩': { category: 'equip', subCategory: 'weapon', durability: 80, type: 'weapon', desc: '无声十字弩，可回收弩箭' },
    '折叠水果刀': { category: 'equip', subCategory: 'tool', durability: 60, type: 'weapon', desc: '便携折叠刀，可作工具或武器' },
    '防弹衣': { category: 'equip', subCategory: 'armor', durability: 80, type: 'equippable', desc: '防护轻型弹药攻击' },
    '防弹插板': { category: 'equip', subCategory: 'armor', durability: 100, type: 'equippable', desc: 'NIJ IV级插板，抵御步枪弹' },
    '防刺服': { category: 'equip', subCategory: 'armor', durability: 70, type: 'equippable', desc: '防刺背心，抵御刀刺和抓伤' },
    '头盔': { category: 'equip', subCategory: 'armor', durability: 80, type: 'equippable', desc: '保护头部免受冲击' },
    '军用头盔': { category: 'equip', subCategory: 'armor', durability: 95, type: 'equippable', desc: 'MICH防弹头盔，防护能力强' },
    '手电筒': { category: 'equip', subCategory: 'tool', type: 'equippable', desc: '便携式照明工具' },
    '强光头灯': { category: 'equip', subCategory: 'tool', type: 'equippable', desc: '戴在头上的强光灯，解放双手' },
    '紫外线灯': { category: 'equip', subCategory: 'tech', type: 'equippable', desc: 'UV杀菌灯，可净化水源和空气消毒' },
    '多功能扳手': { category: 'equip', subCategory: 'tool', type: 'weapon', desc: '实用工具也可作武器' },
    '瑞士军刀': { category: 'equip', subCategory: 'tool', type: 'equippable', desc: '多功能工具刀，用途广泛' },
    '撬棍': { category: 'equip', subCategory: 'tool', type: 'weapon', desc: '金属撬棍，可撬门可打丧尸' },
    '工兵铲': { category: 'equip', subCategory: 'tool', durability: 80, type: 'weapon', desc: '折叠工兵铲，可挖可砍可锯' },
    '破损背包': { category: 'equip', subCategory: 'backpack', type: 'equippable', desc: '容量有限的旧背包' },
    '背包': { category: 'equip', subCategory: 'backpack', type: 'equippable', desc: '标准背包，可携带物品' },
    '登山包': { category: 'equip', subCategory: 'backpack', type: 'equippable', desc: '大容量登山包，外挂点丰富' },
    '军用战术背心': { category: 'equip', subCategory: 'backpack', type: 'equippable', desc: '弹匣口袋+副包，携行装备' },
    '毛巾': { category: 'equip', subCategory: 'tool', type: 'usable', desc: '普通毛巾，可擦拭或包扎' },
    '毯子': { category: 'equip', subCategory: 'tool', type: 'usable', desc: '保暖毛毯，预防失温' },
    '睡袋': { category: 'equip', subCategory: 'tool', type: 'equippable', desc: '冬季睡袋，夜间保暖必备' },
    '汽油': { category: 'material', subCategory: 'fuel', type: 'material', desc: '易燃液体，燃料或制作燃烧弹' },
    '柴油': { category: 'material', subCategory: 'fuel', type: 'material', desc: '柴油燃料，发电机专用' },
    '煤气罐': { category: 'material', subCategory: 'fuel', type: 'material', desc: '液化气罐，可做大型炸弹' },
    '木板': { category: 'material', subCategory: 'build', type: 'material', desc: '建筑材料，可用于搭建' },
    '铁钉': { category: 'material', subCategory: 'build', type: 'material', desc: '金属铁钉，固定木板' },
    '铁丝': { category: 'material', subCategory: 'build', type: 'material', desc: '细铁丝，绑扎或制作陷阱' },
    '水泥': { category: 'material', subCategory: 'build', type: 'material', desc: '速干水泥，加固据点' },
    '金属': { category: 'material', subCategory: 'build', type: 'material', desc: '金属材料，可制作工具武器' },
    '钢筋': { category: 'material', subCategory: 'build', type: 'material', desc: '螺纹钢筋，可改造武器' },
    '铁皮': { category: 'material', subCategory: 'build', type: 'material', desc: '镀锌铁皮，防水围挡' },
    '铝合金': { category: 'material', subCategory: 'build', type: 'material', desc: '轻质铝合金板材' },
    '零件': { category: 'material', subCategory: 'tech', type: 'material', desc: '机械零件，可维修或制作' },
    '电路板': { category: 'material', subCategory: 'tech', type: 'material', desc: '电子元件，制作电子设备' },
    '电线': { category: 'material', subCategory: 'tech', type: 'material', desc: '铜线，连接电路' },
    '太阳能板': { category: 'material', subCategory: 'tech', type: 'material', desc: '光伏发电板，野外充电' },
    '电池': { category: 'material', subCategory: 'tech', type: 'material', desc: '储能装置，供电必备' },
    '充电宝': { category: 'material', subCategory: 'tech', type: 'material', desc: '20000mAh大容量移动电源' },
    '绳子': { category: 'material', subCategory: 'tool', type: 'material', desc: '多用途绳索' },
    '登山绳': { category: 'material', subCategory: 'tool', type: 'material', desc: '攀岩安全绳，承重1吨' },
    '铁链': { category: 'material', subCategory: 'tool', type: 'material', desc: '粗铁链，可绑可打' },
    '钥匙': { category: 'key', subCategory: 'key', type: 'key', desc: '开启特定锁具' },
    '食盐': { category: 'material', subCategory: 'food', type: 'material', desc: '调味品，可保存肉类' },
    '糖': { category: 'material', subCategory: 'food', type: 'material', desc: '白糖，快速补充能量' },
    '面粉': { category: 'material', subCategory: 'food', type: 'material', desc: '小麦面粉，制作主食' },
    '大米': { category: 'consumable', subCategory: 'food', effect: '饱腹+200', type: 'usable', desc: '25kg袋装大米，长期保存' },
    '猪肉': { category: 'consumable', subCategory: 'food', effect: '饱腹+20', type: 'usable', desc: '生猪肉，需烹饪食用' },
    '冻猪肉': { category: 'consumable', subCategory: 'food', effect: '饱腹+25', type: 'usable', desc: '冷冻猪肉，保质期长' },
    '腊肉': { category: 'consumable', subCategory: 'food', effect: '饱腹+35', type: 'usable', desc: '烟熏腊肉，可长期保存' },
    '牛肉': { category: 'consumable', subCategory: 'food', effect: '饱腹+25', type: 'usable', desc: '生牛肉，营养价值高' },
    '牛肉干': { category: 'consumable', subCategory: 'food', effect: '饱腹+40 精神+5', type: 'usable', desc: '风干牛肉干，便携高能量' },
    '方便面': { category: 'consumable', subCategory: 'food', effect: '饱腹+35 口渴+10', type: 'usable', desc: '油炸方便面，热水即食' },
    '巧克力': { category: 'consumable', subCategory: 'food', effect: '饱腹+15 精神+10 欢愉+8', type: 'usable', desc: '黑巧克力，快速补充糖份' },
    '罐头食品': { category: 'consumable', subCategory: 'food', effect: '饱腹+40 口渴+10', type: 'usable', desc: '罐装食品，开罐即食' },
    '维生素片': { category: 'consumable', subCategory: 'medical', effect: '精神+3 体质+微量', type: 'usable', desc: '复合维生素，预防坏血病' },
    '香烟': { category: 'consumable', subCategory: 'misc', effect: '精神+5', type: 'usable', desc: '烟草制品，可缓解压力' },
    '雪茄': { category: 'consumable', subCategory: 'misc', effect: '精神+8 欢愉+12', type: 'usable', desc: '古巴手工雪茄，稀有奢侈品' },
    '打火机': { category: 'equip', subCategory: 'tool', type: 'usable', desc: '便携点火工具' },
    '火柴': { category: 'equip', subCategory: 'tool', type: 'usable', desc: '传统取火工具' },
    '镁棒': { category: 'equip', subCategory: 'tool', type: 'usable', desc: '野外求生打火石，万次点火' },
    '斧头': { category: 'equip', subCategory: 'weapon', durability: 90, type: 'weapon', desc: '伐木斧，也可作武器' },
    '消防斧': { category: 'equip', subCategory: 'weapon', durability: 95, type: 'weapon', desc: '尖刃消防斧，破门利器' },
    '铁锤': { category: 'equip', subCategory: 'weapon', durability: 85, type: 'weapon', desc: '重型铁锤，近战利器' },
    '钢管': { category: 'equip', subCategory: 'weapon', durability: 70, type: 'weapon', desc: '金属管，简易武器' },
    '铁棍': { category: 'equip', subCategory: 'weapon', durability: 75, type: 'weapon', desc: '金属棍棒，近战武器' },
    '球棒': { category: 'equip', subCategory: 'weapon', durability: 60, type: 'weapon', desc: '铝合金棒球棒，挥舞顺手' },
    '菜刀': { category: 'equip', subCategory: 'tool', durability: 50, type: 'weapon', desc: '厨房菜刀，可作临时武器' },
    '匕首': { category: 'equip', subCategory: 'weapon', durability: 65, type: 'weapon', desc: '短刃匕首，隐蔽武器' },
    '格斗刀': { category: 'equip', subCategory: 'weapon', durability: 75, type: 'weapon', desc: '战术格斗刀，卡巴1217' },
    '烟雾弹': { category: 'consumable', subCategory: 'tactical', effect: '制造烟雾', type: 'usable', desc: '战术烟雾弹，掩护撤退' },
    '闪光弹': { category: 'consumable', subCategory: 'tactical', effect: '眩晕敌人', type: 'usable', desc: '闪光震撼弹' },
    '燃烧瓶': { category: 'consumable', subCategory: 'tactical', effect: '燃烧敌人/区域', type: 'usable', desc: '莫洛托夫鸡尾酒，纵火利器' },
    '手雷': { category: 'consumable', subCategory: 'tactical', effect: '范围爆炸', type: 'usable', desc: 'M67破片手雷，威力巨大' },
    '对讲机': { category: 'equip', subCategory: 'tech', type: 'equippable', desc: '短距离通讯设备' },
    '卫星电话': { category: 'equip', subCategory: 'tech', type: 'equippable', desc: '铱星电话，通讯无阻' },
    '收音机': { category: 'equip', subCategory: 'tech', type: 'usable', desc: '收听广播获取信息' },
    '短波电台': { category: 'equip', subCategory: 'tech', type: 'equippable', desc: '大功率短波电台，跨国通讯' },
    '手表': { category: 'equip', subCategory: 'misc', type: 'equippable', desc: '查看时间' },
    '军用手表': { category: 'equip', subCategory: 'misc', type: 'equippable', desc: '三防战术表，含指北针' },
    '地图': { category: 'consumable', subCategory: 'misc', type: 'usable', desc: '城市地图，辅助导航' },
    '指北针': { category: 'equip', subCategory: 'misc', type: 'equippable', desc: '军用指北针，辨别方向' },
    '望远镜': { category: 'equip', subCategory: 'misc', type: 'equippable', desc: '8倍双筒望远镜，远程观察' },
    '手电筒电池': { category: 'material', subCategory: 'tech', type: 'material', desc: '手电筒备用电池' },
    '弩箭': { category: 'material', subCategory: 'tech', type: 'material', desc: '十字弩专用箭，可回收' },
    '9mm子弹': { category: 'material', subCategory: 'ammo', type: 'material', desc: '帕拉贝鲁姆9mm手枪弹' },
    '5.56mm子弹': { category: 'material', subCategory: 'ammo', type: 'material', desc: '北约制式5.56mm步枪弹' },
    '12号霰弹': { category: 'material', subCategory: 'ammo', type: 'material', desc: '12号霰弹，鹿弹/独头弹' },
    '7.62mm子弹': { category: 'material', subCategory: 'ammo', type: 'material', desc: '7.62x51mm全威力步枪弹' },
    '首饰': { category: 'misc', subCategory: 'valuable', type: 'misc', desc: '黄金首饰，可用于交易' },
    '现金': { category: 'misc', subCategory: 'valuable', type: 'misc', desc: '纸币现金，末世价值不定' },
    '金条': { category: 'misc', subCategory: 'valuable', type: 'misc', desc: '500克金条，硬通货' },
    // ===== 新增装备 =====
    '防毒面具': { category: 'equip', subCategory: 'armor', durability: 85, type: 'equippable', desc: '军用防毒面具，防感染防毒气' },
    '护目镜': { category: 'equip', subCategory: 'armor', durability: 60, type: 'equippable', desc: '战术护目镜，保护眼睛' },
    '防化服': { category: 'equip', subCategory: 'armor', durability: 90, type: 'equippable', desc: '全封闭防化服，高危区域必备' },
    '凯夫拉背心': { category: 'equip', subCategory: 'armor', durability: 95, type: 'equippable', desc: '凯夫拉纤维防弹背心，轻量高防护' },
    '护膝': { category: 'equip', subCategory: 'armor', durability: 70, type: 'equippable', desc: '战术护膝，移动防护' },
    '战术腰带': { category: 'equip', subCategory: 'armor', durability: 80, type: 'equippable', desc: '多功能战术腰带，挂载装备' },
    '军用水壶': { category: 'equip', subCategory: 'tool', type: 'usable', desc: '铝合金军用水壶，可加热' },
    '净水吸管': { category: 'equip', subCategory: 'tool', type: 'usable', desc: '生命吸管，直接饮用污水' },
    '急救包': { category: 'consumable', subCategory: 'medical', effect: '治疗轻伤 止血', type: 'usable', desc: '综合急救包，含绷带药品' },
    '手术刀': { category: 'equip', subCategory: 'tool', durability: 50, type: 'weapon', desc: '医用手术刀，可做精细武器' },
    '止血钳': { category: 'equip', subCategory: 'tool', type: 'usable', desc: '医用止血钳，紧急止血' },
    '医疗箱': { category: 'consumable', subCategory: 'medical', effect: '治疗重伤 消毒止血', type: 'usable', desc: '专业医疗箱，含手术工具' },
    '吗啡': { category: 'consumable', subCategory: 'medical', effect: '止痛 精神+15', type: 'usable', desc: '军用吗啡注射器，强效止痛' },
    '肾上腺素': { category: 'consumable', subCategory: 'medical', effect: '精神+25 疲劳-30', type: 'usable', desc: '肾上腺素注射器，应急提神' },
    '营养膏': { category: 'consumable', subCategory: 'food', effect: '饱腹+25 精神+5', type: 'usable', desc: '军用营养膏，高浓缩能量' },
    '单兵口粮': { category: 'consumable', subCategory: 'food', effect: '饱腹+60 精神+5', type: 'usable', desc: 'MRE单兵口粮，完整一餐' },
    '速溶咖啡': { category: 'consumable', subCategory: 'misc', effect: '疲劳-20 精神+8', type: 'usable', desc: '速溶咖啡粉，提神醒脑' },
    '能量饮料': { category: 'consumable', subCategory: 'misc', effect: '疲劳-15 精神+5', type: 'usable', desc: '功能饮料，快速提神' },
    '水果罐头': { category: 'consumable', subCategory: 'food', effect: '饱腹+20 口渴+10 精神+5', type: 'usable', desc: '黄桃罐头，补充维生素和水分' },
    '鱼罐头': { category: 'consumable', subCategory: 'food', effect: '饱腹+30', type: 'usable', desc: '茄汁沙丁鱼罐头' },
    '蜂蜜': { category: 'consumable', subCategory: 'food', effect: '饱腹+10 精神+8', type: 'usable', desc: '天然蜂蜜，永久保存' },
    '奶粉': { category: 'consumable', subCategory: 'food', effect: '饱腹+15 口渴+10 精神+3', type: 'usable', desc: '脱脂奶粉，冲泡饮用，补充水分营养' },
    '茶叶': { category: 'consumable', subCategory: 'misc', effect: '精神+5 口渴+10', type: 'usable', desc: '干燥茶叶，冲泡提神解渴' },
    '咸菜': { category: 'consumable', subCategory: 'food', effect: '饱腹+10 口渴-5', type: 'usable', desc: '腌制咸菜，佐餐但会加重口渴' },
    // ===== 新增武器装备 =====
    '武士刀': { category: 'equip', subCategory: 'weapon', durability: 90, type: 'weapon', desc: '日本武士刀，锋利无比' },
    '三棱刺': { category: 'equip', subCategory: 'weapon', durability: 80, type: 'weapon', desc: '三棱军刺，穿透力强' },
    '链锯': { category: 'equip', subCategory: 'weapon', durability: 60, type: 'weapon', desc: '汽油链锯，恐怖近战武器' },
    '电击棒': { category: 'equip', subCategory: 'weapon', durability: 70, type: 'weapon', desc: '高压电击棒，非致命制服' },
    '弓': { category: 'equip', subCategory: 'weapon', durability: 75, type: 'weapon', desc: '复合弓，无声远程武器' },
    '弓箭': { category: 'material', subCategory: 'ammo', type: 'material', desc: '复合弓专用箭' },
    '霰弹枪子弹': { category: 'material', subCategory: 'ammo', type: 'material', desc: '12号霰弹，鹿弹' },
    // ===== 新增工具与材料 =====
    '尼龙绳': { category: 'material', subCategory: 'tool', type: 'material', desc: '高强度尼龙绳，多功能' },
    '胶带': { category: 'material', subCategory: 'tool', type: 'material', desc: '强力布基胶带，修补万物' },
    '塑料布': { category: 'material', subCategory: 'build', type: 'material', desc: '防水塑料布，搭建庇护所' },
    '砂纸': { category: 'material', subCategory: 'tool', type: 'material', desc: '打磨用砂纸' },
    '磨刀石': { category: 'equip', subCategory: 'tool', type: 'usable', desc: '磨砺刀刃，恢复耐久' },
    '针线包': { category: 'equip', subCategory: 'tool', type: 'usable', desc: '缝补衣物和伤口' },
    '放大镜': { category: 'equip', subCategory: 'tool', type: 'usable', desc: '聚光取火，观察细节' },
    '温度计': { category: 'equip', subCategory: 'tool', type: 'usable', desc: '测量体温和气温' },
    '哨子': { category: 'equip', subCategory: 'tool', type: 'usable', desc: '求救哨子，信号联络' },
    '锁匙工具': { category: 'equip', subCategory: 'tool', type: 'usable', desc: '开锁工具套装' },
    // ===== 新增贵重品与特殊物品 =====
    '钻石': { category: 'misc', subCategory: 'valuable', type: 'misc', desc: '钻石，高价值交易品' },
    '古董': { category: 'misc', subCategory: 'valuable', type: 'misc', desc: '古董瓷器，收藏价值高' },
    '碘伏': { category: 'consumable', subCategory: 'medical', effect: '消毒', type: 'usable', desc: '碘伏消毒液，温和无刺激' },
    '汽油桶': { category: 'material', subCategory: 'fuel', type: 'material', desc: '20L金属汽油桶' },
    '蓄电池': { category: 'material', subCategory: 'tech', type: 'material', desc: '12V汽车蓄电池，可储能' },
    '逆变器': { category: 'material', subCategory: 'tech', type: 'material', desc: '直流转交流，民用电器供电' },
    '电焊机': { category: 'equip', subCategory: 'tool', type: 'usable', desc: '便携电焊机，金属加工' },
    '发电机': { category: 'equip', subCategory: 'tool', type: 'usable', desc: '小型燃油发电机' },
    '捕兽夹': { category: 'equip', subCategory: 'tool', type: 'usable', desc: '钢丝捕兽夹，狩猎防御' },
    '渔网': { category: 'equip', subCategory: 'tool', type: 'usable', desc: '尼龙渔网，捕鱼工具' },
    '鱼竿': { category: 'equip', subCategory: 'tool', type: 'usable', desc: '简易钓鱼竿' },
    '熏肉架': { category: 'equip', subCategory: 'tool', type: 'usable', desc: '制作腊肉，保存肉类' },
    '雨水收集器': { category: 'equip', subCategory: 'tool', type: 'usable', desc: '雨天收集干净雨水' },
    '简易滤水器': { category: 'equip', subCategory: 'tool', type: 'usable', desc: '过滤污水获得饮用水' },
    '防水布袋': { category: 'equip', subCategory: 'backpack', type: 'equippable', desc: '防水布料制成的收纳袋，可存放物品' },
    '密封袋': { category: 'equip', subCategory: 'backpack', type: 'equippable', desc: '密封塑料袋，可防潮收纳' },
    '水壶': { category: 'equip', subCategory: 'container', type: 'equippable', desc: '金属水壶，可装水但本身不是水' },
    '水瓶': { category: 'equip', subCategory: 'container', type: 'equippable', desc: '空水瓶容器，可装水' },
    '水袋': { category: 'equip', subCategory: 'container', type: 'equippable', desc: '装水用的软质水袋' },
    // ===== 新增食物类 =====
    '花生酱': { category: 'consumable', subCategory: 'food', effect: '饱腹+25 精神+3', type: 'usable', desc: '高能量花生酱，可长期保存' },
    '燕麦片': { category: 'consumable', subCategory: 'food', effect: '饱腹+30', type: 'usable', desc: '速食燕麦片，营养均衡' },
    '果酱': { category: 'consumable', subCategory: 'food', effect: '饱腹+15 欢愉+3', type: 'usable', desc: '水果果酱，甜美的奢侈' },
    '速食汤': { category: 'consumable', subCategory: 'food', effect: '饱腹+20 口渴+20', type: 'usable', desc: '脱水速食汤，热水冲泡' },
    '坚果': { category: 'consumable', subCategory: 'food', effect: '饱腹+20 精神+3', type: 'usable', desc: '混合坚果，便携高能量' },
    '葡萄干': { category: 'consumable', subCategory: 'food', effect: '饱腹+15 精神+2', type: 'usable', desc: '晒干葡萄干，保存期长' },
    '牛肉罐头': { category: 'consumable', subCategory: 'food', effect: '饱腹+45 精神+4', type: 'usable', desc: '红烧牛肉罐头，美味高蛋白' },
    '鸡肉罐头': { category: 'consumable', subCategory: 'food', effect: '饱腹+40 精神+3', type: 'usable', desc: '油浸鸡肉罐头，口感尚佳' },
    '玉米罐头': { category: 'consumable', subCategory: 'food', effect: '饱腹+30', type: 'usable', desc: '甜玉米罐头，开罐即食' },
    '番茄酱': { category: 'consumable', subCategory: 'spice', effect: '饱腹+5 欢愉+2', type: 'usable', desc: '调味番茄酱，让食物更美味' },
    '辣酱': { category: 'consumable', subCategory: 'spice', effect: '欢愉+4 体温+0.5', type: 'usable', desc: '辣椒酱，开胃提神' },
    // ===== 新增医疗类 =====
    '创可贴': { category: 'consumable', subCategory: 'medical', effect: '止血 治疗-微伤', type: 'usable', desc: '小伤口用创可贴，防感染' },
    '眼药水': { category: 'consumable', subCategory: 'medical', effect: '缓解眼疲劳 精神+3', type: 'usable', desc: '人工泪液滴眼液' },
    '皮炎平': { category: 'consumable', subCategory: 'medical', effect: '止痒 消炎', type: 'usable', desc: '皮肤外用药膏，治皮炎湿疹' },
    '胃药': { category: 'consumable', subCategory: 'medical', effect: '缓解胃痛 精神+2', type: 'usable', desc: '肠胃不适时服用' },
    '抗过敏药': { category: 'consumable', subCategory: 'medical', effect: '治疗过敏', type: 'usable', desc: '抗组胺类抗过敏药' },
    '血压药': { category: 'consumable', subCategory: 'medical', effect: '稳定血压', type: 'usable', desc: '慢性病人必备的降压药' },
    '胰岛素': { category: 'consumable', subCategory: 'medical', effect: '降低血糖', type: 'usable', desc: '糖尿病人必需的胰岛素针剂' },
    '体温计': { category: 'equip', subCategory: 'tool', type: 'usable', desc: '电子体温计，准确测体温' },
    '听诊器': { category: 'equip', subCategory: 'tool', type: 'usable', desc: '医用听诊器，诊断心肺' },
    '骨折夹板': { category: 'consumable', subCategory: 'medical', effect: '固定骨折', type: 'usable', desc: '铝合金骨折固定板' },
    // ===== 新增武器装备 =====
    '唐刀': { category: 'equip', subCategory: 'weapon', durability: 88, type: 'weapon', desc: '中国唐式横刀，直刃劈砍利器' },
    '苗刀': { category: 'equip', subCategory: 'weapon', durability: 85, type: 'weapon', desc: '双手长柄苗刀，威力巨大' },
    '警棍': { category: 'equip', subCategory: 'weapon', durability: 75, type: 'weapon', desc: '伸缩式警棍，便携近战武器' },
    '拐棍': { category: 'equip', subCategory: 'weapon', durability: 55, type: 'weapon', desc: 'T型拐棍，攻防兼备' },
    '指虎': { category: 'equip', subCategory: 'weapon', durability: 70, type: 'weapon', desc: '金属指虎，增强拳力' },
    '甩棍': { category: 'equip', subCategory: 'weapon', durability: 72, type: 'weapon', desc: '重型甩棍，一击可断骨' },
    '冰镐': { category: 'equip', subCategory: 'weapon', durability: 80, type: 'weapon', desc: '登山冰镐，穿刺力惊人' },
    '鱼叉': { category: 'equip', subCategory: 'weapon', durability: 65, type: 'weapon', desc: '长柄渔叉，可投掷可近战' },
    '镰刀': { category: 'equip', subCategory: 'weapon', durability: 60, type: 'weapon', desc: '农用镰刀，切割力强' },
    '钉枪': { category: 'equip', subCategory: 'weapon', durability: 65, type: 'weapon', desc: '气动钉枪，可做远程武器' },
    '捕网枪': { category: 'equip', subCategory: 'weapon', durability: 70, type: 'weapon', desc: '发射捕捉网，非致命' },
    '电击枪': { category: 'equip', subCategory: 'weapon', durability: 68, type: 'weapon', desc: '泰瑟电击枪，远程电击' },
    // ===== 新增防具 =====
    '防爆盾': { category: 'equip', subCategory: 'armor', durability: 95, type: 'equippable', desc: '警用防爆盾，正面近乎无敌' },
    '防暴头盔': { category: 'equip', subCategory: 'armor', durability: 90, type: 'equippable', desc: '全覆盖式防暴头盔，面部有金属网' },
    '战术手套': { category: 'equip', subCategory: 'armor', durability: 78, type: 'equippable', desc: '半指战术手套，防滑防割' },
    '作战靴': { category: 'equip', subCategory: 'armor', durability: 85, type: 'equippable', desc: '高帮作战靴，防刺防扎' },
    '护肘': { category: 'equip', subCategory: 'armor', durability: 72, type: 'equippable', desc: '硬壳护肘，缓冲冲击' },
    '护肩': { category: 'equip', subCategory: 'armor', durability: 75, type: 'equippable', desc: '战术护肩，保护肩部' },
    '防弹面罩': { category: 'equip', subCategory: 'armor', durability: 82, type: 'equippable', desc: '透明防弹面罩，III级防护' },
    '气囊背心': { category: 'equip', subCategory: 'armor', durability: 70, type: 'equippable', desc: '摩托气囊背心，跌落自动充气' },
    // ===== 新增工具 =====
    '折叠铲': { category: 'equip', subCategory: 'tool', durability: 75, type: 'weapon', desc: '三折折叠铲，挖撬锯砍多功能' },
    '断线钳': { category: 'equip', subCategory: 'tool', durability: 80, type: 'weapon', desc: '重型断线钳，可剪断铁链钢筋' },
    '液压剪': { category: 'equip', subCategory: 'tool', type: 'usable', desc: '便携液压剪，破拆防盗门' },
    '撬锁套装': { category: 'equip', subCategory: 'tool', type: 'usable', desc: '专业开锁工具，锡纸+钩针' },
    '玻璃刀': { category: 'equip', subCategory: 'tool', type: 'usable', desc: '金刚石玻璃刀，静音破窗' },
    '充气泵': { category: 'equip', subCategory: 'tool', type: 'usable', desc: '脚踏式打气筒，车胎充气' },
    '补胎工具': { category: 'equip', subCategory: 'tool', type: 'usable', desc: '冷补胶+搓片，修补轮胎' },
    '牵引绳': { category: 'material', subCategory: 'tool', type: 'material', desc: '5吨拖车绳，带挂钩' },
    '跨接电缆': { category: 'material', subCategory: 'tool', type: 'material', desc: '电瓶搭火线，启动亏电车辆' },
    '防滑链': { category: 'material', subCategory: 'tool', type: 'material', desc: '金属防滑链，雪地行车必备' },
    // ===== 新增电子设备 =====
    '夜视仪': { category: 'equip', subCategory: 'tech', type: 'equippable', desc: '单筒夜视仪，被动红外' },
    '热成像仪': { category: 'equip', subCategory: 'tech', type: 'usable', desc: '手持热成像，探知墙后生物' },
    '无人机': { category: 'equip', subCategory: 'tech', type: 'usable', desc: '航拍无人机，远程侦察' },
    '行车记录仪': { category: 'equip', subCategory: 'tech', type: 'usable', desc: '车载记录仪，循环录像' },
    '手持电台': { category: 'equip', subCategory: 'tech', type: 'equippable', desc: '5W对讲机，10公里通讯' },
    '扫描仪': { category: 'equip', subCategory: 'tech', type: 'usable', desc: '警用频率扫描仪，监听无线电' },
    '便携空调': { category: 'equip', subCategory: 'tech', type: 'usable', desc: 'USB充电制冷风扇，防暑' },
    '电子防盗器': { category: 'equip', subCategory: 'tech', type: 'usable', desc: '门窗磁感应报警器' },
    '移动硬盘': { category: 'material', subCategory: 'tech', type: 'material', desc: '2TB移动硬盘，可能藏有重要数据' },
    // ===== 新增材料 =====
    '钢材': { category: 'material', subCategory: 'build', type: 'material', desc: '厚钢板，可做护甲工事' },
    '弹簧钢': { category: 'material', subCategory: 'build', type: 'material', desc: '高弹性弹簧钢带，做刀的好料' },
    '碳纤维布': { category: 'material', subCategory: 'build', type: 'material', desc: '高强度碳纤维布，轻量化加固' },
    '铜线': { category: 'material', subCategory: 'tech', type: 'material', desc: '粗铜线，电机线圈必备' },
    '稀土磁铁': { category: 'material', subCategory: 'tech', type: 'material', desc: '钕铁硼强磁，制作发电机' },
    '焊锡丝': { category: 'material', subCategory: 'tech', type: 'material', desc: '松香芯焊锡，电子焊接' },
    '热缩管': { category: 'material', subCategory: 'tech', type: 'material', desc: '绝缘热缩套管，电线保护' },
    '环氧树脂': { category: 'material', subCategory: 'build', type: 'material', desc: '高强度AB胶，粘合金属陶瓷' },
    '发泡胶': { category: 'material', subCategory: 'build', type: 'material', desc: '聚氨酯发泡剂，填缝保温' },
    '耐火砖': { category: 'material', subCategory: 'build', type: 'material', desc: '耐高温耐火砖，搭建熔炉' },
    // ===== 新增贵重品/特殊物品 =====
    '加密硬盘': { category: 'misc', subCategory: 'valuable', type: 'misc', desc: '军方加密硬盘，内容未知' },
    '科研样本': { category: 'misc', subCategory: 'valuable', type: 'misc', desc: '冷藏病毒样本，军方/科研方重金收购' },
    '古董金条': { category: 'misc', subCategory: 'valuable', type: 'misc', desc: '民国时期金条，收藏家的最爱' },
    '名表': { category: 'misc', subCategory: 'valuable', type: 'misc', desc: '瑞士机械名表，末世硬通货' },
    '名人字画': { category: 'misc', subCategory: 'valuable', type: 'misc', desc: '名家真迹，盛世价值连城' },
    '美酒': { category: 'consumable', subCategory: 'drink', effect: '欢愉+20 精神+5 疲劳-10', type: 'usable', desc: '陈年威士忌，末世慰藉' },
    '咖啡豆': { category: 'consumable', subCategory: 'misc', effect: '精神+12 疲劳-15', type: 'usable', desc: '精品咖啡豆，研磨冲泡' },
    '明信片': { category: 'misc', subCategory: 'doc', type: 'misc', desc: '来自亲人的明信片，精神寄托' },
    '全家福': { category: 'misc', subCategory: 'doc', type: 'misc', desc: '灾前的全家福照片，给予力量' }
};
// Smart item matching: exact > longest substring > substring with word boundary
function getItemInfo(itemName) {
    if (!itemName) return null;
    const name = itemName.trim();
    // 1. Exact match (highest priority)
    if (ITEM_PRESETS[name]) return ITEM_PRESETS[name];
    // 2. Normalize: strip quantity suffixes like x2, x3, 1.5kg, 500g, 2L etc.
    const normalized = name.replace(/\s*(x\d+|\d+\.?\d*\s*[kKmMgGlL升克千克]?)$/i, '').trim();
    if (normalized !== name && ITEM_PRESETS[normalized]) return ITEM_PRESETS[normalized];
    // 3. Sort keys by length descending for more specific matches
    const keys = Object.keys(ITEM_PRESETS).sort((a, b) => b.length - a.length);
    // 3a. Check if the item contains a preset key AND the key is significant
    for (const key of keys) {
        if (name.includes(key)) {
            // For short keys (1-2 chars), require word boundary or significant context
            if (key.length <= 2) {
                // Check the char before and after the match
                const idx = name.indexOf(key);
                const before = idx > 0 ? name[idx - 1] : '';
                const after = idx + key.length < name.length ? name[idx + key.length] : '';
                // Accept if surrounded by non-Chinese chars (numbers, spaces, punctuation) or at boundaries
                const boundaryOK = !before || !after ||
                    /[\d\s，。、；：,.;:!?！？（）()\[\]【】"'·-]/.test(before) ||
                    /[\d\s，。、；：,.;:!?！？（）()\[\]【】"'·-]/.test(after);
                if (boundaryOK) return ITEM_PRESETS[key];
                // Also accept if the key IS the item name (exact short key)
                if (name === key) return ITEM_PRESETS[key];
                continue;
            }
            // For longer keys (3+ chars), the substring match is trustworthy
            return ITEM_PRESETS[key];
        }
    }
    // 4. Try matching the normalized version
    if (normalized !== name) {
        for (const key of keys) {
            if (normalized.includes(key)) {
                if (key.length <= 2) {
                    const idx = normalized.indexOf(key);
                    const before = idx > 0 ? normalized[idx - 1] : '';
                    const after = idx + key.length < normalized.length ? normalized[idx + key.length] : '';
                    const boundaryOK = !before || !after ||
                        /[\d\s，。、；：,.;:!?！？（）()\[\]【】"'·-]/.test(before) ||
                        /[\d\s，。、；：,.;:!?！？（）()\[\]【】"'·-]/.test(after);
                    if (boundaryOK) return ITEM_PRESETS[key];
                    if (normalized === key) return ITEM_PRESETS[key];
                    continue;
                }
                return ITEM_PRESETS[key];
            }
        }
    }
    // 5. Try semantic classification for unknown items
    const semantic = classifyItemSemantic(name) || (normalized !== name ? classifyItemSemantic(normalized) : null);
    if (semantic) {
        return {
            category: semantic.category,
            subCategory: semantic.subCategory,
            type: semantic.type,
            desc: '（自动分类：' + semantic.category + ' - ' + semantic.subCategory + '）'
        };
    }
    return null;
}
// Semantic item classification - properly categorize items by actual usage
function classifyItemSemantic(itemName) {
    const name = (itemName || '').trim();
    if (!name) return { category: 'misc', subCategory: 'other', type: 'unknown' };
    
    // Container keywords - these are containers, not consumables
    const containerKeywords = ['袋', '背包', '包', '箱', '盒', '罐', '瓶', '壶', '桶', '囊', '储物', '收纳', '防水', '钱包', '腰包', '口袋'];
    // Water consumable keywords - actually drinkable water
    const waterKeywords = ['饮用水', '瓶装水', '矿泉水', '纯净水', '桶装水', '净水', '清水', '活水'];
    // Food keywords
    const foodKeywords = ['饼干', '面包', '罐头', '午餐肉', '沙丁鱼', '巧克力', '能量棒', '火腿', '香肠', '方便面', '压缩饼干', '口粮'];
    // Medical keywords
    const medicalKeywords = ['绷带', '药品', '抗生素', '止痛药', '消炎药', '退烧药', '酒精', '碘伏', '消毒', '口罩', '创可贴', '急救'];
    
    // Special handling for "water" containing items
    // Check if it's actually water (drinkable) vs container/water-resistant
    const isActuallyWater = waterKeywords.some(kw => name.includes(kw));
    const isContainer = containerKeywords.some(kw => name.includes(kw));
    
    // "防水布袋" is a container, not water
    if (name.includes('防水') || (name.includes('水') && isContainer)) {
        return { category: 'tool', subCategory: 'container', type: 'equippable' };
    }
    
    // Check for actual water consumables
    if (isActuallyWater) {
        return { category: 'consumable', subCategory: 'water', type: 'usable' };
    }
    
    // Check for containers
    if (isContainer && !name.includes('水')) {
        return { category: 'tool', subCategory: 'container', type: 'equippable' };
    }
    
    // Check for food
    if (foodKeywords.some(kw => name.includes(kw))) {
        return { category: 'consumable', subCategory: 'food', type: 'usable' };
    }
    
    // Check for medical
    if (medicalKeywords.some(kw => name.includes(kw))) {
        return { category: 'consumable', subCategory: 'medical', type: 'usable' };
    }
    
    // Default: return null to let existing logic handle
    return null;
}
// Check if text fragment could be a real item name (not a measurement or number)
function isValidItemName(text) {
    if (!text || text.length < 1) return false;
    // Skip pure measurements like "500g", "2L", "1.5kg"
    if (/^[\d.]+$/.test(text.trim())) return false;
    // Skip pure number+unit patterns
    if (/^\s*\d+[\d.]*\s*[kKmMgGlL升克千克吨]\s*$/.test(text.trim())) return false;
    // Skip very short fragments that are just units
    if (/^[kKmMgGlL升克千克吨升]$/.test(text.trim())) return false;
    // Skip Chinese punctuation only
    if (/^[，。、；：,.;:!?！？（）()\[\]【】"'·\-\s]+$/.test(text)) return false;
    // If it contains Chinese characters, it's likely an item name
    if (/[\u4e00-\u9fff]/.test(text)) return true;
    // If it has alphanumeric content (for English items)
    if (/[a-zA-Z0-9]/.test(text) && text.length >= 2) return true;
    return false;
}

// Job presets (selectable in character creation)
const JOB_PRESETS = {
    'iammerchant': { name: '行商', desc: '初始携带大量交易物资和一辆货车', bonus: ['货车钥匙','交易清单','防身手枪','3箱罐头','医药包'] },
    'iamsf': { name: '特别行动部队', desc: '退役特种兵，拥有专业军事技能和装备', bonus: ['战术背心','军用步枪','消音器','夜视仪','军用口粮x3'], skills: '战术射击\n近身格斗\n爆破\n潜行\n野外生存\n通讯设备使用' },
    'iamdoctor': { name: '流浪医生', desc: '前军医，携带专业医疗装备', bonus: ['医疗箱','手术刀','抗生素x5','止血钳','绷带x10'], skills: '外科手术\n急救\n药理学\n疾病诊断' },
    'iamengineer': { name: '工程师', desc: '资深工程师，精通机械和建筑', bonus: ['工具箱','电焊机','发电机','钢材x5','电路板x3'], skills: '机械工程\n电气工程\n建筑施工\n焊接' },
    'iamhacker': { name: '黑客', desc: '前网络安全专家，擅长电子入侵和信息战', bonus: ['笔记本电脑','无线信号探测器','EMP手雷','加密U盘','电池x5'], skills: '网络入侵\n信息检索\n电子设备维修\n编程\n数据解密' },
    'iamsniper': { name: '狙击手', desc: '前职业狙击手，擅长远程精确打击和野外隐蔽', bonus: ['狙击步枪','消音器','望远镜伪装','迷彩服','测距仪'], skills: '远程射击\n野外隐蔽\n伪装潜行\n弹道计算\n观察侦察' },
    'iampsych': { name: '心理学家', desc: '前临床心理学家，擅长谈判和心理分析', bonus: ['便携录音机','心理评估量表','镇静剂x3','笔记本','钢笔'], skills: '心理评估\n谈判说服\n情绪分析\n催眠引导\n危机干预' },
    'iamalchemist': { name: '炼金术士', desc: '前化学研究员，精通药物合成和毒理学', bonus: ['化学实验箱','蒸馏装置','草药集','防毒面具','试剂x5'], skills: '药物合成\n毒理学\n草药识别\n化学分析\n解毒治疗' },
    'iamsoldier': { name: '退伍军人', desc: '前陆军步兵，拥有基础军事技能和装备', bonus: ['军用背包','战术腰带','多功能刀','急救包','单兵口粮x2'], skills: '基础射击\n军事战术\n野外生存\n团队协作\n装备维护' },
    'iamcop': { name: '前警官', desc: '前刑警，擅长调查和近身搏斗', bonus: ['警棍','手铐','辣椒水','警用对讲机','防弹衣'], skills: '近身搏斗\n调查取证\n审讯技巧\n法律知识\n擒拿格斗' },
    'iamthug': { name: '街头混混', desc: '前帮派成员，擅长街头战斗和黑市交易', bonus: ['钢管','弹簧刀','黑市地图','现金x3','香烟x5'], skills: '街头斗殴\n黑市交易\n情报网络\n偷窃潜入\n恐吓威慑' },
    'iamsurvivor': { name: '野外生存专家', desc: '前野外向导，精通野外生存和觅食', bonus: ['猎刀','捕兽夹','净水器','帐篷','打火石'], skills: '野外觅食\n追踪辨识\n搭建庇护所\n取火技巧\n动植物辨识' },
    'iamscientist': { name: '科学家', desc: '前研究员，擅长病毒学和数据分析', bonus: ['便携显微镜','样本采集工具','培养皿','数据记录仪','防护服'], skills: '病毒学\n数据分析\n样本采集\n实验室操作\n科研论文写作' },
    'iampriest': { name: '神父/祭司', desc: '前宗教人士，擅长安抚人心和精神引导', bonus: ['圣经','十字架','圣油','蜡烛x5','便携扩音器'], skills: '心理疏导\n公众演讲\n宗教仪式\n精神安抚\n社区组织' },
    'iamnoble': { name: '贵族/继承人', desc: '前富裕家族继承人，拥有资源和人脉', bonus: ['信用卡','保险箱钥匙','名贵手表','丝绸衣物','私人信件'], skills: '社交礼仪\n资源调配\n人脉经营\n商业谈判\n鉴赏古董' },
    'iamchef': { name: '厨师', desc: '前酒店主厨，精通料理与食材辨识', bonus: ['主厨刀','围裙','调味料套装','食材保鲜盒','菜谱笔记本'], skills: '烹饪\n食材辨识\n刀工\n营养搭配\n食物保存' },
    'iamfirefighter': { name: '消防员', desc: '前消防员，擅长救援与火场生存', bonus: ['消防斧','防火服','头盔','对讲机','急救包'], skills: '破拆救援\n火场生存\n急救\n高空作业\n团队协作' },
    'iamteacher': { name: '教师', desc: '前中学教师，知识广博擅长组织', bonus: ['教材','笔记本','钢笔','放大镜','口哨'], skills: '知识广博\n组织协调\n心理疏导\n教学讲解\n基础急救' },
    'iamjournalist': { name: '记者', desc: '前调查记者，擅长信息收集与访谈', bonus: ['录音笔','相机','记者证','笔记本','望远镜'], skills: '信息收集\n访谈技巧\n观察力\n伪装潜入\n情报分析' }
};

// ===== 正面特质库（创建角色时可选/参考）=====
const POS_TRAITS = {
    '强健体魄': { name: '强健体魄', desc: '体能过人，负重上限+5kg，疲劳积累速度-20%', effects: { enc: 5, fatigueRate: -0.2 } },
    '敏捷灵活': { name: '敏捷灵活', desc: '反应迅速，闪避概率+15%，移动速度+10%', effects: { dodge: 0.15, speed: 0.1 } },
    '钢铁意志': { name: '钢铁意志', desc: '意志坚定，精神值衰减-30%，恐慌/虚脱抗性', effects: { spiritRate: -0.3, panicResist: true } },
    '急救知识': { name: '急救知识', desc: '使用医疗物品效果+50%，能处理复杂伤情', effects: { medEff: 0.5 } },
    '潜行习惯': { name: '潜行习惯', desc: '行动隐蔽，被丧尸发现概率-25%', effects: { stealth: 0.25 } },
    '机械天赋': { name: '机械天赋', desc: '修理/合成成功率+30%，工具耐久消耗-30%', effects: { craft: 0.3 } },
    '敏锐观察': { name: '敏锐观察', desc: '搜索物资发现率+25%，能发现隐藏线索', effects: { search: 0.25 } },
    '植物辨识': { name: '植物辨识', desc: '能辨识野外植物，避免中毒，可采集草药', effects: { herbal: true } },
    '神枪手': { name: '神枪手', desc: '远程武器命中率+20%，暴击+10%', effects: { aim: 0.2, crit: 0.1 } },
    '格斗专家': { name: '格斗专家', desc: '近战伤害+25%，徒手也可造成可观伤害', effects: { melee: 0.25 } },
    '口才出众': { name: '口才出众', desc: '说服/谈判成功率+30%，NPC信任度获取+50%', effects: { speech: 0.3 } },
    '快速学习': { name: '快速学习', desc: '技能熟练度获取速度翻倍，能快速掌握新技能', effects: { learn: 2 } },
    '夜行者': { name: '夜行者', desc: '夜间行动不受减益，黑暗中视力+50%', effects: { nightVision: 0.5 } },
    '冷静头脑': { name: '冷静头脑', desc: '危机中保持冷静，决策失误率-40%', effects: { calm: 0.4 } },
    '强壮手臂': { name: '强壮手臂', desc: '投掷类武器伤害+30%，可投掷更重物品', effects: { throw: 0.3 } },
    '坚韧不拔': { name: '坚韧不拔', desc: '血量低于30%时伤害+20%，意志不会崩溃', effects: { lastStand: 0.2 } },
    '自然亲和': { name: '自然亲和', desc: '野生动物不易攻击，可驯服小型动物', effects: { animalAffinity: true } },
    '心灵手巧': { name: '心灵手巧', desc: '精细操作+25%，可制作精密物品', effects: { dexterity: 0.25 } },
    '记忆超群': { name: '记忆超群', desc: '记住所有NPC名字/位置/线索，不会遗忘', effects: { memory: true } },
    '军粮胃': { name: '军粮胃', desc: '可食用腐败食物不生病，消化能力+50%', effects: { ironStomach: true } },
    '酒量惊人': { name: '酒量惊人', desc: '酒精抗性+50%，少量饮酒可提升精神而不醉', effects: { alcoholResist: 0.5 } },
    '狩猎本能': { name: '狩猎本能', desc: '对生物弱点感知+30%，追踪能力+50%', effects: { hunt: 0.3, track: 0.5 } },
    '团队核心': { name: '团队核心', desc: '组队时全队士气+15%，团队协作效率+20%', effects: { leadership: 0.15 } },
    '闪电反应': { name: '闪电反应', desc: '战斗先手+40%，可中断敌人行动', effects: { initiative: 0.4 } },
    '硬骨头': { name: '硬骨头', desc: '骨折概率-50%，受伤后疼痛减益-30%', effects: { boneHard: 0.5 } }
};

// ===== 负面特质库（创建角色时可选/参考，平衡性参考）=====
const NEG_TRAITS = {
    '烟瘾': { name: '烟瘾', desc: '长时间不吸烟精神-2/h，吸烟时精神+8', effects: { addiction: 'smoke' } },
    '酒瘾': { name: '酒瘾', desc: '长时间不饮酒精神-3/h，可借酒壮胆但易失态', effects: { addiction: 'alcohol' } },
    '失眠症': { name: '失眠症', desc: '睡眠效率-30%，疲劳恢复-25%，夜间易醒', effects: { insomnia: 0.3 } },
    '恐血症': { name: '恐血症', desc: '看到大量流血精神-15，处理伤口效率-30%', effects: { hemophobia: true } },
    '幽闭恐惧': { name: '幽闭恐惧', desc: '在密闭空间精神-2/h，可能触发恐慌', effects: { claustrophobia: true } },
    '恐高症': { name: '恐高症', desc: '高处行动成功率-25%，可能僵直', effects: { acrophobia: true } },
    '方向感差': { name: '方向感差', desc: '地图解锁慢，探索时易迷路，需要指北针', effects: { lost: 0.3 } },
    '近视眼': { name: '近视眼', desc: '远距离观察-40%，未戴眼镜时命中率-15%', effects: { myopia: true } },
    '弱体质': { name: '弱体质', desc: '负重上限-5kg，疲劳积累+30%', effects: { enc: -5, fatigueRate: 0.3 } },
    '过敏体质': { name: '过敏体质', desc: '对部分药物/食物过敏，使用前需谨慎', effects: { allergy: true } },
    '旧伤未愈': { name: '旧伤未愈', desc: '某部位旧伤，剧烈活动有概率复发，疼痛减益', effects: { oldWound: true } },
    '心脏病': { name: '心脏病', desc: '剧烈运动/惊吓有概率发病，需备药', effects: { heart: true } },
    '糖尿病': { name: '糖尿病', desc: '需定期注射胰岛素，否则病情恶化', effects: { diabetes: true } },
    '哮喘': { name: '哮喘', desc: '剧烈活动/刺激气体触发，需随身气雾剂', effects: { asthma: true } },
    '贪婪': { name: '贪婪', desc: '面对物资时难以克制，可能冒进危险', effects: { greedy: true } },
    '冲动': { name: '冲动', desc: '易在压力下做出鲁莽决定，决策失误率+20%', effects: { impulsive: 0.2 } },
    '胆小': { name: '胆小', desc: '面对威胁时精神-20%，战斗命中率-10%', effects: { coward: 0.2 } },
    '多疑': { name: '多疑', desc: 'NPC信任度获取-30%，但能识破部分谎言', effects: { paranoid: 0.3 } },
    '天真': { name: '天真', desc: '易轻信他人，被欺骗概率+40%', effects: { naive: 0.4 } },
    '社交障碍': { name: '社交障碍', desc: '与NPC交流效率-25%，难以建立深关系', effects: { social: -0.25 } },
    '笨手笨脚': { name: '笨手笨脚', desc: '合成/修理成功率-20%，易损坏物品', effects: { clumsy: 0.2 } },
    '记忆力差': { name: '记忆力差', desc: '线索/NPC信息易遗忘，需及时记录', effects: { badMemory: true } },
    '依赖手机': { name: '依赖手机', desc: '没电时精神-3/h，需要通讯设备', effects: { phoneDep: true } },
    '洁癖': { name: '洁癖', desc: '接触脏污环境精神-1/h，需定期清洁', effects: { mysophobia: true } },
    '暴脾气': { name: '暴脾气', desc: '易激怒NPC，但威慑力+15%', effects: { temper: 0.15 } }
};

// ===== 预设职业详细数据（供角色创建时快速填充）=====
const PROFESSIONS = {
    '机械师': { name: '机械师', skills: ['机械维修','基础驾驶','简易工具制作'], items: ['扳手','螺丝刀','工作手套'], traits: ['机械天赋'], desc: '熟悉机械结构与维修，能改造工具和武器' },
    '医生': { name: '医生', skills: ['外科手术','急救','药理学','疾病诊断'], items: ['听诊器','手术刀','绷带x3','抗生素x2'], traits: ['急救知识'], desc: '医疗专家，能处理各种伤情和疾病' },
    '退伍军人': { name: '退伍军人', skills: ['基础射击','军事战术','野外生存','近身格斗'], items: ['军用背包','多功能刀','急救包'], traits: ['强健体魄','钢铁意志'], desc: '受过军事训练，战斗与生存能力兼备' },
    '消防员': { name: '消防员', skills: ['破拆救援','火场生存','急救','高空作业'], items: ['消防斧','防火服','头盔','急救包'], traits: ['强健体魄','坚韧不拔'], desc: '体能过人，擅长救援与火场生存' },
    '警察': { name: '警察', skills: ['近身搏斗','调查取证','审讯技巧','擒拿格斗'], items: ['警棍','手铐','辣椒水','对讲机'], traits: ['敏锐观察'], desc: '执法背景，擅长调查和近身格斗' },
    '厨师': { name: '厨师', skills: ['烹饪','食材辨识','刀工','食物保存'], items: ['主厨刀','围裙','调味料','食材'], traits: ['植物辨识'], desc: '精通料理，能将有限食材做出美味' },
    '学生': { name: '学生', skills: ['快速学习','基础急救','电脑操作'], items: ['书包','笔记本','笔','水壶'], traits: ['快速学习'], desc: '学习能力强，可塑性高但经验不足' },
    '猎人': { name: '猎人', skills: ['远程射击','野外生存','追踪辨识','动植物辨识'], items: ['猎枪','猎刀','捕兽夹','望远镜'], traits: ['狩猎本能','潜行习惯'], desc: '野外生存专家，擅长追踪和远程射击' },
    '工程师': { name: '工程师', skills: ['机械工程','电气工程','建筑施工','焊接'], items: ['工具箱','电焊机','发电机'], traits: ['机械天赋','心灵手巧'], desc: '能建造和改造基础设施' },
    '记者': { name: '记者', skills: ['信息收集','访谈技巧','观察力','情报分析'], items: ['录音笔','相机','笔记本','望远镜'], traits: ['敏锐观察','记忆超群'], desc: '信息收集专家，擅长挖掘真相' },
    '科学家': { name: '科学家', skills: ['病毒学','数据分析','样本采集','实验室操作'], items: ['显微镜','样本工具','防护服'], traits: ['冷静头脑'], desc: '研究背景，能分析病毒和研发解药' },
    '教师': { name: '教师', skills: ['知识广博','组织协调','心理疏导','教学讲解'], items: ['教材','笔记本','钢笔','放大镜'], traits: ['口才出众','冷静头脑'], desc: '知识渊博，擅长安抚和组织团队' },
    '飞行员': { name: '飞行员', skills: ['飞行驾驶','机械维修','导航','英语流利'], items: ['墨镜','飞行手册','地图','瑞士军刀'], traits: ['冷静头脑','闪电反应'], desc: '会驾驶飞行器，空间感强' },
    '木工': { name: '木工', skills: ['木工','建筑施工','工具维护','图纸阅读'], items: ['锤子','锯子','卷尺','木工铅笔'], traits: ['心灵手巧'], desc: '能建造庇护所和木质工事' },
    '程序员': { name: '程序员', skills: ['编程','电子设备维修','数据分析','快速打字'], items: ['笔记本电脑','充电宝','手机','数据线'], traits: ['记忆超群'], desc: '熟悉电子设备和编程' },
    '护士': { name: '护士', skills: ['急救','护理','药理学','病人安抚'], items: ['注射器','绷带x5','体温计','药品'], traits: ['急救知识','冷静头脑'], desc: '专业护理人员，擅长日常医疗' },
    '电工': { name: '电工', skills: ['电气工程','电路维修','焊接','安全用电'], items: ['万用表','绝缘手套','电工胶带','螺丝刀'], traits: ['心灵手巧'], desc: '熟悉电气系统，能恢复供电' },
    '农民': { name: '农民', skills: ['种植','养殖','节气知识','动植物辨识'], items: ['镰刀','锄头','种子','水桶'], traits: ['植物辨识','强壮手臂'], desc: '擅长种植和养殖，能自给自足' },
    '司机': { name: '司机', skills: ['车辆驾驶','基础机械维修','路线规划','紧急避险'], items: ['车钥匙','车载工具','地图','对讲机'], traits: ['冷静头脑'], desc: '专业司机，熟悉各类车辆' },
    '律师': { name: '律师', skills: ['法律知识','谈判说服','逻辑分析','审讯技巧'], items: ['公文包','法律文件','录音笔','钢笔'], traits: ['口才出众','冷静头脑'], desc: '法律专家，擅长谈判和说服' }
};

// ===== NPC 模板（开发者参考：日后手动添加新 NPC 的范例）=====
// 复制此模板并填入具体内容即可添加新 NPC
const NPC_TEMPLATE = {
    '{NPC名字}': {
        trust: 30,           // 信任度 0-100（初始）
        affinity: 50,        // 好感度 0-100（初始）
        personality: '{性格关键词，如：谨慎内敛/外柔内刚}',  // 影响AI演绎风格
        occupation: '{职业，如：退役军人/ICU护士}',
        age: 0,              // 年龄
        gender: '{男/女}',   // 性别
        health: '{健康状况，如：左腿有旧伤，阴雨天会疼}',  // 影响AI叙事
        // 对话分三档：low(信任<40) / mid(40-70) / high(>70)
        dialogue: {
            low: '{低信任时的对话描写，体现戒备/冷漠，必须含动作神态}',
            mid: '{中信任时的对话描写，态度软化但仍保留距离}',
            high: '{高信任时的对话描写，敞开心扉，可能透露秘密或托付重要物品}'
        },
        gifts: ['{喜欢的礼物1}','{喜欢的礼物2}','{喜欢的礼物3}'],  // 送礼加好感
        unlockLevel: 60,     // 解锁剧情/交易的信任阈值
        backstory: '{详细背景故事：灾难前的经历、家庭、重要回忆、为何至此——影响AI演绎的深度}'
    }
};

// ===== NPC 示例（开发者范例 - 展示如何按模板添加）=====
const NPC_EXAMPLES = {
    '示例-小李': {
        trust: 25, affinity: 40, personality: '乐天健谈', occupation: '快递员',
        age: 26, gender: '男', health: '扭伤右脚踝，行动略缓',
        dialogue: {
            low: '他斜倚在货架旁，右脚踝缠着绷带微微抬起，看见你时下意识握紧了手里的电瓶车钥匙，挤出一个略带防备的笑："哥们儿，借过一下？这地方不太宽敞。"',
            mid: '他试着站起来走了两步，疼得龇牙咧嘴，但还是冲你比了个 OK："哈，能走！多谢你那根绷带——哎对，我之前送外卖时这一片门儿清，你要找哪儿我指给你？"',
            high: '他从贴身口袋掏出一张皱巴巴的快递单，背面画满了路线和门牌号："这上面是我这一年走过的所有地址——哪家有人、哪家没人、哪家东西多，我全记着。本来想留着自己用，但……你拿着吧，比我用得上。"'
        },
        gifts: ['运动饮料','充电宝','香烟'], unlockLevel: 55,
        backstory: '外卖骑手三年，熟悉城市每条小巷和楼栋。灾难当天正在送餐，被客户家的丧尸追着跑出来，只抢回了电瓶车和一兜还没送出的外卖。妻子在城东超市上班，失联至今。他随身带着对讲机，每晚都守着固定频道喊话，希望妻子能听到。'
    },
    '示例-林医生': {
        trust: 35, affinity: 45, personality: '严谨温和', occupation: '社区全科医生',
        age: 41, gender: '女', health: '慢性腰痛，长期睡眠不足',
        dialogue: {
            low: '她正在用酒精棉片擦拭听诊器，闻声抬头，镜片后的眼睛冷静地扫过你全身："受伤了？还是生病？说症状，别绕。"',
            mid: '她放下手里的药盒，揉了揉酸痛的腰，给你倒了杯温水："你这次气色比上次好。药按时吃了？伤口没发炎吧？让我看看。"',
            high: '她从药箱底层取出一个用塑料袋包了三层的小本子，扉页上写着一个名字和一串电话："这是我女儿……她在外地读书，灾难那天之后就没联系上。如果你以后……往那个方向去，能不能帮我打听一下？"'
        },
        gifts: ['听诊器','药品','维生素片'], unlockLevel: 70,
        backstory: '社区医院全科医生，从业十五年，对常见病和慢性病了如指掌。丈夫是同院药剂师，灾难首日为护住药房被感染者咬伤，三天后变异，她亲手结束了丈夫的痛苦。从此把所有精力投入到救治幸存者中，但每个安静的夜晚都会想起女儿。'
    },
    '示例-阿强': {
        trust: 15, affinity: 25, personality: '沉默坚韧', occupation: '建筑工人',
        age: 38, gender: '男', health: '左手食指断了一节，背部有烧伤疤痕',
        dialogue: {
            low: '他蹲在墙角啃着一块干硬的馒头，听见脚步声猛地抬头，左手下意识摸向身边的钢筋，眼神警惕却不带敌意："……啥事？"',
            mid: '他把最后一口馒头咽下去，拍了拍手上的灰，缓缓站起身："你能来这一趟……是有事吧？说。能帮的我帮，帮不了的我直说。"',
            high: '他从内衣口袋掏出一张被汗水浸得发皱的照片，上面是一个穿校服的女孩和一个笑容憨厚的女人："我老婆和闺女……灾前在城北避难所。我每天都去那边找，没找到人，也没找到……别的。你帮我留心一下，行吗？"'
        },
        gifts: ['香烟','白酒','牛肉干'], unlockLevel: 65,
        backstory: '建筑工地钢筋工，沉默寡言但干活拼命。灾难当天工地塌方，他被埋了六个小时才被工友刨出来，左手食指被截断，背部被烧坏的电路烫伤。工友们在混乱中四散，他独自走了三天才找到现在的据点。不爱说话，但每个夜晚都会朝着城北方向望很久。'
    }
};

// ===== 状态效果预设 =====
const STATUS_EFFECTS = {
    bleeding: { name: '流血', icon: '🩸', color: '#c75b3a', stackable: true, maxStacks: 5, duration: 60,
        onTick: (s) => { s.hp = Math.max(0, (s.hp||100) - 2); if (Math.random() < 0.15) s.infection = (s.infection||0) + 1; },
        onApply: () => playSfx('hurt') },
    infection: { name: '感染', icon: '🤢', color: '#9d7a3a', stackable: false, duration: 300,
        onTick: (s) => { s.bodyTemp = (s.bodyTemp||36.5) + 0.2; s.hp = Math.max(0, (s.hp||100) - 1); },
        onApply: () => playSfx('warn') },
    poison: { name: '中毒', icon: '☠️', color: '#6a3a9d', stackable: true, maxStacks: 3, duration: 180,
        onTick: (s) => { s.hp = Math.max(0, (s.hp||100) - 3); s.spirit = Math.max(0, (s.spirit||50) - 2); },
        onApply: () => playSfx('danger') },
    fracture: { name: '骨折', icon: '🦴', color: '#8a5a3a', stackable: false, duration: 900,
        onTick: (s) => { s.fatigue = Math.min(100, (s.fatigue||0) + 1); s.movement = (s.movement||5) - 1; },
        onApply: () => playSfx('hurt') },
    hypothermia: { name: '失温', icon: '🥶', color: '#3a7bc7', stackable: false, duration: 300,
        onTick: (s) => { s.bodyTemp = Math.max(32, (s.bodyTemp||36.5) - 0.15); s.fatigue = Math.min(100, (s.fatigue||0) + 0.5); },
        onApply: () => playSfx('warn') },
    panic: { name: '恐慌', icon: '😱', color: '#c77b3a', stackable: false, duration: 120,
        onTick: (s) => { s.spirit = Math.max(0, (s.spirit||50) - 1); },
        onApply: () => playSfx('warn') },
    adrenaline: { name: '肾上腺素', icon: '💉', color: '#3ac77b', stackable: false, duration: 120,
        onTick: (s) => { s.enc = Math.min(20, (s.enc||5) + 0.5); s.fatigue = Math.max(0, (s.fatigue||0) - 1); },
        onApply: () => playSfx('levelup') },
    exhaustion: { name: '虚脱', icon: '💀', color: '#5a5a5a', stackable: false, duration: 300,
        onTick: (s) => { s.hp = Math.max(0, (s.hp||100) - 2); s.spirit = Math.max(0, (s.spirit||50) - 1); s.fatigue = Math.min(100, (s.fatigue||0) + 2); },
        onApply: () => playSfx('danger') }
};

// ===== 武器伤害/耐久预设 =====
const WEAPON_DATA = {
    '手枪': { dmg: 25, range: 15, crit: 0.15, speed: 'medium', ammoType: '9mm子弹' },
    '消音手枪': { dmg: 22, range: 12, crit: 0.15, speed: 'medium', ammoType: '9mm子弹', silent: true },
    '步枪': { dmg: 35, range: 50, crit: 0.2, speed: 'slow', ammoType: '5.56mm子弹' },
    '狙击步枪': { dmg: 80, range: 200, crit: 0.4, speed: 'very slow', ammoType: '7.62mm子弹' },
    '霰弹枪': { dmg: 50, range: 8, crit: 0.25, speed: 'slow', ammoType: '12号霰弹' },
    '十字弩': { dmg: 45, range: 30, crit: 0.3, speed: 'slow', ammoType: '弩箭', silent: true },
    '砍刀': { dmg: 20, range: 2, crit: 0.1, speed: 'fast', ammoType: null },
    '日式长刀': { dmg: 28, range: 3, crit: 0.18, speed: 'fast', ammoType: null },
    '斧头': { dmg: 30, range: 2, crit: 0.05, speed: 'slow', ammoType: null },
    '消防斧': { dmg: 38, range: 2, crit: 0.1, speed: 'slow', ammoType: null },
    '匕首': { dmg: 12, range: 1, crit: 0.25, speed: 'fast', ammoType: null },
    '格斗刀': { dmg: 18, range: 1, crit: 0.28, speed: 'very fast', ammoType: null },
    '铁锤': { dmg: 35, range: 2, crit: 0.05, speed: 'slow', ammoType: null },
    '钢管': { dmg: 15, range: 2, crit: 0.08, speed: 'medium', ammoType: null },
    '铁棍': { dmg: 16, range: 2, crit: 0.06, speed: 'medium', ammoType: null },
    '球棒': { dmg: 18, range: 2, crit: 0.12, speed: 'medium', ammoType: null },
    '折叠水果刀': { dmg: 10, range: 1, crit: 0.2, speed: 'fast', ammoType: null },
    '多功能扳手': { dmg: 12, range: 1, crit: 0.1, speed: 'medium', ammoType: null },
    '撬棍': { dmg: 22, range: 2, crit: 0.1, speed: 'medium', ammoType: null },
    '工兵铲': { dmg: 24, range: 2, crit: 0.1, speed: 'medium', ammoType: null },
    '菜刀': { dmg: 14, range: 1, crit: 0.12, speed: 'fast', ammoType: null },
    '武士刀': { dmg: 35, range: 3, crit: 0.22, speed: 'fast', ammoType: null },
    '三棱刺': { dmg: 28, range: 2, crit: 0.15, speed: 'fast', ammoType: null },
    '链锯': { dmg: 50, range: 1, crit: 0.05, speed: 'very slow', ammoType: null },
    '电击棒': { dmg: 15, range: 1, crit: 0.3, speed: 'fast', ammoType: null, stun: true },
    '弓': { dmg: 30, range: 25, crit: 0.2, speed: 'medium', ammoType: '弓箭', silent: true },
    '手术刀': { dmg: 8, range: 1, crit: 0.35, speed: 'very fast', ammoType: null }
};

// ===== 合成配方（100个，8大类）=====
const CRAFT_RECIPES = [
    { id: 'bandage', name: '绷带', ingredients: ['布料', '酒精'], result: '绷带x3', desc: '酒精消毒后的布料制成绷带，一次得3卷', difficulty: 1 },
    { id: 'gauze_bandage', name: '高级绷带', ingredients: ['纱布', '酒精', '消炎药'], result: '医疗包', desc: '包扎+消炎的综合医疗包', difficulty: 2 },
    { id: 'molotov', name: '燃烧瓶', ingredients: ['汽油', '玻璃瓶', '布条'], result: '燃烧瓶', desc: '简易燃烧瓶，攻击后起火', difficulty: 3 },
    { id: 'spark', name: '烟雾弹', ingredients: ['硫磺', '金属片', '电池'], result: '烟雾弹', desc: '制造烟雾阻隔视线', difficulty: 3 },
    { id: 'spear', name: '简易长矛', ingredients: ['长木棍', '菜刀'], result: '简易长矛', desc: '近战加长武器', difficulty: 2 },
    { id: 'trap', name: '简易陷阱', ingredients: ['木板', '钉子', '绳子'], result: '简易陷阱', desc: '触发后造成伤害', difficulty: 2 },
    { id: 'filter', name: '简易滤水器', ingredients: ['塑料瓶', '沙子', '木炭'], result: '简易滤水器', desc: '过滤污水，获得饮用水', difficulty: 2 },
    { id: 'torch', name: '火把', ingredients: ['长木棍', '破布', '酒精'], result: '火把', desc: '黑暗中照明2小时', difficulty: 1 },
    { id: 'candle', name: '蜡烛', ingredients: ['蜂蜡', '铁丝'], result: '蜡烛x3', desc: '柔和光源，不吸引丧尸', difficulty: 1 },
    { id: 'armor_plate', name: '简易护心镜', ingredients: ['金属片', '皮革', '绳子'], result: '简易护心镜', desc: '胸部防护，减伤30%', difficulty: 3 },
    { id: 'shield', name: '简易盾牌', ingredients: ['木板', '铁皮', '铁丝'], result: '简易盾牌', desc: '格挡概率提升', difficulty: 2 },
    { id: 'spike_armor', name: '钉甲', ingredients: ['皮革', '铁钉', '铁丝'], result: '钉甲', desc: '近战攻击反伤敌人', difficulty: 4 },
    { id: 'medkit', name: '综合医疗包', ingredients: ['绷带', '药品', '酒精'], result: '综合医疗包', desc: '治疗多种伤情', difficulty: 2 },
    { id: 'surgical_kit', name: '急救手术包', ingredients: ['医疗包', '手术刀', '抗生素'], result: '急救手术包', desc: '治疗重伤和骨折', difficulty: 4 },
    { id: 'wire', name: '铁丝网', ingredients: ['金属丝', '钳子'], result: '铁丝网', desc: '构建防御工事', difficulty: 2 },
    { id: 'lockpick', name: '开锁工具', ingredients: ['金属片', '细铁丝'], result: '开锁工具', desc: '撬开普通门锁', difficulty: 2 },
    { id: 'booby', name: '简易爆炸装置', ingredients: ['炸药', '电池', '金属片'], result: '简易爆炸装置', desc: '触发式杀伤', difficulty: 4 },
    { id: 'landmine', name: '地雷', ingredients: ['炸药', '金属片', '木板'], result: '地雷x2', desc: '踩踏触发，威力巨大', difficulty: 5 },
    { id: 'purify', name: '净水药片', ingredients: ['酒精', '药品', '金属'], result: '净水药片x5', desc: '净化水源，一次5片', difficulty: 3 },
    { id: 'axe_improved', name: '加固斧头', ingredients: ['斧头', '金属片', '绳子'], result: '加固斧头', desc: '更高伤害的近战武器', difficulty: 2 },
    { id: 'radio', name: '简易对讲机', ingredients: ['对讲机', '零件', '电池'], result: '简易对讲机', desc: '短距离通讯增强', difficulty: 3 },
    { id: 'generator', name: '手摇发电机', ingredients: ['零件', '木板', '铜线'], result: '手摇发电机', desc: '手动发电，为电池充电', difficulty: 5 },
    { id: 'battery_pack', name: '移动电源', ingredients: ['充电宝', '太阳能板', '电线'], result: '20000mAh移动电源', desc: '太阳能+大容量储能', difficulty: 4 },
    { id: 'fishing_rod', name: '简易钓鱼竿', ingredients: ['长木棍', '绳子', '铁丝'], result: '钓鱼竿', desc: '河边钓鱼获得食物', difficulty: 2 },
    { id: 'smoker', name: '熏肉架', ingredients: ['木板', '铁丝'], result: '熏肉架', desc: '制作腊肉，保存肉类', difficulty: 2 },
    { id: 'rain_collector', name: '雨水收集器', ingredients: ['塑料布', '绳子', '木板'], result: '雨水收集器', desc: '雨天收集干净雨水', difficulty: 2 },
    { id: 'sleeping_bag', name: '睡袋', ingredients: ['毯子', '布料', '绳子'], result: '睡袋', desc: '夜间保暖，睡眠恢复', difficulty: 3 },
    { id: 'crossbow', name: '十字弩', ingredients: ['木板', '铁丝', '零件'], result: '十字弩', desc: '无声远程武器', difficulty: 5 },
    { id: 'bow_craft', name: '弓', ingredients: ['长木棍', '绳子', '铁丝'], result: '弓', desc: '无声远程武器，可回收箭矢', difficulty: 3 },
    { id: 'arrow_craft', name: '弓箭', ingredients: ['木棍', '铁丝', '胶带'], result: '弓箭x5', desc: '弓用箭矢，一次5支', difficulty: 2 },
    { id: 'stun_baton', name: '电击棒', ingredients: ['钢管', '电池', '电线'], result: '电击棒', desc: '高压电击武器，可制服敌人', difficulty: 4 },
    { id: 'rebreather', name: '简易防毒面具', ingredients: ['塑料瓶', '布条', '木炭'], result: '防毒面具', desc: '过滤空气，防毒防感染', difficulty: 3 },
    { id: 'whetstone_use', name: '磨刀', ingredients: ['磨刀石', '匕首'], result: '格斗刀', desc: '将匕首磨利升级为格斗刀', difficulty: 1 },
    { id: 'sewing_kit', name: '针线包', ingredients: ['铁丝', '布条', '绳子'], result: '针线包', desc: '缝补衣物和包扎伤口', difficulty: 1 },
    { id: 'solar_charger', name: '太阳能充电器', ingredients: ['太阳能板', '逆变器', '电线'], result: '太阳能充电器', desc: '野外充电装置', difficulty: 4 },
    { id: 'fishing_net', name: '渔网', ingredients: ['绳子', '铁丝', '尼龙绳'], result: '渔网', desc: '捕鱼效率更高的工具', difficulty: 2 },
    { id: 'improved_filter', name: '高级滤水器', ingredients: ['简易滤水器', '木炭', '塑料布'], result: '高级滤水器', desc: '升级滤水器，过滤更彻底，可过滤病毒', difficulty: 3 },
    // ===== 进阶食物配方 =====
    { id: 'hardtack', name: '压缩饼干', ingredients: ['面粉', '盐', '水'], result: '压缩饼干x4', desc: '耐储存的干粮，饱腹持久', difficulty: 1 },
    { id: 'jerky', name: '风干肉', ingredients: ['生肉', '盐', '绳子'], result: '风干肉x3', desc: '腌制风干的肉类，可保存数月', difficulty: 2 },
    { id: 'smoked_fish', name: '熏鱼', ingredients: ['鲜鱼', '木柴', '盐'], result: '熏鱼x3', desc: '烟熏保存的鱼，风味独特', difficulty: 2 },
    { id: 'dried_fruit', name: '果干', ingredients: ['水果', '绳子', '布'], result: '果干x4', desc: '晾晒风干的水果，便携零食', difficulty: 1 },
    { id: 'bone_broth', name: '骨汤罐头', ingredients: ['骨头', '盐', '罐头盒'], result: '骨汤罐头x2', desc: '熬制浓缩骨汤，补充钙质', difficulty: 2 },
    { id: 'mre_upgrade', name: '自热口粮', ingredients: ['单兵口粮', '生石灰', '塑料袋'], result: '自热口粮', desc: '升级版口粮，野外无需火源加热', difficulty: 3 },
    { id: 'vitamin_extract', name: '维生素提取物', ingredients: ['蔬菜', '医用酒精', '蒸馏装置'], result: '维生素片x8', desc: '从新鲜蔬果提取浓缩维生素', difficulty: 4 },
    // ===== 进阶医疗配方 =====
    { id: 'iodine', name: '碘伏', ingredients: ['碘酒', '酒精', '蒸馏水'], result: '碘伏', desc: '低刺激皮肤消毒剂', difficulty: 2 },
    { id: 'splint', name: '骨折固定板', ingredients: ['木板', '纱布', '胶带'], result: '骨折固定板', desc: '固定骨折伤肢，防止二次伤害', difficulty: 2 },
    { id: 'stitch_kit', name: '缝合包', ingredients: ['手术刀', '针线包', '酒精'], result: '缝合包', desc: '伤口缝合工具，止大血管出血', difficulty: 3 },
    { id: 'herbal_salve', name: '草药膏', ingredients: ['草药', '凡士林', '纱布'], result: '草药膏x3', desc: '天然草药外敷，治疗感染伤口', difficulty: 3 },
    { id: 'antivenom', name: '抗毒血清', ingredients: ['毒蛇', '注射器', '离心机'], result: '抗毒血清', desc: '解毒神药，治疗蛇咬犬咬感染', difficulty: 5 },
    { id: 'blood_bag', name: '血浆袋', ingredients: ['输血套装', '抗凝剂', '生理盐水'], result: '血浆袋', desc: '紧急输血用，挽回濒死生命', difficulty: 5 },
    { id: 'morphine_syringe', name: '吗啡注射器', ingredients: ['止痛药', '注射器', '酒精'], result: '吗啡注射器x2', desc: '强效镇痛剂，重伤急救使用', difficulty: 4 },
    { id: 'cpr_kit', name: '急救复苏包', ingredients: ['急救手术包', '氧气瓶', '电极片'], result: '心脏复苏包', desc: 'CPR全套工具，心脏骤停急救', difficulty: 5 },
    // ===== 武器进阶升级链 =====
    { id: 'pipe_gun', name: '简易手枪', ingredients: ['钢管', '子弹', '弹簧'], result: '简易手枪', desc: '手工改装单发手枪，后坐力大', difficulty: 4 },
    { id: 'smg_craft', name: '简易冲锋枪', ingredients: ['钢管x2', '手枪零件', '弹簧x2'], result: '简易冲锋枪', desc: '自动改装武器，精度一般', difficulty: 5 },
    { id: 'tactical_knife', name: '战术匕首', ingredients: ['弹簧钢', '磨刀石', '伞绳'], result: '战术匕首', desc: '高硬度军规匕首，附带伞绳握柄', difficulty: 3 },
    { id: 'katanahandle', name: '刀装升级', ingredients: ['武士刀', '黄铜管', '鲛皮'], result: '上品打刀', desc: '升级刀柄刀装，挥刀更顺手', difficulty: 4 },
    { id: 'compound_bow', name: '复合弓', ingredients: ['弓', '滑轮', '碳纤维布'], result: '复合弓', desc: '现代复合弓，拉力更大射程更远', difficulty: 5 },
    { id: 'crossbow_scope', name: '瞄准镜弩', ingredients: ['十字弩', '瞄准镜', '支架'], result: '战术十字弩', desc: '加装瞄准镜和支架，精准狙击', difficulty: 5 },
    { id: 'fire_axe_special', name: '破拆斧', ingredients: ['消防斧', '弹簧钢', '橡胶'], result: '破拆斧', desc: '升级版消防斧，破拆木门铁门更快', difficulty: 3 },
    { id: 'taser_ammo', name: '电击枪弹', ingredients: ['电池', '细铁丝', '塑料'], result: '电击枪弹药x3', desc: '泰瑟枪替换弹，远距离电击', difficulty: 3 },
    { id: 'ballistic_knife', name: '弹簧刀', ingredients: ['弹簧钢', '弹簧', '钢管'], result: '弹射飞刀', desc: '扳机弹射刀片，近战出其不意', difficulty: 4 },
    { id: 'incendiary_ammo', name: '燃烧弩箭', ingredients: ['弩箭x5', '汽油', '布条'], result: '燃烧弩箭x5', desc: '命中起火的弩箭，对付群体丧尸', difficulty: 3 },
    { id: 'explosive_arrow', name: '爆裂箭', ingredients: ['弓箭x5', '炸药', '雷管'], result: '爆裂箭x3', desc: '命中爆炸的箭矢，范围杀伤', difficulty: 5 },
    // ===== 防具进阶升级链 =====
    { id: 'kevlar_vest', name: '凯夫拉背心', ingredients: ['防弹衣', '碳纤维布', '环氧树脂'], result: '凯夫拉战术背心', desc: '轻量化强化防弹衣，更灵活', difficulty: 4 },
    { id: 'riot_helmet', name: '防暴头盔', ingredients: ['军用头盔', '亚克力', '海绵'], result: '防暴头盔', desc: '加装面罩的防暴头盔，防破片防咬', difficulty: 3 },
    { id: 'full_plate', name: '全身板甲', ingredients: ['钢材x3', '皮革x2', '铆钉x50'], result: '中世纪板甲', desc: '手工打制全身甲，刀枪不入但沉重', difficulty: 5 },
    { id: 'chainmail', name: '锁子甲', ingredients: ['铁丝x5', '钳子', '铆钉'], result: '锁子甲衫', desc: '金属环编织软甲，防砍防抓', difficulty: 4 },
    { id: 'combat_boots', name: '作战靴', ingredients: ['皮革x2', '钢板', '橡胶'], result: '钢头作战靴', desc: '钢头防刺作战靴，保护脚踝', difficulty: 3 },
    { id: 'gauntlets', name: '金属护手', ingredients: ['钢材', '皮革', '铆钉'], result: '钢制护手', desc: '金属护手，格斗时挡刀不伤手', difficulty: 3 },
    { id: 'shin_guards', name: '护胫甲', ingredients: ['钢材', '塑料', '胶带'], result: '护胫甲', desc: '小腿防护，防丧尸扑倒咬伤', difficulty: 2 },
    { id: 'bite_proof', name: '防咬护颈', ingredients: ['皮革x2', '钢丝', '铆钉'], result: '防咬护颈', desc: '保护颈部大动脉，防丧尸撕咬关键部位', difficulty: 3 },
    // ===== 电子/工具进阶 =====
    { id: 'nv_upgrade', name: '头盔夜视仪', ingredients: ['夜视仪', '军用头盔', '支架'], result: '夜视头盔', desc: '整合夜视仪到头盔，解放双手', difficulty: 4 },
    { id: 'solar_panel_array', name: '太阳能板阵列', ingredients: ['太阳能板x3', '铜线', '逆变器'], result: '太阳能阵列', desc: '多板并联，发电功率提升3倍', difficulty: 4 },
    { id: 'ebike', name: '电动自行车', ingredients: ['自行车', '电机', '移动电源'], result: '电动自行车', desc: '改装电动车，长距离移动节省体力', difficulty: 5 },
    { id: 'jammer', name: '信号干扰器', ingredients: ['对讲机', '扫描仪', '功放'], result: '信号干扰器', desc: '干扰无人机、无线电引信炸弹', difficulty: 5 },
    { id: 'faraday_cage', name: '法拉第笼', ingredients: ['铜网x3', '钢材', '绝缘胶带'], result: '法拉第笼箱', desc: '屏蔽EMP电磁脉冲，保护电子设备', difficulty: 4 },
    { id: 'metal_detector', name: '地下金属探测器', ingredients: ['铜线', '扬声器', '电池'], result: '金属探测器', desc: '搜索地下埋藏的金属物资', difficulty: 3 },
    { id: 'door_barricade', name: '加固门闩', ingredients: ['钢材x2', '木板x3', '钉子x20'], result: '加固门闩套装', desc: '重型门闩，丧尸撞不开', difficulty: 3 },
    { id: 'perimeter_alarm', name: '周界报警器', ingredients: ['电子防盗器x3', '细铁丝', '电池x2'], result: '周界报警套装', desc: '布设一圈，外围闯入立即响铃', difficulty: 3 },
    { id: 'spike_strip', name: '阻车钉', ingredients: ['钢材', '钉子x30', '绳子'], result: '阻车钉x3', desc: '刺破车胎的路障，阻挡车辆', difficulty: 3 },
    { id: 'watchtower', name: '瞭望塔组件', ingredients: ['木板x5', '绳子x3', '钉子x50'], result: '便携瞭望塔', desc: '拼装式3米高瞭望塔，监控周边', difficulty: 4 },
    // ===== 农业/种植 =====
    { id: 'compost', name: '堆肥箱', ingredients: ['木板x2', '塑料布', '泥土'], result: '堆肥箱', desc: '厨余落叶堆肥，改良贫瘠土壤', difficulty: 2 },
    { id: 'grow_light', name: '植物生长灯', ingredients: ['LED灯带', '太阳能板', '定时器'], result: '室内植物灯', desc: '全光谱生长灯，室内种植蔬菜', difficulty: 4 },
    { id: 'seed_bank', name: '种子保存罐', ingredients: ['玻璃罐', '干燥剂', '标签纸'], result: '种子银行', desc: '低温干燥保存种子，延长发芽率', difficulty: 2 },
    { id: 'irrigation', name: '滴灌系统', ingredients: ['塑料瓶x4', '细塑料管', '绳子'], result: '自动滴灌装置', desc: '无人值守灌溉，节省人力时间', difficulty: 3 },
    { id: 'greenhouse', name: '迷你温室', ingredients: ['塑料布x3', 'PVC管', '胶带'], result: '便携温室套件', desc: '小型温室，反季节种植抵御严寒', difficulty: 4 },
    // ===== 陷阱/防御进阶 =====
    { id: 'punji_stakes', name: '尖钉陷阱', ingredients: ['长木棍x5', '刀具', '绳子'], result: '尖钉陷阱x3', desc: '越南陷阱，刺入脚底感染重伤', difficulty: 2 },
    { id: 'snare', name: '捕兽套', ingredients: ['钢丝绳', '弹簧', '木棍'], result: '捕兽套x3', desc: '勒捕小型动物，获取皮毛肉食', difficulty: 2 },
    { id: 'bear_trap', name: '大型捕兽夹', ingredients: ['钢材x2', '弹簧x2', '铆钉'], result: '捕兽夹x2', desc: '咬合力极强，骨断筋折', difficulty: 4 },
    { id: 'alarm_trap', name: '警报陷阱', ingredients: ['铁皮罐x3', '石头x3', '绳子'], result: '警报陷阱x5', desc: '触发时发出巨大声响，警告来敌', difficulty: 1 },
    { id: 'concussion_grenade', name: '震爆弹', ingredients: ['炸药', '金属片', '电池'], result: '震爆弹x2', desc: '强光巨响眩晕敌人，非致命清理室内', difficulty: 4 },
    { id: 'tear_gas', name: '催泪瓦斯', ingredients: ['辣椒素', '喷雾剂', '酒精'], result: '催泪瓦斯x3', desc: '驱散人群，室内攻坚利器', difficulty: 4 },
    // ===== 工具/杂项 =====
    { id: 'multitool_kit', name: '组合工具', ingredients: ['瑞士军刀', '多功能扳手', '胶带'], result: '专业组合工具', desc: '多工具组合，出门随身携带', difficulty: 2 },
    { id: 'climbing_kit', name: '攀岩套装', ingredients: ['登山绳x2', '锁扣x5', '扁带'], result: '攀岩套装', desc: '高楼攀爬绳索下降必备', difficulty: 3 },
    { id: 'lockpick_master', name: '专业开锁组', ingredients: ['开锁工具x3', '细铁丝', '润滑油'], result: '专业开锁套装', desc: '可开B级C级锁，防盗门也可尝试', difficulty: 3 },
    { id: 'battery_rebuild', name: '电池复活包', ingredients: ['电芯x4', '焊锡丝', '保护板'], result: '复活锂电池组', desc: '拆开废旧电池换芯，得到大容量电池', difficulty: 3 },
    { id: 'ham_radio', name: '业余电台', ingredients: ['手持电台', '功放', '天线'], result: '基地电台', desc: '50W大功率电台，百公里通联', difficulty: 5 },
    { id: 'water_heater', name: '便携热水器', ingredients: ['不锈钢杯', '电热丝', '电池'], result: '电热水器', desc: '野外加热洗澡水，预防感冒', difficulty: 3 },
    { id: 'portable_stove', name: '便携炉具', ingredients: ['铝罐', '酒精', '钢丝'], result: '酒精炉', desc: '小巧轻便的野营炉具，煮食取暖', difficulty: 2 },
    { id: 'bug_out_bag', name: '末日生存包', ingredients: ['登山包', '手电筒', '医疗包', '压缩饼干x4', '瓶装水x2'], result: 'BOB逃生背包', desc: '预先打包好的72小时应急逃生背包，随时提包走人', difficulty: 3 }
];

// ===== 随机事件库 =====
const RANDOM_EVENTS = [
    { id: 'ambush', name: '丧尸伏击', trigger: 'location', minDuration: 30, 
        text: '你推开一扇破旧的门，阴暗的楼道里传来低沉的嘶吼……三只丧尸从角落扑出！', 
        type: 'combat', difficulty: 2 },
    { id: 'airdrop', name: '空投物资', trigger: 'time', minDuration: 120, 
        text: '远处传来直升机的轰鸣声，一个降落伞缓缓飘落在空地上！里面可能有急需的物资。', 
        type: 'loot', minItems: 2, maxItems: 4 },
    { id: 'survivor', name: '幸存者求救', trigger: 'proximity', minDuration: 60, 
        text: '不远处传来微弱的呼救声……一个衣衫褴褛的幸存者向你求助。', 
        type: 'npc', riskLevel: 'medium' },
    { id: 'migration', name: '尸群迁移', trigger: 'time', minDuration: 180, 
        text: '大群丧尸正在向这个方向移动，你必须尽快做出决定——躲藏、绕行还是应战！', 
        type: 'combat', difficulty: 3 },
    { id: 'supply_drop', name: '遗留物资箱', trigger: 'location', minDuration: 90, 
        text: '你在翻找一个被遗忘的角落时发现了一个尘封的物资箱！', 
        type: 'loot', minItems: 3, maxItems: 5 },
    { id: 'betrayal', name: '背叛事件', trigger: 'npc', minDuration: 300, 
        text: '你的同伴趁你不备，举起了手中的武器……', 
        type: 'combat', difficulty: 4 },
    { id: 'discovery', name: '重要发现', trigger: 'exploration', minDuration: 60, 
        text: '你在墙上发现了一张旧地图，上面标注着一个可能的避难所位置！', 
        type: 'clue' },
    { id: 'infection_spread', name: '感染扩散', trigger: 'time', minDuration: 300, 
        text: '有消息称附近的感染范围正在扩大，你必须更加小心。', 
        type: 'info' },
    { id: 'good_samaritan', name: '善意行为', trigger: 'proximity', minDuration: 180, 
        text: '一个友好的幸存者主动与你分享了有用的信息。', 
        type: 'npc' },
    { id: 'raider_attack', name: '掠夺者袭击', trigger: 'location', minDuration: 150, 
        text: '一群掠夺者挡住了你的去路，他们手中的武器让你不寒而栗。', 
        type: 'combat', difficulty: 4 },
    { id: 'dog_stray', name: '流浪狗', trigger: 'location', minDuration: 120,
        text: '一只瘦骨嶙峋的流浪狗摇着尾巴向你走来，似乎想要求救……是否收留？', 
        type: 'npc', riskLevel: 'low' },
    { id: 'cat_stray', name: '流浪猫', trigger: 'proximity', minDuration: 100,
        text: '一只灰猫跳到你面前的箱子上，静静地看着你，喵了一声。', 
        type: 'info' },
    { id: 'merchant', name: '游商到访', trigger: 'time', minDuration: 200,
        text: '一个背着大背包的游商出现在你面前，打开了他的商品，物物交换，公平交易。', 
        type: 'npc' },
    { id: 'old_fire', name: '远处火光', trigger: 'time', minDuration: 150,
        text: '远方升起了一道浓烟……是有人发求救信号还是灾难现场？', 
        type: 'clue' },
    { id: 'power_flicker', name: '电力波动', trigger: 'location', minDuration: 80,
        text: '远处的路灯闪烁了几下，又熄灭了……难道这个区域还有电？', 
        type: 'clue' },
    { id: 'lucky_find', name: '意外之财', trigger: 'exploration', minDuration: 120,
        text: '你踩到一个软东西，低头一看——是一捆没开封的罐头！', 
        type: 'loot', minItems: 1, maxItems: 2 },
    { id: 'phone_ring', name: '手机铃声', trigger: 'time', minDuration: 240,
        text: '附近传来一阵手机铃声，从一具尸体旁的包里传出……接还是不接？', 
        type: 'clue' },
    { id: 'bird_singing', name: '鸟群惊飞', trigger: 'proximity', minDuration: 40,
        text: '一群乌鸦突然从树上惊飞四散……有什么东西正在接近！', 
        type: 'combat', difficulty: 1 },
    { id: 'music_box', name: '音乐盒', trigger: 'location', minDuration: 200,
        text: '你在废墟中发现一个还能转动的音乐盒，清脆的旋律让你精神振奋。', 
        type: 'buff', effect: { spirit: 15, joy: 10 } },
    { id: 'water_source', name: '隐秘水源', trigger: 'exploration', minDuration: 160,
        text: '你发现了一处隐蔽的山泉，水看起来很干净。', 
        type: 'loot', minItems: 1, maxItems: 1 },
    { id: 'photo_found', name: '老照片', trigger: 'exploration', minDuration: 90,
        text: '一张泛黄的全家福照片，背面写着"愿家人平安"……', 
        type: 'info' },
    { id: 'booby_trap', name: '陷阱警报', trigger: 'location', minDuration: 120,
        text: '你差点踩到一根细细的铁丝……这是幸存者布置的陷阱！', 
        type: 'combat', difficulty: 2 },
    { id: 'radio_broadcast', name: '无线电广播', trigger: 'time', minDuration: 260,
        text: '收音机突然有信号了："……城北避难所开放……需要……幸存者……"然后又断了。', 
        type: 'clue' },
    { id: 'garden', name: '城市花园', trigger: 'exploration', minDuration: 140,
        text: '你发现一处被遗忘的屋顶花园，居然还有蔬菜和水果挂着！', 
        type: 'loot', minItems: 2, maxItems: 3 },
    { id: 'safe_house', name: '安全屋', trigger: 'location', minDuration: 220,
        text: '你找到一处用木板封死的小屋，从门缝里没被破坏过。里面会有什么？', 
        type: 'loot', minItems: 2, maxItems: 4 }
];

// ===== NPC 基础数据 =====
const NPC_DATA = {
    '老张': { 
        trust: 30, affinity: 50, personality: '谨慎内敛', occupation: '退役军人', 
        age: 58, gender: '男', health: '左腿有旧伤，阴雨天会疼',
        dialogue: { 
            low: '他斜眼扫了你一下，指节轻轻叩着膝头的旧步枪，半晌才吐出一句："有事快说，我没工夫闲聊。"', 
            mid: '沉默地点燃一支烟，深吸一口后缓缓开口："你这人……还不算讨厌。有什么打算，说说看。"', 
            high: '粗糙的手掌重重拍在你肩上，眼中闪过一丝难得的柔软："丫头/小子，我这条老命不值钱，但你要是敢丢下我……我做鬼也不放过你。"' 
        },
        gifts: ['老白干', '军粮压缩饼干', '陈年香烟'], unlockLevel: 60, 
        backstory: '参加过两次边境冲突的侦察连老兵，左腿在一次伏击中被炸伤留下残疾。退役后在郊区开了个修车铺，老伴走得早，唯一的儿子在外地当兵至今音讯全无。腰间总别着一把磨得发亮的军刺，说是老班长留的。' 
    },
    '莉莉': { 
        trust: 40, affinity: 60, personality: '外柔内刚', occupation: 'ICU护士', 
        age: 29, gender: '女', health: '轻度贫血，长期睡眠不足',
        dialogue: { 
            low: '她正低头整理药箱，听见脚步声抬起头，嘴角扯出一个疲惫却礼貌的弧度："你好，需要处理伤口吗？我这里还有些碘伏。"', 
            mid: '见你走近，她放下了手里的注射器，指尖在白大褂下摆无意识地绞了两下："你又来了……今天带了什么消息吗？外面的情况……有没有好一点？"', 
            high: '眼眶红了红，却倔强地别过脸去擦了擦，再转回来时已经带着笑意，声音却有些哽咽："说好的，我们都要活下去。等这一切结束……我请你喝我最拿手的珍珠奶茶。"' 
        },
        gifts: ['医用棉片', '维生素片', '手工曲奇'], unlockLevel: 70, 
        backstory: '市立医院ICU的资深护士，从业七年，见过太多生死。灾难爆发的那个夜晚她正在值大夜班，眼睁睁看着同事和病人一个个倒下变异，最后只带着一个急救箱从消防通道逃了出来。左手腕上一直戴着一条已经褪色的粉色手绳，那是她刚上小学的女儿给她编的。' 
    },
    '陈默': { 
        trust: 50, affinity: 70, personality: '寡言深情', occupation: '航空航天工程师', 
        age: 44, gender: '男', health: '高血压，需长期服药',
        dialogue: { 
            low: '他头也不抬地拧着螺丝，焊枪的蓝光照在脸上忽明忽暗，只有喉咙里发出一声短促的："嗯。"算是打过招呼。', 
            mid: '放下了手中的电烙铁，从抽屉里摸出一张泛黄的照片看了一眼又迅速收好，声音低沉："你上次提的那个发电装置……我画了草图。要看看吗？"', 
            high: '沉默了很久，才将一个用布层层包裹的小盒子递到你手里，里面是一个做工精致的八音盒："丫丫……我女儿，她最喜欢这个旋律。你替我……好好收着。"' 
        },
        gifts: ['精密螺丝刀套装', '万用表', '进口锂电池'], unlockLevel: 80, 
        backstory: '国家级研究所的骨干工程师，曾参与多项载人航天项目。灾难爆发时他正在外地开研讨会，等他赶回家时，只在废墟里找到了女儿最喜欢的兔子玩偶和妻子的结婚戒指。从此把自己关在废弃工厂里没日没夜地做东西，说是要给女儿造一个"不会被怪物破坏的家"。' 
    },
    '苏梅': { 
        trust: 20, affinity: 35, personality: '敏感多疑', occupation: '高级财务经理', 
        age: 36, gender: '女', health: '神经性胃炎，营养不良',
        dialogue: { 
            low: '她立刻后退两步，手本能地摸向身后藏着的美工刀，眼神锐利得像刀子："别靠近。你再走一步，别怪我不客气。"', 
            mid: '确认你没有威胁后，她的肩膀稍稍放松了一些，但手指仍紧紧攥着包带："……你想要什么？物资的话，只接受以物易物，我不相信口头承诺。"', 
            high: '她犹豫了很久，才从贴身口袋里摸出一张皱巴巴的全家福，指尖轻轻摩挲着照片上男人和孩子的脸，声音低得像呢喃："我以前……不信任何人。但你不一样。答应我，别让我后悔。"' 
        },
        gifts: ['真丝丝巾', '未拆封香水', '银行卡包'], unlockLevel: 75, 
        backstory: '四大会计师事务所出身，三十岁就当上了某上市公司财务总监。灾难前一周刚把一笔巨额资金转到海外账户准备全家移民，结果第二天世界就变了。逃跑时被"幸存者"抢劫，所有值钱的东西都被拿走，只剩下丈夫送她的订婚戒指藏在鞋底。从此不再相信任何人，尤其是男人。' 
    },
    '大刘': { 
        trust: 35, affinity: 55, personality: '外粗内细', occupation: '重案组刑警', 
        age: 41, gender: '男', health: '右肩中过枪，阴天会酸',
        dialogue: { 
            low: '蒲扇大的手按住了腰间的枪套，浓眉拧成一团，上上下下地打量你："你这脸生得很啊……哪个区混的？老老实实说，别跟老子耍花腔。"', 
            mid: '豪爽地一巴掌拍在你背上，差点把你拍个趔趄，另一只手递过来一罐还没开的啤酒："哈哈！对老子胃口！走，喝两杯去！有什么事，酒桌上说！"', 
            high: '眼眶通红却死撑着不肯掉眼泪，举起酒碗跟你重重一碰，酒水洒了一身："兄弟！这辈子认你了！以后你的事就是老子的事！谁敢动你，我先崩了他！"' 
        },
        gifts: ['陈年老白干', '酱牛肉', '自卷旱烟'], unlockLevel: 65, 
        backstory: '从警十八年的老刑警，破过上百起大案要案，手上的枪比他自己的儿子还亲。妻子在他蹲点抓逃犯时难产去世，孩子没能保住。从此把警队当家，把搭档当兄弟，却在一次行动中亲手击毙了叛变的搭档，心里留下了一道坎，申请调去了档案室直到退休。' 
    },
    '王金贵': { 
        trust: 10, affinity: 20, personality: '精明市侩', occupation: '连锁超市老板', 
        age: 52, gender: '男', health: '糖尿病，需注射胰岛素',
        dialogue: { 
            low: '小眼睛滴溜溜地在你身上扫，算盘珠子在他手里噼里啪啦响个不停："买东西就挑，不买走人。小店小本经营，概不赊账，只收硬通货——烟、酒、药、子弹。"', 
            mid: '见你是回头客，脸上终于挤出了几分真心实意的笑，压低声音凑过来："看你是个实在人，老哥我给你透个底——昨天刚到一批好货，搁别人我都不拿出来。价格嘛……好说。"', 
            high: '难得地叹了口气，从柜台底下摸出两瓶好酒扔给你，不再提钱的事："钱是王八蛋，没了再赚。这年头……能找个说得上话的人不容易。以后有难处，尽管来找老哥。"' 
        },
        gifts: ['进口巧克力', '古巴雪茄', '精装白酒'], unlockLevel: 72, 
        backstory: '从摆地摊卖袜子起家，三十年做到全市拥有十二家连锁超市的"王半城"。这辈子什么都不信，除了钱。灾难爆发时躲在超市地下冷库里，靠着满仓物资活了下来，却眼睁睁看着糖尿病的老伴因为胰岛素被抢而死。从此把每一件物资都看得比命重，但夜深人静时总对着老伴的照片自言自语。' 
    },
    '林晓芳': { 
        trust: 25, affinity: 48, personality: '倔强不服输', occupation: '临床医学院学生', 
        age: 22, gender: '女', health: '轻微哮喘，需随身携带气雾剂',
        dialogue: { 
            low: '她紧紧抱着怀里的医学课本，后背贴着墙角，像只受惊的小猫，声音却刻意装得很镇定："我……我没什么值钱的东西。你要找食物的话，去别的地方吧。"', 
            mid: '发现你没有恶意，她怯生生地从包里摸出一颗橘子糖递过来，脸颊微红："那个……谢谢你上次帮我赶走那些人。这是我最后一颗糖了，很甜的。"', 
            high: '鼓起勇气拉住你的衣角，眼眶里闪着泪光却强忍着不掉下来："学长/学姐……我爸妈和老师都不在了。我只剩你了。以后我什么都听你的，你……你别丢下我好不好？"' 
        },
        gifts: ['手写医学笔记', '水果硬糖', '毛绒钥匙扣'], unlockLevel: 60, 
        backstory: '医科大学临床专业大三学生，刚上完系统解剖学就赶上了灾难。从小是温室里长大的乖乖女，父母都是中学老师，灾难当天为了让她逃跑而双双遇害。她怀里至今抱着那本系统解剖学课本，说那是爸爸送她的十八岁生日礼物，不能丢。虽然看起来很柔弱，但为了活下去，什么都愿意学。' 
    },
    '陈志远': { 
        trust: 48, affinity: 52, personality: '理性克制', occupation: '心脏外科主任', 
        age: 50, gender: '男', health: '慢性冠心病',
        dialogue: { 
            low: '他头也不抬地继续缝合着伤口，手术刀在手里稳得像天平，只扔下一句："外伤去那边等，心脏问题的话，先把病历给我。没病历的话，先说症状。"', 
            mid: '摘下手术手套扔进医疗废物桶，用消毒水反复洗了三遍手，才在你对面坐下，语气缓和了些："你的气色比上次好多了。看来上次开的药起作用了。说说看，最近饮食怎么样？"', 
            high: '罕见地摘下了金丝眼镜，用白大褂下摆擦了擦镜片，声音里带着一丝不易察觉的颤抖："我这双手……救过三千多条人命，却救不了自己的妻子和儿子。你能活着……很好。替他们，也替我，好好活下去。"' 
        },
        gifts: ['进口支架', '白蛋白', '专业手术器械'], unlockLevel: 78, 
        backstory: '国内顶尖的心外科专家，曾主刀过三千多台心脏手术，号称"陈一刀"。灾难发生时正在做一台紧急手术，整台手术团队只有他和一个护士活了下来。妻子是同院的儿科医生，为了保护住院的孩子被丧尸围攻牺牲；儿子当时正读高三，失联至今。他活下来的唯一信念，就是找到儿子，或者……确认他的下落。' 
    },
    '铁头': { 
        trust: 5, affinity: 15, personality: '残暴多疑', occupation: '掠夺者首领', 
        age: 34, gender: '男', health: '浑身旧伤，右耳少了一块',
        dialogue: { 
            low: '手里的开山刀一下下剁着旁边的木桌，木屑飞溅，三角眼里透着凶光："你他妈哪根葱？敢闯老子的地盘？留条胳膊就滚，不然——"', 
            mid: '吐了口带血的浓痰，把刀扛在肩上，语气稍微收敛了些："上次的事……算你狠。这次带了什么孝敬老子？要是够分量，咱以前的账就一笔勾销。"', 
            high: '突然仰天大笑，上前用力揽住你的肩膀，力气大得像要把骨头捏碎："哈哈哈哈！好！够狠够黑！我铁头这辈子没服过谁，你是第一个！以后咱兄弟俩联手，这一片的地盘……一人一半！"' 
        },
        gifts: ['走私金条', '散装白酒', '外国香烟'], unlockLevel: 90, 
        backstory: '原名赵铁柱，从小在农村被欺负大，十五岁就捅了人跑到城里混社会。从工地小工做到小包工头，后来越走越歪，拉起了一支二十几号人的队伍靠收保护费过活。灾难爆发当天他就觉得"天助我也"，第一个冲进超市打砸抢，手上沾了至少五十条幸存者的血。唯一的软肋是他乡下的老娘，他把老娘藏在一个谁也不知道的地方。' 
    },
    '赵寡妇': {
        trust: 18, affinity: 28, personality: '泼辣精明', occupation: '夜市小吃摊主',
        age: 45, gender: '女', health: '腰间盘突出',
        dialogue: {
            low: '她手里的大炒勺往铁锅上"哐当"一砸，横眉竖眼："看啥看？想吃东西就掏钱，没钱就滚蛋，别耽误老娘做生意！"',
            mid: '见你出手大方，她脸上的横肉松了松，抄起勺子盛了满满一碗："哎哟大兄弟/妹子，早说嘛！来，尝尝大姐我这手艺，正宗川菜，包你吃了还想！"',
            high: '深夜收摊时，她悄悄塞给你一个还热乎的肉包子，眼眶有些发红："好久没见着你这么实在的人了……这世道，好人不多了。以后到大姐这儿，管够。"'
        },
        gifts: ['老干妈辣酱', '腌腊肉', '手工包子'], unlockLevel: 68,
        backstory: '男人十年前在工地摔死了，她一个人拉扯大了一儿一女，在夜市摆了十年的炒饭摊，什么样的地痞流氓都见过。儿子去年刚考上大学去了外地，女儿才读初中，灾难发生时被她藏进了下水道。她每天冒着危险出去找食物，就为了让女儿能多长一寸肉。'
    },
    '阿彬': {
        trust: 12, affinity: 22, personality: '机灵油滑', occupation: '街头小偷',
        age: 19, gender: '男', health: '营养不良，瘦得像猴子',
        dialogue: {
            low: '他像条泥鳅一样从你身边溜过去，转眼就消失在巷子里，只留下一句远远飘来的："嘿！谢了啊大哥/大姐，你的钱包我先借两天用用！"',
            mid: '他挠着后脑勺从垃圾桶后面钻出来，脸上带着讨好的笑，手里还攥着你上次丢的打火机："嘿嘿……哥/姐，我把东西还给你，你别报警……不是，你别打我行不行？我知道哪儿有藏的物资，我带你去！"',
            high: '他突然跪在你面前，"咚咚咚"磕了三个响头，脸上全是泪："哥/姐！我长这么大，从来没人对我这么好过！我这条命以后就是你的！上刀山下油锅，我阿彬要是皱一下眉头，我就是你孙子！"'
        },
        gifts: ['偷来的打火机', '半包好烟', '捡到的金项链'], unlockLevel: 62,
        backstory: '生下来就没见过爹妈，在福利院待到十二岁就跑出来混社会了，偷鸡摸狗什么都干过，就是没干过正经事。最擅长的就是摸钱包和钻狗洞，整个旧城旮旮旯旯就没有他找不到的路。看起来油滑不靠谱，其实心里比谁都明白，谁对他好，他能记一辈子。'
    },
    '周老师': {
        trust: 42, affinity: 62, personality: '温文尔雅', occupation: '退休历史教授',
        age: 68, gender: '男', health: '腿脚不便，需拄拐杖',
        dialogue: {
            low: '他缓缓抬起头，老花镜滑到了鼻尖上，上下打量了你许久才慢悠悠开口："年轻人，找老朽有何贵干？若是想要书，架子上的……但请自取，不要伤了书页。"',
            mid: '他放下了手中的线装书，给你倒了一杯粗茶，手指在泛黄的书页上轻轻划过："这些书……我守了一辈子。若是你能让它们……传下去，就都拿去吧。"',
            high: '他从怀里取出一个用绸子包了三层的小匣子，郑重地交到你手里，里面是一枚校徽和一本手写的诗稿："这是我毕生的心血。老朽这把年纪怕是活不长了，这些……就托付给你了。"'
        },
        gifts: ['古籍善本', '文房四宝', '陈年普洱'], unlockLevel: 72,
        backstory: '某知名大学历史系教授，专攻宋史，退休后著书立说，一生桃李满天下。老伴走得早，儿子定居国外，他一个人守着一屋子的古籍过日子。灾难爆发后，别的什么都没拿，就推着一辆小推车，把他最珍贵的三万册书一本一本搬到了废弃的图书馆里，说"书在，人在"。'
    }
};

// ===== NPC 预设关系列表（开局可选起始关系）=====
const NPC_RELATIONSHIPS = [
    { from: '老张', to: '大刘', type: '忘年交', level: 75 },
    { from: '莉莉', to: '陈志远', type: '师徒', level: 85 },
    { from: '陈默', to: '老张', type: '前同事', level: 45 },
    { from: '大刘', to: '陈默', type: '酒友', level: 55 },
    { from: '林晓芳', to: '陈志远', type: '师生', level: 80 },
    { from: '林晓芳', to: '莉莉', type: '闺蜜', level: 70 },
    { from: '王金贵', to: '铁头', type: '暗中交易', level: 35 },
    { from: '大刘', to: '铁头', type: '死对头', level: 5 },
    { from: '苏梅', to: '王金贵', type: '债主', level: 25 },
    { from: '赵寡妇', to: '王金贵', type: '邻居', level: 40 },
    { from: '阿彬', to: '赵寡妇', type: '接济关系', level: 60 },
    { from: '周老师', to: '林晓芳', type: '隔代亲', level: 55 },
    { from: '陈志远', to: '周老师', type: '旧识', level: 48 },
    { from: '陈默', to: '阿彬', type: '师徒', level: 62 },
    { from: '苏梅', to: '莉莉', type: '室友', level: 30 }
];

// ===== 成就列表 =====
const ACHIEVEMENTS = [
    { id: 'first_blood', name: '初露锋芒', desc: '首次击倒敌人', icon: '⚔️', check: () => { const s = gst(); return s.totalKills >= 1; } },
    { id: 'survivor_3', name: '三日幸存者', desc: '存活3天', icon: '🌅', check: () => { const c = gclk(); return c.day >= 3; } },
    { id: 'survivor_7', name: '一周幸存者', desc: '存活7天', icon: '🏆', check: () => { const c = gclk(); return c.day >= 7; } },
    { id: 'survivor_30', name: '月度幸存者', desc: '存活30天', icon: '👑', check: () => { const c = gclk(); return c.day >= 30; } },
    { id: 'first_craft', name: '手艺初成', desc: '首次成功合成', icon: '🔨', check: () => { const s = gst(); return (s.crafts || 0) >= 1; } },
    { id: 'craft_master', name: '制造大师', desc: '累计合成10件物品', icon: '⚒️', check: () => { const s = gst(); return (s.crafts || 0) >= 10; } },
    { id: 'collector', name: '收藏家', desc: '收集20种不同物品', icon: '📦', check: () => { const s = gst(); return new Set((s.inv || []).map(i => i.replace(/\s*(x\d+|\d+\.?\d*\s*[kKmMgGlL升克千克]?)$/i, '').trim())).size >= 20; } },
    { id: 'explorer', name: '探索者', desc: '解锁10个地点', icon: '🗺️', check: () => { const s = gst(); return (s.mapUnlock || []).length >= 10; } },
    { id: 'peacemaker', name: '调解者', desc: '建立2个以上NPC的信任关系', icon: '🤝', check: () => { const count = Object.values(NPC_DATA).filter(n => n.trust >= 50).length; return count >= 2; } },
    { id: 'badass', name: '狠角色', desc: '击杀10名敌人', icon: '💀', check: () => { const s = gst(); return (s.totalKills || 0) >= 10; } },
    { id: 'hardcore', name: '硬核玩家', desc: '存活且从未感染', icon: '🔥', check: () => { const s = gst(); return (s.infection || 0) === 0 && gclk().day >= 5; } },
    { id: 'gear_head', name: '装备达人', desc: '同时装备4件物品', icon: '🛡️', check: () => { const s = gst(); const eq = s.equip; if (!eq) return false; return Object.values(eq).filter(v => v && v.trim()).length >= 4; } }
];

// ===== 结局条件与模板 =====
const ENDING_CONDITIONS = [
    { id: 'hero', name: '英雄结局', icon: '🏆', color: '#d4a03a',
        intro: '你成为了末日中的传奇英雄。',
        detail: '在{days}天的求生中，你消灭了{kills}个敌人，拯救了{trust}名幸存者。你以无畏的勇气和坚定的信念，在废墟中建立起新的秩序。',
        poem: '"在黑暗中，你是那道最后的光芒。"',
        requirement: '存活30天以上，信任3个以上NPC，击杀>20' },
    { id: 'leader', name: '领袖结局', icon: '👑', color: '#3a7c3a',
        intro: '你成为了幸存者们的领袖。',
        detail: '在{days}天的磨难中，你身边聚集了{trust}名忠实的伙伴。你的每一个决定都影响着他们的生死。',
        poem: '"追随你的人不会迷失方向。"',
        requirement: '存活20天以上，拥有2名以上高信任NPC' },
    { id: 'solo', name: '独行结局', icon: '🌙', color: '#8a5a3a',
        intro: '你独自在末日中生存。',
        detail: '在{days}天的独处中，你学会了只有自己才能依靠。孤独是你的挚友，警觉是你的铠甲。',
        poem: '"独自一人，也可以是一种力量。"',
        requirement: '存活15天以上，独自生存' },
    { id: 'tragedy', name: '悲剧结局', icon: '💀', color: '#5a5a5a',
        intro: '你的故事在第{days}天戛然而止。',
        detail: '末日从不怜悯任何人。你的挣扎最终化为尘埃，成为这片废墟中无数沉默的故事之一。',
        poem: '"我们都是末日的过客。"',
        requirement: '存活不足15天' },
    { id: 'escape', name: '逃离结局', icon: '🚁', color: '#3a5a9d',
        intro: '你成功逃离了这片废墟！',
        detail: '经过{days}天的艰苦跋涉，你终于抵达了安全区。身上带着{kills}个敌人的战绩和{inv}件珍贵的物资。',
        poem: '"新生，从今天开始。"',
        requirement: '发现避难所并存活20天' },
    { id: 'betrayal', name: '背叛结局', icon: '🗡️', color: '#9d3a3a',
        intro: '你被最信任的人背叛了。',
        detail: '在{days}天的共患难后，{betrayer}在关键时刻选择了背叛。这个世界上，信任是最奢侈的东西。',
        poem: '"地狱空荡荡，恶魔在人间。"',
        requirement: 'NPC背叛事件' },
    { id: 'savior', name: '救世主结局', icon: '✨', color: '#d4a03a',
        intro: '你拯救了整个避难所！',
        detail: '在{days}天的战斗中，你带领幸存者们击退了尸潮，守住了家园。你的名字将被永远铭记。',
        poem: '"救世主从未独行。"',
        requirement: '击退大规模尸潮' }
];

// ===== 将共享常量绑定到 window，供多文件引用 =====
Object.assign(window, {
  DPROMPT, ABILITIES, NORMAL_SKILLS,
  DCLK, CATS, CAT_KW, SUB_ICONS, ITEM_EMOJI, ITEM_PRESETS,
  STATUS_EFFECTS, WEAPON_DATA, CRAFT_RECIPES, RANDOM_EVENTS,
  NPC_DATA, NPC_RELATIONSHIPS, ACHIEVEMENTS, ENDING_CONDITIONS,
  POS_TRAITS, NEG_TRAITS, PROFESSIONS, JOB_PRESETS,
  NPC_TEMPLATE, NPC_EXAMPLES
});

})();
