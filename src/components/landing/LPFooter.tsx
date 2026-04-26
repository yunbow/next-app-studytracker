"use client";

import Link from "next/link";
import { useTranslations } from "@/lib/i18n/use-translations";

export function LPFooter() {
  const { t } = useTranslations();

  return (
    <footer className="border-t py-8" role="contentinfo">
      <div className="container mx-auto px-4">
        <nav
          className="mb-4 flex flex-wrap justify-center gap-6 text-sm"
          aria-label="フッターナビゲーション"
        >
          <Link href="/terms" className="text-muted-foreground hover:text-foreground transition-colors">
            {t.footer.terms}
          </Link>
          <Link href="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">
            {t.footer.privacy}
          </Link>
          <Link href="/cookies" className="text-muted-foreground hover:text-foreground transition-colors">
            {t.footer.cookie}
          </Link>
          <Link href="/about" className="text-muted-foreground hover:text-foreground transition-colors">
            {t.footer.creator}
          </Link>
        </nav>
        <p className="text-center text-sm text-muted-foreground">
          © 2026 {t.common.appName}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
