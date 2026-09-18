"use client";

import { useEffect } from "react";

const REVEAL_TARGETS = [
  ".section-heading",
  ".video-frame",
  ".feature-card",
  ".waitlist-grid",
  ".faq-grid > div",
  ".audience-strip > div > span",
  ".footer-top > *",
].join(", ");

export function ScrollReveal() {
  useEffect(() => {
    if (!("IntersectionObserver" in window) || !("animate" in Element.prototype)) return;
    const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const animations = new Set<Animation>();
    const revealed = new WeakSet<Element>();
    const targets = document.querySelectorAll<HTMLElement>(REVEAL_TARGETS);
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting || motionPreference.matches) continue;

        observer.unobserve(entry.target);
        revealed.add(entry.target);

        // Never fade a form or link while someone is interacting with it.
        if (entry.target.matches(":focus-within")) continue;

        const animation = entry.target.animate(
          [{ opacity: 0, translate: "0 20px" }, { opacity: 1, translate: "0 0" }],
          { duration: 650, easing: "cubic-bezier(0.22, 1, 0.36, 1)" },
        );
        animations.add(animation);
        animation.onfinish = () => animations.delete(animation);
      }
    }, { threshold: 0.12, rootMargin: "0px 0px -32px 0px" });

    function updateMotionPreference() {
      observer.disconnect();
      for (const animation of animations) animation.cancel();
      animations.clear();

      if (!motionPreference.matches) {
        for (const target of targets) {
          if (!revealed.has(target)) observer.observe(target);
        }
      }
    }

    updateMotionPreference();
    motionPreference.addEventListener("change", updateMotionPreference);

    return () => {
      observer.disconnect();
      for (const animation of animations) animation.cancel();
      motionPreference.removeEventListener("change", updateMotionPreference);
    };
  }, []);

  // Content stays visible if JavaScript or the animation APIs are unavailable.
  return null;
}
