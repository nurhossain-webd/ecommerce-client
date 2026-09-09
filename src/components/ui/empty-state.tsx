import type { ReactNode } from "react";
import { Icon, type IconName } from "./icon";

export function EmptyState({ children, title, action, icon = "box" }: { children?: ReactNode; title?: string; action?: ReactNode; icon?: IconName }) {
  return <div className="state-card" role="status">
    <span className="mx-auto mb-5 grid size-14 place-items-center rounded-2xl border border-line bg-surface text-muted"><Icon name={icon} className="size-6" /></span>
    {title && <h2 className="mb-2 text-lg font-semibold tracking-tight text-ink">{title}</h2>}
    <div className="mx-auto max-w-md text-sm leading-6 text-muted">{children}</div>
    {action && <div className="mt-6 flex justify-center">{action}</div>}
  </div>;
}
