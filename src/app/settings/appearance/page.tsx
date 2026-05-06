"use client";

import { useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Sun, Moon, Monitor, Globe, ChevronDown, Type, Eye } from "lucide-react";
import { useLocale, useTranslations } from "@/lib/i18n";
import { useFontSize, type FontSize } from "@/lib/font-size";
import { useColorVision, type ColorVisionMode } from "@/lib/color-vision";
import { BackLink } from "@/components/common/BackLink";

const emptySubscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

export default function AppearanceSettingsPage() {
  const { t } = useTranslations();
  const { locale, setLocale } = useLocale();
  const { theme, setTheme } = useTheme();
  const { fontSize, setFontSize } = useFontSize();
  const { colorVisionMode, setColorVisionMode } = useColorVision();
  const mounted = useSyncExternalStore(emptySubscribe, getClientSnapshot, getServerSnapshot);

  const currentLanguageLabel = mounted ? (locale === "ja" ? `🇯🇵 ${t.language.ja}` : `🇺🇸 ${t.language.en}`) : "...";
  const currentThemeLabel = mounted ? (theme === "light" ? t.theme.light : theme === "dark" ? t.theme.dark : t.theme.system) : "...";
  const currentThemeIcon = mounted ? (theme === "light" ? <Sun className="h-4 w-4" /> : theme === "dark" ? <Moon className="h-4 w-4" /> : <Monitor className="h-4 w-4" />) : <Monitor className="h-4 w-4" />;
  const fontSizeLabels: Record<FontSize, string> = { small: t.settings.fontSizeSmall, medium: t.settings.fontSizeMedium, large: t.settings.fontSizeLarge };
  const currentFontSizeLabel = mounted ? fontSizeLabels[fontSize] : "...";
  const colorVisionLabels: Record<ColorVisionMode, string> = { normal: t.settings.colorVisionNormal, protanopia: t.settings.colorVisionProtanopia, deuteranopia: t.settings.colorVisionDeuteranopia, tritanopia: t.settings.colorVisionTritanopia };
  const currentColorVisionLabel = mounted ? colorVisionLabels[colorVisionMode] : "...";

  return (
    <div className="w-full max-w-2xl pb-6">
      <BackLink href="/settings" label="設定に戻る" />
      <h1 className="text-2xl font-bold mb-6">{t.settings.appearance}</h1>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2"><Globe className="h-5 w-5" />{t.settings.appearance}</CardTitle>
          <CardDescription>{t.settings.appearanceDescription}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div><p className="font-medium">{t.settings.language}</p><p className="text-sm text-muted-foreground">{t.settings.languageDescription}</p></div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild><Button variant="outline" className="min-w-[140px] justify-between">{currentLanguageLabel}<ChevronDown className="ml-2 h-4 w-4" /></Button></DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setLocale("ja")}><span className="mr-2">🇯🇵</span>{t.language.ja}</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLocale("en")}><span className="mr-2">🇺🇸</span>{t.language.en}</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="flex items-center justify-between">
            <div><p className="font-medium">{t.settings.theme}</p><p className="text-sm text-muted-foreground">{t.settings.themeDescription}</p></div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild><Button variant="outline" className="min-w-[140px] justify-between"><span className="flex items-center gap-2">{currentThemeIcon}{currentThemeLabel}</span><ChevronDown className="ml-2 h-4 w-4" /></Button></DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setTheme("light")}><Sun className="mr-2 h-4 w-4" />{t.theme.light}</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("dark")}><Moon className="mr-2 h-4 w-4" />{t.theme.dark}</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("system")}><Monitor className="mr-2 h-4 w-4" />{t.theme.system}</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="flex items-center justify-between">
            <div><p className="font-medium">{t.settings.fontSize}</p><p className="text-sm text-muted-foreground">{t.settings.fontSizeDescription}</p></div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild><Button variant="outline" className="min-w-[140px] justify-between"><span className="flex items-center gap-2"><Type className="h-4 w-4" />{currentFontSizeLabel}</span><ChevronDown className="ml-2 h-4 w-4" /></Button></DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setFontSize("small")}><span className="mr-2 text-sm">A</span>{t.settings.fontSizeSmall}</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFontSize("medium")}><span className="mr-2 text-base">A</span>{t.settings.fontSizeMedium}</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFontSize("large")}><span className="mr-2 text-lg">A</span>{t.settings.fontSizeLarge}</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="flex items-center justify-between">
            <div><p className="font-medium">{t.settings.colorVision}</p><p className="text-sm text-muted-foreground">{t.settings.colorVisionDescription}</p></div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild><Button variant="outline" className="min-w-[180px] justify-between"><span className="flex items-center gap-2"><Eye className="h-4 w-4" />{currentColorVisionLabel}</span><ChevronDown className="ml-2 h-4 w-4" /></Button></DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setColorVisionMode("normal")}><Eye className="mr-2 h-4 w-4" />{t.settings.colorVisionNormal}</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setColorVisionMode("protanopia")}><Eye className="mr-2 h-4 w-4" />{t.settings.colorVisionProtanopia}</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setColorVisionMode("deuteranopia")}><Eye className="mr-2 h-4 w-4" />{t.settings.colorVisionDeuteranopia}</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setColorVisionMode("tritanopia")}><Eye className="mr-2 h-4 w-4" />{t.settings.colorVisionTritanopia}</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
