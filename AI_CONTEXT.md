# AI_CONTEXT.md — コード生成 AI 向けドキュメント

このファイルは、Claude/ChatGPT 等の AI に DD Learn の編集・拡張を依頼するときに**最初に読ませる**ためのものです。

---

## プロジェクト概要

- **名称**: DD Learn（dd-learn.com）
- **目的**: 子ども向けの学習アプリハブ。教科別カードから外部学習アプリを起動し、Google ログインしたユーザーは日々のポイントを記録できる
- **対象ユーザー**: 主に小学生
- **デプロイ環境**: GitHub Pages（静的ホスティングのみ、サーバーロジック不可）
- **総コード規模**: 約 700 行（HTML+CSS+JS 統合の単一ファイル）

---

## アーキテクチャの大原則

### 1. 静的ファイルのみ

- バックエンドサーバーは存在しない
- すべて GitHub Pages で配信される静的ファイル
- データ永続化は **localStorage のみ**（クラウド保存しない）

### 2. 設定駆動

- アプリ名・キャッチコピー・テーマカラー → **`config.json`**
- 教科グループとアプリ → **`apps.json`**
- HTML を書き換えずにこの 2 ファイルだけで多くの変更ができる

### 3. プライバシー優先

- Google OAuth で取得した情報は **画面表示と localStorage キーにのみ使用**
- 個人情報を外部に送信しない（Google Identity Services 自体の通信を除く）
- localStorage キーは `mq_{Google UID}_points`

### 4. シングルファイル原則

- すべての CSS・JS は `index.html` 内にインラインで記述
- 例外: `apps.json`、`config.json`、`sw.js`、`icon-*`（PWA 必須）
- ビルド工程なし、フレームワーク不使用、依存はすべて CDN

---

## ファイル別の役割

| ファイル | 役割 | 編集頻度 |
|---|---|---|
| `index.html` | UI / ロジック / スタイル全部入り | 機能追加時 |
| `apps.json` | 教科とアプリの定義 | 高（コンテンツ追加） |
| `config.json` | テキスト・色・OAuth ID | 中（ブランド変更時） |
| `manifest.json` | PWA メタデータ | 低 |
| `sw.js` | Service Worker | 低（キャッシュ対象を増やす時） |
| `icon-*.png/svg` | PWA アイコン | 低 |
| `assets/*` | 画像素材（バナー等） | 中（ビジュアル変更時） |

---

## データ構造

### `config.json`

```json
{
  "appName": "DD Learn",
  "appNameShort": "DD Learn",
  "appSubtitle": "",
  "appTagline": "今日もまなぼう",
  "heroEyebrow": "📚 今日のレッスン",
  "heroTitle": "毎日少しずつ、",
  "heroTitleEm": "ぐんぐん<br>かしこく！",
  "heroDesc": "...",
  "missionTitle": "🎯 今日の目標",
  "missionText": "...",
  "footerText": "© 2026 DD Learn",
  "themeColor": "#39a7ff",
  "mascot": "🦊",
  "googleClientId": "xxxx.apps.googleusercontent.com",
  "pointsChartDays": 7,
  "heroBanner": "assets/hero-banner-illustrated.png"
}
```

- フィールドを追加するときは、`index.html` の `loadConfig()` 関数にも反映処理を書く
- HTML 側のプレースホルダー要素には `id="cfg-XXX"` を付ける慣例

### `apps.json`

```json
[
  {
    "id": "math",                    // 一意な英数字 ID
    "type": "subject" | "general",   // 教科 or 科目外ツール
    "name": "さんすう",               // 表示名
    "icon": "🧮",                    // 絵文字
    "color": "#38bdf8",              // グループのテーマ色
    "apps": [
      {
        "id": "math-forest",         // 一意な英数字 ID
        "name": "さんすうの森",
        "icon": "🌲",
        "description": "...",
        "url": "https://...",        // iframe で開く URL
        "level": "おすすめ",          // 自由テキスト（5分・人気・チャレンジ等）
        "reward": "⭐ 20"            // 獲得ポイント表記。null なら非表示
      }
    ]
  }
]
```

- `reward` の数値部分（`20`）が完了時に加算されるポイント
- `null` にすると「⭐ 0pt 加算」になり、便利ツール扱い

### localStorage の構造

```
キー:   mq_{googleUID}_points
値:     {"2026-04-25": 50, "2026-04-24": 30, ...}
```

- 日付は `YYYY-MM-DD` 形式（ローカルタイム）
- 値は 1 日の合計ポイント数

---

## 主要関数の責務（index.html 内）

| 関数 | 役割 |
|---|---|
| `loadConfig()` | `config.json` を取得し、UI のテキスト・カラーを反映後に `loadApps()` を呼ぶ |
| `loadApps()` | `apps.json` を取得し、グループとカードを生成 |
| `makeCard(app, color, delay)` | カード要素を生成して返す |
| `initGoogle(clientId)` | GIS SDK 待機後、`renderButton` で公式ボタン描画 |
| `onGoogleCredential(response)` | JWT をデコードして `currentUser` をセット |
| `onLoginSuccess()` | UI をログイン状態に切替（teaser 隠し / dashboard 出し） |
| `doLogout()` | UI を未ログイン状態に戻す |
| `openApp(url, name, icon, pts)` | ビューア（iframe）でアプリを開く |
| `completeApp()` | ポイント加算 → トースト → グラフ更新 → ビューア閉じる |
| `addPoints(uid, pts)` | localStorage に今日のポイントを加算 |
| `loadPoints(uid)` / `savePoints(uid, data)` | localStorage の読み書き |
| `renderChart()` | Chart.js で過去 N 日の折れ線グラフを描画 |
| `showToast(msg)` | 画面下部にトースト通知を 2.8 秒表示 |

---

## デザインシステム

### CSS カスタムプロパティ（`:root`）

```css
--sky:#b9ecff;     --sky2:#77d5ff;
--paper:rgba(255,255,255,.92);
--ink:#26324d;    --muted:#667085;
--yellow:#ffd34d;
--shadow:0 10px 0 rgba(41,70,108,.07),0 16px 28px rgba(41,70,108,.13);
--font:'Noto Sans JP',system-ui,sans-serif;
--sl:max(1rem,env(safe-area-inset-left));   /* iPhone ノッチ対応 */
--sr:max(1rem,env(safe-area-inset-right));
--sb:max(2rem,calc(env(safe-area-inset-bottom) + 1rem));
```

### コンポーネント命名規則

- セクション → `.hero`, `.mission-panel`, `.dashboard`, `.group`, `.viewer-bar`, `.login-teaser`
- 要素 → `.card-top`, `.icon-wrap`, `.card-arrow`, `.app-name`, `.app-desc`, `.card-tag`
- ボタン → `.btn-login`, `.btn-done`, `.close-btn`, `.mission-button`, `.btn-logout`
- 修飾子 → `.group.general`（科目外）, `.app-card:hover`, `.btn-done.hidden`

### 立体感の表現

- カードやボタンは **下方向に色付きの影**を入れることで「押せる立体感」を演出
- 例: `box-shadow: 0 6px 0 #d78312` → 押した時に `0 2px 0` に変化

### 動きのルール

- ページロード時のフェードインは `@keyframes pop`
- カードのホバーは `transform: translateY(-6px) rotate(-.8deg)` で軽く浮く
- 派手な装飾アニメは控えめに（小学生対象だが、酔わせない範囲）

---

## やってはいけないこと（重要）

1. **localStorage 以外でデータ永続化しない**  
   外部 DB・Cookie・IndexedDB は使わない。サーバーが存在しない前提。

2. **Google から取得した情報を localStorage 以外に保存しない**  
   メールアドレスなどのフィールドを localStorage に書かない（UID・name・picture のみ画面表示で使用）。

3. **HTML を直接書き換える編集を `config.json` で代用できる場合は config 側に追加する**  
   ユーザーは「ファイル1個編集すれば変わる」のシンプルさを重視している。

4. **外部 CDN を増やしすぎない**  
   現在は Chart.js と Google Fonts、GIS のみ。これ以上増やすときは要相談。

5. **ビルドツールを導入しない**  
   Webpack / Vite / Sass などは入れない。ブラウザでそのまま動くものだけ。

6. **既存の `id` 属性を変更しない**  
   `id="cfg-XXX"`、`id="appRoot"`、`id="viewer"` などは JS から参照されている。

7. **PWA インストール要件を壊さない**  
   - manifest.json の name / start_url / icons (192px PNG + 512px PNG) は必須
   - Service Worker の登録を消さない

---

## よくある依頼パターンへの対応指針

### 「○○セクションを追加して」

1. `STRUCTURE.md` に新セクションを追記する形で要件をユーザーに確認
2. HTML に該当 `<section>` を追加（既存セクションの規則に合わせて命名）
3. 必要なら `config.json` に新フィールドを追加
4. `index.html` の `loadConfig()` に反映処理を追加
5. CSS は既存のデザイントークン（カスタムプロパティ）を流用

### 「色を変えたい」

- 全体テーマ色 → `config.json` の `themeColor`（manifest.json も合わせて手動で更新する必要あり）
- 教科ごとの色 → `apps.json` の各グループの `color`
- 個別の固定色は `index.html` の `<style>` 内を編集

### 「アプリ完了の判定を変えたい」

現状: 「⭐ 完了！」ボタン押下で固定ポイント加算
- タイマー方式（30秒以上滞在で完了など）にする → `openApp` 内で `setTimeout` を仕込む
- 完了入力フォーム → `completeApp` を改造

### 「教科を増やしたい / 減らしたい」

`apps.json` の編集だけで完結する。HTML 側は変更不要。

---

## デバッグのヒント

- **Google ログインが動かない** → 一番多いのは `googleClientId` の未設定 or Google Cloud Console の承認済み生成元の不一致（`origin_mismatch` エラー）
- **iOS で PWA インストールできない** → `apple-touch-icon` が PNG であること、`manifest.json` が読み込めていることを確認
- **Android で PWA インストールできない** → `icon-192.png` と `icon-512.png` が両方存在すること
- **キャッシュが古い** → Service Worker の `CACHE_NAME` を更新（v3 → v4 のように）

---



---

## 画像アセットの扱い

- 画像は **必ず `assets/` フォルダ** に保存（ルートに散らかさない）
- ファイル名は英数小文字とハイフン区切り（`hero-banner-illustrated.png` 等）
- 1600px 以上の画像はリサイズしてからコミット
- PWA でオフライン使用する画像は `sw.js` の `STATIC_ASSETS` に登録
- `config.json` を介してパス参照させる（HTML 内に直接書かない）

例: 新しい背景画像 `bg-spring.png` を追加する場合
1. `assets/bg-spring.png` に保存
2. `sw.js` の `STATIC_ASSETS` に `'./assets/bg-spring.png'` を追加
3. `config.json` に `"backgroundImage": "assets/bg-spring.png"` を追加
4. `index.html` の `loadConfig()` で `CFG.backgroundImage` を CSS変数や img.src に流し込む

## 編集の流れ（推奨）

1. ユーザーから依頼を受ける
2. `STRUCTURE.md` を確認し、該当箇所がどう定義されているか把握
3. `apps.json` / `config.json` で済むなら、そちらだけ編集
4. HTML 編集が必要なら、既存のスタイルや命名規則を踏襲
5. 変更後、`STRUCTURE.md` も実態に合わせて更新
6. ZIP にまとめて出力

---

## 連絡先・参考

- このドキュメントを更新する権利はオーナーにあります
- AI が新機能を勝手に追加せず、要件を確認してから実装してください
- 不明点があれば、ユーザーに質問してから手を動かしてください
