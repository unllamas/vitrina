import type { ButtonHTMLAttributes } from "react";

import { cx } from "../lib/cx.ts";

type Variant = "primary" | "secondary";

export function buttonClassName(variant: Variant = "primary", className?: string): string {
  return cx(
    "inline-flex min-h-11 items-center justify-center rounded-xl px-4 text-base font-medium",
    variant === "primary" ? "bg-ink text-canvas" : "border border-line bg-surface text-ink",
    className,
  );
}

export function Button({
  variant = "primary",
  className,
  type = "button",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return <button type={type} className={buttonClassName(variant, className)} {...props} />;
}
