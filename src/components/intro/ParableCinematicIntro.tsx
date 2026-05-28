"use client";

import { Open_Sans } from "next/font/google";
import { useEffect, useRef, type ReactNode } from "react";
import styles from "@/components/intro/ParableCinematicIntro.module.css";

const openSans = Open_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "600"],
  display: "swap",
});

/** Official PARABLE hero artwork (legacy export — intro uses local MP4). */
export const PARABLE_INTRO_HERO_URL =
  "https://assets.codepen.io/17388899/ChatGPT%20Image%20May%2027%2C%202026%2C%2004_08_34%20PM.png";

/** Fullscreen intro background — place file at public/intro/parable-intro.mp4 */
export const PARABLE_INTRO_VIDEO_SRC = "/intro/parable-intro.mp4";

type ParableCinematicIntroProps = {
  onEnter: () => void;
  entering?: boolean;
  /** Optional subtle secondary navigation (does not replace onEnter auth routing). */
  footerLinks?: ReactNode;
};

/**
 * Cinematic MP4 flash intro — fullscreen video at app entry (`/`).
 * ENTER wired through onEnter (auth routing on flash page).
 */
export default function ParableCinematicIntro({
  onEnter,
  entering = false,
  footerLinks,
}: ParableCinematicIntroProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = true;
    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        /* Autoplay blocked until user gesture — ENTER still works */
      });
    }
  }, []);

  return (
    <main
      className={`${openSans.className} ${styles.intro}`}
      data-audio-zone="intro-ambient"
      data-audio-ready="true"
      data-testid="parable-cinematic-intro"
    >
      <div className={styles.videoWrap} aria-hidden>
        <video
          ref={videoRef}
          className={styles.video}
          src={PARABLE_INTRO_VIDEO_SRC}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
        />
      </div>

      <div className={styles.scrim} aria-hidden />

      <section className={styles.enterZone}>
        <button
          type="button"
          className={styles.enter}
          onClick={onEnter}
          disabled={entering}
          data-audio-target="intro-enter"
          data-audio-hover="intro-enter-hover"
          aria-label={entering ? "Entering sanctuary" : "Enter PARABLE"}
        >
          <span className={styles.enterLabel}>
            {entering ? "ENTERING" : "ENTER PARABLE"}
          </span>
        </button>
      </section>

      {footerLinks ? <div className={styles.footer}>{footerLinks}</div> : null}
    </main>
  );
}
