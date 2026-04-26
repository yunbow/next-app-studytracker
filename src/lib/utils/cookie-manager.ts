export type CookieOptions = {
  maxAgeDays?: number;
  path?: string;
  sameSite?: "Strict" | "Lax" | "None";
  secure?: boolean;
};

const DEFAULT_OPTIONS: Required<CookieOptions> = {
  maxAgeDays: 365,
  path: "/",
  sameSite: "Lax",
  secure: false,
};

let cookieCache: Record<string, string> | null = null;
let lastCookieString: string | null = null;

function parseCookies(): Record<string, string> {
  if (typeof document === "undefined") {
    return {};
  }

  const currentCookieString = document.cookie;

  if (cookieCache !== null && lastCookieString === currentCookieString) {
    return cookieCache;
  }

  const cookies: Record<string, string> = {};
  if (currentCookieString) {
    currentCookieString.split(";").forEach((cookie) => {
      const [name, ...rest] = cookie.trim().split("=");
      if (name) {
        cookies[name] = decodeURIComponent(rest.join("="));
      }
    });
  }

  cookieCache = cookies;
  lastCookieString = currentCookieString;

  return cookies;
}

function invalidateCookieCache(): void {
  cookieCache = null;
  lastCookieString = null;
}

export function getCookie(name: string): string | null {
  if (typeof document === "undefined") {
    return null;
  }

  const cookies = parseCookies();
  return cookies[name] ?? null;
}

export function setCookie(
  name: string,
  value: string,
  options: CookieOptions = {}
): void {
  if (typeof document === "undefined") {
    return;
  }

  const opts = { ...DEFAULT_OPTIONS, ...options };
  const expires = new Date(Date.now() + opts.maxAgeDays * 864e5).toUTCString();

  let cookieString = `${name}=${encodeURIComponent(value)}`;
  cookieString += `; expires=${expires}`;
  cookieString += `; path=${opts.path}`;
  cookieString += `; SameSite=${opts.sameSite}`;

  if (opts.secure) {
    cookieString += "; Secure";
  }

  document.cookie = cookieString;
  invalidateCookieCache();
}

export function removeCookie(name: string, path: string = "/"): void {
  if (typeof document === "undefined") {
    return;
  }

  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path}`;
  invalidateCookieCache();
}

export function getTypedCookie<T>(
  name: string,
  validator: (value: unknown) => value is T,
  defaultValue: T
): T {
  const value = getCookie(name);
  if (value && validator(value)) {
    return value;
  }
  return defaultValue;
}
