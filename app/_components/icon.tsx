import type { ReactNode } from "react";

const paths = {
  arrow: <path d="M4 12h15M13 5l7 7-7 7" />,
  check: <path d="m5 12 4 4L19 6" />,
  play: <path d="m9 6 9 6-9 6V6Z" />,
  pause: <path d="M9 5v14M15 5v14" />,
  tasks: <><rect x="4" y="4" width="16" height="17" rx="3" /><path d="M9 3h6v4H9zM8 12l1 1 2-2M13 12h3M8 17l1 1 2-2M13 17h3" /></>,
  offline: <><path d="m3 3 18 18M8.5 5.5A6 6 0 0 1 18 10a4.5 4.5 0 0 1 2 7M16 19H7a5 5 0 0 1-2-9" /></>,
  report: <><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9l-6-6Z" /><path d="M14 3v6h6M8 13h8M8 17h5" /></>,
  team: <><circle cx="9" cy="8" r="3" /><path d="M3 21v-3a6 6 0 0 1 12 0v3M16 5a3 3 0 0 1 0 6M21 21v-3a6 6 0 0 0-3-5" /></>,
  location: <><path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.5" /></>,
  business: <><rect x="3" y="7" width="18" height="14" rx="3" /><path d="M8 7V4h8v3M3 12a22 22 0 0 0 18 0M12 12v4" /></>,
  heart: <path d="M20.8 4.8a5.5 5.5 0 0 0-7.8 0l-1 1-1-1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.4a5.5 5.5 0 0 0 0-7.8Z" />,
  plus: <path d="M12 5v14M5 12h14" />,
  lock: <><rect x="5" y="10" width="14" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3" /></>,
  mail: <><rect x="3" y="5" width="18" height="14" rx="3" /><path d="m3 7 9 6 9-6" /></>,
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  close: <path d="M6 6l12 12M18 6 6 18" />,
} satisfies Record<string, ReactNode>;

export function Icon({ name, className = "" }: { name: keyof typeof paths; className?: string }) {
  return <svg className={`icon ${className}`} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}
