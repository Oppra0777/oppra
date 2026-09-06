"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Icon } from "./icon";

export function HeroMotion({ children }: { children: ReactNode }) {
  const visualRef = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);
  const [active, setActive] = useState(true);

  useEffect(() => {
    const visual = visualRef.current;
    if (!visual || !("IntersectionObserver" in window)) return;
    let inView = true;
    const updateActivity = () => setActive(inView && !document.hidden);
    const observer = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      updateActivity();
    }, { threshold: 0 });
    observer.observe(visual);
    document.addEventListener("visibilitychange", updateActivity);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", updateActivity);
    };
  }, []);

  return (
    <div
      ref={visualRef}
      className="hero-visual"
      data-motion-paused={paused || !active}
      aria-label="Preview of the Oppra mobile app"
    >
      {children}
      <button
        className="hero-motion-toggle"
        type="button"
        onClick={() => setPaused(!paused)}
        aria-label={paused ? "Resume hero animation" : "Pause hero animation"}
        title={paused ? "Resume animation" : "Pause animation"}
      >
        <Icon name={paused ? "play" : "pause"} />
      </button>
    </div>
  );
}
