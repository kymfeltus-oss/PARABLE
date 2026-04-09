'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Beta: Web Audio RMS “spike” detector on the active video — drives Praise Break UI.
 * Works best when video is unmuted; CORS may block analysis on some external URLs.
 */
export function useVideoPraiseBreak(activeVideo: HTMLVideoElement | null, enabled: boolean) {
  const [praiseBreakActive, setPraiseBreakActive] = useState(false);
  const baselineRef = useRef(0.04);
  const lastTriggerRef = useRef(0);

  useEffect(() => {
    if (!activeVideo || !enabled) return;

    let ctx: AudioContext | null = null;
    let source: MediaElementAudioSourceNode | null = null;
    let analyser: AnalyserNode | null = null;
    let raf = 0;
    let cancelled = false;

    const setup = async () => {
      try {
        ctx = new AudioContext();
        if (ctx.state === 'suspended') await ctx.resume();
        source = ctx.createMediaElementSource(activeVideo);
        analyser = ctx.createAnalyser();
        analyser.fftSize = 512;
        analyser.smoothingTimeConstant = 0.65;
        source.connect(analyser);
        analyser.connect(ctx.destination);
      } catch {
        return;
      }

      const data = new Uint8Array(analyser.frequencyBinCount);

      const tick = () => {
        if (cancelled || !analyser) return;
        analyser.getByteTimeDomainData(data);
        let sum = 0;
        for (let i = 0; i < data.length; i++) {
          const v = (data[i] - 128) / 128;
          sum += v * v;
        }
        const rms = Math.sqrt(sum / data.length);
        baselineRef.current = baselineRef.current * 0.97 + rms * 0.03;
        const now = performance.now();
        const threshold = Math.max(0.11, baselineRef.current * 2.4);
        if (rms > threshold && rms > 0.08 && now - lastTriggerRef.current > 2000) {
          lastTriggerRef.current = now;
          setPraiseBreakActive(true);
          window.setTimeout(() => setPraiseBreakActive(false), 2400);
        }
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    };

    void setup();

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      try {
        source?.disconnect();
        analyser?.disconnect();
        void ctx?.close();
      } catch {
        /* ignore */
      }
    };
  }, [activeVideo, enabled]);

  return praiseBreakActive;
}
