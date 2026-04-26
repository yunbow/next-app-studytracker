"use client";

import { useLocaleContext } from "./context";

export function useTranslations() {
  const { t } = useLocaleContext();
  return { t };
}
