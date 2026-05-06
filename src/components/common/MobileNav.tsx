"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import {
  HomeIcon,
  TimerIcon,
  ClipboardIcon,
  TargetIcon,
  UserIcon,
  SettingsIcon,
} from "./icons";
import { useTranslations } from "@/lib/i18n";

type NavItem = {
  labelKey: "home" | "timer" | "records" | "goals" | "profile" | "settings";
  href: string;
  icon: React.ReactNode;
  authRequired?: boolean;
};

const getNavItems = (userId?: string): NavItem[] => [
  { labelKey: "home", href: "/dashboard", icon: <HomeIcon /> },
  { labelKey: "timer", href: "/timer", icon: <TimerIcon />, authRequired: true },
  { labelKey: "records", href: "/records", icon: <ClipboardIcon />, authRequired: true },
  { labelKey: "goals", href: "/goals", icon: <TargetIcon />, authRequired: true },
  { labelKey: "profile", href: userId ? `/users/${userId}` : "/dashboard", icon: <UserIcon />, authRequired: true },
  { labelKey: "settings", href: "/settings", icon: <SettingsIcon />, authRequired: true },
];

export function MobileNav() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { t } = useTranslations();

  const filteredNavItems = getNavItems(session?.user?.id).filter((item) => {
    if (item.authRequired && !session) {
      return false;
    }
    return true;
  });

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background border-t">
      <div className="flex items-center justify-around h-16">
        {filteredNavItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors",
              pathname === item.href
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
            aria-label={t.nav[item.labelKey]}
            aria-current={pathname === item.href ? "page" : undefined}
          >
            <span aria-hidden="true">{item.icon}</span>
            <span className="text-xs">{t.nav[item.labelKey]}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
