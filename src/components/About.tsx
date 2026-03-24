import { RevealOnScroll } from "./RevealOnScroll";
import styles from "./About.module.css";

export function About() {
  return (
    <section id="about" className={styles.section} aria-label="About">
      <RevealOnScroll stagger={1}>
        <div className={styles.separator} aria-hidden="true" />
      </RevealOnScroll>
      <RevealOnScroll stagger={2}>
        <p className={styles.bio}>
          I spent 5 years running businesses in India before I learned to code.
          I co-founded an agency at 20, ran growth for a startup at 18, and
          built dashboards that led to real investment calls. Now I&apos;m
          finishing my MSc at Liverpool, consulting on AI at Springpod, and
          building tools in public that people actually use. I get AI and I get
          business. I don&apos;t need 6 months of onboarding to be useful.
        </p>
      </RevealOnScroll>
      <RevealOnScroll stagger={3}>
        <nav className={styles.links} aria-label="Social links">
          <a
            href="https://github.com/vedantggwp"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.link}
          >
            GitHub
          </a>
          <a
            href="https://linkedin.com/in/vedantgaikwad"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.link}
          >
            LinkedIn
          </a>
          <a
            href="mailto:vedant.g26@gmail.com"
            className={styles.link}
          >
            Email
          </a>
        </nav>
      </RevealOnScroll>
    </section>
  );
}
