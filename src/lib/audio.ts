let audioCtx: AudioContext | null = null;

export function playHornPattern(pattern: [number, number][]) {
  try {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AC) return;
    if (!audioCtx) audioCtx = new AC();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    let t = audioCtx.currentTime + 0.02;
    pattern.forEach(([freq, dur]) => {
      const osc = audioCtx!.createOscillator();
      const gain = audioCtx!.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.18, t + 0.015);
      gain.gain.linearRampToValueAtTime(0.18, t + dur - 0.03);
      gain.gain.linearRampToValueAtTime(0, t + dur);
      osc.connect(gain).connect(audioCtx!.destination);
      osc.start(t);
      osc.stop(t + dur + 0.02);
      t += dur;
    });
  } catch {
    // Audio not available
  }
}
