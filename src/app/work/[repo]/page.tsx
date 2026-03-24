import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import Link from "next/link";
import { projects } from "@/lib/projects";
import styles from "@/app/writing/[slug]/article.module.css";
import React from "react";

export async function generateMetadata({ params }: { params: Promise<{ repo: string }> }) {
  const resolvedParams = await params;
  const repo = resolvedParams.repo;
  const project = projects.find((p) => p.id === repo);
  if (!project) return { title: "Not Found" };
  return { title: `${project.title} — Grimoire Entry` };
}

export default async function ProjectReadmePage({ params }: { params: Promise<{ repo: string }> }) {
  const resolvedParams = await params;
  const repoParam = resolvedParams.repo;
  const project = projects.find((p) => p.id === repoParam);
  
  if (!project || !project.github) {
    notFound();
  }

  // Extract vedantggwp/RepoName from https://github.com/vedantggwp/RepoName
  const repoPath = project.github.replace("https://github.com/", "").replace(/\/$/, "");

  // Try fetching main, then master
  let res = await fetch(`https://raw.githubusercontent.com/${repoPath}/main/README.md`, { next: { revalidate: 3600 } });
  if (!res.ok) {
    res = await fetch(`https://raw.githubusercontent.com/${repoPath}/master/README.md`, { next: { revalidate: 3600 } });
  }

  if (!res.ok) {
    return (
      <main className={styles.articlePage}>
        <div className={styles.container}>
          <Link href="/#work" className={styles.backLink}>
            <span className={styles.backArrow}>←</span> Return to Grimoire
          </Link>
          <article className={styles.article}>
            <header className={styles.header}>
              <h1 className={styles.title}>{project.title}</h1>
              <p className={styles.subtitle}>No README found. The scrolls are empty.</p>
            </header>
          </article>
        </div>
      </main>
    );
  }

  const markdownContent = await res.text();

  return (
    <main className={styles.articlePage}>
      <div className={styles.container}>
        
        <Link href="/#work" className={styles.backLink}>
          <span className={styles.backArrow}>←</span> Return to Grimoire
        </Link>
        
        <article className={styles.article}>
          <header className={styles.header}>
            <div className={styles.meta}>
              <span className={styles.date}>GitHub Source</span>
              <span className={styles.dot}>•</span>
              <a href={project.github} target="_blank" rel="noopener noreferrer" className={styles.readTime}>
                {repoPath} ↗
              </a>
            </div>
            <h1 className={styles.title}>{project.title}</h1>
            <p className={styles.subtitle}>{project.description}</p>
          </header>

          <div className={styles.content}>
            <MDXRemote source={markdownContent} />
          </div>
        </article>

      </div>
    </main>
  );
}
