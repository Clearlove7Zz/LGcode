<p align="center">
  <a href="https://modelhub.lgdg.cc">
    <picture>
      <source srcset="packages/console/app/src/asset/logo-ornate-dark.svg" media="(prefers-color-scheme: dark)">
      <source srcset="packages/console/app/src/asset/logo-ornate-light.svg" media="(prefers-color-scheme: light)">
      <img src="packages/console/app/src/asset/logo-ornate-light.svg" alt="Loongcode logo">
    </picture>
  </a>
</p>
<p align="center">オープンソースのAIコーディングエージェント。</p>
<p align="center">
  <a href="https://modelhub.lgdg.cc/discord"><img alt="Discord" src="https://img.shields.io/discord/1391832426048651334?style=flat-square&label=discord" /></a>
  <a href="https://www.npmjs.com/package/loongcode-ai"><img alt="npm" src="https://img.shields.io/npm/v/loongcode-ai?style=flat-square" /></a>
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

### インストール

```bash
# YOLO
curl -fsSL https://modelhub.lgdg.cc/install | bash

# パッケージマネージャー
npm i -g loongcode-ai@latest        # bun/pnpm/yarn でもOK
scoop install loongcode             # Windows
choco install loongcode             # Windows
brew install anomalyco/tap/loongcode # macOS と Linux（推奨。常に最新）
brew install loongcode              # macOS と Linux（公式 brew formula。更新頻度は低め）
sudo pacman -S loongcode            # Arch Linux (Stable)
paru -S loongcode-bin               # Arch Linux (Latest from AUR)
mise use -g loongcode               # どのOSでも
nix run nixpkgs#loongcode           # または github:Clearlove7Zz/LoongCode で最新 dev ブランチ
```

> [!TIP]
> インストール前に 0.1.x より古いバージョンを削除してください。

### デスクトップアプリ (BETA)

Loongcode はデスクトップアプリとしても利用できます。[releases page](https://github.com/Clearlove7Zz/LoongCode/releases) から直接ダウンロードするか、[modelhub.lgdg.cc/download](https://modelhub.lgdg.cc/download) を利用してください。

| プラットフォーム      | ダウンロード                       |
| --------------------- | ---------------------------------- |
| macOS (Apple Silicon) | `loongcode-desktop-mac-arm64.dmg`   |
| macOS (Intel)         | `loongcode-desktop-mac-x64.dmg`     |
| Windows               | `loongcode-desktop-windows-x64.exe` |
| Linux                 | `.deb`、`.rpm`、または AppImage    |

```bash
# macOS (Homebrew)
brew install --cask loongcode-desktop
# Windows (Scoop)
scoop bucket add extras; scoop install extras/loongcode-desktop
```

#### インストールディレクトリ

インストールスクリプトは、インストール先パスを次の優先順位で決定します。

1. `$LOONGCODE_INSTALL_DIR` - カスタムのインストールディレクトリ
2. `$XDG_BIN_DIR` - XDG Base Directory Specification に準拠したパス
3. `$HOME/bin` - 標準のユーザー用バイナリディレクトリ（存在する場合、または作成できる場合）
4. `$HOME/.loongcode/bin` - デフォルトのフォールバック

```bash
# 例
LOONGCODE_INSTALL_DIR=/usr/local/bin curl -fsSL https://modelhub.lgdg.cc/install | bash
XDG_BIN_DIR=$HOME/.local/bin curl -fsSL https://modelhub.lgdg.cc/install | bash
```

### Agents

Loongcode には組み込みの Agent が2つあり、`Tab` キーで切り替えられます。

- **build** - デフォルト。開発向けのフルアクセス Agent
- **plan** - 分析とコード探索向けの読み取り専用 Agent
  - デフォルトでファイル編集を拒否
  - bash コマンド実行前に確認
  - 未知のコードベース探索や変更計画に最適

また、複雑な検索やマルチステップのタスク向けに **general** サブ Agent も含まれています。
内部的に使用されており、メッセージで `@general` と入力して呼び出せます。

[agents](https://modelhub.lgdg.cc/docs/agents) の詳細はこちら。

### ドキュメント

Loongcode の設定については [**ドキュメント**](https://modelhub.lgdg.cc/docs) を参照してください。

### コントリビュート

Loongcode に貢献したい場合は、Pull Request を送る前に [contributing docs](./CONTRIBUTING.md) を読んでください。

### Loongcode の上に構築する

Loongcode に関連するプロジェクトで、名前に "loongcode"（例: "loongcode-dashboard" や "loongcode-mobile"）を含める場合は、そのプロジェクトが Loongcode チームによって作られたものではなく、いかなる形でも関係がないことを README に明記してください。

---

**コミュニティに参加** [Discord](https://discord.gg/loongcode) | [X.com](https://x.com/loongcode)
