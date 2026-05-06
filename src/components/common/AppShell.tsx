"use client";

import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { LPHeader } from "@/components/landing/LPHeader";
import { LPFooter } from "@/components/landing/LPFooter";
import { Sidebar } from "./Sidebar";
import { MobileNav } from "./MobileNav";
import { useTranslations } from "@/lib/i18n";

function SkipLink() {
  const { t } = useTranslations();
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:bg-background focus:px-4 focus:py-2 focus:rounded-md focus:ring-2 focus:ring-ring focus:outline-none"
    >
      {t.accessibility.skipToContent}
    </a>
  );
}

const PUBLIC_PATHS = ["/", "/login", "/register", "/terms", "/privacy", "/cookies", "/about"];

// LPヘッダー+フッターを使うページ
const LP_HEADER_PATHS = ["/login", "/register", "/terms", "/privacy", "/cookies", "/about"];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { status } = useSession();

  const isPublicPage = PUBLIC_PATHS.some(path => pathname === path || pathname.startsWith(path));
  const useLPHeader = LP_HEADER_PATHS.some(path => pathname.startsWith(path));
  const isAuthenticated = status === "authenticated";
  const isLoading = status === "loading";

  // Loading state
  if (isLoading && !isPublicPage) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  // Authenticated: Sidebar (desktop) + Bottom Nav (mobile)
  if (isAuthenticated) {
    return (
      <>
        <SkipLink />
        <div className="flex min-h-screen">
          <Sidebar />
          <main id="main-content" className="flex-1 p-4 pb-20 md:pb-6">{children}</main>
          <MobileNav />
        </div>
      </>
    );
  }

  // 未ログイン（login/register/legal）: LPヘッダー + コンテンツ + フッター
  if (useLPHeader) {
    return (
      <>
        <SkipLink />
        <div className="flex flex-col min-h-screen">
          <LPHeader />
          <main id="main-content" className="flex-1">{children}</main>
          <LPFooter />
        </div>
      </>
    );
  }

  // Public pages: Simple layout
  return (
    <>
      <SkipLink />
      <main id="main-content">{children}</main>
    </>
  );
}
