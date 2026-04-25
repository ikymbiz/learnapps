# DD Learn

> 子ども向け学習プラットフォーム  
> 教科ごとの学習アプリをカード形式で集約し、Googleログインで日々のポイントを記録できる PWA。

🌐 **URL**: https://dd-learn.com

---

## 📖 概要

DD Learn は、複数の学習アプリを 1 つのハブにまとめて表示する PWA です。

- **教科別グループ** で学習アプリを整理（さんすう・こくご・りか・しゃかい・えいご）
- **科目外の便利ツール** も同じ画面に並べられる
- **Google ログインで日々のポイントを端末に記録**（サーバー保存なし）
- **過去 1 週間の学習履歴を折れ線グラフ表示**
- **PWA としてホーム画面にインストール可能**

---

## 🗂 ファイル構成

```
dd-learn/
├── index.html        メインアプリ（HTML/CSS/JS 統合）
├── apps.json         教科グループとアプリ一覧の定義
├── config.json       アプリ名・キャッチコピー等の設定
├── manifest.json     PWA マニフェスト
├── sw.js             Service Worker（オフライン対応）
├── icon-192.png      PWA アイコン（Android 必須）
├── icon-512.png      PWA アイコン（スプラッシュ用）
├── icon.svg          PWA アイコン（フォールバック）
├── assets/           画像素材フォルダ
│   ├── hero-banner-illustrated.png  ヒーローバナー（イラスト版）
│   └── hero-banner-simple.png       ヒーローバナー（シンプル版）
├── README.md         このファイル
├── STRUCTURE.md      サイト構成定義（編集して構造を変更）
├── AI_CONTEXT.md     コード生成 AI 向けドキュメント
└── admin/            管理画面（GitHub PATで JSON を編集）
    ├── index.html
    └── README.md
```

---

## 🚀 デプロイ手順

### 1. リポジトリ準備

```bash
git clone https://github.com/<USER>/<REPO>.git
cd <REPO>
# ファイルを配置してコミット
git add .
git commit -m "init"
git push
```

### 2. GitHub Pages 有効化

リポジトリの **Settings → Pages** で：

- Branch: `main` / Folder: `/ (root)` を選択
- Custom domain に `dd-learn.com` を入力（任意）
- DNS check が緑になったら **Enforce HTTPS** にチェック

### 3. Google OAuth 設定

[Google Cloud Console](https://console.cloud.google.com) で：

1. 「APIとサービス → 認証情報」 → OAuth 2.0 クライアント ID 作成
2. **承認済みの JavaScript 生成元** に以下を追加：
   - `https://dd-learn.com`
   - `https://<USER>.github.io`（GitHub Pages 直アクセス用）
3. 取得した Client ID を `config.json` の `googleClientId` に貼付

---

## ✏️ よくある編集タスク

### アプリ名・キャッチコピーを変更

`config.json` を編集するだけ：

```json
{
  "appName": "DD Learn",
  "heroTitle": "毎日少しずつ、",
  "heroTitleEm": "ぐんぐん<br>かしこく！",
  "themeColor": "#39a7ff",
  "mascot": "🦊"
}
```

### 教科を追加

`apps.json` の配列に 1 ブロック追加：

```json
{
  "id": "music",
  "type": "subject",
  "name": "おんがく",
  "icon": "🎵",
  "color": "#a855f7",
  "apps": [
    { "id": "...", "name": "...", "icon": "...", "description": "...", "url": "...", "level": "5分", "reward": "🎼 10" }
  ]
}
```

### 個別アプリを追加

該当グループの `apps[]` に 1 ブロック追加。

### サイト構成（セクションの並び・追加・削除）

`STRUCTURE.md` を編集 → AI に「STRUCTURE.md に従って index.html を更新して」と依頼。

### 管理画面で apps/config を編集

`https://dd-learn.com/admin/` にアクセス。GitHub PAT を入力すれば、ブラウザから直接 `apps.json` / `config.json` を編集してコミットできます。詳細は [admin/README.md](./admin/README.md) を参照。

---

## 🔐 プライバシー

- Google ログインで取得するのは **UID・名前・アバター画像のみ**
- これらは **画面表示と localStorage キーにのみ使用**
- 学習データはすべて **端末の localStorage** に保存（サーバー送信なし）
- ログアウトすればダッシュボードは非表示、再ログイン時に同じ Google アカウントなら復元される

---

## 🛠 技術スタック

- バニラ HTML / CSS / JavaScript（フレームワーク不使用）
- [Google Identity Services](https://developers.google.com/identity/gsi/web) — 認証
- [Chart.js](https://www.chartjs.org/) — 折れ線グラフ
- localStorage — データ永続化
- Service Worker — オフライン対応 / PWA

---

## 📄 ライセンス

© 2026 DD Learn
