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

export function beep(frecuencia = 880, duracionMs = 150, volumen = 0.15) {
  try {
    const c = ctx();
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = "sine";
    osc.frequency.value = frecuencia;
    gain.gain.value = volumen;
    osc.connect(gain).connect(c.destination);
    osc.start();
    setTimeout(() => {
      osc.stop();
      osc.disconnect();
      gain.disconnect();
    }, duracionMs);
  } catch {
    /* silenciar errores de autoplay */
  }
}

export function beepDoble() {
  beep(880, 120);
  setTimeout(() => beep(1100, 180), 160);
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
