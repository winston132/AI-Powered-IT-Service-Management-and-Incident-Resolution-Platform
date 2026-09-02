import React, { useState } from 'react';
import { Sparkles, CheckCircle2, ArrowRight, ShieldCheck, Compass, Sliders } from 'lucide-react';
import { audioSubsystem } from '../services/audioSubsystem';

export default function SystemCalibrationModal({ isOpen, onClose, kinematics, onSaveCalibration }) {
  const [step, setStep] = useState(1);
  const [capturedCva, setCapturedCva] = useState(52);
  const [capturedShoulder, setCapturedShoulder] = useState(1.2);
  const [capturedDistance, setCapturedDistance] = useState(58);
  const [sensitivity, setSensitivity] = useState('NORMAL');

  if (!isOpen) return null;

  const handleCaptureNeutral = () => {
    if (kinematics) {
      setCapturedCva(kinematics.cva || 52);
      setCapturedShoulder(kinematics.shoulderTilt || 1.2);
      setCapturedDistance(kinematics.gazeDistanceCm || 55);
    }
    audioSubsystem.playTone('CHIME_OPTIMAL');
    setStep(2);
  };

  const handleComplete = () => {
    audioSubsystem.playTone('CHIME_OPTIMAL');
    audioSubsystem.speakCue('Biomechanical calibration saved successfully.');
    onSaveCalibration({
      cvaBaseline: capturedCva,
      shoulderBaseline: capturedShoulder,
      distanceBaseline: capturedDistance,
      sensitivity
    });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div className="brand-logo-glow" style={{ width: 34, height: 34 }}>
              <Sparkles size={18} color="#030712" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.2rem', color: '#f8fafc' }}>Biomechanical Posture Baseline Calibration</h2>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                STEP {step} OF 3 • ANTHROPOMETRIC ADAPTATION
              </div>
            </div>
          </div>

          <button className="cyber-btn cyber-btn-secondary" onClick={onClose} style={{ padding: '4px 10px' }}>
            ✕
          </button>
        </div>

        {/* Step Indicator */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 20 }}>
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              style={{
                flex: 1,
                height: 4,
                borderRadius: 2,
                background: s <= step ? '#00f2fe' : 'rgba(255,255,255,0.1)',
                boxShadow: s <= step ? '0 0 10px rgba(0, 242, 254, 0.5)' : 'none',
                transition: 'all 0.3s ease'
              }}
            />
          ))}
        </div>

        {/* Step 1: Upright Spine */}
        {step === 1 && (
          <div>
            <h4 style={{ fontSize: '1rem', color: '#00f2fe', marginBottom: 8 }}>
              1. Sit in your natural neutral upright posture
            </h4>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: 16 }}>
              Align your head so your ears are directly above your shoulders. Relax your shoulder girdle and gaze straight at the camera.
            </p>

            <div style={{ background: 'rgba(15, 23, 42, 0.6)', borderRadius: 10, padding: 14, border: '1px solid var(--border-glass)', marginBottom: 20 }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: 4 }}>LIVE DETECTED ANGLES:</div>
              <div style={{ display: 'flex', gap: 16 }}>
                <div>CVA: <strong style={{ color: '#10b981', fontFamily: 'var(--font-mono)' }}>{kinematics?.cva || 52}°</strong></div>
                <div>Shoulder Tilt: <strong style={{ color: '#00f2fe', fontFamily: 'var(--font-mono)' }}>Δ {kinematics?.shoulderTilt || 0}°</strong></div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button className="cyber-btn cyber-btn-primary" onClick={handleCaptureNeutral}>
                Lock Neutral Posture <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Distance */}
        {step === 2 && (
          <div>
            <h4 style={{ fontSize: '1rem', color: '#00f2fe', marginBottom: 8 }}>
              2. Calibrate Workstation Monitor Distance
            </h4>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: 16 }}>
              Position yourself at an arm's length (approx. 50-70 cm) from your display screen.
            </p>

            <div style={{ background: 'rgba(15, 23, 42, 0.6)', borderRadius: 10, padding: 14, border: '1px solid var(--border-glass)', marginBottom: 20 }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: 4 }}>ESTIMATED GAZE DISTANCE:</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#10b981', fontFamily: 'var(--font-mono)' }}>
                {kinematics?.gazeDistanceCm || 55} cm
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <button className="cyber-btn cyber-btn-secondary" onClick={() => setStep(1)}>
                Back
              </button>
              <button className="cyber-btn cyber-btn-primary" onClick={() => setStep(3)}>
                Accept Distance <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Sensitivity */}
        {step === 3 && (
          <div>
            <h4 style={{ fontSize: '1rem', color: '#00f2fe', marginBottom: 8 }}>
              3. Sensory Alert Sensitivity & Escalation Delay
            </h4>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: 16 }}>
              Select how aggressively the sensory orchestration engine should dispatch haptic and audible alerts.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 20 }}>
              {[
                { id: 'GENTLE', label: 'Gentle', desc: 'Alert after 10s slouch' },
                { id: 'NORMAL', label: 'Standard', desc: 'Alert after 5s slouch' },
                { id: 'STRICT', label: 'Strict Ergonomics', desc: 'Alert after 2s slouch' }
              ].map((lvl) => (
                <div
                  key={lvl.id}
                  onClick={() => setSensitivity(lvl.id)}
                  style={{
                    background: sensitivity === lvl.id ? 'rgba(6, 182, 212, 0.15)' : 'rgba(15, 23, 42, 0.6)',
                    border: sensitivity === lvl.id ? '1px solid #00f2fe' : '1px solid var(--border-glass)',
                    borderRadius: 10,
                    padding: 12,
                    cursor: 'pointer',
                    textAlign: 'center'
                  }}
                >
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f8fafc' }}>{lvl.label}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 4 }}>{lvl.desc}</div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <button className="cyber-btn cyber-btn-secondary" onClick={() => setStep(2)}>
                Back
              </button>
              <button className="cyber-btn cyber-btn-emerald" onClick={handleComplete}>
                <CheckCircle2 size={14} /> Save & Apply Calibration
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
