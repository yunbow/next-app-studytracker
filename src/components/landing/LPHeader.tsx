"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { BrandMark } from "@/components/common/BrandMark";
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
      <div className="container mx-auto flex h-16 items-center justify-between gap-3 px-4">
        <Link href="/" className="shrink-0">
          <BrandMark
            label={t.common.appName}
            markSize={32}
            labelClassName="text-lg sm:text-xl"
          />
        </Link>

        <div className="flex min-w-0 items-center gap-1 sm:gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                aria-label={t.accessibility.selectLanguage}
                className="gap-1 px-2 sm:px-3"
              >
                <Globe className="h-4 w-4" />
                <span className="hidden sm:inline">{t.language[locale]}</span>
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
                className="hidden gap-1 px-2 sm:inline-flex sm:px-3"
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

          <Button asChild variant="outline" className="hidden sm:inline-flex">
            <Link href="/register">{t.common.register}</Link>
          </Button>

          <Button asChild variant="default" size="sm">
            <Link href="/login">{t.common.login}</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
