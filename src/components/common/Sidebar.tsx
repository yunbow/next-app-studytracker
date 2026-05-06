"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { ChevronLeft, ChevronRight, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();
  const { t } = useTranslations();

  const filteredNavItems = getNavItems(session?.user?.id).filter((item) => {
    if (item.authRequired && !session) {
      return false;
    }
    return true;
  });

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/" });
    setShowLogoutDialog(false);
  };

  const getUserInitial = () => {
    if (session?.user?.name) {
      return session.user.name.charAt(0).toUpperCase();
    }
    if (session?.user?.email) {
      return session.user.email.charAt(0).toUpperCase();
    }
    return "U";
  };

  return (
    <>
      <aside
        className={cn(
          "hidden md:flex flex-col border-r bg-background transition-all duration-300",
          isCollapsed ? "w-16" : "w-64"
        )}
        aria-label="Sidebar navigation"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          {!isCollapsed && (
            <Link href="/dashboard" className="font-bold text-lg">
              {t.common.appName}
            </Link>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(!isCollapsed)}
            aria-label={isCollapsed ? t.sidebar.expand : t.sidebar.collapse}
            className={cn(isCollapsed && "mx-auto")}
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            ) : (
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            )}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-2 space-y-1" aria-label="Main navigation">
          {filteredNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
                pathname === item.href
                  ? "bg-accent text-accent-foreground"
                  : "hover:bg-accent hover:text-accent-foreground",
                isCollapsed && "justify-center"
              )}
              aria-label={t.nav[item.labelKey]}
              aria-current={pathname === item.href ? "page" : undefined}
            >
              <span aria-hidden="true">{item.icon}</span>
              {!isCollapsed && <span>{t.nav[item.labelKey]}</span>}
            </Link>
          ))}
        </nav>

        {/* User Info */}
        {session && (
          <div className="p-4 border-t">
            <button
              onClick={() => setShowLogoutDialog(true)}
              className={cn(
                "flex items-center gap-3 w-full p-2 rounded-md hover:bg-accent transition-colors",
                isCollapsed && "justify-center"
              )}
              aria-label={t.accessibility.userMenu}
            >
              <Avatar className="h-8 w-8">
                <AvatarFallback>{getUserInitial()}</AvatarFallback>
              </Avatar>
              {!isCollapsed && (
                <div className="flex-1 text-left overflow-hidden">
                  <p className="text-sm font-medium truncate">
                    {session.user?.name || t.common.nameNotSet}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {session.user?.email}
                  </p>
                </div>
              )}
            </button>
          </div>
        )}
      </aside>

      {/* Logout Dialog */}
      <Dialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.sidebar.logoutConfirm}</DialogTitle>
            <DialogDescription>{t.sidebar.logoutDescription}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLogoutDialog(false)}>
              {t.common.cancel}
            </Button>
            <Button onClick={handleLogout} className="gap-2">
              <LogOut className="h-4 w-4" aria-hidden="true" />
              {t.sidebar.logout}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
