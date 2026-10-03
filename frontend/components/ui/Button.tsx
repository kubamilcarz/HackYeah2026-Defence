import type { ButtonHTMLAttributes, ReactNode } from "react";
import type { Icon } from "@phosphor-icons/react/lib";

export type ButtonVariant = "primary" | "secondary" | "tertiary" | "destructive";

type SharedButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

export type ButtonProps = SharedButtonProps & {
  children: ReactNode;
  leadingIcon?: Icon;
  trailingIcon?: Icon;
};

export function Button({
  children,
  className,
  leadingIcon: LeadingIcon,
  trailingIcon: TrailingIcon,
  type = "button",
  variant = "primary",
  ...props
}: ButtonProps) {
  return (
    <button className={`button button--${variant}${className ? ` ${className}` : ""}`} type={type} {...props}>
      {LeadingIcon && <LeadingIcon aria-hidden="true" className="button__icon" size={20} weight="bold" />}
      <span>{children}</span>
      {TrailingIcon && <TrailingIcon aria-hidden="true" className="button__icon" size={20} weight="bold" />}
    </button>
  );
}

export type IconButtonProps = Omit<SharedButtonProps, "aria-label" | "children"> & {
  icon: Icon;
  label: string;
};

export function IconButton({
  className,
  icon: Icon,
  label,
  type = "button",
  variant = "secondary",
  ...props
}: IconButtonProps) {
  return (
    <button
      aria-label={label}
      className={`icon-button icon-button--${variant}${className ? ` ${className}` : ""}`}
      type={type}
      {...props}
    >
      <Icon aria-hidden="true" size={20} weight="bold" />
    </button>
  );
}
