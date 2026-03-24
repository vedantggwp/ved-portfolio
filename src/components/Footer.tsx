import { RevealOnScroll } from "./RevealOnScroll";
import styles from "./Footer.module.css";

export function Footer() {
  return (
    <footer id="contact" className={styles.footer} aria-label="Footer">
      <div className={styles.content}>
        <RevealOnScroll stagger={1}>
          <p className={styles.bio}>
            Five years building businesses before I learned to code.
            Co-founded an agency at 20. Ran growth for a startup at 18.
            Now finishing my MSc at Liverpool, consulting on AI at Springpod,
            and building tools in public. I understand AI and
            I understand business. I don&apos;t need six months of onboarding.
          </p>
        </RevealOnScroll>
        
        <RevealOnScroll stagger={2}>
          <nav className={styles.linkGrid} aria-label="Contact links">
            <a href="mailto:vedant.g26@gmail.com" className={`${styles.contactLink} ${styles.contactExort}`}>
              <span className={styles.contactOrb} />
              <span className={styles.contactLabel}>Email</span>
              <span className={styles.contactArrow}>↗</span>
            </a>
            <a href="https://github.com/vedantggwp" target="_blank" rel="noopener noreferrer" className={`${styles.contactLink} ${styles.contactWex}`}>
              <span className={styles.contactOrb} />
              <span className={styles.contactLabel}>GitHub</span>
              <span className={styles.contactArrow}>↗</span>
            </a>
            <a href="https://linkedin.com/in/vedantgaikwad" target="_blank" rel="noopener noreferrer" className={`${styles.contactLink} ${styles.contactQuas}`}>
              <span className={styles.contactOrb} />
              <span className={styles.contactLabel}>LinkedIn</span>
              <span className={styles.contactArrow}>↗</span>
            </a>
          </nav>
        </RevealOnScroll>
      </div>

      <RevealOnScroll stagger={3}>
        <div className={styles.bottomBar}>
          <span className={styles.status}>Open to UK roles 2026.</span>
          <span className={styles.copyright}>© {new Date().getFullYear()} Vedant Gaikwad</span>
        </div>
      </RevealOnScroll>
    </footer>
  );
}
