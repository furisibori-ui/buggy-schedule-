# 虫のように逃げる日程調整アプリ

「調整さん」風の見た目なのに、UI要素がマウスカーソルから逃げ回るシュールな日程調整アプリです。

## 機能

- **イベント作成**: イベント名と日程候補（改行区切り）を入力して作成
- **イベント詳細**: 候補日程の表示、名前＋○△×の回答フォーム、回答一覧テーブル
- **データ保存**: Vercel Postgres（events / responses テーブル）

## ギミック

- 入力欄・ボタン・テーブル行がマウスに近づくと「サササッ」と逃げる
- 右上の「整列（秩序を取り戻す）」ボタンを**長押し**している間だけ、すべての要素が正しい位置に戻り操作可能に
- 指を離すと再びカオス状態へ

## セットアップ

1. 依存関係のインストール
   ```bash
   npm install
   ```

2. Vercel Postgres の設定
   - [Vercel Dashboard](https://vercel.com) でプロジェクトを作成
   - Storage タブから Postgres を追加
   - `vercel env pull .env.local` で環境変数を取得

3. データベースの初期化
   - 開発サーバー起動後、`/api/init` にアクセスしてテーブルを作成

4. 開発サーバー起動
   ```bash
   npm run dev
   ```

## 技術スタック

- Next.js 14 (App Router)
- Vercel Postgres
- Framer Motion
- Tailwind CSS
