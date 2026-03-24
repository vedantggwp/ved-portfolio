"use client";

import Link from "next/link";
import { projects } from "@/lib/projects";
import { RevealOnScroll } from "./RevealOnScroll";
import styles from "./ProjectShowcase.module.css";

export function ProjectShowcase() {
  return (
    <section id="work" className={styles.section} aria-label="Selected Work">
      <RevealOnScroll stagger={1}>
        <div className="energy-separator" aria-hidden="true" />
      </RevealOnScroll>
      <RevealOnScroll stagger={2}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>
            Grimoire
          </h2>
          <p className={styles.sectionSubtitle}>Selected incantations — proof of pattern recognition</p>
          <a href="/work" className={styles.archiveLink}>
            Full Archive <span aria-hidden="true">↗</span>
          </a>
        </div>
      </RevealOnScroll>

      <div className={styles.projectGrid} role="list" aria-label="Project cards">
        {projects.map((project, index) => (
          <RevealOnScroll key={project.id} stagger={(index % 3) + 1}>
            <article className={styles.projectCard} role="listitem">
              <div className={styles.cardHeader}>
                <span className={styles.number}>{project.number}</span>
                <span className={styles.category}>
                  {project.tech[0]}
                </span>
              </div>

              <Link href={`/work/${project.id}`} style={{ textDecoration: 'none' }}>
                <h3 className={styles.title}>{project.title}</h3>
                <p className={styles.description}>{project.description}</p>
              </Link>
              
              <div className={styles.techStack}>
                {project.tech.map((tag) => (
                  <span key={tag} className={styles.techTag}>
                    {tag}
                  </span>
                ))}
              </div>

              <div className={styles.links}>
                <Link href={`/work/${project.id}`} className={styles.link}>
                  Examine Scroll →
                </Link>
                {project.github && (
                  <a
                    href={project.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.link}
                  >
                    Source →
                  </a>
                )}
                {project.live && (
                  <a
                    href={project.live}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.link}
                  >
                    Live →
                  </a>
                )}
              </div>
            </article>
          </RevealOnScroll>
        ))}
      </div>
    </section>
  );
}
