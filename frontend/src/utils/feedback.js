/**
 * LogicPlay Feedback Utility
 * Uses Web Audio API for cyberpunk sound synthesis and Vibration API for haptics.
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
 * Plays a synthesized cyberpunk sound based on interaction type
 */
export const playSound = (type) => {
  try {
    initAudio();
    const now = audioCtx.currentTime;

    // Common nodes for cyberpunk texture
    const osc = audioCtx.createOscillator();
    const filter = audioCtx.createBiquadFilter();
    const gain = audioCtx.createGain();

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(audioCtx.destination);

    filter.type = 'lowpass';
    filter.Q.setValueAtTime(8, now); // High resonance for "squelchy" sound

    switch (type) {
      case 'click':
        // Cyber-tick: Resonant square wave with rapid decay
        osc.type = 'square';
        osc.frequency.setValueAtTime(1200, now);
        osc.frequency.exponentialRampToValueAtTime(400, now + 0.04);
        
        filter.frequency.setValueAtTime(2000, now);
        filter.frequency.exponentialRampToValueAtTime(100, now + 0.04);
        
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
        
        osc.start(now);
        osc.stop(now + 0.04);
        break;

      case 'global':
        // "Oomph" for special buttons: Deep resonant pulse
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.exponentialRampToValueAtTime(40, now + 0.3);
        
        filter.frequency.setValueAtTime(1500, now);
        filter.frequency.exponentialRampToValueAtTime(100, now + 0.3);
        filter.Q.setValueAtTime(12, now);
        
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        
        osc.start(now);
        osc.stop(now + 0.3);
        break;

      case 'connect':
        // Digital chirp: Detuned sawtooth sweep
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.exponentialRampToValueAtTime(1500, now + 0.12);
        
        filter.frequency.setValueAtTime(4000, now);
        filter.frequency.exponentialRampToValueAtTime(500, now + 0.12);
        
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        
        osc.start(now);
        osc.stop(now + 0.15);
        break;

      case 'delete':
        // Glitch shutdown: Heavy bass drop
        osc.type = 'square';
        osc.frequency.setValueAtTime(180, now);
        osc.frequency.linearRampToValueAtTime(20, now + 0.25);
        
        filter.frequency.setValueAtTime(1000, now);
        filter.frequency.linearRampToValueAtTime(10, now + 0.25);
        
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.linearRampToValueAtTime(0, now + 0.25);
        
        osc.start(now);
        osc.stop(now + 0.25);
        break;

      case 'error':
        // Warning buzz: Low frequency sawtooth with jitter
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(100, now);
        filter.frequency.setValueAtTime(800, now);
        
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
        
        osc.start(now);
        osc.stop(now + 0.1);
        
        // Second pulse for that rhythmic error feel
        setTimeout(() => {
          const osc2 = audioCtx.createOscillator();
          const gain2 = audioCtx.createGain();
          osc2.connect(gain2);
          gain2.connect(audioCtx.destination);
          osc2.type = 'sawtooth';
          osc2.frequency.setValueAtTime(85, audioCtx.currentTime);
          gain2.gain.setValueAtTime(0.15, audioCtx.currentTime);
          gain2.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.12);
          osc2.start(audioCtx.currentTime);
          osc2.stop(audioCtx.currentTime + 0.12);
          hapticFeedback('medium');
        }, 120);
        break;

      case 'success':
        // "System online": Rising resonant sweep
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.exponentialRampToValueAtTime(1100, now + 0.4);
        
        filter.frequency.setValueAtTime(100, now);
        filter.frequency.exponentialRampToValueAtTime(4000, now + 0.4);
        filter.Q.setValueAtTime(15, now);
        
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
        
        osc.start(now);
        osc.stop(now + 0.45);
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
      navigator.vibrate(12);
      break;
    case 'medium':
      navigator.vibrate(40);
      break;
    case 'heavy':
      navigator.vibrate([60, 40, 60]);
      break;
    default:
      navigator.vibrate(12);
      break;
  }
};

/**
 * Combines cyberpunk sound and haptics for a unified feedback event
 */
export const triggerFeedback = (type) => {
  playSound(type);
  
  // Custom haptic mapping
  if (type === 'click' || type === 'connect') hapticFeedback('light');
  if (type === 'global') hapticFeedback('medium');
  if (type === 'delete') hapticFeedback('medium');
  if (type === 'error') hapticFeedback('heavy');
};

