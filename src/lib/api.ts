import fs from "fs";
import path from "path";
import matter from "gray-matter";

const postsDirectory = path.join(process.cwd(), "content/blog/posts");

export interface MarkdownPost {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  content: string;
}

export function getPostSlugs() {
  if (!fs.existsSync(postsDirectory)) return [];
  // Ensure we only process markdown files and not system files/directories
  return fs.readdirSync(postsDirectory).filter(file => file.endsWith('.md'));
}

export function getPostBySlug(slug: string): MarkdownPost {
  const realSlug = slug.replace(/\.md$/, "");
  const fullPath = path.join(postsDirectory, `${realSlug}.md`);
  const fileContents = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(fileContents);

  return {
    slug: realSlug,
    title: data.title || "Untitled",
    date: data.date || "Unknown Date",
    excerpt: data.excerpt || "",
    content,
  };
}

export function getAllPosts(): MarkdownPost[] {
  const slugs = getPostSlugs();
  const posts = slugs
    .map((slug) => getPostBySlug(slug))
    .filter((post): post is MarkdownPost => post !== null && typeof post.slug === 'string') // Type guard to ensure slug exists
    // sort posts by date in descending order
    .sort((post1, post2) => (post1.date > post2.date ? -1 : 1));
  return posts;
}
