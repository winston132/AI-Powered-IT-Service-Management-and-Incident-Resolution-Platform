/**
 * Integrated Audio Subsystem & Procedural Synthesizer (Module 4)
 * Real-time Web Audio API procedural sound synthesis, spatial stereo panning,
 * live frequency spectrum analyzer, and Web Speech API natural voice prompts.
 */

export class AudioSubsystem {
  constructor() {
    this.audioCtx = null;
    this.analyser = null;
    this.masterGain = null;
    this.panner = null;
    this.volume = 0.75;
    this.isMuted = false;
    this.voiceGuidanceEnabled = true;
    this.voiceLanguage = 'en-US';
    this.dataArray = null;
    this.bufferLength = 0;
    this.synthPresets = {
      CHIME_OPTIMAL: { name: 'Optimal Harmonic Chime', freqs: [528, 660, 792], type: 'sine', duration: 0.6 },
      PING_ALERT: { name: 'Gentle Ergonomic Ping', freqs: [440, 880], type: 'triangle', duration: 0.4 },
      CHORD_WARNING: { name: 'Thoracic Slouch Chord', freqs: [330, 392, 494], type: 'sawtooth', duration: 0.8 },
      BINAURAL_BEAT: { name: 'Binaural Focus Pulse', freqs: [432, 442], type: 'sine', duration: 1.2 },
      CRITICAL_ALARM: { name: 'Escalation Alert Beep', freqs: [880, 1174, 880], type: 'square', duration: 0.9 }
    };
  }

  /**
   * Initialize AudioContext on first user interaction
   */
  initContext() {
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
        this.analyser = this.audioCtx.createAnalyser();
        this.analyser.fftSize = 128;
        this.bufferLength = this.analyser.frequencyBinCount;
        this.dataArray = new Uint8Array(this.bufferLength);

        this.masterGain = this.audioCtx.createGain();
        this.masterGain.gain.setValueAtTime(this.volume, this.audioCtx.currentTime);

        if (this.audioCtx.createStereoPanner) {
          this.panner = this.audioCtx.createStereoPanner();
          this.panner.pan.setValueAtTime(0, this.audioCtx.currentTime);
          this.masterGain.connect(this.panner);
          this.panner.connect(this.analyser);
        } else {
          this.masterGain.connect(this.analyser);
        }

        this.analyser.connect(this.audioCtx.destination);
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  setVolume(val) {
    this.volume = Math.max(0, Math.min(1, val));
    if (this.masterGain && this.audioCtx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.audioCtx.currentTime);
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    this.setVolume(this.volume);
    return this.isMuted;
  }

  setVoiceGuidance(enabled) {
    this.voiceGuidanceEnabled = enabled;
  }

  /**
   * Set spatial stereo pan (-1.0 Full Left to +1.0 Full Right)
   */
  setSpatialPan(panValue) {
    if (this.panner && this.audioCtx) {
      const clamped = Math.max(-1, Math.min(1, panValue));
      this.panner.pan.setTargetAtTime(clamped, this.audioCtx.currentTime, 0.05);
    }
  }

  /**
   * Play procedural synthesized tone with harmonic overtones
   */
  playTone(presetKey = 'PING_ALERT', pan = 0) {
    if (this.isMuted) return;
    this.initContext();
    if (!this.audioCtx) return;

    this.setSpatialPan(pan);
    const preset = this.synthPresets[presetKey] || this.synthPresets.PING_ALERT;
    const now = this.audioCtx.currentTime;

    preset.freqs.forEach((freq, idx) => {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = preset.type;
      osc.frequency.setValueAtTime(freq, now);

      // Envelope: Fast attack, exponential decay
      const attack = 0.03;
      const decay = preset.duration;
      const initialVol = (0.3 / (idx + 1)) * (this.isMuted ? 0 : this.volume);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(initialVol, now + attack);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + attack + decay);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + attack + decay + 0.05);
    });
  }

  /**
   * Natural Voice Prompt via Web Speech API
   */
  speakCue(text) {
    if (this.isMuted || !this.voiceGuidanceEnabled || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel(); // Stop prior utterance
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = this.voiceLanguage;
      utterance.rate = 1.05;
      utterance.pitch = 1.0;
      utterance.volume = this.volume;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('SpeechSynthesis error:', e);
    }
  }

  /**
   * Dispatches sensory notification sound based on posture violation
   */
  handlePostureAudioEvent(eventType, kinematics = null) {
    if (this.isMuted) return;

    let pan = 0;
    if (kinematics) {
      // Pan towards asymmetric shoulder side
      if (kinematics.rawKeypoints?.left_shoulder && kinematics.rawKeypoints?.right_shoulder) {
        const dy = kinematics.rawKeypoints.right_shoulder.y - kinematics.rawKeypoints.left_shoulder.y;
        pan = dy > 0 ? 0.6 : -0.6; // Positive dy means right shoulder is lower
      }
    }

    switch (eventType) {
      case 'TIER2_GENTLE_PING':
        this.playTone('PING_ALERT', pan);
        break;
      case 'TIER3_AUDIO_CHIME':
        this.playTone('CHORD_WARNING', pan);
        this.speakCue('Please align your shoulders and lift your chin.');
        break;
      case 'TIER4_VOICE_DESK':
        this.playTone('CRITICAL_ALARM', 0);
        this.speakCue('Prolonged slouch detected. Elevating desk to standing mode.');
        break;
      case 'RECOVERY_OPTIMAL':
        this.playTone('CHIME_OPTIMAL', 0);
        break;
      case 'MICRO_BREAK_START':
        this.playTone('BINAURAL_BEAT', 0);
        this.speakCue('Starting guided posture micro-break.');
        break;
      default:
        this.playTone('PING_ALERT', pan);
    }
  }

  /**
   * Get real-time frequency spectrum array for canvas visualizer
   */
  getSpectrumData() {
    if (!this.analyser || !this.dataArray) {
      return new Uint8Array(64).fill(12); // subtle baseline animation
    }
    this.analyser.getByteFrequencyData(this.dataArray);
    return this.dataArray;
  }
}

export const audioSubsystem = new AudioSubsystem();
