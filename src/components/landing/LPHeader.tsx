"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useTranslations } from "@/lib/i18n/use-translations";
import { useLocale } from "@/lib/i18n/use-locale";
import { useTheme } from "next-themes";
import { Moon, Sun, Monitor, Globe, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function LPHeader() {
  const { t } = useTranslations();
  const { locale, setLocale } = useLocale();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const themeLabel = mounted
    ? theme === "dark"
      ? t.theme.dark
      : theme === "light"
        ? t.theme.light
        : t.theme.system
    : "";

  const themeIcon = mounted ? (
    theme === "dark" ? (
      <Moon className="h-4 w-4" />
    ) : theme === "light" ? (
      <Sun className="h-4 w-4" />
    ) : (
      <Monitor className="h-4 w-4" />
    )
  ) : (
    <Sun className="h-4 w-4" />
  );

  return (
    <header className="border-b">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="text-xl font-bold">
          {t.common.appName}
        </Link>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                aria-label={t.accessibility.selectLanguage}
              >
                <Globe className="h-4 w-4" />
                <span>{t.language[locale]}</span>
                <ChevronDown className="h-3 w-3 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setLocale("ja")}>
                日本語 {locale === "ja" && "✓"}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLocale("en")}>
                English {locale === "en" && "✓"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                aria-label={t.accessibility.selectTheme}
              >
                {themeIcon}
                <span>{themeLabel}</span>
                <ChevronDown className="h-3 w-3 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setTheme("light")}>
                <Sun className="h-4 w-4" />
                {t.theme.light} {theme === "light" && "✓"}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("dark")}>
                <Moon className="h-4 w-4" />
                {t.theme.dark} {theme === "dark" && "✓"}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("system")}>
                <Monitor className="h-4 w-4" />
                {t.theme.system} {theme === "system" && "✓"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button asChild variant="outline">
            <Link href="/register">{t.common.register}</Link>
          </Button>

          <Button asChild variant="default">
            <Link href="/login">{t.common.login}</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
