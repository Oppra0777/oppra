"use client";

import { useEffect, useState } from "react";
import { Icon } from "./icon";

const BACK_TO_TOP_THRESHOLD = 480;
const SCROLL_DURATION_MS = 900;

export function PageNavigation() {
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const updateVisibility = () => setShowBackToTop(window.scrollY > BACK_TO_TOP_THRESHOLD);
    const initialFrame = requestAnimationFrame(updateVisibility);
    const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
    let scrollFrame: number | null = null;
    let scrollTarget = 0;

    function cancelScroll() {
      if (scrollFrame !== null) cancelAnimationFrame(scrollFrame);
      scrollFrame = null;
    }

    function scrollToPosition(top: number) {
      cancelScroll();
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      scrollTarget = Math.max(0, Math.min(top, maxScroll));
      const start = window.scrollY;
      const distance = scrollTarget - start;
      if (motionPreference.matches || Math.abs(distance) < 1) {
        window.scrollTo({ top: scrollTarget, behavior: "instant" });
        return;
      }

      let startedAt: number | null = null;
      function step(time: number) {
        startedAt ??= time;
        const progress = Math.min((time - startedAt) / SCROLL_DURATION_MS, 1);
        const eased = progress < 0.5
          ? 4 * progress ** 3
          : 1 - (-2 * progress + 2) ** 3 / 2;
        window.scrollTo({ top: start + distance * eased, behavior: "instant" });
        scrollFrame = progress < 1 ? requestAnimationFrame(step) : null;
      }
      scrollFrame = requestAnimationFrame(step);
    }

    function cancelOnKey(event: KeyboardEvent) {
      if (["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End", " ", "Escape", "Tab"].includes(event.key)) cancelScroll();
    }

    function updateMotionPreference() {
      if (motionPreference.matches && scrollFrame !== null) {
        cancelScroll();
        window.scrollTo({ top: scrollTarget, behavior: "instant" });
      }
    }

    function navigateToSection(event: MouseEvent) {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const anchor = event.target instanceof Element
        ? event.target.closest<HTMLAnchorElement>('a[href^="#"]')
        : null;
      if (!anchor || anchor.hasAttribute("download") || (anchor.target && anchor.target !== "_self")) return;

      const hash = anchor.getAttribute("href");
      if (!hash) return;
      const isTop = hash === "#" || hash === "#top";
      const target = document.getElementById(isTop ? "top" : hash.slice(1));
      if (!target) return;

      event.preventDefault();
      const focusTarget = isTop
        ? target.querySelector<HTMLElement>("a")
        : target.querySelector<HTMLElement>("h2") ?? target;
      if (focusTarget) {
        if (!focusTarget.hasAttribute("tabindex") && !focusTarget.matches("a, button, input, select, textarea")) {
          focusTarget.setAttribute("tabindex", "-1");
          focusTarget.addEventListener("blur", () => focusTarget.removeAttribute("tabindex"), { once: true });
        }
        focusTarget.focus({ preventScroll: true });
      }

      if (window.location.hash !== hash) window.history.pushState(null, "", hash);
      const headerOffset = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
      scrollToPosition(isTop ? 0 : window.scrollY + target.getBoundingClientRect().top - headerOffset);
    }

    document.addEventListener("click", navigateToSection);
    window.addEventListener("scroll", updateVisibility, { passive: true });
    window.addEventListener("wheel", cancelScroll, { passive: true });
    window.addEventListener("touchstart", cancelScroll, { passive: true });
    window.addEventListener("pointerdown", cancelScroll, { passive: true });
    window.addEventListener("keydown", cancelOnKey);
    window.addEventListener("popstate", cancelScroll);
    motionPreference.addEventListener("change", updateMotionPreference);
    return () => {
      cancelAnimationFrame(initialFrame);
      cancelScroll();
      document.removeEventListener("click", navigateToSection);
      window.removeEventListener("scroll", updateVisibility);
      window.removeEventListener("wheel", cancelScroll);
      window.removeEventListener("touchstart", cancelScroll);
      window.removeEventListener("pointerdown", cancelScroll);
      window.removeEventListener("keydown", cancelOnKey);
      window.removeEventListener("popstate", cancelScroll);
      motionPreference.removeEventListener("change", updateMotionPreference);
    };
  }, []);

  return (
    <a
      href="#top"
      className={`back-to-top${showBackToTop ? " is-visible" : ""}`}
      aria-label="Back to top"
      title="Back to top"
      aria-hidden={!showBackToTop}
      tabIndex={showBackToTop ? 0 : -1}
    >
      <Icon name="arrow" />
    </a>
  );
}
