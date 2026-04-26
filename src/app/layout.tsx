import type { Metadata } from "next";
import { Geist, Geist_Mono, Noto_Sans_JP } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/common/Providers";
import { AppShell } from "@/components/common/AppShell";
import { CookieConsent } from "@/components/common/CookieConsent";
import { Toaster } from "@/components/ui/sonner";
import { getLocale } from "@/lib/i18n/server";

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
  title: "StudyTracker - 勉強時間トラッカー",
  description: "学習時間を記録・可視化して、目標達成をサポート",
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
