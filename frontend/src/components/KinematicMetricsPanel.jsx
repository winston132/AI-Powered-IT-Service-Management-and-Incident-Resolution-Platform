import React from 'react';
import { Activity, AlertCircle, Compass, ShieldAlert, Zap, TrendingUp, Info } from 'lucide-react';
import { KINEMATIC_THRESHOLDS } from '../services/kinematicEngine';

export default function KinematicMetricsPanel({ kinematics }) {
  if (!kinematics) return null;

  const score = kinematics.score || 0;
  const cva = kinematics.cva || 52;
  const shoulderTilt = kinematics.shoulderTilt || 0;
  const thoracic = kinematics.thoracicFlexion || 90;
  const lateral = kinematics.lateralDeviation || 0;
  const gaze = kinematics.gazeDistanceCm || 55;
  const compressionForce = kinematics.compressionForceN || 320;
  const cervicalStrain = kinematics.cervicalStrainN || 220;
  const lumbarStrain = kinematics.lumbarStrainN || 290;

  // Determine score color
  let scoreColor = '#10b981';
  let glowClass = 'glass-panel-glow-emerald';
  if (score < 60) {
    scoreColor = '#ff3366';
    glowClass = 'glass-panel-glow-crimson';
  } else if (score < 80) {
    scoreColor = '#f59e0b';
    glowClass = 'glass-panel-glow-amber';
  }

  // Radial SVG calculation
  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className={`glass-panel ${glowClass}`} style={{ padding: 22 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Activity size={18} color="#00f2fe" />
            Module 2: Kinematic Geometry & Biomechanics
          </h3>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginTop: 2 }}>
            Real-time multi-vector angle computation and disc load analysis
          </p>
        </div>

        <span className={`cyber-badge ${kinematics.postureState?.badgeClass || 'badge-optimal'}`}>
          {kinematics.postureState?.label}
        </span>
      </div>

      {/* Radial Ergonomic Health Score Gauge */}
      <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', gap: 20, alignItems: 'center', marginBottom: 20 }}>
        <div className="score-radial-container">
          <svg className="score-radial-svg" viewBox="0 0 160 160">
            <circle
              cx="80"
              cy="80"
              r={radius}
              fill="transparent"
              stroke="rgba(255, 255, 255, 0.08)"
              strokeWidth="12"
            />
            <circle
              cx="80"
              cy="80"
              r={radius}
              fill="transparent"
              stroke={scoreColor}
              strokeWidth="12"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 0.4s ease, stroke 0.4s ease' }}
            />
          </svg>

          <div className="score-value-text">
            <span className="score-big-num" style={{ color: scoreColor }}>
              {score}
            </span>
            <span className="score-label">EHS INDEX</span>
          </div>
        </div>

        <div>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 8 }}>
            <strong style={{ color: '#fff' }}>Ergonomic Health Score:</strong> Instantaneous posture optimization index evaluated against clinical biomechanical thresholds.
          </div>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '6px 12px', borderRadius: 8, border: '1px solid var(--border-glass)' }}>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>SPINAL DISC LOAD</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: compressionForce > 600 ? '#ff3366' : '#00f2fe', fontFamily: 'var(--font-mono)' }}>
                {compressionForce} N
              </div>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '6px 12px', borderRadius: 8, border: '1px solid var(--border-glass)' }}>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>C5/C7 CERVICAL STRAIN</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc', fontFamily: 'var(--font-mono)' }}>
                {cervicalStrain} N
              </div>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '6px 12px', borderRadius: 8, border: '1px solid var(--border-glass)' }}>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>L4/L5 LUMBAR LOAD</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc', fontFamily: 'var(--font-mono)' }}>
                {lumbarStrain} N
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Active Violations List */}
      {kinematics.violations && kinematics.violations.length > 0 && (
        <div style={{ marginBottom: 18, background: 'rgba(255, 51, 102, 0.08)', border: '1px solid rgba(255, 51, 102, 0.3)', borderRadius: 10, padding: '10px 14px' }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#ff4d79', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <AlertCircle size={14} /> ACTIVE KINEMATIC VIOLATIONS DETECTED:
          </div>
          {kinematics.violations.map((v, i) => (
            <div key={i} style={{ fontSize: '0.75rem', color: '#f8fafc', display: 'flex', justifyContent: 'space-between', marginTop: 3 }}>
              <span>• {v.message}</span>
              <span style={{ color: '#ff4d79', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>-{v.penalty} pts</span>
            </div>
          ))}
        </div>
      )}

      {/* Biomechanical Metric Progress Bars */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* Metric 1: CVA */}
        <div className="metric-row">
          <div className="metric-header">
            <span>
              <strong>Craniovertebral Angle (CVA)</strong>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginLeft: 6 }}>(Normal: &ge; 50°)</span>
            </span>
            <span className="mono" style={{ fontWeight: 700, color: cva >= 50 ? '#10b981' : (cva >= 42 ? '#f59e0b' : '#ff3366') }}>
              {cva}°
            </span>
          </div>
          <div className="metric-bar-track">
            <div
              className="metric-bar-fill"
              style={{
                width: `${Math.min(100, Math.max(10, (cva / 70) * 100))}%`,
                backgroundColor: cva >= 50 ? '#10b981' : (cva >= 42 ? '#f59e0b' : '#ff3366')
              }}
            />
          </div>
        </div>

        {/* Metric 2: Shoulder Tilt */}
        <div className="metric-row">
          <div className="metric-header">
            <span>
              <strong>Shoulder Horizontal Tilt</strong>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginLeft: 6 }}>(Normal: &le; 2.5°)</span>
            </span>
            <span className="mono" style={{ fontWeight: 700, color: shoulderTilt <= 2.5 ? '#10b981' : '#f59e0b' }}>
              Δ {shoulderTilt}°
            </span>
          </div>
          <div className="metric-bar-track">
            <div
              className="metric-bar-fill"
              style={{
                width: `${Math.min(100, Math.max(5, (shoulderTilt / 12) * 100))}%`,
                backgroundColor: shoulderTilt <= 2.5 ? '#10b981' : '#f59e0b'
              }}
            />
          </div>
        </div>

        {/* Metric 3: Thoracic Kyphosis */}
        <div className="metric-row">
          <div className="metric-header">
            <span>
              <strong>Thoracic Flexion / Slouch</strong>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginLeft: 6 }}>(Neutral: 82° - 98°)</span>
            </span>
            <span className="mono" style={{ fontWeight: 700, color: (thoracic >= 82 && thoracic <= 98) ? '#10b981' : '#ff3366' }}>
              {thoracic}°
            </span>
          </div>
          <div className="metric-bar-track">
            <div
              className="metric-bar-fill"
              style={{
                width: `${Math.min(100, Math.max(10, (thoracic / 120) * 100))}%`,
                backgroundColor: (thoracic >= 82 && thoracic <= 98) ? '#10b981' : '#ff3366'
              }}
            />
          </div>
        </div>

        {/* Metric 4: Gaze Distance */}
        <div className="metric-row">
          <div className="metric-header">
            <span>
              <strong>Screen Gaze Distance</strong>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginLeft: 6 }}>(Ergonomic: 45 - 75 cm)</span>
            </span>
            <span className="mono" style={{ fontWeight: 700, color: (gaze >= 45 && gaze <= 75) ? '#10b981' : '#f59e0b' }}>
              {gaze} cm
            </span>
          </div>
          <div className="metric-bar-track">
            <div
              className="metric-bar-fill"
              style={{
                width: `${Math.min(100, Math.max(10, (gaze / 100) * 100))}%`,
                backgroundColor: (gaze >= 45 && gaze <= 75) ? '#10b981' : '#f59e0b'
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
