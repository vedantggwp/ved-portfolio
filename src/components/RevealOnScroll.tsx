"use client";

import { useEffect, useRef, type ReactNode } from "react";

type RevealOnScrollProps = {
  readonly children: ReactNode;
  readonly className?: string;
  readonly stagger?: number;
  readonly threshold?: number;
};

export function RevealOnScroll({
  children,
  className = "",
  stagger = 1,
  threshold = 0.15,
}: RevealOnScrollProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Reduced motion: show immediately
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) {
      el.classList.add("revealed");
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("revealed");
          observer.unobserve(el);
        }
      },
      { threshold },
    );

    observer.observe(el);

    return () => observer.disconnect();
  }, [threshold]);

  return (
    <div
      ref={ref}
      className={`reveal stagger-${stagger} ${className}`}
    >
      {children}
    </div>
  );
}
