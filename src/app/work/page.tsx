import { Metadata } from "next";
import { RevealOnScroll } from "@/components/RevealOnScroll";
import Link from "next/link";
import styles from "./work.module.css";

export const metadata: Metadata = {
  title: "Archive — Ved Gaikwad",
  description: "A comprehensive index of projects, experiments, and open-source contributions.",
};

interface ArchiveEntry {
  year: string;
  project: string;
  category: string;
  builtWith: string[];
  link?: string;
}

const archiveData: ArchiveEntry[] = [
  {
    year: "2026",
    project: "FraudShieldAI",
    category: "AI / Finance",
    builtWith: ["Python", "FastAPI", "Azure", "React"],
    link: "https://github.com/vedantggwp/FraudShieldAI",
  },
  {
    year: "2026",
    project: "HoldMyClaw",
    category: "Infrastructure",
    builtWith: ["TypeScript", "Next.js", "Commander", "Node.js"],
    link: "https://github.com/vedantggwp/holdmyclaw",
  },
  {
    year: "2026",
    project: "Scrollwise",
    category: "EdTech",
    builtWith: ["Next.js", "React 19", "Dexie", "epub.js"],
    link: "https://github.com/vedantggwp/scrollwise",
  },
  {
    year: "2025",
    project: "SpringBoard",
    category: "AI / Framework",
    builtWith: ["MDX", "Python", "RAG"],
    link: "https://github.com/vedantggwp/springpod-springboard",
  },
  {
    year: "2025",
    project: "Sotto",
    category: "macOS Utility",
    builtWith: ["Python", "Whisper", "Swift", "AppKit"],
    link: "https://github.com/vedantggwp/Sotto",
  },
  {
    year: "2025",
    project: "Rajniti",
    category: "Open Data",
    builtWith: ["TypeScript", "AI Enrichment", "PostgreSQL"],
    link: "https://github.com/vedantggwp/Rajniti",
  },
  {
    year: "2024",
    project: "Ved Portfolio V1",
    category: "Design",
    builtWith: ["Next.js", "Framer Motion", "Tailwind"],
  },
  {
    year: "2024",
    project: "Neural Lens",
    category: "WebGL",
    builtWith: ["Three.js", "GLSL", "React Three Fiber"],
  },
  {
    year: "2023",
    project: "Agency Dashboard",
    category: "Internal Tool",
    builtWith: ["React", "Firebase", "Material UI"],
  },
  {
    year: "2022",
    project: "Startup Growth Engine",
    category: "Marketing",
    builtWith: ["Node.js", "Twilio API", "MongoDB"],
  }
];

export default function WorkArchive() {
  return (
    <div className={styles.container}>
      <RevealOnScroll stagger={1}>
        <header className={styles.header}>
          <Link href="/" className={styles.backLink}>
            <span className={styles.arrow}>←</span> Back to Index
          </Link>
          <h1 className={styles.title}>Archive</h1>
          <p className={styles.subtitle}>Complete index of crafted incantations</p>
        </header>
      </RevealOnScroll>

      <RevealOnScroll stagger={2}>
        <main className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Year</th>
                <th>Project</th>
                <th className={styles.hideMobile}>Category</th>
                <th className={styles.hideTablet}>Built with</th>
                <th>Link</th>
              </tr>
            </thead>
            <tbody>
              {archiveData.map((entry, index) => (
                <tr key={`${entry.project}-${index}`} className={styles.row}>
                  <td className={styles.year}>{entry.year}</td>
                  <td className={styles.name}>{entry.project}</td>
                  <td className={`${styles.category} ${styles.hideMobile}`}>{entry.category}</td>
                  <td className={`${styles.tech} ${styles.hideTablet}`}>
                    {entry.builtWith.join(" · ")}
                  </td>
                  <td className={styles.linkCol}>
                    {entry.link && (
                      <a href={entry.link} target="_blank" rel="noopener noreferrer" className={styles.externalLink}>
                        View ↗
                      </a>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </main>
      </RevealOnScroll>
    </div>
  );
}
