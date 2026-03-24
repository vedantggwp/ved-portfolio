import Image from "next/image";
import styles from "./AmbientBackground.module.css";

export function AmbientBackground() {
  return (
    <div className={styles.ambientContainer} aria-hidden="true">
      {/* The Arcane Architect Silhouette */}
      <Image 
        src="/images/invoker-bg.png" 
        alt="Arcane Silhouette" 
        width={1920} 
        height={1080} 
        className={styles.invokerFigure}
        priority
      />

      {/* Floating Magic Orbs */}
      <div className={`${styles.ambientOrb} ${styles.quasOrb}`} />
      <div className={`${styles.ambientOrb} ${styles.wexOrb}`} />
      <div className={`${styles.ambientOrb} ${styles.exortOrb}`} />
    </div>
  );
}
