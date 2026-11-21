import type { HTMLAttributes } from "react";

import { cx } from "../lib/cx.ts";

/** Bloque de página: título liviano, texto secundario chico y aire. */
export function Section({
  eyebrow,
  title,
  description,
  children,
  className,
  ...props
}: HTMLAttributes<HTMLElement> & {
  eyebrow?: string;
  title: string;
  description?: string;
}) {
  return (
    <section className={cx("flex flex-col gap-8", className)} {...props}>
      <div className="flex max-w-2xl flex-col gap-3">
        {eyebrow ? <p className="text-sm text-muted">{eyebrow}</p> : null}
        <h2 className="text-3xl font-light tracking-[-0.03em] text-balance sm:text-4xl">{title}</h2>
        {description ? <p className="text-pretty text-sm leading-relaxed text-muted">{description}</p> : null}
      </div>
      {children}
    </section>
  );
}
