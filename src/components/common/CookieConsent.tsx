"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useTranslations } from "@/lib/i18n/use-translations";

export function CookieConsent() {
  const { t } = useTranslations();
  const [showConsent, setShowConsent] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) {
      setShowConsent(true);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem("cookie-consent", "accepted");
    setShowConsent(false);
  };

  if (!showConsent) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background p-4 shadow-lg">
      <div className="container mx-auto flex flex-col items-center justify-between gap-4 sm:flex-row">
        <p className="text-sm text-muted-foreground">{t.cookie.message}</p>
        <Button onClick={acceptCookies} size="sm">
          {t.cookie.accept}
        </Button>
      </div>
    </div>
  );
}
