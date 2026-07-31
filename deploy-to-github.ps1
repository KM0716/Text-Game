# 末日文字模拟器 - GitHub Pages 部署脚本
# 使用方法：右键点击 PowerShell，运行 ./deploy-to-github.ps1

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host " 末日文字模拟器 - GitHub Pages 部署" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 检查 git 是否可用
try {
    $gitVersion = git --version
    Write-Host "✓ Git 已安装: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Git 未安装！请先安装 Git: https://git-scm.com/download/win" -ForegroundColor Red
    exit 1
}

# 检查当前目录
$projectDir = Get-Location
Write-Host "项目目录: $projectDir" -ForegroundColor Gray

# 检查必要文件
$requiredFiles = @("game.html", "index.html", "404.html", "README.md")
$missingFiles = @()
foreach ($f in $requiredFiles) {
    if (-not (Test-Path $f)) { $missingFiles += $f }
}
if ($missingFiles.Count -gt 0) {
    Write-Host "✗ 缺少必要文件: $($missingFiles -join ', ')" -ForegroundColor Red
    exit 1
}
Write-Host "✓ 所有必要文件已就绪" -ForegroundColor Green

# 检查 BGM 目录
if (Test-Path "BGM") {
    $bgmCount = (Get-ChildItem "BGM\*.mp3" -ErrorAction SilentlyContinue).Count
    $bgmSize = [math]::Round(((Get-ChildItem "BGM" -Recurse | Measure-Object -Property Length -Sum).Sum) / 1MB, 2)
    Write-Host "✓ BGM 目录: $bgmCount 首 MP3, ${bgmSize}MB" -ForegroundColor Green
    if ($bgmSize -gt 500) {
        Write-Host "  ⚠ BGM 文件较大 (${bgmSize}MB)，建议使用 Git LFS 或外部存储" -ForegroundColor Yellow
    }
}

# 获取 GitHub 用户名
$username = Read-Host "`n请输入你的 GitHub 用户名"
$repoName = Read-Host "请输入仓库名（建议：doomsday-text-sim 或 game）"

# 验证输入
if ([string]::IsNullOrWhiteSpace($username) -or [string]::IsNullOrWhiteSpace($repoName)) {
    Write-Host "✗ 用户名和仓库名不能为空" -ForegroundColor Red
    exit 1
}

Write-Host "`n即将部署到: https://github.com/$username/$repoName" -ForegroundColor Yellow
$confirm = Read-Host "确认继续？(Y/N)"
if ($confirm -ne 'Y' -and $confirm -ne 'y') {
    Write-Host "已取消" -ForegroundColor Gray
    exit 0
}

# 初始化 git 仓库
if (-not (Test-Path ".git")) {
    Write-Host "`n初始化 Git 仓库..." -ForegroundColor Cyan
    git init
    git branch -M main
} else {
    Write-Host "Git 仓库已存在，更新中..." -ForegroundColor Cyan
}

# 添加 .gitignore
if (-not (Test-Path ".gitignore")) {
    $gitignoreContent = @"
.DS_Store
Thumbs.db
*.log
node_modules/
"@
    Set-Content -Path ".gitignore" -Value $gitignoreContent -Encoding UTF8
}

# 添加所有文件
Write-Host "添加文件..." -ForegroundColor Cyan
git add -A

# 提交
$commitMsg = "feat: 末日文字模拟器 v1.0 - 完整游戏 + BGM + 部署配置"
git commit -m $commitMsg 2>&1 | Out-Null

# 添加远程仓库
$remoteUrl = "https://github.com/$username/$repoName.git"
try {
    git remote remove origin 2>$null
} catch {}
git remote add origin $remoteUrl

# 推送到 GitHub
Write-Host "`n推送到 GitHub..." -ForegroundColor Cyan
Write-Host "提示: 如果需要认证，请在浏览器中完成 GitHub 授权" -ForegroundColor Gray
Write-Host "或者使用 Personal Access Token: https://github.com/settings/tokens" -ForegroundColor Gray

git push -u origin main 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n========================================" -ForegroundColor Green
    Write-Host " 部署成功！" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "`n接下来：" -ForegroundColor Yellow
    Write-Host "1. 访问 https://github.com/$username/$repoName/settings/pages" -ForegroundColor White
    Write-Host "2. Source 选择 'Deploy from a branch'" -ForegroundColor White
    Write-Host "3. Branch 选择 'main' / '/ (root)'" -ForegroundColor White
    Write-Host "4. 点击 Save 等待部署完成" -ForegroundColor White
    Write-Host "`n部署完成后访问: https://$username.github.io/$repoName/" -ForegroundColor Cyan
} else {
    Write-Host "`n推送失败，请检查:" -ForegroundColor Red
    Write-Host "- 网络连接" -ForegroundColor Yellow
    Write-Host "- GitHub 用户名和仓库名是否正确" -ForegroundColor Yellow
    Write-Host "- 是否已创建仓库: https://github.com/new" -ForegroundColor Yellow
    Write-Host "- 是否有推送权限（使用 Personal Access Token）" -ForegroundColor Yellow
}

Write-Host "`n完成" -ForegroundColor Gray
