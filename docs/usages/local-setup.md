# ローカル環境構築手順

Next.js + Prisma + Auth.js で構成された StudyTracker のローカル開発環境を構築する手順です。

---

## 1. 前提条件

以下が事前にインストールされている必要があります。

| ツール         | 推奨バージョン          | 備考                              |
| -------------- | ----------------------- | --------------------------------- |
| Node.js        | 20.x 以上               | Next.js 16 の動作要件             |
| npm            | 10.x 以上               | Node.js に同梱                    |
| Git            | 2.x 以上                |                                   |
| Docker Desktop | 最新安定版              | PostgreSQL・MinIO のコンテナ起動に使用 |

```bash
node -v && npm -v && git --version && docker version
```

---

## 2. リポジトリのクローン

サブモジュール (`.gitmodules`) を含むため `--recurse-submodules` を付けてクローンしてください。

```bash
git clone --recurse-submodules <REPOSITORY_URL>
cd next-app-studytracker
```

クローン済みでサブモジュールが未取得の場合:

```bash
git submodule update --init --recursive
```

---

## 3. 依存パッケージのインストール

```bash
npm install
```

`postinstall` フックで `prisma generate` が自動実行され、Prisma Client が生成されます。

---

## 4. 環境変数の設定

`.env.example` を `.env` にコピーして必要な値を埋めます。

```bash
cp .env.example .env
```

### 必須項目

| 変数名         | 説明                                | ローカルでの推奨値               |
| -------------- | ----------------------------------- | -------------------------------- |
| `DATABASE_URL` | PostgreSQL 接続文字列               | `.env.example` のデフォルト値    |
| `AUTH_SECRET`  | セッション暗号化キー (32 文字以上)  | 下記コマンドで生成               |
| `AUTH_URL`     | アプリの公開 URL                    | `http://localhost:3000`          |

`AUTH_SECRET` の生成:

```bash
openssl rand -base64 48
```

### 任意項目

| 変数グループ                            | 説明                         | 備考                                      |
| --------------------------------------- | ---------------------------- | ----------------------------------------- |
| `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` | Google OAuth                 | 2 つ同時設定または両方未設定              |
| `AUTH_GITHUB_ID` / `AUTH_GITHUB_SECRET` | GitHub OAuth                 | 2 つ同時設定または両方未設定              |
| `EMAIL_SERVER_*` / `EMAIL_FROM`         | メール認証用 SMTP             | HOST / USER / PASSWORD は 3 つ同時設定    |
| `R2_*`                                  | 画像ストレージ (MinIO/R2)    | 4 つ同時設定。ローカルは後述の MinIO を使用 |

> OAuth・メール関連は未設定でも起動できます。未設定のプロバイダはログイン画面で利用不可になります。

---

## 5. サービスの起動

PostgreSQL・MinIO・Stripe Mock をまとめて起動します。

```bash
docker compose up -d
```

起動確認:

```bash
docker compose ps
```

`STATUS` 列が `Up (healthy)` になれば OK です。初回はイメージ pull に 1〜2 分かかります。

### MinIO について

ローカルの画像ストレージとして MinIO を使用します。

- **S3 API**: `http://localhost:9000`
- **Web コンソール**: `http://localhost:9001` (ID: `minioadmin` / PW: `minioadmin`)
- バケット `studytracker` は `minio-init` コンテナが自動作成します。

`.env.example` の `R2_*` デフォルト値はそのまま MinIO に向いているため、コピーするだけで使えます。

### Stripe Mock について

サブスクリプション課金機能のローカル開発用に [stripe/stripe-mock](https://github.com/stripe/stripe-mock) を使用します。

- **HTTP エンドポイント**: `http://localhost:12111`
- **HTTPS エンドポイント**: `https://localhost:12112`
- 実際の Stripe API と同じインターフェースで Checkout セッション・Customer Portal の動作確認が可能です。

`.env.example` の `STRIPE_*` デフォルト値はそのまま stripe-mock に向いているため、コピーするだけで使えます。

```
STRIPE_SECRET_KEY="sk_test_123"        # stripe-mock は sk_test_ 形式の任意の値を受け付ける
STRIPE_BASIC_PRICE_ID="price_basic"    # stripe-mock は price_ 形式の任意の値を受け付ける
STRIPE_PREMIUM_PRICE_ID="price_premium"
STRIPE_MOCK_HOST="localhost"           # この変数がセットされると stripe-mock に接続する
```

> **注意**: stripe-mock は Stripe API 呼び出しのモックのみで、**ウェブフックは送信しません**。
> ウェブフック (`/api/stripe/webhook`) のテストには Stripe CLI が必要です（後述）。

---

## 6. データベースの初期化

マイグレーションを適用してテーブルを作成します。

```bash
npm run db:migrate:dev
```

マイグレーション状態の確認:

```bash
npm run db:migrate:status
```

DB の中身を GUI で確認したい場合:

```bash
npx prisma studio
```

`http://localhost:5555` で Prisma Studio が開きます。

---

## 7. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで <http://localhost:3000> を開きます。

---

## 8. 主要コマンド

| 用途                     | コマンド                  | 備考                                         |
| ------------------------ | ------------------------- | -------------------------------------------- |
| 本番ビルド               | `npm run build`           |                                              |
| 本番ビルド起動           | `npm start`               | `build` 後に実行                             |
| Lint                     | `npm run lint`            | ESLint                                       |
| フォーマット適用         | `npm run format`          | Prettier                                     |
| フォーマット確認のみ     | `npm run format:check`    | CI で使用                                    |
| 全テスト (1 回)          | `npm test`                | Vitest                                       |
| ユニットテスト           | `npm run test:unit`       |                                              |
| インテグレーションテスト | `npm run test:integration`|                                              |
| テスト (watch)           | `npm run test:watch`      |                                              |
| E2E テスト               | `npm run test:e2e`        | Playwright。初回は `npx playwright install`  |
| バンドル解析             | `npm run analyze`         | `ANALYZE=true` で `next build` を実行        |
| DB マイグレーション作成  | `npm run db:migrate:dev -- --name <name>` | 新規 migration を生成    |
| DB マイグレーション適用  | `npm run db:migrate:deploy` | CI / 本番用 (非対話)                       |
| Stripe Webhook 転送      | `stripe listen --forward-to localhost:3000/api/stripe/webhook` | Stripe CLI 必須。ウェブフックのローカルテスト用 |

---

## 9. コンテナのライフサイクル

| 操作                   | コマンド                        | 備考                      |
| ---------------------- | ------------------------------- | ------------------------- |
| 停止 (データ保持)      | `docker compose stop`           | `start` で即復帰          |
| 再開                   | `docker compose start`          |                           |
| 完全停止＋コンテナ削除 | `docker compose down`           | ボリュームは残る          |
| **DB・ストレージリセット** | `docker compose down -v`    | ⚠ 全データ消失            |
| ログ確認               | `docker compose logs -f db`     | MinIO は `-f minio`、Stripe Mock は `-f stripe-mock` |

ハマったときの定番リセット:

```bash
docker compose down -v
docker compose up -d
npm run db:migrate:dev
```

### 複数プロジェクトの同時起動

`docker-compose.yml` の `name:` フィールドが各プロジェクトで異なるため、コンテナは独立して並走できます。ホスト側ポートも個別割当済みなので衝突しません。

```bash
# 起動中の next-app-* コンテナ一覧
docker ps --filter "name=next-app-" --format "table {{.Names}}\t{{.Ports}}\t{{.Status}}"
```

---

## 10. よくあるトラブル

### `prisma generate` が失敗する

`node_modules` が壊れている可能性があります。

```bash
rm -rf node_modules
npm install
```

### DB に接続できない (`P1001`)

コンテナがまだ `healthy` になっていないか、`.env` の `DATABASE_URL` のポートと `docker-compose.yml` の publish ポートが不一致の可能性があります。

```bash
docker compose ps          # STATUS が healthy か確認
cat .env | grep DATABASE_URL
```

### マイグレーションが破綻した

ローカル DB のみリセットしてください。

```bash
docker compose down -v
docker compose up -d
npm run db:migrate:dev
```

### 画像アップロードに失敗する

MinIO が起動しているか、および `studytracker` バケットが存在するか確認してください。

```bash
docker compose ps minio    # healthy か確認
docker compose logs minio-init   # バケット作成ログを確認
```

バケットが存在しない場合は `minio-init` を再実行します。

```bash
docker compose run --rm minio-init
```

### ポート 3000 が使用中

別ポートで起動できます。

```bash
npm run dev -- --port 3001
```

`.env` の `AUTH_URL` も同じポートに合わせてください。

### Stripe Mock に接続できない

stripe-mock コンテナが起動しているか確認してください。

```bash
docker compose ps stripe-mock   # healthy か確認
docker compose logs stripe-mock # エラーログを確認
```

`STRIPE_MOCK_HOST` が `.env` に設定されているか確認してください。

```bash
cat .env | grep STRIPE_MOCK_HOST
```

未設定の場合、アプリは本番 Stripe API に接続しようとします。

### Webhook が届かない

stripe-mock はウェブフックを送信しません。ウェブフックのローカルテストには Stripe CLI を使用してください。

```bash
# Stripe CLI のインストール (macOS)
brew install stripe/stripe-cli/stripe

# Stripe アカウントにログイン
stripe login

# ウェブフックをローカルに転送 (ターミナルを別タブで開いて実行)
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

`stripe listen` を実行すると `whsec_...` 形式のシークレットが表示されます。
これを `.env` の `STRIPE_WEBHOOK_SECRET` に設定してください（ローカルテスト中のみ）。

### Playwright テストが Vitest で実行されてエラーになる

`vitest.config.ts` の `test.exclude` に `tests/e2e/**` が含まれていることを確認してください。Playwright テストは `npm run test:e2e` で実行します。

### `port is already allocated`

該当ポートを使っているプロセスを特定して停止してください。

```bash
# macOS / Linux
lsof -i :54339

# Windows (PowerShell)
netstat -ano | Select-String "54339"
```
