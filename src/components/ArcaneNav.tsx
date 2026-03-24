"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import styles from "./ArcaneNav.module.css";

interface NavLink {
  label: string;
  href: string;
}

const orbGroups: Record<string, { energy: string; links: NavLink[] }> = {
  quas: {
    energy: "quas",
    links: [
      { label: "About", href: "/about" },
    ],
  },
  wex: {
    energy: "wex",
    links: [
      { label: "Projects", href: "/#work" },
      { label: "Archive", href: "/work" },
    ],
  },
  exort: {
    energy: "exort",
    links: [
      { label: "Writing", href: "/writing" },
      { label: "Resources", href: "/resources" },
    ],
  },
};

export function ArcaneNav() {
  const [activeOrb, setActiveOrb] = useState<string | null>(null);

  const handleOrbClick = useCallback(
    (energy: string) => {
      setActiveOrb((prev) => (prev === energy ? null : energy));
    },
    []
  );

  const handleClose = useCallback(() => {
    setActiveOrb(null);
  }, []);

  return (
    <nav className={styles.nav} aria-label="Main navigation">
      <Link href="/" className={styles.monogram} onClick={handleClose}>
        VG
      </Link>

      <div className={styles.orbContainer}>
        {Object.entries(orbGroups).map(([key, group]) => (
          <div key={key} className={styles.orbGroup}>
            <button
              className={`${styles.orb} ${styles[`orb--${group.energy}`]} ${activeOrb === key ? styles.orbActive : ""}`}
              onClick={() => handleOrbClick(key)}
              aria-expanded={activeOrb === key}
              aria-label={`${key} navigation`}
            >
              <span className={styles.orbCore} />
            </button>

            {activeOrb === key && (
              <div className={styles.orbLinks} role="menu">
                {group.links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={styles.orbLink}
                    role="menuitem"
                    onClick={handleClose}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <Link href="mailto:vedant.g26@gmail.com" className={styles.contact}>
        Contact
      </Link>
    </nav>
  );
}
