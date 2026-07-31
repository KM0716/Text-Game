# 末日文字模拟器 (Doomsday Text Simulator)

一款基于 AI 的末日生存文字冒险游戏。角色设定、世界沙盒、战斗与探索，所有决策都将影响你的生存。

## 🎮 功能特性

- **角色创建**：自定义姓名、性别、年龄、外貌、技能、特质、背景故事
- **世界沙盒**：12 种预设世界模板（丧尸、真菌灾变、核战废土、AI 叛乱等）
- **实时叙事**：由 AI 驱动的剧情生成，每一步选择都会影响故事走向
- **物品系统**：背包、装备、合成、使用效果全链路实现
- **战斗系统**：回合制战斗、状态效果、Boss 战
- **线索系统**：可拖拽的线索便签板，剧情推进时自动更新
- **天气/季节**：昼夜循环、天气变化、季节更替
- **BGM 系统**：36 首背景音乐，按场景/情绪自动切换
- **存档系统**：本地自动存档，支持多槽位
- **API 配置**：支持 OpenAI / DeepSeek / Ollama 等多种服务商
- **移动适配**：响应式布局，手机/平板/PC 均可游玩

## 🎵 背景音乐列表

游戏内置 36 首 BGM，分为以下场景分类：

| 分类 | 说明 | 包含曲目 |
|------|------|----------|
| title | 主菜单 | bgm_title1, bgm_intro1 |
| explore | 探索废墟 | bgm_explore1, bgm_journey1, bgm_mystery1 |
| camp | 营地/安全屋 | bgm_camp1, bgm_healing1, bgm_calm1 |
| combat | 战斗 | bgm_combat1, bgm_combat2, bgm_action1-3 |
| boss | Boss 战 | bgm_boss1-3 |
| danger | 危机/紧张 | bgm_danger1-2, bgm_ambush1, bgm_tense1-3 |
| sad | 悲伤/回忆 | bgm_sad1-2, bgm_memorial1, bgm_memory1 |
| hope | 希望/新生 | bgm_hope1, bgm_camp1 |
| horror | 恐怖/绝望 | bgm_horror1, bgm_chaos1, bgm_despair1 |
| story | 剧情/NPC | bgm_story1, bgm_negotiate1, bgm_cultural1, bgm_guard1 |
| rain | 雨声 | bgm_rain1 |
| survival | 生存/户外 | bgm_survival1 |

BGM 会根据玩家位置、季节、天气、血量和心情自动切换。也可点击顶栏 🎵 按钮手动选择。

> ⚠️ BGM 仅供个人学习与交流使用，请勿用于商业用途或公开分发。

## 🚀 部署方法

### 方法 1：GitHub Pages（推荐）

#### 步骤一：创建 GitHub 仓库

1. 登录 [github.com](https://github.com)
2. 点击右上角 "+" → "New repository"
3. 填写仓库名（建议：`doomsday-text-sim`）
4. 选择 **Public** 或 **Private**（公开/私有）
5. 勾选 **Add a README file**，点击 **Create repository**

#### 步骤二：上传项目（3 种方式）

**方式 A：使用部署脚本（Windows，推荐）**
```powershell
# 进入项目目录
cd 项目路径

# 运行部署脚本
powershell -ExecutionPolicy Bypass -File deploy-to-github.ps1

# 按提示输入 GitHub 用户名和仓库名
```

**方式 B：命令行手动上传**
```bash
# 初始化 Git
cd 项目路径
git init
git branch -M main
git add -A
git commit -m "feat: 末日文字模拟器 v1.0"
git remote add origin https://github.com/你的用户名/仓库名.git
git push -u origin main
```

**方式 C：GitHub Desktop（GUI）**
1. 打开 GitHub Desktop
2. File → Add Local Repository → 选择项目目录
3. 点击 "Publish repository" → 选择你的 GitHub 账号
4. 填写仓库名，点击 Publish

#### 步骤三：启用 GitHub Pages

1. 打开仓库页面 → **Settings** → **Pages**
2. **Source** 选择 **Deploy from a branch**
3. **Branch** 选择 **main** / **/ (root)**
4. 点击 **Save**
5. 等待 1-5 分钟，页面提示：
   > ✅ Your site is live at https://你的用户名.github.io/仓库名/

#### 步骤四：访问游戏

打开浏览器访问：`https://你的用户名.github.io/仓库名/`

> 💡 **首次进入游戏**：需要配置 AI 服务商（见下方 API 配置部分），配置会自动保存，下次无需重复输入。

### 方法 2：Vercel / Netlify / Cloudflare Pages

1. 注册账号
2. 新建项目，上传或连接 GitHub 仓库
3. 直接部署，无需额外配置

### 方法 3：静态托管（阿里云 OSS / 腾讯云 COS）

1. 创建 Bucket，开启静态网站托管
2. 默认首页设置为 `index.html`
3. 将所有文件上传至 Bucket

### 方法 4：本地测试

```bash
# Python 3
python -m http.server 8000

# 或 Node.js
npx serve .
```

然后访问 `http://localhost:8000`。

## 📁 项目结构

```
├── index.html                  # 入口页（自动跳转到 game.html）
├── game.html                   # 游戏主文件（单文件实现，约 10000+ 行）
├── 404.html                    # 404 错误页面
├── robots.txt                  # 搜索引擎爬虫规则
├── sitemap.xml                 # 网站地图
├── .nojekyll                   # GitHub Pages 绕过 Jekyll 处理
├── .gitignore                  # Git 忽略规则
├── README.md                   # 项目说明文档
├── deploy-to-github.ps1        # GitHub 部署辅助脚本（Windows PowerShell）
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Actions 自动部署工作流
├── BGM/                        # 背景音乐目录（36 首 mp3，约 270MB）
└── README.md
```

## ⚙️ API 配置

首次进入游戏时需要配置 AI 服务商：

1. **服务商预设**：选择 OpenAI / DeepSeek / Ollama
2. **端点地址**：通常自动填充，也可手动输入
3. **模型**：选择或输入模型名（如 `gpt-4o`、`deepseek-chat`）
4. **API 密钥**：粘贴你的 API Key（仅保存在浏览器本地）

**API 配置持久化**：
- 配置完成后自动保存至浏览器 `localStorage`
- 刷新/重开页面后自动读取，无需重复输入
- 清除浏览器数据会丢失配置，建议使用"导出存档"功能备份
- 多浏览器/多设备需要分别配置

## 💾 存档说明

- 游戏会在每次 AI 回复后自动存档到 `auto` 槽位
- 所有存档保存在浏览器 `localStorage`（约 5MB 限制）
- 数据包含：角色状态、位置、线索、装备、对话历史、沙盒设置
- **配额保护**：历史对话自动裁剪，超过阈值时自动清理备份
- **备份机制**：关键数据均有 `_bak` 副本，损坏时自动恢复
- **导出/导入**：设置面板可导出/导入完整存档（JSON 格式）
- 清除浏览器数据会丢失存档，请定期使用导出功能备份

## 🎯 快捷操作

| 按钮 | 功能 |
|------|------|
| 观察 | 观察周围环境 |
| 线索 | 回顾已知线索 |
| 状态 | 查看身体状况 |
| 聆听 | 聆听周围动静 |
| 决策 | 请求 AI 给出 3-5 条行动建议 |
| 🎵 | 开启/关闭 BGM（长按或右键打开选择面板）|
| 🔊 | 开启/关闭音效 |
| 挂机 | 开启自动挂机 |

## 🔧 BGM 系统说明

游戏内置 36 首 BGM，按场景自动切换：
- **自动切换触发点**：位置变化、天气变化、心态变化
- **手动选择**：长按顶栏 🎵 按钮或右键点击打开选择面板
- **音量调节**：BGM 选择面板底部滑块
- **首次启动**：遵循浏览器自动播放策略，首次点击页面后播放

## 📝 版权声明

- 游戏代码：仅供个人学习与研究
- BGM：版权归原作者所有，仅供个人娱乐，请勿商用或公开分发
- 字体：使用开源字体 Cubic 11（SIL Open Font License）

## ⚠️ 常见问题

**Q: 页面加载很慢？**
A: BGM 文件较大（约 270MB），首次访问需要下载。建议使用 Chrome/Edge 并启用缓存。

**Q: API 配置能保存吗？**
A: 能。配置保存后自动跳过欢迎弹窗，刷新后直接进入游戏。

**Q: 存档会丢吗？**
A: 清除浏览器数据会丢失。建议定期通过设置面板导出存档 JSON 文件备份。

**Q: 手机能玩吗？**
A: 可以。游戏已适配移动端，响应式布局支持触屏操作。

**Q: BGM 不播放？**
A: 浏览器要求首次交互后才能播放音频。点击页面任意位置即可启动。
