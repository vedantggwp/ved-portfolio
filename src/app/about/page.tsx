import { Metadata } from "next";
import { RevealOnScroll } from "@/components/RevealOnScroll";
import Link from "next/link";
import styles from "./about.module.css";

export const metadata: Metadata = {
  title: "About — Ved Gaikwad",
  description: "Philosophy, thinking style, and the mind behind the patterns.",
};

export default function AboutPage() {
  return (
    <div className={styles.container}>
      <RevealOnScroll stagger={1}>
        <header className={styles.header}>
          <Link href="/" className={styles.backLink}>
            <span className={styles.arrow}>←</span> Back to Index
          </Link>
          <h1 className={styles.title}>About</h1>
        </header>
      </RevealOnScroll>

      <div className={styles.grid}>
        {/* Quas — Structure */}
        <RevealOnScroll stagger={1}>
          <section className={`${styles.facet} ${styles.facetQuas}`}>
            <div className={styles.facetOrb} />
            <h2 className={styles.facetTitle}>Quas</h2>
            <h3 className={styles.facetSubtitle}>Structure &amp; Depth</h3>
            <p className={styles.facetText}>
              I think in systems. Every project starts with understanding the 
              architecture beneath the surface — the data flows, the decision trees,
              the failure modes nobody talks about. Five years of building businesses 
              taught me that the foundation determines everything.
            </p>
          </section>
        </RevealOnScroll>

        {/* Wex — Speed */}
        <RevealOnScroll stagger={2}>
          <section className={`${styles.facet} ${styles.facetWex}`}>
            <div className={styles.facetOrb} />
            <h2 className={styles.facetTitle}>Wex</h2>
            <h3 className={styles.facetSubtitle}>Speed &amp; Adaptability</h3>
            <p className={styles.facetText}>
              I ship fast without sacrificing quality. From co-founding an agency at 20
              to consulting on AI at Springpod, I&apos;ve learned that velocity is a 
              symptom of deep understanding — not its opposite. I don&apos;t need six 
              months of onboarding to be useful.
            </p>
          </section>
        </RevealOnScroll>

        {/* Exort — Power */}
        <RevealOnScroll stagger={3}>
          <section className={`${styles.facet} ${styles.facetExort}`}>
            <div className={styles.facetOrb} />
            <h2 className={styles.facetTitle}>Exort</h2>
            <h3 className={styles.facetSubtitle}>Impact &amp; Expression</h3>
            <p className={styles.facetText}>
              I build things that matter. Whether it&apos;s an explainable AI fraud 
              detector for SMBs, a reading infrastructure that surfaces the best 
              passages, or this portfolio itself — every project exists because I 
              saw a pattern others missed and decided to act on it.
            </p>
          </section>
        </RevealOnScroll>
      </div>

      <RevealOnScroll stagger={4}>
        <section className={styles.bio}>
          <h2 className={styles.bioTitle}>The Person</h2>
          <p className={styles.bioText}>
            Vedant Gaikwad. MSc Computer Science at the University of Liverpool.
            AI Consultant at Springpod. Microsoft Imagine Cup 2026 competitor.
            Previously: co-founded a digital agency, ran growth for a startup,
            built dashboards that led to real investment calls.
          </p>
          <p className={styles.bioText}>
            I operate at the intersection of AI, product thinking, and systems 
            architecture. I understand both the business problem and the technical
            solution — and more importantly, I understand the gap between them.
          </p>
        </section>
      </RevealOnScroll>
    </div>
  );
}
