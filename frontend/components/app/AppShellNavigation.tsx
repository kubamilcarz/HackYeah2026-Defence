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
import { useLocalization } from "@/components/localization/LocalizationProvider";

function itemMatchesPath(item: NavigationItem, pathname: string) {
  return item.href === "/" ? pathname === "/" : pathname === item.href || pathname.startsWith(`${item.href}/`);
}

export function AppShellNavigation() {
  const pathname = usePathname();
  const { messages } = useLocalization();
  const { navigation } = messages;
  const desktopItems: NavigationItem[] = [
    { id: "home", label: navigation.home, href: "/", icon: House },
    { id: "map", label: navigation.map, href: "/map", icon: MapTrifold },
    { id: "family", label: navigation.family, href: "/family", icon: UsersThree },
    { id: "plan", label: navigation.plan, href: "/plan", icon: ClipboardText },
    { id: "supplies", label: navigation.supplies, href: "/supplies", icon: Package },
    { id: "alerts", label: navigation.alerts, href: "/alerts", icon: Bell },
    { id: "settings", label: navigation.settings, href: "/settings", icon: Gear },
  ];
  const mobileItems = desktopItems.filter(({ id }) => id !== "supplies" && id !== "alerts");
  const activeItem = desktopItems.find((item) => itemMatchesPath(item, pathname))?.id;

  return <AppNavigation activeItem={activeItem} brandLabel={navigation.brandLabel} desktopItems={desktopItems} mobileItems={mobileItems} navigationLabel={navigation.primary} />;
}
