"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import styles from "./Hero.module.css";

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const text1Ref = useRef<HTMLDivElement>(null);
  const text2Ref = useRef<HTMLDivElement>(null);
  const text3Ref = useRef<HTMLDivElement>(null);
  
  const orb1Ref = useRef<HTMLDivElement>(null);
  const orb2Ref = useRef<HTMLDivElement>(null);
  const orb3Ref = useRef<HTMLDivElement>(null);
  const flashRef = useRef<HTMLDivElement>(null);
  const invokerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Prevent browser from trying to restore scroll position midway through the pinned section
    if (history.scrollRestoration) {
      history.scrollRestoration = "manual";
    }
    window.scrollTo(0, 0);

    gsap.registerPlugin(ScrollTrigger);

    // Prefer reduced motion check
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) {
      // If reduced motion, just show the final text
      gsap.set([text1Ref.current, text2Ref.current, orb1Ref.current, orb2Ref.current, orb3Ref.current], { display: "none" });
      gsap.set(text3Ref.current, { autoAlpha: 1 });
      return;
    }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          pin: true,
          start: "top top",
          end: "+=4000",
          scrub: 1, // Smooth scrubbing
        }
      });

      // Step 1: "I CONNECT SYSTEMS" fades in and moves up
      tl.to(text1Ref.current, { autoAlpha: 1, y: 0, duration: 2, ease: "power2.out" })
        .to(text1Ref.current, { autoAlpha: 0, y: -50, duration: 2, ease: "power2.in" }, "+=1");

      // Step 2: "TRANSLATOR BETWEEN WORLDS" fades in
      tl.fromTo(text2Ref.current, 
          { autoAlpha: 0, scale: 0.9, y: 50 },
          { autoAlpha: 1, scale: 1, y: 0, duration: 2.5, ease: "power3.out" }
        )
        .to(text2Ref.current, { autoAlpha: 0, scale: 1.1, duration: 2, ease: "power2.in" }, "+=1.5");

      // Step 3: Orbs converge & Invoker appears
      tl.to([orb1Ref.current, orb2Ref.current, orb3Ref.current], {
        autoAlpha: 1,
        duration: 0.5
      }, "-=0.5")
      .to(invokerRef.current, { autoAlpha: 0.6, scale: 1, duration: 4, ease: "power2.out" }, "converge-=1")
      .to(orb1Ref.current, { left: "50%", top: "50%", scale: 1, duration: 2, ease: "power4.in" }, "converge")
      .to(orb2Ref.current, { left: "50%", top: "50%", scale: 1, duration: 2, ease: "power4.in" }, "converge")
      .to(orb3Ref.current, { left: "50%", top: "50%", scale: 1, duration: 2, ease: "power4.in" }, "converge");

      // Step 4: Collision Flash + Reveal Final Text
      tl.set(flashRef.current, { autoAlpha: 1 }, "flash")
        .set([orb1Ref.current, orb2Ref.current, orb3Ref.current, invokerRef.current], { autoAlpha: 0 }, "flash")
        .fromTo(text3Ref.current, 
          { autoAlpha: 0, scale: 1.2 }, 
          { autoAlpha: 1, scale: 1, duration: 0.1 }, 
          "flash"
        )
        .to(flashRef.current, { autoAlpha: 0, duration: 3, ease: "power2.out" }, "flash+=0.1");

    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="hero" className={styles.hero} aria-label="Introduction">
      <div ref={containerRef} className={styles.sequenceContainer}>
        
        {/* Decorative Background */}
        <div ref={invokerRef} className={styles.invokerLikeness} aria-hidden="true">
          <Image src="/invoker.png" alt="Arcane Architect" fill style={{ objectFit: 'cover', objectPosition: 'center 20%' }} priority />
        </div>
        <div className={styles.spellCircle} aria-hidden="true" suppressHydrationWarning>
          <svg viewBox="0 0 500 500" className={styles.circleSvg} suppressHydrationWarning>
            <circle cx="250" cy="250" r="240" className={styles.ringOuter} />
            <circle cx="250" cy="250" r="190" className={styles.ringMiddle} />
            <circle cx="250" cy="250" r="140" className={styles.ringInner} />
            {Array.from({ length: 36 }).map((_, i) => {
              const angle = (i * 10 * Math.PI) / 180;
              const x1 = 250 + Math.cos(angle) * 232;
              const y1 = 250 + Math.sin(angle) * 232;
              const x2 = 250 + Math.cos(angle) * 240;
              const y2 = 250 + Math.sin(angle) * 240;
              return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} className={styles.tick} />;
            })}
          </svg>
        </div>

        {/* Text Sequence */}
        <div ref={text1Ref} className={`${styles.textLayer} ${styles.textQuas}`}>
          A Beacon <span>of Knowledge</span>
        </div>

        <div ref={text2Ref} className={`${styles.textLayer} ${styles.textExort}`}>
          Blazing out across <br/> <span>a black sea of ignorance</span>
        </div>

        <div ref={text3Ref} className={`${styles.textLayer} ${styles.textFinal}`}>
          <span className={styles.finalSmall}>I have committed the</span>
          <span className={styles.finalLarge}>architecture of this world</span>
          <span className={styles.finalSmall}>to memory</span>
        </div>

        {/* Summoning Orbs */}
        <div className={styles.orbSystem} aria-hidden="true">
          <div ref={orb1Ref} className={`${styles.summonOrb} ${styles.orb1}`} />
          <div ref={orb2Ref} className={`${styles.summonOrb} ${styles.orb2}`} />
          <div ref={orb3Ref} className={`${styles.summonOrb} ${styles.orb3}`} />
        </div>

        {/* Collision Flash */}
        <div ref={flashRef} className={styles.collisionFlash} />
      </div>

      <div className={styles.scrollHint} aria-hidden="true">
        <span className={styles.scrollLabel}>Descend</span>
        <div className={styles.scrollLine} />
      </div>
    </section>
  );
}
