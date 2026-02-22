"use client"

import { MoreVertical } from "lucide-react";
import React, { JSX, useMemo } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { usePermissions } from "@/hooks/use-permissions";
import type { NavigationItem } from "@/lib/permissions";

type NavItem = {
  icon: string;
  label: string;
  href: string;
  key: NavigationItem;
  disabled?: boolean;
};

const allNavigationItems: NavItem[] = [
  {
    icon: "/frame-5.svg",
    label: "Dashboard",
    href: "/dashboard",
    key: "dashboard",
  },
  {
    icon: "/image.png",
    label: "Admins",
    href: "/admins",
    key: "admins",
  },
  {
    icon: "/frame-4.svg",
    label: "Communities",
    href: "/communities",
    key: "communities",
  },
  {
    icon: "/frame-3.svg",
    label: "Users",
    href: "/users",
    key: "users",
  },
  {
    icon: "/frame-7.svg",
    label: "Collections",
    href: "/collections",
    key: "collections",
  },
  {
    icon: "/frame-6.svg",
    label: "Utilities",
    href: "/utilities",
    key: "utilities",
  },
  {
    icon: "/frame-9.svg",
    label: "Wallet",
    href: "/wallet",
    key: "wallet",
  },
  {
    icon: "/frame.svg",
    label: "Access codes",
    href: "/access-codes",
    key: "access-codes",
  },
  {
    icon: "/frame-2.svg",
    label: "Audit logs",
    href: "/audit-logs",
    key: "audit-logs",
    disabled: true,
  },
  {
    icon: "/frame-10.svg",
    label: "Partners",
    href: "/partners",
    key: "partners",
  },
  {
    icon: "/frame-8.svg",
    label: "Integrations",
    href: "/integrations",
    key: "integrations",
  },
];

export const Sidebar = (): JSX.Element => {
  const pathname = usePathname();
  const { canAccess, user } = usePermissions();

  // Filter navigation items based on user permissions
  const navigationItems = useMemo(() => {
    return allNavigationItems.filter((item) => canAccess(item.key));
  }, [canAccess]);

  // Get user initials for avatar
  const userInitials = useMemo(() => {
    if (!user?.name) return "U";
    const names = user.name.split(" ");
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return user.name.slice(0, 2).toUpperCase();
  }, [user?.name]);

  return (
    <aside className="fixed left-0 top-0 h-screen flex flex-col w-64 bg-white border-r border-gray-200">
      {/* Header */}
      <header className="px-6 py-4">
        <h1 className="[font-family:'SF_Pro-Bold',Helvetica] font-bold text-[#1f1f3f] text-xl tracking-[-0.5px] whitespace-nowrap">
          Zamani
        </h1>
      </header>

      {/* Navigation */}
      <nav className="flex-1 flex flex-col gap-1 px-3 py-2 overflow-y-auto">
        {navigationItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");

          if (item.disabled) {
            return (
              <div key={item.href} className="w-full cursor-not-allowed" title="Coming soon">
                <Button
                  variant="ghost"
                  disabled
                  className="w-full justify-start gap-3 px-3 py-2 h-10 rounded-lg opacity-40 pointer-events-none"
                >
                  <img className="w-5 h-5 flex-shrink-0" alt={item.label} src={item.icon} />
                  <span className="[font-family:'SF_Pro-Regular',Helvetica] text-[#5b5b66] text-sm tracking-[-0.3px]">
                    {item.label}
                  </span>
                </Button>
              </div>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className="w-full"
            >
              <Button
                variant="ghost"
                className={`w-full justify-start gap-3 px-3 py-2 h-10 rounded-lg transition-colors ${
                  isActive
                    ? "bg-[#1f1f3f] hover:bg-[#1f1f3f]/90"
                    : "hover:bg-gray-100"
                }`}
              >
                <img
                  className={`w-5 h-5 flex-shrink-0 ${isActive ? "brightness-0 invert" : ""}`}
                  alt={item.label}
                  src={item.icon}
                />
                <span
                  className={`text-sm tracking-[-0.3px] ${
                    isActive
                      ? "[font-family:'SF_Pro-Semibold',Helvetica] text-white"
                      : "[font-family:'SF_Pro-Regular',Helvetica] text-[#5b5b66]"
                  }`}
                >
                  {item.label}
                </span>
              </Button>
            </Link>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="border-t border-gray-200 p-3">
        <div className="flex items-center gap-3">
          <Avatar className="w-9 h-9 bg-[#e5e5ea] rounded-lg flex-shrink-0">
            <AvatarFallback className="bg-[#e5e5ea] [font-family:'SF_Pro-Semibold',Helvetica] text-[#2f5fbf] text-sm">
              {userInitials}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="[font-family:'SF_Pro-Semibold',Helvetica] text-[#242426] text-sm tracking-[-0.3px] truncate">
              {user?.name || "User"}
            </div>
            <div className="[font-family:'SF_Pro-Light',Helvetica] text-[#5b5b66] text-xs tracking-[-0.2px] truncate">
              {user?.email || ""}
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="w-8 h-8 p-0 flex-shrink-0"
          >
            <MoreVertical className="w-4 h-4 text-[#5b5b66]" />
          </Button>
        </div>
      </div>
    </aside>
  );
};
