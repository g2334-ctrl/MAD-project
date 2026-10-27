// Web Audio API Sound Synthesizer for Siren, Radio Chime, and Alert Beeps
let audioCtx = null;
let sirenOsc1 = null;
let sirenOsc2 = null;
let sirenGain = null;
let sirenTimer = null;

function getAudioContext() {
  if (!audioCtx) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) audioCtx = new AudioContext();
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

// 🚨 Toggle Emergency Dual-Tone Siren
export function startSiren() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    stopSiren();

    sirenGain = ctx.createGain();
    sirenGain.gain.setValueAtTime(0.15, ctx.currentTime);
    sirenGain.connect(ctx.destination);

    sirenOsc1 = ctx.createOscillator();
    sirenOsc1.type = 'sawtooth';
    sirenOsc1.frequency.setValueAtTime(750, ctx.currentTime);
    sirenOsc1.connect(sirenGain);
    sirenOsc1.start();

    let high = true;
    sirenTimer = setInterval(() => {
      if (!sirenOsc1) return;
      const targetFreq = high ? 950 : 650;
      sirenOsc1.frequency.exponentialRampToValueAtTime(targetFreq, ctx.currentTime + 0.3);
      high = !high;
    }, 400);
  } catch (err) {
    console.warn('Audio not available:', err);
  }
}

export function stopSiren() {
  if (sirenTimer) {
    clearInterval(sirenTimer);
    sirenTimer = null;
  }
  if (sirenOsc1) {
    try { sirenOsc1.stop(); sirenOsc1.disconnect(); } catch {}
    sirenOsc1 = null;
  }
  if (sirenGain) {
    try { sirenGain.disconnect(); } catch {}
    sirenGain = null;
  }
}

// 📻 Radio Walkie-Talkie Chime
export function playRadioChime() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.setValueAtTime(1760, ctx.currentTime + 0.08);

    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.25);
  } catch (err) {
    console.warn(err);
  }
}

// 🚨 Emergency Klaxon Beep
export function playAlertBeep() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(520, ctx.currentTime);
    osc.frequency.setValueAtTime(1040, ctx.currentTime + 0.1);

    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.35);
  } catch (err) {
    console.warn(err);
  }
}
