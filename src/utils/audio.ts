let audioCtx: AudioContext | null = null;

function ctx(): AudioContext {
  if (!audioCtx) {
    const AC = (window.AudioContext || (window as any).webkitAudioContext) as
      | typeof AudioContext
      | undefined;
    if (!AC) throw new Error("AudioContext no disponible");
    audioCtx = new AC();
  }
  return audioCtx;
}

/**
 * Plays a smooth 'piiiip' tone.
 * @param frecuencia - Hz (default 880)
 * @param duracionSeg - duration in seconds (default 0.5 → clear piip)
 * @param volumen - peak gain 0–1 (default 0.7)
 */
export function beepPiip(frecuencia = 880, duracionSeg = 0.5, volumen = 0.7) {
  try {
    const c = ctx();
    const play = () => {
      const now = c.currentTime;
      const osc = c.createOscillator();
      const gain = c.createGain();

      osc.type = "sine";
      osc.frequency.value = frecuencia;

      // Hold at full volume, then fade to silence in last 50ms
      gain.gain.setValueAtTime(volumen, now);
      gain.gain.setValueAtTime(volumen, now + duracionSeg - 0.05);
      gain.gain.linearRampToValueAtTime(0, now + duracionSeg);

      osc.connect(gain).connect(c.destination);
      osc.start(now);
      osc.stop(now + duracionSeg);
    };

    if (c.state === "suspended") {
      c.resume().then(play).catch(() => {});
    } else {
      play();
    }
  } catch {
    /* silenciar errores de autoplay */
  }
}

/**
 * Legacy short click-beep (kept for backward compat).
 */
export function beep(frecuencia = 880, duracionMs = 150, volumen = 0.15) {
  beepPiip(frecuencia, duracionMs / 1000, volumen);
}

export function beepDoble() {
  beepPiip(880, 0.12);
  setTimeout(() => beepPiip(1100, 0.18), 160);
}

export function vibrar(patron: number | number[]) {
  if ("vibrate" in navigator) {
    try {
      navigator.vibrate(patron);
    } catch {
      /* noop */
    }
  }
}
