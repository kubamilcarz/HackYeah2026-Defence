import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import type { Icon } from "@phosphor-icons/react/lib";

export type NavigationItem = {
  href: string;
  icon: Icon;
  id: string;
  label: string;
};

type NavigationMode = "desktop" | "mobile" | "responsive";

export type AppNavigationProps = {
  activeItem?: string;
  brandHref?: string;
  brandLabel?: string;
  desktopItems: NavigationItem[];
  mobileItems: NavigationItem[];
  mode?: NavigationMode;
  navigationLabel?: string;
};

function NavigationLinks({
  activeItem,
  items,
  variant,
}: {
  activeItem?: string;
  items: NavigationItem[];
  variant: "desktop" | "mobile";
}) {
  return (
    <ul
      className={`app-navigation__list app-navigation__list--${variant}`}
      style={variant === "mobile" ? { "--navigation-item-count": items.length } as CSSProperties : undefined}
    >
      {items.map(({ href, icon: Icon, id, label }) => {
        const isActive = id === activeItem;

        return (
          <li key={id}>
            <Link
              aria-current={isActive ? "page" : undefined}
              className={`app-navigation__link app-navigation__link--${variant}${isActive ? " app-navigation__link--active" : ""}`}
              data-navigation-item={id}
              href={href}
            >
              <Icon
                aria-hidden="true"
                className="app-navigation__icon"
                size={variant === "mobile" ? 24 : 20}
                weight={isActive ? "fill" : "regular"}
              />
              <span>{label}</span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export function AppNavigation({
  activeItem,
  brandHref = "/",
  brandLabel = "Plan: 0 home",
  desktopItems,
  mobileItems,
  mode = "responsive",
  navigationLabel = "Primary navigation",
}: AppNavigationProps) {
  return (
    <div className={`app-navigation app-navigation--${mode}`}>
      {mode !== "desktop" && (
        <nav aria-label={navigationLabel} className="app-navigation__mobile">
          <NavigationLinks activeItem={activeItem} items={mobileItems} variant="mobile" />
        </nav>
      )}

      {mode !== "mobile" && (
        <aside className="app-navigation__desktop">
          <Link aria-label={brandLabel} className="app-navigation__brand" href={brandHref}>
            <Image alt="" className="app-navigation__brand-logo app-navigation__brand-logo--color" height={80} src="/brand/logo-color.svg" width={80} />
            <Image alt="" className="app-navigation__brand-logo app-navigation__brand-logo--contrast" height={80} src="/brand/logo-white.svg" width={80} />
          </Link>
          <nav aria-label={navigationLabel}>
            <NavigationLinks activeItem={activeItem} items={desktopItems} variant="desktop" />
          </nav>
        </aside>
      )}
    </div>
  );
}
