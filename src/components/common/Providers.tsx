"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { LocaleProvider } from "@/lib/i18n";
import { FontSizeProvider } from "@/lib/font-size";
import { ColorVisionProvider } from "@/lib/color-vision";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <LocaleProvider>
            <FontSizeProvider>
              <ColorVisionProvider>{children}</ColorVisionProvider>
            </FontSizeProvider>
          </LocaleProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </SessionProvider>
  );
}
