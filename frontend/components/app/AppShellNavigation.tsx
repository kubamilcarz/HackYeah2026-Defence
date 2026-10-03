"use client";

import {
  Bell,
  ClipboardText,
  Gear,
  House,
  MapTrifold,
  Package,
  UsersThree,
} from "@phosphor-icons/react";
import { usePathname } from "next/navigation";
import { AppNavigation, type NavigationItem } from "@/components/ui/AppNavigation";

const desktopItems: NavigationItem[] = [
  { id: "home", label: "Home", href: "/", icon: House },
  { id: "map", label: "Map", href: "/map", icon: MapTrifold },
  { id: "family", label: "Family", href: "/family", icon: UsersThree },
  { id: "plan", label: "Plan", href: "/plan", icon: ClipboardText },
  { id: "supplies", label: "Supplies", href: "/supplies", icon: Package },
  { id: "alerts", label: "Alerts", href: "/alerts", icon: Bell },
  { id: "settings", label: "Settings", href: "/settings", icon: Gear },
];

const mobileItems = desktopItems.filter(({ id }) => id !== "supplies" && id !== "alerts");

function itemMatchesPath(item: NavigationItem, pathname: string) {
  return item.href === "/" ? pathname === "/" : pathname === item.href || pathname.startsWith(`${item.href}/`);
}

export function AppShellNavigation() {
  const pathname = usePathname();
  const activeItem = desktopItems.find((item) => itemMatchesPath(item, pathname))?.id;

  return <AppNavigation activeItem={activeItem} desktopItems={desktopItems} mobileItems={mobileItems} />;
}
