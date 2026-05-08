"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BackLink } from "@/components/common/BackLink";
import { Check, X, ExternalLink } from "lucide-react";
import { PLANS, PLAN_ORDER, type Plan } from "@/lib/stripe/plans";
import {
  createCheckoutSessionAction,
  createPortalSessionAction,
} from "@/features/billing/server/billing-actions";

interface Props {
  currentPlan: Plan;
  stripeSubscriptionId: string | null;
  stripeCurrentPeriodEnd: Date | null;
}

export function BillingContent({
  currentPlan,
  stripeSubscriptionId,
  stripeCurrentPeriodEnd,
}: Props) {
  const [loading, setLoading] = useState<string | null>(null);

  const handleUpgrade = async (plan: "basic" | "premium") => {
    setLoading(plan);
    const result = await createCheckoutSessionAction(plan);
    if (result.success) {
      window.location.href = result.data.url;
    } else {
      toast.error(result.error);
      setLoading(null);
    }
  };

  const handleManage = async () => {
    setLoading("portal");
    const result = await createPortalSessionAction();
    if (result.success) {
      window.location.href = result.data.url;
    } else {
      toast.error(result.error);
      setLoading(null);
    }
  };

  const currentPlanIndex = PLAN_ORDER.indexOf(currentPlan);

  return (
    <div className="w-full max-w-2xl pb-8">
      <BackLink href="/settings" label="設定に戻る" />

      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">サブスクリプション</h1>
        {stripeSubscriptionId && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleManage}
            disabled={loading === "portal"}
          >
            {loading === "portal" ? "読み込み中..." : "サブスクリプション管理"}
            <ExternalLink className="ml-2 h-3 w-3" />
          </Button>
        )}
      </div>

      {stripeCurrentPeriodEnd && (
        <p className="mb-6 text-sm text-muted-foreground">
          次回請求日:{" "}
          {new Date(stripeCurrentPeriodEnd).toLocaleDateString("ja-JP", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      )}

      <div className="space-y-4">
        {PLAN_ORDER.map((plan) => {
          const details = PLANS[plan];
          const isCurrent = plan === currentPlan;
          const planIndex = PLAN_ORDER.indexOf(plan);
          const isUpgrade = planIndex > currentPlanIndex;

          return (
            <Card
              key={plan}
              className={
                isCurrent
                  ? "border-primary ring-2 ring-primary ring-offset-1"
                  : ""
              }
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    {details.name}
                    {isCurrent && (
                      <Badge
                        variant="default"
                        className="text-xs font-normal"
                      >
                        現在のプラン
                      </Badge>
                    )}
                  </CardTitle>
                  <span className="text-2xl font-bold">
                    {details.price === 0 ? (
                      "無料"
                    ) : (
                      <>
                        ¥{details.price.toLocaleString()}
                        <span className="text-sm font-normal text-muted-foreground">
                          /月
                        </span>
                      </>
                    )}
                  </span>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <ul className="space-y-1.5">
                  {details.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-2 text-sm"
                    >
                      <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      {feature}
                    </li>
                  ))}
                </ul>

                {details.limits.length > 0 && (
                  <ul className="space-y-1.5 pt-2 border-t">
                    {details.limits.map((limit) => (
                      <li
                        key={limit}
                        className="flex items-start gap-2 text-sm text-muted-foreground"
                      >
                        <X className="h-4 w-4 shrink-0 mt-0.5" />
                        {limit}
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>

              <CardFooter>
                {isCurrent ? (
                  <Button variant="outline" disabled className="w-full">
                    現在のプラン
                  </Button>
                ) : isUpgrade && plan !== "free" ? (
                  <Button
                    className="w-full"
                    onClick={() =>
                      handleUpgrade(plan as "basic" | "premium")
                    }
                    disabled={loading !== null}
                  >
                    {loading === plan
                      ? "処理中..."
                      : `${details.name} にアップグレード — ¥${details.price.toLocaleString()}/月`}
                  </Button>
                ) : stripeSubscriptionId ? (
                  <Button
                    variant="outline"
                    className="w-full text-muted-foreground"
                    onClick={handleManage}
                    disabled={loading !== null}
                  >
                    {loading === "portal"
                      ? "読み込み中..."
                      : "このプランにダウングレード（サブスクリプション管理から）"}
                  </Button>
                ) : null}
              </CardFooter>
            </Card>
          );
        })}
      </div>

      <p className="mt-6 text-xs text-muted-foreground text-center">
        プランの変更・解約はいつでも可能です。解約後も当月末まで利用できます。
      </p>
    </div>
  );
}
