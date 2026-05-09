"use client";

import { useState, useSyncExternalStore } from "react";
import { Button } from "@/components/ui/button";
import { useTranslations } from "@/lib/i18n/use-translations";

const noopSubscribe = () => () => {};
const getStoredConsent = () => localStorage.getItem("cookie-consent");
const getServerConsent = () => "server";

export function CookieConsent() {
  const { t } = useTranslations();
  const storedConsent = useSyncExternalStore(
    noopSubscribe,
    getStoredConsent,
    getServerConsent
  );
  const [dismissed, setDismissed] = useState(false);
  const showConsent = storedConsent === null && !dismissed;

  const acceptCookies = () => {
    localStorage.setItem("cookie-consent", "accepted");
    setDismissed(true);
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
