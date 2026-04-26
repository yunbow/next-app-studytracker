/**
 * Rate Limiting ユーティリティ
 * ガイドライン 18_security.md に準拠
 * 
 * メモリベースの簡易実装（本番環境ではRedis推奨）
 */

interface RateLimitConfig {
  interval: number; // ミリ秒
  maxRequests: number; // 期間内の最大リクエスト数
}

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

/**
 * Rate Limitをチェック
 * @param identifier ユーザーIDまたはIPアドレス
 * @param config Rate Limit設定
 * @returns 制限内ならtrue、超過ならfalse
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): boolean {
  const now = Date.now();
  const key = identifier;

  const entry = rateLimitStore.get(key);

  // エントリーが存在しない、または期限切れの場合
  if (!entry || now > entry.resetAt) {
    rateLimitStore.set(key, {
      count: 1,
      resetAt: now + config.interval,
    });
    return true;
  }

  // 制限を超えている場合
  if (entry.count >= config.maxRequests) {
    return false;
  }

  // カウントを増やす
  entry.count++;
  return true;
}

/**
 * Rate Limit設定のプリセット
 */
export const RATE_LIMITS = {
  // 一般的な操作: 10リクエスト/分
  STANDARD: { interval: 60 * 1000, maxRequests: 10 },

  // 読み取り操作: 20リクエスト/分
  READ: { interval: 60 * 1000, maxRequests: 20 },

  // 書き込み操作: 5リクエスト/分
  WRITE: { interval: 60 * 1000, maxRequests: 5 },

  // 重い操作: 3リクエスト/5分
  HEAVY: { interval: 5 * 60 * 1000, maxRequests: 3 },

  // 認証関連: 5リクエスト/15分
  AUTH: { interval: 15 * 60 * 1000, maxRequests: 5 },
} as const;

/**
 * 定期的にクリーンアップ（メモリリーク防止）
 */
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetAt) {
      rateLimitStore.delete(key);
    }
  }
}, 60 * 1000); // 1分ごと
