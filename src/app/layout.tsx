import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Noto_Sans_JP } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/common/Providers";
import { AppShell } from "@/components/common/AppShell";
import { CookieConsent } from "@/components/common/CookieConsent";
import { Toaster } from "@/components/ui/sonner";
import { APPLE_TOUCH_ICON_SRC, BRAND_ICON_SRC } from "@/lib/brand";
import { getLocale } from "@/lib/i18n/server";
import { env } from "@/lib/config/env";

const APP_URL = env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
const SITE_NAME = "StudyTracker";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const notoSansJp = Noto_Sans_JP({
  variable: "--font-noto-sans-jp",
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  display: "swap",
  preload: false,
});
export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: "StudyTracker - 勉強時間トラッカー",
    template: `%s | ${SITE_NAME}`,
  },
  description: "学習時間を記録・可視化して、目標達成をサポート",
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    url: APP_URL,
  },
  twitter: {
    card: "summary_large_image",
  },
  alternates: { canonical: "/" },
  robots:
    process.env.VERCEL_ENV === "production"
      ? { index: true, follow: true }
      : { index: false, follow: false },
  icons: {
    icon: BRAND_ICON_SRC,
    shortcut: BRAND_ICON_SRC,
    apple: APPLE_TOUCH_ICON_SRC,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${notoSansJp.variable} antialiased`}
      >
        <Providers>
          <AppShell>
            {children}
            <CookieConsent />
            <Toaster />
          </AppShell>
        </Providers>
      </body>
    </html>
  );
}
