# Vercel デプロイ手順（Node.js 不要）

会社PCで Node.js が使えなくても、GitHub + Vercel でデプロイできます。

---

## ステップ1: GitHub アカウント

1. [github.com](https://github.com) にアクセス
2. アカウント作成（まだの場合）
3. ログイン

---

## ステップ2: リポジトリを作成してコードをアップロード

（省略：前回の手順を参照）

---

## ステップ3: Vercel でデプロイ

1. [vercel.com](https://vercel.com) にアクセス
2. **「Sign Up」** → **「Continue with GitHub」** で GitHub と連携
3. ダッシュボードで **「Add New」** → **「Project」**
4. インポート一覧から **「buggy-schedule」** を選択 → **「Import」**
5. 設定はそのまま **「Deploy」** をクリック
6. 数分待つとデプロイ完了 → URL が表示される

---

## ステップ4: データベースの接続（重要・エラー解消）

**「新しい日程を入れようとしてもエラー」になる場合、ここが未設定です。**

1. Vercel のプロジェクト画面で **「Storage」** タブを開く
2. **「Create Database」** をクリック
3. **「Neon」** または **「Postgres」** を選択（Vercel Marketplace から）
4. 作成後、**「Connect Project」** で buggy-schedule に接続
5. 環境変数（POSTGRES_URL など）が自動で追加される
6. **「Redeploy」** で再デプロイ

---

## ステップ5: テーブルの作成

デプロイ後、次のURLにアクセスしてテーブルを作成：

```
https://あなたのプロジェクトURL.vercel.app/api/init
```

`{"ok":true,"message":"テーブルを作成しました"}` が返れば成功です。

---

## 逃げる動作について

- **PC**: マウスを動かすと、カーソルに近い要素が逃げます
- **スマホ・タブレット**: 画面をタッチして指を動かすと、指に近い要素が逃げます
- **整列ボタン**: 右上の「整列（秩序を取り戻す）」を**長押し**している間だけ、すべての要素が正しい位置に戻り、入力が可能になります
