export type Plan = "free" | "basic" | "premium";

export const PLAN_ORDER: Plan[] = ["free", "basic", "premium"];

export const PLAN_LEVEL: Record<Plan, number> = {
  free: 0,
  basic: 1,
  premium: 2,
};

export const PLANS: Record<
  Plan,
  { name: string; price: number; features: string[]; limits: string[] }
> = {
  free: {
    name: "Free",
    price: 0,
    features: [
      "学習記録・タイマー（無制限）",
      "目標管理（同時3件まで）",
      "バッジシステム",
      "フォロー・リアクション・コメント",
    ],
    limits: [
      "目標は同時3件まで",
      "リマインダー利用不可",
      "データエクスポート不可",
      "習慣管理・グループ・メンター利用不可",
    ],
  },
  basic: {
    name: "Basic",
    price: 980,
    features: [
      "Free のすべての機能",
      "目標管理（無制限）",
      "リマインダー作成・管理",
      "データエクスポート（GDPR 準拠）",
    ],
    limits: [
      "習慣管理利用不可",
      "グループ学習利用不可",
      "メンター機能利用不可",
    ],
  },
  premium: {
    name: "Premium",
    price: 1980,
    features: [
      "Basic のすべての機能",
      "習慣管理（Habit トラッキング）",
      "メンターシステム（登録・セッション）",
      "グループ学習・スタディルーム",
    ],
    limits: [],
  },
};
