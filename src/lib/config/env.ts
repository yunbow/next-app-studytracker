import "server-only";
import { z } from "zod";

// See next-app-post/src/lib/config/env.ts for canonical template rationale.
// NOTE: studytracker は Auth.js v5 完全移行済み。AUTH_SECRET / AUTH_URL /
// AUTH_GOOGLE_* / AUTH_GITHUB_* を使用。メールは EMAIL_SERVER_* / EMAIL_FROM。
const optionalString = <T extends z.ZodTypeAny>(inner: T) =>
  z.preprocess(
    (v) => (typeof v === "string" && v.length === 0 ? undefined : v),
    inner.optional(),
  );
const optionalUrl = () =>
  z.preprocess(
    (v) => (typeof v === "string" && v.length === 0 ? undefined : v),
    z.url().optional(),
  );
const optionalEmail = () =>
  z.preprocess(
    (v) => (typeof v === "string" && v.length === 0 ? undefined : v),
    z.email().optional(),
  );

const EnvSchema = z
  .object({
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
    LOG_LEVEL: optionalString(
      z.enum(["fatal", "error", "warn", "info", "debug", "trace"]),
    ),

    DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),

    AUTH_SECRET: z.string().min(32, "AUTH_SECRET must be at least 32 chars"),
    AUTH_URL: z.url("AUTH_URL must be a valid URL"),

    AUTH_GOOGLE_ID: optionalString(z.string().min(1)),
    AUTH_GOOGLE_SECRET: optionalString(z.string().min(1)),
    AUTH_GITHUB_ID: optionalString(z.string().min(1)),
    AUTH_GITHUB_SECRET: optionalString(z.string().min(1)),

    EMAIL_SERVER_HOST: optionalString(z.string().min(1)),
    EMAIL_SERVER_PORT: optionalString(z.string().min(1)),
    EMAIL_SERVER_USER: optionalString(z.string().min(1)),
    EMAIL_SERVER_PASSWORD: optionalString(z.string().min(1)),
    EMAIL_FROM: optionalEmail(),

    NEXT_PUBLIC_APP_URL: optionalUrl(),

    // Cloudflare R2 (本番) / MinIO (ローカル) — 4つすべてセットするか、すべて未設定にすること
    R2_ACCESS_KEY_ID: optionalString(z.string().min(1)),
    R2_SECRET_ACCESS_KEY: optionalString(z.string().min(1)),
    R2_BUCKET_NAME: optionalString(z.string().min(1)),
    R2_ENDPOINT: optionalString(z.string().min(1)),
    R2_PUBLIC_URL: optionalString(z.string().min(1)),

    // Stripe — すべてセットするか、すべて未設定にすること
    STRIPE_SECRET_KEY: optionalString(z.string().min(1)),
    STRIPE_WEBHOOK_SECRET: optionalString(z.string().min(1)),
    STRIPE_BASIC_PRICE_ID: optionalString(z.string().min(1)),
    STRIPE_PREMIUM_PRICE_ID: optionalString(z.string().min(1)),
  })
  .superRefine((v, ctx) => {
    const pairs: Array<[string, Array<string | undefined>]> = [
      ["Google OAuth", [v.AUTH_GOOGLE_ID, v.AUTH_GOOGLE_SECRET]],
      ["GitHub OAuth", [v.AUTH_GITHUB_ID, v.AUTH_GITHUB_SECRET]],
    ];
    for (const [name, keys] of pairs) {
      const setCount = keys.filter(
        (k) => k !== undefined && k.length > 0,
      ).length;
      if (setCount !== 0 && setCount !== keys.length) {
        ctx.addIssue({
          code: "custom",
          message: `${name} keys must be all-set or all-unset`,
        });
      }
    }
    const r2Core = [v.R2_ACCESS_KEY_ID, v.R2_SECRET_ACCESS_KEY, v.R2_BUCKET_NAME, v.R2_ENDPOINT];
    const r2Set = r2Core.filter((k) => k !== undefined && k.length > 0).length;
    if (r2Set !== 0 && r2Set !== r2Core.length) {
      ctx.addIssue({
        code: "custom",
        message: "R2_ACCESS_KEY_ID / R2_SECRET_ACCESS_KEY / R2_BUCKET_NAME / R2_ENDPOINT must be all-set or all-unset",
      });
    }

    const stripeCore = [v.STRIPE_SECRET_KEY, v.STRIPE_WEBHOOK_SECRET, v.STRIPE_BASIC_PRICE_ID, v.STRIPE_PREMIUM_PRICE_ID];
    const stripeSet = stripeCore.filter((k) => k !== undefined && k.length > 0).length;
    if (stripeSet !== 0 && stripeSet !== stripeCore.length) {
      ctx.addIssue({
        code: "custom",
        message: "STRIPE_SECRET_KEY / STRIPE_WEBHOOK_SECRET / STRIPE_BASIC_PRICE_ID / STRIPE_PREMIUM_PRICE_ID must be all-set or all-unset",
      });
    }

    const emailCore = [
      v.EMAIL_SERVER_HOST,
      v.EMAIL_SERVER_USER,
      v.EMAIL_SERVER_PASSWORD,
    ];
    const emailSet = emailCore.filter(
      (k) => k !== undefined && k.length > 0,
    ).length;
    if (emailSet !== 0 && emailSet !== emailCore.length) {
      ctx.addIssue({
        code: "custom",
        message:
          "EMAIL_SERVER_HOST / EMAIL_SERVER_USER / EMAIL_SERVER_PASSWORD must be all-set or all-unset",
      });
    }
  });

const parsed = EnvSchema.safeParse(process.env);

if (!parsed.success) {
  const formatted = JSON.stringify(
    z.flattenError(parsed.error).fieldErrors,
    null,
    2,
  );
  throw new Error(`Invalid environment variables:\n${formatted}`);
}

export const env = parsed.data;
