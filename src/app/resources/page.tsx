import { Metadata } from "next";
import { RevealOnScroll } from "@/components/RevealOnScroll";
import Link from "next/link";
import styles from "./resources.module.css";

export const metadata: Metadata = {
  title: "Resources — Ved Gaikwad",
  description: "Curated tools, frameworks, and knowledge for builders.",
};

interface Resource {
  title: string;
  description: string;
  category: string;
  energy: "quas" | "wex" | "exort";
  link?: string;
}

const resources: Resource[] = [
  {
    title: "SpringBoard Framework",
    description: "A risk-graded AI build path. Answer 5 questions, get a deployment strategy.",
    category: "Framework",
    energy: "exort",
    link: "https://github.com/vedantggwp/springpod-springboard",
  },
  {
    title: "Scrollwise",
    description: "Personal reading infrastructure — upload EPUBs, surface the best passages.",
    category: "Tool",
    energy: "wex",
    link: "https://github.com/vedantggwp/scrollwise",
  },
  {
    title: "HoldMyClaw",
    description: "Deploy your own server in one command. CLI + web wizard + cloud adapters.",
    category: "Infrastructure",
    energy: "quas",
    link: "https://github.com/vedantggwp/holdmyclaw",
  },
  {
    title: "Rajniti Dataset",
    description: "Open-source Indian politician data with LLM-powered profile enrichment.",
    category: "Open Data",
    energy: "quas",
    link: "https://github.com/vedantggwp/Rajniti",
  },
  {
    title: "Sotto",
    description: "Voice control for macOS using Whisper transcription and hotkey activation.",
    category: "Utility",
    energy: "wex",
    link: "https://github.com/vedantggwp/Sotto",
  },
  {
    title: "Neural Lens",
    description: "WebGL shader experiments — GLSL distortion and generative visual effects.",
    category: "Experiment",
    energy: "exort",
  },
];

export default function ResourcesPage() {
  return (
    <div className={styles.container}>
      <RevealOnScroll stagger={1}>
        <header className={styles.header}>
          <Link href="/" className={styles.backLink}>
            <span className={styles.arrow}>←</span> Back to Index
          </Link>
          <h1 className={styles.title}>Resources</h1>
          <p className={styles.subtitle}>
            Tools, frameworks, and knowledge — unlocked for builders
          </p>
        </header>
      </RevealOnScroll>

      <div className={styles.grid}>
        {resources.map((resource, index) => (
          <RevealOnScroll key={resource.title} stagger={(index % 3) + 1}>
            <article className={`${styles.card} ${styles[`card--${resource.energy}`]}`}>
              <div className={styles.cardHeader}>
                <span className={styles.cardOrb} />
                <span className={styles.cardCategory}>{resource.category}</span>
              </div>
              <h2 className={styles.cardTitle}>{resource.title}</h2>
              <p className={styles.cardDescription}>{resource.description}</p>
              {resource.link && (
                <a
                  href={resource.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.cardLink}
                >
                  Unlock ↗
                </a>
              )}
            </article>
          </RevealOnScroll>
        ))}
      </div>
    </div>
  );
}
