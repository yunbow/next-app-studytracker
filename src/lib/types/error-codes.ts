/**
 * アプリケーション全体で使用するエラーコード定義
 * ガイドライン 21_error.md に準拠
 */

export const ERROR_CODES = {
  // 認証エラー (401)
  UNAUTHORIZED: "UNAUTHORIZED",
  SESSION_EXPIRED: "SESSION_EXPIRED",

  // 認可エラー (403)
  FORBIDDEN: "FORBIDDEN",
  INSUFFICIENT_PERMISSIONS: "INSUFFICIENT_PERMISSIONS",

  // バリデーションエラー (400)
  INVALID_INPUT: "INVALID_INPUT",
  VALIDATION_FAILED: "VALIDATION_FAILED",

  // リソースエラー (404)
  NOT_FOUND: "NOT_FOUND",
  RESOURCE_NOT_FOUND: "RESOURCE_NOT_FOUND",

  // 競合エラー (409)
  CONFLICT: "CONFLICT",
  ALREADY_EXISTS: "ALREADY_EXISTS",
  DUPLICATE_ENTRY: "DUPLICATE_ENTRY",

  // レート制限 (429)
  RATE_LIMIT_EXCEEDED: "RATE_LIMIT_EXCEEDED",
  TOO_MANY_REQUESTS: "TOO_MANY_REQUESTS",

  // サーバーエラー (500)
  INTERNAL_ERROR: "INTERNAL_ERROR",
  DATABASE_ERROR: "DATABASE_ERROR",
  EXTERNAL_SERVICE_ERROR: "EXTERNAL_SERVICE_ERROR",

  // ビジネスロジックエラー
  BUSINESS_RULE_VIOLATION: "BUSINESS_RULE_VIOLATION",
  OPERATION_NOT_ALLOWED: "OPERATION_NOT_ALLOWED",

  // グループ関連
  GROUP_FULL: "GROUP_FULL",
  ALREADY_MEMBER: "ALREADY_MEMBER",
  NOT_GROUP_MEMBER: "NOT_GROUP_MEMBER",

  // メンター関連
  MENTOR_UNAVAILABLE: "MENTOR_UNAVAILABLE",
  SESSION_ALREADY_REVIEWED: "SESSION_ALREADY_REVIEWED",
  SESSION_NOT_COMPLETED: "SESSION_NOT_COMPLETED",

  // 習慣・リマインダー関連
  HABIT_NOT_ACTIVE: "HABIT_NOT_ACTIVE",
  REMINDER_NOT_ACTIVE: "REMINDER_NOT_ACTIVE",
} as const;

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];

/**
 * API エラーレスポンス型
 */
export interface ApiError {
  code: ErrorCode;
  message: string;
  details?: Record<string, unknown>;
  requestId?: string;
}

/**
 * エラーレスポンスを生成
 */
export function createErrorResponse(
  code: ErrorCode,
  message: string,
  details?: Record<string, unknown>
): ApiError {
  return {
    code,
    message,
    ...(details && { details }),
  };
}
