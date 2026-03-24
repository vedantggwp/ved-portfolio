import { getPostBySlug, getPostSlugs } from "@/lib/api";
import { RevealOnScroll } from "@/components/RevealOnScroll";
import { MDXRemote } from "next-mdx-remote/rsc";
import Link from "next/link";
import styles from "./article.module.css";
import { Metadata } from "next";

import { notFound } from "next/navigation";

export async function generateStaticParams() {
  const posts = getPostSlugs();
  return posts.map((post) => ({
    slug: post.replace(/\.md$/, ""),
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  try {
    const post = getPostBySlug(slug);
    return {
      title: `${post.title} — Ved Gaikwad`,
      description: post.excerpt,
    };
  } catch (e) {
    return {
      title: "Post Not Found"
    }
  }
}

export default async function Article({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  let post;
  try {
    post = getPostBySlug(slug);
  } catch (e) {
    notFound();
  }

  const components = {
    h1: (props: any) => <h1 className={styles.h1} {...props} />,
    h2: (props: any) => <h2 className={styles.h2} {...props} />,
    h3: (props: any) => <h3 className={styles.h3} {...props} />,
    p: (props: any) => <p className={styles.p} {...props} />,
    ul: (props: any) => <ul className={styles.ul} {...props} />,
    ol: (props: any) => <ol className={styles.ol} {...props} />,
    li: (props: any) => <li className={styles.li} {...props} />,
    a: (props: any) => <a className={styles.a} target="_blank" rel="noopener noreferrer" {...props} />,
    blockquote: (props: any) => <blockquote className={styles.blockquote} {...props} />,
    hr: (props: any) => <hr className={styles.hr} {...props} />,
    code: (props: any) => <code className={styles.code} {...props} />,
    pre: (props: any) => <pre className={styles.pre} {...props} />,
  };

  return (
    <article className={styles.container}>
      <RevealOnScroll stagger={1}>
        <header className={styles.header}>
          <Link href="/writing" className={styles.backLink}>
            <span className={styles.arrow}>←</span> Back to Writing
          </Link>
          <div className={styles.meta}>
            <time className={styles.date}>{post.date}</time>
            <span className={styles.readingTime}>5 min read</span>
          </div>
          <h1 className={styles.title}>{post.title}</h1>
        </header>
      </RevealOnScroll>

      <div className={styles.content}>
        <RevealOnScroll stagger={2}>
          <div className={styles.prose}>
            <MDXRemote source={post.content} components={components} />
          </div>
        </RevealOnScroll>
      </div>
    </article>
  );
}
