# テストカバレッジ計測レポート

| 項目          | 値                                  |
| ------------- | ----------------------------------- |
| 実施日        | 2026-05-10                          |
| コマンド      | `npx vitest run --coverage`         |
| Vitest        | 2.1.9                               |
| カバレッジ Provider | `@vitest/coverage-v8`         |
| 設定ファイル  | `vitest.config.ts`                  |

## サマリ

| 指標            | 値                  |
| --------------- | ------------------- |
| テストファイル数 | **1 / 1 passed**    |
| テスト件数      | **22 / 22 passed**  |
| 実行時間        | 11.89s              |

## カバレッジ全体

| Stmts  | Branch | Funcs | Lines  |
| ------ | ------ | ----- | ------ |
| 0.45 % | 7.4 %  | 7.4 % | 0.45 % |

## カバレッジ内訳

唯一のテスト `src/tests/features/study/study-schema.test.ts` が対象とする 1 ファイルのみが 100% を達成し、それ以外のすべてのプロダクションコードはテスト未到達（0%）。

### 100% カバー
| ファイル                                       | Stmts | Branch | Funcs | Lines |
| ---------------------------------------------- | ----- | ------ | ----- | ----- |
| `src/features/study/schema/study-schema.ts`    | 100   | 100    | 100   | 100   |

### 0% カバー（主要領域抜粋）
| 領域                                  | 代表ファイル例                                           |
| ------------------------------------- | -------------------------------------------------------- |
| `src/app/**`（App Router ページ・API） | `app/dashboard/page.tsx` / `app/api/stripe/webhook/route.ts` ほか全ページ |
| `src/features/*/server/*-actions.ts`  | `dashboard-actions.ts` / `goal-actions.ts` / `mentor-actions.ts` / `billing-actions.ts` ほか全 server actions |
| `src/features/*/components/`          | `TimerContent.tsx` / `GoalsContent.tsx` / `RecordsContent.tsx` ほか全機能コンポーネント |
| `src/components/common/`・`src/components/ui/` | `Sidebar.tsx` / `Pagination.tsx` / `select.tsx` ほか全 UI |
| `src/lib/auth/`                       | `config.ts` / `index.ts`                                 |
| `src/lib/stripe/`                     | `index.ts` / `plan-gate.ts` / `plans.ts`                 |
| `src/lib/storage/`                    | `r2.ts`                                                  |
| `src/lib/i18n/`                       | `context.tsx` / `server.ts` / `locales/{ja,en}.ts`       |
| `src/lib/config/env.ts`               | Zod による env 検証スキーマ                              |
| `src/middleware.ts`                   |                                                          |
| `prisma/seeds/`                       | `dev.ts` / `prod.ts` / `common.ts`                       |

### 一部のみブランチ/関数が拾われている領域
（実装側は 0% だが、型定義や定数のおかげで Branch/Funcs だけ部分的に計測されたもの）

| ファイル/領域               | Stmts | Branch | Funcs | Lines |
| --------------------------- | ----- | ------ | ----- | ----- |
| `src/lib/`                  | 0     | 40.00  | 40.00 | 0     |
| `src/lib/utils/`            | 0     | 66.66  | 66.66 | 0     |
| `src/lib/constants/cookies.ts` | 0  | 100    | 100   | 0     |
| `src/lib/types/error-codes.ts` | 0  | 100    | 100   | 0     |
| `src/lib/i18n/types.ts`     | 0     | 100    | 100   | 0     |
| `src/lib/font-size/types.ts`| 0     | 100    | 100   | 0     |
| `src/lib/color-vision/types.ts` | 0 | 100    | 100   | 0     |
| `src/lib/stripe/plans.ts`   | 0     | 100    | 100   | 0     |

## 観察事項

- **テスト資産がスキーマ 1 本のみ**: `package.json` には `test:unit` / `test:integration` スクリプトが定義されているが、対象となる `*.test.ts` は 1 ファイルしか存在せず、結果としてプロダクションコードのほぼ全領域が未カバー。
- **テストヘルパは整備済み**: `src/tests/helpers/` に `action-cases.ts` / `action-helpers.ts` / `prisma-mock.ts` / `test-db.ts` が用意されており、server actions に対するユニット／インテグレーションテストを書くための土台はすでに用意されている（が、これらヘルパ自体も呼び出し側がないため 0% カバー）。
- **e2e は別経路**: Playwright テスト (`tests/e2e/auth/login.spec.ts`) は `vitest.config.ts` の `exclude` で除外されており、本計測には含まれない。
- **新規依存追加**: 計測のため `@vitest/coverage-v8@^2.1.8` を `devDependencies` に追加。

## 推奨される次の打ち手（優先度順）

1. **server actions のユニットテスト拡充**: `src/features/*/server/*-actions.ts` は ✕ 全件 0% カバー。`src/tests/helpers/` の `prisma-mock.ts` / `action-cases.ts` を活用すれば短期間で大きなカバレッジ改善が見込める領域。
2. **schema 系のテスト追加**: `study-schema.test.ts` と同形式で `timer-schema` / `goal-schema` / `social-schema` / `mentor-schema` 等にも展開すれば、Zod 検証ロジックを安価にカバーできる。
3. **ルート（page.tsx / route.ts）テスト**: server component のレンダリングテストはコストが高いので、まずは API Route (`app/api/**/route.ts`) のテストから始めるのが費用対効果が高い。
4. **CI への組み込み**: `vitest run --coverage` を CI に追加し、最低カバレッジ閾値（例: Stmts 50%）を `vitest.config.ts` の `coverage.thresholds` で強制するのが望ましい。
