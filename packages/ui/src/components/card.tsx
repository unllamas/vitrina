import type { HTMLAttributes } from "react";

import { cx } from "../lib/cx.ts";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cx("rounded-xl border border-line bg-surface p-4", className)} {...props} />;
}
