import type { SVGProps, ReactNode } from "react";

export type IconName = "search" | "cart" | "bag" | "user" | "menu" | "close" | "chevron" | "arrow" | "orders" | "grid" | "home" | "logout" | "admin" | "check" | "info" | "box" | "shield" | "sparkles" | "refresh" | "sliders" | "eye" | "eyeOff";

const paths: Record<IconName, ReactNode> = {
  search: <><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 4 4" /></>,
  cart: <><path d="M2 3h3l3 13h11l3-9H6" /><circle cx="9" cy="21" r="1" /><circle cx="18" cy="21" r="1" /></>,
  bag: <><path d="M5 7h14l1 14H4L5 7Z" /><path d="M8 8V6a4 4 0 0 1 8 0v2" /></>,
  user: <><circle cx="12" cy="8" r="4" /><path d="M4 21v-2a8 8 0 0 1 16 0v2" /></>,
  menu: <path d="M4 6h16M4 12h16M4 18h16" />,
  close: <path d="m6 6 12 12M6 18 18 6" />,
  chevron: <path d="m6 9 6 6 6-6" />,
  arrow: <path d="M4 12h16m-6-6 6 6-6 6" />,
  orders: <><rect x="5" y="3" width="14" height="18" rx="2" /><path d="M9 8h6M9 12h6M9 16h4" /></>,
  grid: <><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></>,
  home: <><path d="m3 10 9-7 9 7M5 9v12h14V9" /><path d="M9 21v-8h6v8" /></>,
  logout: <><path d="M10 4H4v16h6M10 12h11m-4-4 4 4-4 4" /></>,
  admin: <><path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6l8-3Z" /><path d="m8 12 3 3 5-6" /></>,
  check: <><circle cx="12" cy="12" r="9" /><path d="m8 12 3 3 5-6" /></>,
  info: <><circle cx="12" cy="12" r="9" /><path d="M12 11v6M12 7h.01" /></>,
  box: <><path d="m12 3 9 5v9l-9 5-9-5V8l9-5Zm0 10 9-5M3 8l9 5v9M7.5 5.5l9 5" /></>,
  shield: <><path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6l8-3Z" /><path d="m8.5 12 2.2 2.2 4.8-5" /></>,
  sparkles: <><path d="m12 3 1.2 3.8L17 8l-3.8 1.2L12 13l-1.2-3.8L7 8l3.8-1.2L12 3ZM5 14l.8 2.2L8 17l-2.2.8L5 20l-.8-2.2L2 17l2.2-.8L5 14Zm13-1 1 3 3 1-3 1-1 3-1-3-3-1 3-1 1-3Z" /></>,
  refresh: <><path d="M20 7v5h-5" /><path d="M18.5 16a8 8 0 1 1 .8-7.1L20 12" /></>,
  sliders: <><path d="M4 6h5m4 0h7M9 3v6M4 18h7m4 0h5M15 15v6M4 12h2m4 0h10M6 9v6" /></>,
  eye: <><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" /><circle cx="12" cy="12" r="2.5" /></>,
  eyeOff: <><path d="m3 3 18 18M10.6 6.2A10.7 10.7 0 0 1 12 6c6.5 0 10 6 10 6a18 18 0 0 1-2.1 2.8M6.6 6.6C3.6 8.4 2 12 2 12s3.5 6 10 6c1.4 0 2.7-.3 3.8-.7M9.9 9.9a3 3 0 0 0 4.2 4.2" /></>,
};

export function Icon({ name, ...props }: SVGProps<SVGSVGElement> & { name: IconName }) {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false" {...props}>{paths[name]}</svg>;
}
