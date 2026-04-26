import "server-only";
import { cookies } from "next/headers";
import type { Locale } from "./types";
import { defaultLocale } from "./types";
import { translations } from "./locales";

export async function getLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  return (cookieStore.get("locale")?.value as Locale) || defaultLocale;
}

export async function getTranslations() {
  const locale = await getLocale();
  return translations[locale];
}
