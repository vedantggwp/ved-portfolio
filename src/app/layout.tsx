import type { Metadata } from "next";
import { Cinzel, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import { SkipLinks } from "@/components/SkipLinks";
import { SmoothScroll } from "@/components/SmoothScroll";
import { CustomCursor } from "@/components/CustomCursor";
import { WebGLFluidCursor } from "@/components/WebGLFluidCursor";
import { ArcaneNav } from "@/components/ArcaneNav";
import Spellcaster from "@/components/Spellcaster";
import { AmbientBackground } from "@/components/AmbientBackground";
import "./globals.css";

const cinzel = Cinzel({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-cinzel",
  weight: ["400", "500", "600", "700"],
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-space-grotesk",
  weight: ["300", "400", "500", "600"],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jetbrains",
  weight: ["400"],
});

export const metadata: Metadata = {
  title: "Ved Gaikwad — Arcane Architect",
  description:
    "AI tools, systems thinking, and engineered experiences. Portfolio of Vedant Gaikwad — AI Architect, MSc CS @ Liverpool, builder of patterns others miss.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${cinzel.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <body>
        <AmbientBackground />
        <SkipLinks />
        <ArcaneNav />
        <CustomCursor />
        <WebGLFluidCursor />
        <Spellcaster />
        <SmoothScroll>
          <main>{children}</main>
        </SmoothScroll>
      </body>
    </html>
  );
}
