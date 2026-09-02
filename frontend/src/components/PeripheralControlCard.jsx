import React, { useState, useEffect } from 'react';
import { Radio, Bluetooth, Zap, Sliders, Battery, Wifi, CheckCircle2, AlertTriangle, ArrowUpCircle, Sparkles } from 'lucide-react';
import { peripheralOrchestrator, HAPTIC_PATTERNS } from '../services/peripheralOrchestrator';

export default function PeripheralControlCard() {
  const [snapshot, setSnapshot] = useState(peripheralOrchestrator.getSnapshot());
  const [selectedLightColor, setSelectedLightColor] = useState('#10b981');
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    const unsubscribe = peripheralOrchestrator.subscribe((snap) => {
      setSnapshot(snap);
    });
    return unsubscribe;
  }, []);

  const handleScan = async () => {
    setIsScanning(true);
    await new Promise(r => setTimeout(r, 1200));
    await peripheralOrchestrator.scanForPeripherals();
    setIsScanning(false);
  };

  const handleTriggerHaptic = (patternKey) => {
    peripheralOrchestrator.triggerHaptic(patternKey);
  };

  const handleColorChange = (color) => {
    setSelectedLightColor(color);
    peripheralOrchestrator.setLightbarState(color, 90);
  };

  const handleDeskToggle = (height) => {
    peripheralOrchestrator.adjustDeskHeight(height);
  };

  return (
    <div className="glass-panel" style={{ padding: 22 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Radio size={18} color="#00f2fe" />
            Module 3: Dynamic Peripheral Discovery & Sensory Orchestrator
          </h3>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginTop: 2 }}>
            Multi-protocol hardware bus (BLE 5.2, USB-HID, WebSerial, TCP Actuator Bridge)
          </p>
        </div>

        <button
          className="cyber-btn cyber-btn-primary"
          onClick={handleScan}
          disabled={isScanning}
          style={{ padding: '6px 14px', fontSize: '0.8rem' }}
        >
          <Bluetooth size={14} />
          {isScanning ? 'Scanning Bus...' : 'Discover Peripherals'}
        </button>
      </div>

      {/* Escalation Policy Status Banner */}
      <div style={{ background: 'rgba(6, 182, 212, 0.08)', border: '1px solid rgba(6, 182, 212, 0.25)', borderRadius: 10, padding: '10px 14px', marginBottom: 18 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#00f2fe', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Zap size={14} /> ACTIVE SENSORY ESCALATION STATUS:
          </div>
          <span className="cyber-badge badge-cyan">
            TIER {snapshot.activeEscalationTier || '0'}: {snapshot.activeEscalationTier === 0 ? 'STANDBY' : (snapshot.activeEscalationTier === 1 ? 'AMBIENT GLOW' : (snapshot.activeEscalationTier === 2 ? 'HAPTIC BUZZ' : (snapshot.activeEscalationTier === 3 ? 'DUAL SENSORY' : 'DESK ELEVATE')))}
          </span>
        </div>
        <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: 4 }}>
          Continuous Posture Strain Timer: <strong style={{ color: '#fff', fontFamily: 'var(--font-mono)' }}>{snapshot.slouchDurationSec}s</strong> / Refractory Cooldown: <strong style={{ color: '#fff' }}>Active</strong>
        </div>
      </div>

      {/* Discovered Peripherals Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12, marginBottom: 20 }}>
        {snapshot.peripherals.map((dev) => (
          <div
            key={dev.id}
            style={{
              background: 'rgba(15, 23, 42, 0.6)',
              border: dev.activePattern ? '1px solid #00f2fe' : '1px solid var(--border-glass)',
              boxShadow: dev.activePattern ? '0 0 16px rgba(0, 242, 254, 0.3)' : 'none',
              borderRadius: 12,
              padding: 14,
              transition: 'all 0.2s ease'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
              <div>
                <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#f8fafc' }}>{dev.name}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>{dev.protocol}</div>
              </div>
              <span
                style={{
                  fontSize: '0.68rem',
                  padding: '2px 8px',
                  borderRadius: 6,
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 600,
                  background: dev.status === 'connected' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(100, 116, 139, 0.15)',
                  color: dev.status === 'connected' ? '#10b981' : '#94a3b8'
                }}
              >
                {dev.status.toUpperCase()}
              </span>
            </div>

            <div style={{ display: 'flex', gap: 12, fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 10 }}>
              {dev.battery !== null && (
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Battery size={12} color="#10b981" /> {dev.battery}%
                </span>
              )}
              {dev.rssi !== null && (
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Wifi size={12} color="#00f2fe" /> {dev.rssi} dBm
                </span>
              )}
              <span>FW: {dev.firmware}</span>
            </div>

            {/* Custom Peripheral Status Indicators */}
            {dev.type === 'lighting' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>LED STATE:</span>
                <span style={{ width: 14, height: 14, borderRadius: '50%', background: dev.activeColor || '#10b981', boxShadow: `0 0 10px ${dev.activeColor || '#10b981'}` }} />
                <span style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: '#fff' }}>{dev.activeColor}</span>
              </div>
            )}

            {dev.type === 'actuator' && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 6, fontSize: '0.75rem' }}>
                <span style={{ color: 'var(--text-dim)' }}>HEIGHT: <strong style={{ color: '#00f2fe', fontFamily: 'var(--font-mono)' }}>{dev.currentHeightCm} cm</strong></span>
                {dev.isMoving && <span style={{ color: '#f59e0b', fontWeight: 600, animation: 'pulse 1s infinite' }}>[MOTOR ACTUATING...]</span>}
              </div>
            )}

            {dev.activePattern && (
              <div style={{ marginTop: 8, fontSize: '0.74rem', color: '#00f2fe', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                ⚡ FIRING: {dev.activePattern}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Interactive Peripheral Commander Sandbox */}
      <div style={{ background: 'rgba(12, 18, 34, 0.7)', borderRadius: 12, padding: 16, border: '1px solid var(--border-glass)' }}>
        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#f8fafc', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          🎮 Interactive Hardware Commander Sandbox:
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
          {/* Haptic Buzz Test */}
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: 6 }}>Haptic Vibration Waveforms:</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <button className="cyber-btn cyber-btn-secondary" onClick={() => handleTriggerHaptic('GENTLE_PULSE')} style={{ padding: '6px 10px', fontSize: '0.75rem', justifyContent: 'flex-start' }}>
                <Zap size={12} color="#10b981" /> Pulse (90Hz)
              </button>
              <button className="cyber-btn cyber-btn-secondary" onClick={() => handleTriggerHaptic('DOUBLE_BUZZ')} style={{ padding: '6px 10px', fontSize: '0.75rem', justifyContent: 'flex-start' }}>
                <Zap size={12} color="#00f2fe" /> Dual Acromion Buzz (160Hz)
              </button>
              <button className="cyber-btn cyber-btn-secondary" onClick={() => handleTriggerHaptic('STACCATO_WARNING')} style={{ padding: '6px 10px', fontSize: '0.75rem', justifyContent: 'flex-start' }}>
                <Zap size={12} color="#ff3366" /> Staccato Slouch Alert (210Hz)
              </button>
            </div>
          </div>

          {/* ErgoGlow Ambient Lighting Colors */}
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: 6 }}>ErgoGlow™ Ambient Lightbar:</div>
            <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
              {['#10b981', '#00f2fe', '#f59e0b', '#ff3366', '#8b5cf6'].map(color => (
                <button
                  key={color}
                  onClick={() => handleColorChange(color)}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    background: color,
                    border: selectedLightColor === color ? '2px solid #ffffff' : '2px solid transparent',
                    boxShadow: selectedLightColor === color ? `0 0 14px ${color}` : 'none',
                    cursor: 'pointer'
                  }}
                  title={`Set Lightbar ${color}`}
                />
              ))}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 10 }}>
              Addressable 360° Visual Peripheral Cue
            </div>
          </div>

          {/* SmartDesk Actuator */}
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: 6 }}>SmartDesk™ Actuator Presets:</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="cyber-btn cyber-btn-secondary" onClick={() => handleDeskToggle(74.0)} style={{ padding: '6px 12px', fontSize: '0.75rem' }}>
                Sit (74 cm)
              </button>
              <button className="cyber-btn cyber-btn-emerald" onClick={() => handleDeskToggle(106.0)} style={{ padding: '6px 12px', fontSize: '0.75rem' }}>
                Stand (106 cm)
              </button>
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 10 }}>
              Automatic Tier-4 Ergonomic Reliever
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
