"use client";

import { useEffect, useRef, type MouseEvent } from "react";
import { Icon } from "./icon";

export function FaqItem({ question, answer }: { question: string; answer: string }) {
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const animationRef = useRef<Animation | null>(null);
  const targetOpen = useRef(false);

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    function finishImmediately() {
      if (!preference.matches || !animationRef.current) return;
      animationRef.current.cancel();
      animationRef.current = null;
      if (detailsRef.current) {
        detailsRef.current.open = targetOpen.current;
        detailsRef.current.removeAttribute("data-closing");
        detailsRef.current.removeAttribute("data-animating");
      }
    }
    preference.addEventListener("change", finishImmediately);
    return () => {
      animationRef.current?.cancel();
      preference.removeEventListener("change", finishImmediately);
    };
  }, []);

  function toggle(event: MouseEvent<HTMLElement>) {
    const details = detailsRef.current;
    if (!details) return;
    event.preventDefault();

    const nextOpen = !(animationRef.current ? targetOpen.current : details.open);
    const startHeight = details.getBoundingClientRect().height;
    targetOpen.current = nextOpen;
    animationRef.current?.cancel();
    animationRef.current = null;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !details.animate) {
      details.open = nextOpen;
      details.removeAttribute("data-closing");
      details.removeAttribute("data-animating");
      return;
    }

    // Keep the native details element open until its closing transition finishes.
    details.open = true;
    const style = getComputedStyle(details);
    const borderHeight = parseFloat(style.borderTopWidth) + parseFloat(style.borderBottomWidth);
    const endHeight = nextOpen
      ? details.getBoundingClientRect().height
      : event.currentTarget.getBoundingClientRect().height + borderHeight;
    details.toggleAttribute("data-closing", !nextOpen);
    details.setAttribute("data-animating", "");

    const animation = details.animate(
      [{ height: `${startHeight}px` }, { height: `${endHeight}px` }],
      { duration: 350, easing: "cubic-bezier(0.22, 1, 0.36, 1)", fill: "both" },
    );
    animationRef.current = animation;
    animation.onfinish = () => {
      if (animationRef.current !== animation) return;
      details.open = nextOpen;
      animation.cancel();
      animationRef.current = null;
      details.removeAttribute("data-closing");
      details.removeAttribute("data-animating");
    };
  }

  return (
    <details ref={detailsRef}>
      <summary onClick={toggle}>
        {question}
        <span className="faq-toggle"><Icon name="plus" /></span>
      </summary>
      <div className="faq-answer"><p>{answer}</p></div>
    </details>
  );
}
