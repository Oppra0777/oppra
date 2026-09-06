"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Icon } from "./icon";

const LINKS = [
  { href: "#why-oppra", label: "Why Oppra" },
  { href: "#how-it-works", label: "How it works" },
  { href: "#faqs", label: "FAQs" },
];

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      setOpen(false);
      buttonRef.current?.focus();
    }
    function closeOnOutside(event: PointerEvent) {
      if (event.target instanceof Node && !containerRef.current?.contains(event.target)) setOpen(false);
    }
    // A link inside the panel scrolls the page, so the panel should get out of the way.
    function closeOnNavigate(event: MouseEvent) {
      if (event.target instanceof Element && event.target.closest('a[href^="#"]')) setOpen(false);
    }

    document.addEventListener("keydown", closeOnEscape);
    document.addEventListener("pointerdown", closeOnOutside);
    containerRef.current?.addEventListener("click", closeOnNavigate);
    const panel = containerRef.current;
    return () => {
      document.removeEventListener("keydown", closeOnEscape);
      document.removeEventListener("pointerdown", closeOnOutside);
      panel?.removeEventListener("click", closeOnNavigate);
    };
  }, [open]);

  return (
    <div className="mobile-nav" ref={containerRef} data-open={open}>
      <button
        ref={buttonRef}
        type="button"
        className="mobile-nav-toggle"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => setOpen((wasOpen) => !wasOpen)}
      >
        <Icon name={open ? "close" : "menu"} />
      </button>
      {/* Section links only — the header keeps its own waitlist CTA visible at
          every width, so repeating it here would put two identical buttons on
          screen at once. */}
      <nav className="mobile-nav-panel" id={panelId} hidden={!open} aria-label="Main navigation">
        {LINKS.map(({ href, label }) => (
          <a key={href} href={href}>{label}<Icon name="arrow" /></a>
        ))}
      </nav>
    </div>
  );
}
