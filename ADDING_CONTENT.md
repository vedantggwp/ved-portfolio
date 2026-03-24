# Arcane Architect: Content Management Guide

The portfolio is designed as a statically generated, file-based digital spellbook. You do **not** need a separate Content Management System (CMS) or database to update your site. Everything is managed directly through files in this repository.

---

## 1. Adding a New "Scroll" (Blog Post)

Your blog section ("The Scrolls") reads directly from Markdown files. To publish a new article:

1. Navigate to the `content/blog/posts/` folder in your project.
2. Create a new markdown file (e.g., `my-new-article.md`).
3. At the very top of the file, insert the "Frontmatter" (metadata) enclosed by `---`:

```markdown
---
title: "The Architecture of 50k Portfolios"
date: "2026-03-24"
summary: "An exploration into shifting from web templates to digital spellbooks."
---

Your actual article content starts here. You can write in standard Markdown.
You can use `inline code`, create lists, and bold **text**.
```

**That’s it.** The moment you save the file, Next.js will automatically detect it, add it to the "Scrolls" section, and generate its own dedicated reading page.

---

## 2. Adding a New "Grimoire" Project

Your projects are stored as data objects that automatically fetch their `README.md` from GitHub.

1. Open `src/lib/projects.ts`.
2. Find the `projects` array and add a new object. Follow this exact structure:

```typescript
  {
    id: "my-cool-repo", // This becomes the URL: /work/my-cool-repo
    number: "07", // The arcane index number on the card
    title: "Project Name",
    description: "A one or two sentence high-impact description of the project.",
    tech: ["TypeScript", "React", "AI"], // Top 3 to 4 technologies
    image: "/projects/placeholder.png", // Path to the card image
    github: "https://github.com/vedantggwp/my-cool-repo", // IMPORTANT: Must be your actual GitHub URL
    live: "https://my-cool-project.com", // Optional live link
  },
```

**How the GitHub Magic Works:**
By providing the `github` link, the portfolio will automatically generate a dedicated "Examine Scroll" page for the project (`/work/my-cool-repo`). When a user clicks it, the site uses the GitHub API to fetch your live `README.md` and renders it inside the dark Arcane theme. You never have to write project case studies twice! Update the README on GitHub, and your portfolio updates automatically.
