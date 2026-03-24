import { Metadata } from "next";
import { RevealOnScroll } from "@/components/RevealOnScroll";
import { getAllPosts } from "@/lib/api";
import Link from "next/link";
import styles from "./writing.module.css";

export const metadata: Metadata = {
  title: "Writing — Ved Gaikwad",
  description: "Thoughts on AI, product architecture, and engineering.",
};

export default function WritingIndex() {
  const posts = getAllPosts();

  return (
    <div className={styles.container}>
      <RevealOnScroll stagger={1}>
        <header className={styles.header}>
          <Link href="/" className={styles.backLink}>
            <span className={styles.arrow}>←</span> Back to Index
          </Link>
          <h1 className={styles.title}>Writing</h1>
          <p className={styles.subtitle}>
            Thoughts on AI architecture, product design, and building things that work.
          </p>
        </header>
      </RevealOnScroll>

      <div className={styles.postsList}>
        {posts.map((post, index) => (
          <RevealOnScroll key={post.slug} stagger={(index % 4) + 2}>
            <article className={styles.post}>
              <Link href={`/writing/${post.slug}`} className={styles.postLink}>
                <span className={styles.date}>{post.date}</span>
                <h2 className={styles.postTitle}>{post.title}</h2>
                <p className={styles.excerpt}>{post.excerpt}</p>
                <span className={styles.readMore}>
                  <span className={styles.readLine} aria-hidden="true" />
                  Read Article
                </span>
              </Link>
            </article>
          </RevealOnScroll>
        ))}
      </div>
    </div>
  );
}
