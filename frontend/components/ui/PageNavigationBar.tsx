import { ArrowLeft } from "@phosphor-icons/react/ssr";
import type { Icon } from "@phosphor-icons/react/lib";
import type { MouseEventHandler } from "react";
import Link from "next/link";
import { IconButton } from "@/components/ui/Button";

export type PageNavigationAction = {
  disabled?: boolean;
  icon: Icon;
  label: string;
  onClick: MouseEventHandler<HTMLButtonElement>;
};

export type PageNavigationBarProps = {
  action?: PageNavigationAction;
  backDisabled?: boolean;
  backHref?: string;
  backLabel?: string;
  className?: string;
  onBack?: MouseEventHandler<HTMLButtonElement>;
  title: string;
};

export function PageNavigationBar({
  action,
  backDisabled = false,
  backHref,
  backLabel = "Go back",
  className,
  onBack,
  title,
}: PageNavigationBarProps) {
  return (
    <header className={`page-navigation-bar${className ? ` ${className}` : ""}`}>
      <div className="page-navigation-bar__slot page-navigation-bar__slot--leading">
        {backHref ? (
          <Link
            aria-label={backLabel}
            className="icon-button icon-button--tertiary page-navigation-bar__button"
            href={backHref}
          >
            <ArrowLeft aria-hidden="true" size={20} weight="bold" />
          </Link>
        ) : onBack && (
          <IconButton
            className="page-navigation-bar__button"
            disabled={backDisabled}
            icon={ArrowLeft}
            label={backLabel}
            onClick={onBack}
            variant="tertiary"
          />
        )}
      </div>
      <p className="page-navigation-bar__title">{title}</p>
      <div className="page-navigation-bar__slot page-navigation-bar__slot--trailing">
        {action && (
          <IconButton
            className="page-navigation-bar__button"
            disabled={action.disabled}
            icon={action.icon}
            label={action.label}
            onClick={action.onClick}
            variant="tertiary"
          />
        )}
      </div>
    </header>
  );
}
