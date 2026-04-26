import { ja } from "./ja";
import { en } from "./en";

export const translations = {
  ja,
  en,
} as const;

export type Translations = typeof ja;
