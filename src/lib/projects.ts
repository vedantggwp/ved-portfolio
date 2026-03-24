export interface Project {
  readonly id: string;
  readonly number: string;
  readonly title: string;
  readonly description: string;
  readonly tech: readonly string[];
  readonly image: string;
  readonly github?: string;
  readonly live?: string;
}

export const projects: readonly Project[] = [
  {
    id: "fraudshield",
    number: "01",
    title: "FraudShieldAI",
    description:
      "Explainable fraud detection engine for SMBs. Direct anomaly scoring with semantic interpretations. Built for Microsoft Imagine Cup 2026.",
    tech: ["Python", "FastAPI", "Azure", "React"],
    image: "/projects/fraudshield.png",
    github: "https://github.com/vedantggwp/FraudShieldAI",
  },
  {
    id: "holdmyclaw",
    number: "02",
    title: "HoldMyClaw",
    description:
      "Single-command infrastructure deployment. Monorepo architecture pairing a CLI wizard with Hetzner and DigitalOcean cloud adapters.",
    tech: ["TypeScript", "Next.js", "Commander", "Node.js"],
    image: "/projects/holdmyclaw.png",
    github: "https://github.com/vedantggwp/holdmyclaw",
    live: "https://holdmyclaw-web.vercel.app",
  },
  {
    id: "scrollwise",
    number: "03",
    title: "Scrollwise",
    description:
      "Personal reading infrastructure. Local-first parser for EPUBs and PDFs driving a curated discovery feed. Validated by zero-flake E2E tests.",
    tech: ["Next.js", "React 19", "Dexie", "epub.js"],
    image: "/projects/scrollwise.png",
    github: "https://github.com/vedantggwp/scrollwise",
  },
  {
    id: "springboard",
    number: "04",
    title: "SpringBoard",
    description:
      "AI coding framework and risk protocol. Translates scoping answers into a graded build path for enterprise AI shipping.",
    tech: ["MDX", "Static Site", "Risk Framework"],
    image: "/projects/springboard.png",
    github: "https://github.com/vedantggwp/springpod-springboard",
  },
  {
    id: "sotto",
    number: "05",
    title: "Sotto",
    description:
      "System-wide native voice control for macOS. Leverages Whisper transcription via hotkey activation in a minimal overlay UI.",
    tech: ["Python", "Whisper", "macOS", "AppKit"],
    image: "/projects/sotto.png",
    github: "https://github.com/vedantggwp/Sotto",
  },
  {
    id: "rajniti",
    number: "06",
    title: "Rajniti",
    description:
      "Open-source political data index. LLM-powered profile enrichment engine for rapid browsing and search of public representatives.",
    tech: ["TypeScript", "AI Enrichment", "Open Data"],
    image: "/projects/rajniti.png",
    github: "https://github.com/vedantggwp/Rajniti",
  },
] as const;
