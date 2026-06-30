<p align="center">
  <a href="https://modelhub.lgdg.cc">
    <picture>
      <source srcset="packages/console/app/src/asset/logo-ornate-dark.png" media="(prefers-color-scheme: dark)">
      <source srcset="packages/console/app/src/asset/logo-ornate-light.png" media="(prefers-color-scheme: light)">
      <img src="packages/console/app/src/asset/logo-ornate-light.png" alt="Loongcode logo">
    </picture>
  </a>
</p>
<p align="center">开源的 AI Coding Agent。</p>
<p align="center">
  <a href="https://modelhub.lgdg.cc/discord"><img alt="Discord" src="https://img.shields.io/discord/1391832426048651334?style=flat-square&label=discord" /></a>
  <a href="https://www.npmjs.com/package/loongcode"><img alt="npm" src="https://img.shields.io/npm/v/loongcode?style=flat-square" /></a>
  <a href="https://github.com/Clearlove7Zz/LoongCode/actions/workflows/publish.yml"><img alt="Build status" src="https://img.shields.io/github/actions/workflow/status/Clearlove7Zz/LoongCode/publish.yml?style=flat-square&branch=dev" /></a>
</p>

<p align="center">
  <a href="README.md">English</a> |
  <a href="README.zh.md">简体中文</a> |
  <a href="README.zht.md">繁體中文</a> |
  <a href="README.ko.md">한국어</a> |
  <a href="README.de.md">Deutsch</a> |
  <a href="README.es.md">Español</a> |
  <a href="README.fr.md">Français</a> |
  <a href="README.it.md">Italiano</a> |
  <a href="README.da.md">Dansk</a> |
  <a href="README.ja.md">日本語</a> |
  <a href="README.pl.md">Polski</a> |
  <a href="README.ru.md">Русский</a> |
  <a href="README.bs.md">Bosanski</a> |
  <a href="README.ar.md">العربية</a> |
  <a href="README.no.md">Norsk</a> |
  <a href="README.br.md">Português (Brasil)</a> |
  <a href="README.th.md">ไทย</a> |
  <a href="README.tr.md">Türkçe</a> |
  <a href="README.uk.md">Українська</a> |
  <a href="README.bn.md">বাংলা</a> |
  <a href="README.gr.md">Ελληνικά</a> |
  <a href="README.vi.md">Tiếng Việt</a>
</p>

[![Loongcode Terminal UI](packages/web/src/assets/lander/screenshot.png)](https://modelhub.lgdg.cc)

---

### 安装

```bash
# 直接安装 (YOLO)
curl -fsSL https://modelhub.lgdg.cc/install | bash

# 软件包管理器
npm i -g loongcode@latest        # 也可使用 bun/pnpm/yarn
scoop install loongcode             # Windows
choco install loongcode             # Windows
brew install anomalyco/tap/loongcode # macOS 和 Linux（推荐，始终保持最新）
brew install loongcode              # macOS 和 Linux（官方 brew formula，更新频率较低）
sudo pacman -S loongcode            # Arch Linux (Stable)
paru -S loongcode-bin               # Arch Linux (Latest from AUR)
mise use -g loongcode               # 任意系统
nix run nixpkgs#loongcode           # 或用 github:Clearlove7Zz/LoongCode 获取最新 dev 分支
```

> [!TIP]
> 安装前请先移除 0.1.x 之前的旧版本。

### 桌面应用程序 (BETA)

Loongcode 也提供桌面版应用。可直接从 [发布页 (releases page)](https://github.com/Clearlove7Zz/LoongCode/releases) 或 [modelhub.lgdg.cc/download](https://modelhub.lgdg.cc/download) 下载。

| 平台                  | 下载文件                           |
| --------------------- | ---------------------------------- |
| macOS (Apple Silicon) | `loongcode-desktop-mac-arm64.dmg`   |
| macOS (Intel)         | `loongcode-desktop-mac-x64.dmg`     |
| Windows               | `loongcode-desktop-windows-x64.exe` |
| Linux                 | `.deb`、`.rpm` 或 AppImage         |

```bash
# macOS (Homebrew Cask)
brew install --cask loongcode-desktop
# Windows (Scoop)
scoop bucket add extras; scoop install extras/loongcode-desktop
```

#### 安装目录

安装脚本按照以下优先级决定安装路径：

1. `$LOONGCODE_INSTALL_DIR` - 自定义安装目录
2. `$XDG_BIN_DIR` - 符合 XDG 基础目录规范的路径
3. `$HOME/bin` - 如果存在或可创建的用户二进制目录
4. `$HOME/.loongcode/bin` - 默认备用路径

```bash
# 示例
LOONGCODE_INSTALL_DIR=/usr/local/bin curl -fsSL https://modelhub.lgdg.cc/install | bash
XDG_BIN_DIR=$HOME/.local/bin curl -fsSL https://modelhub.lgdg.cc/install | bash
```

### Agents

Loongcode 内置两种 Agent，可用 `Tab` 键快速切换：

- **build** - 默认模式，具备完整权限，适合开发工作
- **plan** - 只读模式，适合代码分析与探索
  - 默认拒绝修改文件
  - 运行 bash 命令前会询问
  - 便于探索未知代码库或规划改动

另外还包含一个 **general** 子 Agent，用于复杂搜索和多步任务，内部使用，也可在消息中输入 `@general` 调用。

了解更多 [Agents](https://modelhub.lgdg.cc/docs/agents) 相关信息。

### 文档

更多配置说明请查看我们的 [**官方文档**](https://modelhub.lgdg.cc/docs)。

### 参与贡献

如有兴趣贡献代码，请在提交 PR 前阅读 [贡献指南 (Contributing Docs)](./CONTRIBUTING.md)。

### 基于 Loongcode 进行开发

如果你在项目名中使用了 “loongcode”（如 “loongcode-dashboard” 或 “loongcode-mobile”），请在 README 里注明该项目不是 Loongcode 团队官方开发，且不存在隶属关系。

---

**加入我们的社区** [飞书](https://applink.feishu.cn/client/chat/chatter/add_by_link?link_token=738j8655-cd59-4633-a30a-1124e0096789&qr_code=true) | [X.com](https://x.com/loongcode)
