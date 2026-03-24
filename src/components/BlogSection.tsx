import { RevealOnScroll } from "./RevealOnScroll";
import { getAllPosts } from "@/lib/api";
import Link from "next/link";
import styles from "./BlogSection.module.css";

export function BlogSection() {
  const allPosts = getAllPosts();
  const recentPosts = allPosts.slice(0, 3);

  return (
    <section id="writing" className={styles.section} aria-label="Writing">
      <RevealOnScroll stagger={1}>
        <div className="energy-separator" aria-hidden="true" />
      </RevealOnScroll>
      <RevealOnScroll stagger={1}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Scrolls</h2>
          <p className={styles.sectionSubtitle}>Knowledge inscribed — thoughts on AI, architecture, and pattern</p>
          <Link href="/writing" className={styles.archiveLink}>
            All Writings <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </RevealOnScroll>

      <div className={styles.entries}>
        {recentPosts.map((post, i) => (
          <RevealOnScroll key={post.slug} stagger={(i % 3) + 1}>
            <article className={styles.entry}>
              <Link href={`/writing/${post.slug}`} className={styles.entryLink}>
                <span className={styles.date}>{post.date}</span>
                <h3 className={styles.entryTitle}>{post.title}</h3>
                <p className={styles.excerpt}>{post.excerpt}</p>
                <span className={styles.readMore}>
                  <span className={styles.readLine} aria-hidden="true" />
                  Unfurl
                </span>
              </Link>
            </article>
          </RevealOnScroll>
        ))}
        {recentPosts.length === 0 && (
          <div className={styles.empty}>
            No scrolls yet. Add .md files to content/blog/posts.
          </div>
        )}
      </div>
    </section>
  );
}
