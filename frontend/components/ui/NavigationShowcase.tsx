"use client";

import { useState, type MouseEvent } from "react";
import {
  Bell,
  ClipboardText,
  Gear,
  House,
  MapTrifold,
  Package,
  UsersThree,
} from "@phosphor-icons/react";
import { AppNavigation, type NavigationItem } from "@/components/ui/AppNavigation";

const desktopItems: NavigationItem[] = [
  { id: "home", label: "Home", href: "#home", icon: House },
  { id: "map", label: "Map", href: "#map", icon: MapTrifold },
  { id: "family", label: "Family", href: "#family", icon: UsersThree },
  { id: "plan", label: "Plan", href: "#plan", icon: ClipboardText },
  { id: "supplies", label: "Supplies", href: "#supplies", icon: Package },
  { id: "alerts", label: "Alerts", href: "#alerts", icon: Bell },
  { id: "settings", label: "Settings", href: "#settings", icon: Gear },
];

const mobileItems = desktopItems.filter(({ id }) => id !== "supplies" && id !== "alerts");

type PreviewProps = {
  mode: "desktop" | "mobile";
  title: string;
};

function NavigationPreview({ mode, title }: PreviewProps) {
  const [activeItem, setActiveItem] = useState("plan");

  function handleClick(event: MouseEvent<HTMLElement>) {
    const link = (event.target as Element).closest<HTMLAnchorElement>("a");
    if (!link) return;

    event.preventDefault();
    const itemId = link.dataset.navigationItem;
    if (itemId) setActiveItem(itemId);
  }

  return (
    <section className={`navigation-showcase__preview navigation-showcase__preview--${mode}`} onClick={handleClick}>
      <div className="navigation-showcase__heading">
        <h3 className="type-h3">{title}</h3>
        <code>{mode === "mobile" ? "&lt; 1024px" : "≥ 1024px"}</code>
      </div>
      <AppNavigation
        activeItem={activeItem}
        brandHref="#navigation"
        desktopItems={desktopItems}
        mobileItems={mobileItems}
        mode={mode}
      />
    </section>
  );
}

export function NavigationShowcase() {
  return (
    <div className="navigation-showcase">
      <NavigationPreview mode="mobile" title="Mobile bottom bar" />
      <NavigationPreview mode="desktop" title="Desktop sidebar" />
    </div>
  );
}
