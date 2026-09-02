import React, { useRef, useEffect, useState } from 'react';
import { Volume2, VolumeX, Mic, Play, Radio, Music, Sliders, Check } from 'lucide-react';
import { audioSubsystem } from '../services/audioSubsystem';

export default function AudioSynthesizerVisualizer({ isMuted, onToggleMute }) {
  const canvasRef = useRef(null);
  const [volume, setVolume] = useState(0.75);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [lastPlayedTone, setLastPlayedTone] = useState(null);

  useEffect(() => {
    let animationFrameId;

    const render = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      const width = canvas.width;
      const height = canvas.height;

      const spectrum = audioSubsystem.getSpectrumData();

      ctx.clearRect(0, 0, width, height);

      // Draw baseline glow
      const grad = ctx.createLinearGradient(0, height, 0, 0);
      grad.addColorStop(0, 'rgba(0, 242, 254, 0.8)');
      grad.addColorStop(0.6, 'rgba(139, 92, 246, 0.6)');
      grad.addColorStop(1, 'rgba(255, 51, 102, 0.9)');

      const barCount = 36;
      const barWidth = (width / barCount) - 2;

      for (let i = 0; i < barCount; i++) {
        const value = (spectrum[i % spectrum.length] || 15) / 255;
        const barHeight = Math.max(4, value * height * 0.9);

        const x = i * (barWidth + 2);
        const y = height - barHeight;

        ctx.fillStyle = grad;
        ctx.shadowColor = '#00f2fe';
        ctx.shadowBlur = 6;
        ctx.fillRect(x, y, barWidth, barHeight);
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  const handleVolumeChange = (e) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    audioSubsystem.setVolume(val);
  };

  const handlePlayPreset = (presetKey, name) => {
    setLastPlayedTone(name);
    audioSubsystem.playTone(presetKey);
    setTimeout(() => setLastPlayedTone(null), 1200);
  };

  const handleTestVoicePrompt = (text) => {
    audioSubsystem.speakCue(text);
  };

  return (
    <div className="glass-panel" style={{ padding: 22 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Volume2 size={18} color="#00f2fe" />
            Module 4: Procedural Audio Synthesizer & Acoustic Subsystem
          </h3>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginTop: 2 }}>
            Low-latency Web Audio API spatial frequency synthesizer and natural voice guidance
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>MASTER VOL:</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={handleVolumeChange}
              style={{ width: 80, accentColor: '#00f2fe' }}
            />
          </div>

          <button
            className="cyber-btn cyber-btn-secondary"
            onClick={onToggleMute}
            style={{ padding: '6px 12px', fontSize: '0.8rem' }}
          >
            {isMuted ? <VolumeX size={14} color="#ff3366" /> : <Volume2 size={14} color="#10b981" />}
            {isMuted ? 'Muted' : 'Audio On'}
          </button>
        </div>
      </div>

      {/* Real-Time FFT Frequency Spectrum Canvas */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-dim)', marginBottom: 4 }}>
          <span>LIVE FFT FREQUENCY SPECTRUM (20Hz - 20kHz)</span>
          {lastPlayedTone && <span style={{ color: '#00f2fe', fontWeight: 700 }}>SYNTH: {lastPlayedTone}</span>}
        </div>
        <canvas
          ref={canvasRef}
          width={600}
          height={80}
          className="audio-spectrum-canvas"
        />
      </div>

      {/* Procedural Waveform Synthesizer Sound Board */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 16 }}>
        <div style={{ background: 'rgba(12, 18, 34, 0.6)', borderRadius: 10, padding: 14, border: '1px solid var(--border-glass)' }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#f8fafc', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Music size={14} color="#00f2fe" /> PROCEDURAL SYNTH SOUNDBOARD:
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <button
              className="cyber-btn cyber-btn-secondary"
              onClick={() => handlePlayPreset('CHIME_OPTIMAL', 'Optimal 528Hz')}
              style={{ fontSize: '0.74rem', padding: '6px 10px', justifyContent: 'flex-start' }}
            >
              <Play size={12} color="#10b981" /> 528Hz Harmonic Chime
            </button>

            <button
              className="cyber-btn cyber-btn-secondary"
              onClick={() => handlePlayPreset('PING_ALERT', 'Ergo Ping')}
              style={{ fontSize: '0.74rem', padding: '6px 10px', justifyContent: 'flex-start' }}
            >
              <Play size={12} color="#00f2fe" /> 440Hz Gentle Ping
            </button>

            <button
              className="cyber-btn cyber-btn-secondary"
              onClick={() => handlePlayPreset('CHORD_WARNING', 'Slouch Chord')}
              style={{ fontSize: '0.74rem', padding: '6px 10px', justifyContent: 'flex-start' }}
            >
              <Play size={12} color="#f59e0b" /> Slouch Minor Chord
            </button>

            <button
              className="cyber-btn cyber-btn-secondary"
              onClick={() => handlePlayPreset('BINAURAL_BEAT', 'Binaural 432Hz')}
              style={{ fontSize: '0.74rem', padding: '6px 10px', justifyContent: 'flex-start' }}
            >
              <Play size={12} color="#8b5cf6" /> 432Hz Binaural Beat
            </button>

            <button
              className="cyber-btn cyber-btn-danger"
              onClick={() => handlePlayPreset('CRITICAL_ALARM', 'Alarm Beep')}
              style={{ fontSize: '0.74rem', padding: '6px 10px', justifyContent: 'flex-start', gridColumn: 'span 2' }}
            >
              <Play size={12} /> Tier-4 Escalation Alarm Beep
            </button>
          </div>
        </div>

        {/* Natural Voice Guidance Prompts */}
        <div style={{ background: 'rgba(12, 18, 34, 0.6)', borderRadius: 10, padding: 14, border: '1px solid var(--border-glass)' }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#f8fafc', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Mic size={14} color="#10b981" /> NATURAL SPEECH CUES:
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <button
              className="cyber-btn cyber-btn-secondary"
              onClick={() => handleTestVoicePrompt('Please align your shoulders and lift your chin.')}
              style={{ fontSize: '0.72rem', padding: '6px 10px', justifyContent: 'flex-start' }}
            >
              "Please align your shoulders"
            </button>

            <button
              className="cyber-btn cyber-btn-secondary"
              onClick={() => handleTestVoicePrompt('Forward head posture detected. Realign cervical spine.')}
              style={{ fontSize: '0.72rem', padding: '6px 10px', justifyContent: 'flex-start' }}
            >
              "Forward head posture detected"
            </button>

            <button
              className="cyber-btn cyber-btn-secondary"
              onClick={() => handleTestVoicePrompt('Posture micro-break suggested. Commencing 30-second stretch.')}
              style={{ fontSize: '0.72rem', padding: '6px 10px', justifyContent: 'flex-start' }}
            >
              "Posture micro-break suggested"
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
