"use client";

import { createCookieContext } from "@/lib/utils/create-cookie-context";
import { COOKIE_NAMES } from "@/lib/constants/cookies";
import {
  FontSize,
  DEFAULT_FONT_SIZE,
  SUPPORTED_FONT_SIZES,
  FONT_SIZE_VALUES,
} from "./types";

const { Context, Provider, useValue: useFontSizeValue } = createCookieContext<FontSize>({
  cookieName: COOKIE_NAMES.FONT_SIZE,
  defaultValue: DEFAULT_FONT_SIZE,
  supportedValues: SUPPORTED_FONT_SIZES,
  validator: (value): value is FontSize =>
    SUPPORTED_FONT_SIZES.includes(value as FontSize),
  applyEffect: (fontSize) => {
    if (typeof document !== "undefined") {
      document.documentElement.style.fontSize = FONT_SIZE_VALUES[fontSize];
    }
  },
});

export const FontSizeContext = Context;
export const FontSizeProvider = Provider;

export function useFontSize() {
  const { value: fontSize, setValue: setFontSize } = useFontSizeValue();
  return { fontSize, setFontSize };
}
