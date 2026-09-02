import React from 'react';
import { Activity, Cpu, Radio, Volume2, VolumeX, Sparkles, Shield, RefreshCw } from 'lucide-react';

export default function Navbar({
  fps = 30,
  latencyMs = 12,
  isMuted = false,
  onToggleMute,
  onOpenCalibration,
  connectedPeripheralCount = 4,
  postureState = null
}) {
  return (
    <header className="top-nav">
      <div className="brand-section">
        <div className="brand-logo-glow">
          <Activity size={24} color="#030712" />
        </div>
        <div>
          <div className="brand-title">EDGEPOSTURE AI</div>
          <div className="brand-subtitle">VisionSensory™ Edge Computing Platform</div>
        </div>
      </div>

      <div className="telemetry-ticker">
        <div className="ticker-item">
          <Cpu size={14} className="ticker-label" />
          <span className="ticker-label">ACCEL:</span>
          <span className="ticker-value">NPU/WASM</span>
        </div>

        <div className="ticker-item">
          <span className="ticker-label">FPS:</span>
          <span className="ticker-value" style={{ color: fps >= 25 ? '#10b981' : '#f59e0b' }}>
            {fps}
          </span>
        </div>

        <div className="ticker-item">
          <span className="ticker-label">LATENCY:</span>
          <span className="ticker-value">{latencyMs}ms</span>
        </div>

        <div className="ticker-item">
          <Radio size={14} className="ticker-label" />
          <span className="ticker-label">PERIPHERALS:</span>
          <span className="ticker-value">{connectedPeripheralCount} Active</span>
        </div>
      </div>

      <div className="nav-actions">
        {postureState && (
          <span className={`cyber-badge ${postureState.badgeClass}`}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor' }} />
            {postureState.label}
          </span>
        )}

        <button
          className="cyber-btn cyber-btn-secondary"
          onClick={onOpenCalibration}
          title="Recalibrate Posture Baseline"
          style={{ padding: '6px 14px', fontSize: '0.8rem' }}
        >
          <Sparkles size={14} color="#00f2fe" />
          <span>Calibrate</span>
        </button>

        <button
          className="cyber-btn cyber-btn-secondary"
          onClick={onToggleMute}
          title={isMuted ? 'Unmute Audio Subsystem' : 'Mute Audio Subsystem'}
          style={{ padding: '6px 12px' }}
        >
          {isMuted ? <VolumeX size={16} color="#ff3366" /> : <Volume2 size={16} color="#10b981" />}
        </button>
      </div>
    </header>
  );
}
