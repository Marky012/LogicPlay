/**
 * LogicPlay Feedback Utility
 * Uses Web Audio API for sound synthesis and Vibration API for haptics.
 */

let audioCtx = null;

const initAudio = () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
};

/**
 * Plays a synthesized sound based on interaction type
 */
export const playSound = (type) => {
  try {
    initAudio();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    const now = audioCtx.currentTime;

    switch (type) {
      case 'click':
        // Short, clean "tick"
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(400, now + 0.05);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
        osc.start(now);
        osc.stop(now + 0.05);
        break;

      case 'connect':
        // Modern "chirp" for wire connection
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.exponentialRampToValueAtTime(1200, now + 0.1);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
        osc.start(now);
        osc.stop(now + 0.15);
        break;

      case 'delete':
        // Low "thud" for deletion
        osc.type = 'sine';
        osc.frequency.setValueAtTime(200, now);
        osc.frequency.exponentialRampToValueAtTime(50, now + 0.2);
        gain.gain.setValueAtTime(0.4, now);
        gain.gain.linearRampToValueAtTime(0, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.2);
        break;

      case 'error':
        // Dual-tone "buzz"
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(120, now);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.linearRampToValueAtTime(0, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.1);
        
        // Second pulse
        setTimeout(() => {
          const osc2 = audioCtx.createOscillator();
          const gain2 = audioCtx.createGain();
          osc2.connect(gain2);
          gain2.connect(audioCtx.destination);
          osc2.type = 'sawtooth';
          osc2.frequency.setValueAtTime(100, audioCtx.currentTime);
          gain2.gain.setValueAtTime(0.15, audioCtx.currentTime);
          gain2.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.1);
          osc2.start(audioCtx.currentTime);
          osc2.stop(audioCtx.currentTime + 0.1);
          hapticFeedback('medium');
        }, 120);
        break;

      case 'success':
        // Ascending harmonic "pling"
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(1200, now + 0.2);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
        break;

      default:
        break;
    }
  } catch (e) {
    console.warn('Audio feedback failed:', e);
  }
};

/**
 * Triggers haptic vibration for mobile users
 */
export const hapticFeedback = (intensity = 'light') => {
  if (!('vibrate' in navigator)) return;

  switch (intensity) {
    case 'light':
      navigator.vibrate(10);
      break;
    case 'medium':
      navigator.vibrate(35);
      break;
    case 'heavy':
      navigator.vibrate([50, 30, 50]);
      break;
    default:
      navigator.vibrate(10);
      break;
  }
};

/**
 * Combines sound and haptics for a unified feedback event
 */
export const triggerFeedback = (type) => {
  playSound(type);
  
  // Custom haptic mapping
  if (type === 'click' || type === 'connect') hapticFeedback('light');
  if (type === 'delete') hapticFeedback('medium');
  if (type === 'error') hapticFeedback('heavy');
};
