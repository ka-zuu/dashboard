# Smart Home Dashboard Agent Context

## プロジェクト概要
自宅サーバー（Ubuntu）で稼働させるスマートホームダッシュボードのMVP。
DevContainer上で開発し、ReactフロントエンドとNode.jsバックエンドで構成される。

## 技術スタック
- **Environment:** DevContainer (Node.js 20 LTS)
- **Frontend:** React (Vite), Tailwind CSS, Lucide React, React Grid Layout
- **Backend:** Node.js, Express, Socket.io
- **Database:** SQLite, Prisma ORM
- **Language:** JavaScript (ES Modules)

## アーキテクチャルール
1. **プラグイン・アーキテクチャ**
   - `/server/plugins` に配置されたファイルを動的に読み込む。
   - 統一インターフェース: `init()`, `getData()`, `executeAction()`。
2. **データ保存**
   - ウィジェット配置や設定はSQLiteに保存。
3. **通信**
   - Socket.ioによるリアルタイムプッシュ通知。

## コーディング規約
- **言語:** コメント、ドキュメントは全て日本語。
- **チャット:** ユーザーとのやり取り、コメント、Implementation Plan,Walk Through等は必ず日本語で行う。
- **命名:** 変数・関数名は英語。
- **モジュール:** ES Modules (`import`/`export`) を使用。
- **スタイル:** Prettier/ESLintの標準設定に従う。

## ディレクトリ構造
- `/server`: バックエンド (Express, Socket.io)
  - `/plugins`: 拡張機能
  - `/prisma`: DBスキーマ
- `/client`: フロントエンド (Vite + React)
  - `/src/widgets`: ダッシュボード用ウィジェットコンポーネント

## Phase 2 更新情報 (DB & API)

### API Endpoints
- `GET /api/widgets`: 保存されたウィジェット一覧を取得
- `POST /api/widgets`: ウィジェット配置・設定を保存（一括/単体）
- `DELETE /api/widgets/:id`: ウィジェットを削除

### Database Schema (Widget)
- `id`: String (UUID)
- `pluginId`: String (例: "clock", "weather")
- `x`, `y`, `w`, `h`: Int (Layout)
- `settings`: String (JSON)

### Plugins
- **Weather (`weather.js`)**:
  - OpenMeteo APIを使用
  - 15分間のキャッシュ機能
  - デフォルト: 東京 (settingsで拡張可能)

## Phase 3 更新情報 (編集機能 & SwitchBot)

### API Endpoints
- `GET /api/available-plugins`: 利用可能なプラグインのメタデータ一覧を取得

### Plugins
- **SwitchBot (`switchbot.js`)**:
  - SwitchBot API v1.1 を使用
  - 60秒間のキャッシュ機能
  - **必須環境変数**: `SWITCHBOT_TOKEN`, `SWITCHBOT_SECRET`
  - Meter (温湿度計) と Hub Mini のステータスを表示

### Frontend Features
- **編集モード**: ヘッダーのボタンで切り替え
- **ウィジェット追加**: モーダルからプラグインを選択して追加
- **ウィジェット削除**: 編集モード時にゴミ箱アイコンで削除
