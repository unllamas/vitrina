import type { HTMLAttributes } from "react";

import { cx } from "../lib/cx.ts";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cx("rounded-3xl border border-line bg-surface p-6 sm:p-8", className)} {...props} />;
}
