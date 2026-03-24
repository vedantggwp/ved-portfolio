"use client";

import { useEffect, useRef } from "react";
import styles from "./CustomCursor.module.css";

export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const trailRefs = useRef<HTMLDivElement[]>([]);
  const mouse = useRef({ x: 0, y: 0 });
  const positions = useRef<{ x: number; y: number }[]>(
    Array.from({ length: 5 }, () => ({ x: 0, y: 0 }))
  );

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) return;

    // Hide on touch devices
    if ('ontouchstart' in window) return;

    function handleMouseMove(e: MouseEvent) {
      mouse.current = { x: e.clientX, y: e.clientY };
    }

    function animate() {
      const dot = dotRef.current;
      if (!dot) return;

      // Position main dot
      dot.style.transform = `translate(${mouse.current.x}px, ${mouse.current.y}px)`;

      // Trail follows with delay
      for (let i = 0; i < positions.current.length; i++) {
        const target = i === 0 ? mouse.current : positions.current[i - 1];
        positions.current[i].x += (target.x - positions.current[i].x) * (0.15 - i * 0.02);
        positions.current[i].y += (target.y - positions.current[i].y) * (0.15 - i * 0.02);

        const trail = trailRefs.current[i];
        if (trail) {
          trail.style.transform = `translate(${positions.current[i].x}px, ${positions.current[i].y}px)`;
        }
      }

      requestAnimationFrame(animate);
    }

    window.addEventListener("mousemove", handleMouseMove);
    animate();

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <div className={styles.cursorContainer} aria-hidden="true">
      <div ref={dotRef} className={styles.dot} />
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          ref={(el) => { if (el) trailRefs.current[i] = el; }}
          className={styles.trail}
          style={{ opacity: 0.4 - i * 0.07 }}
        />
      ))}
    </div>
  );
}
