import React, { useState, useEffect } from 'react';
import { Sparkles, Play, CheckCircle2, RotateCcw, Award, Flame, HeartPulse, ChevronRight } from 'lucide-react';
import { audioSubsystem } from '../services/audioSubsystem';

const MICRO_EXERCISES = [
  {
    id: 'chin_tuck',
    title: 'Cervical Chin Retraction (Chin Tuck)',
    targetArea: 'Deep Cervical Flexors (C1-C7)',
    targetReps: 5,
    holdSec: 3,
    description: 'Draw your chin straight backward without tilting head down. Re-aligns C-spine and relieves cervical suboccipital tension.',
    benefit: 'Reduces forward head posture and eases tension headaches'
  },
  {
    id: 'scapular_squeeze',
    title: 'Scapular Retraction (Shoulder Squeeze)',
    targetArea: 'Rhomboids & Middle Trapezius',
    targetReps: 5,
    holdSec: 4,
    description: 'Pull your shoulder blades down and back together as if squeezing a pencil between them. Avoid shrugging shoulders up.',
    benefit: 'Reverses rounded shoulders and opens chest cavity'
  },
  {
    id: 'thoracic_extension',
    title: 'Thoracic Spinal Extension & Opener',
    targetArea: 'Thoracic Vertebrae (T1-T12)',
    targetReps: 3,
    holdSec: 6,
    description: 'Interlace fingers behind head, gently inhale and extend upper back backward over chair, looking slightly upward.',
    benefit: 'Counters desk kyphosis and expands lung volume'
  },
  {
    id: 'lateral_neck_stretch',
    title: 'Lateral Upper Trapezius Stretch',
    targetArea: 'Upper Trapezius & Scalene Muscles',
    targetReps: 4,
    holdSec: 5,
    description: 'Slowly lower right ear toward right shoulder until gentle stretch is felt on left side. Repeat on opposite side.',
    benefit: 'Relieves asymmetric shoulder elevation tightness'
  }
];

export default function MicroBreakCoach({ kinematics }) {
  const [currentExerciseIdx, setCurrentExerciseIdx] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [currentReps, setCurrentReps] = useState(0);
  const [holdTimer, setHoldTimer] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  const [completedExercises, setCompletedExercises] = useState(new Set());
  const [streakCount, setStreakCount] = useState(3);

  const activeExercise = MICRO_EXERCISES[currentExerciseIdx];

  // Dynamic exercise tracker simulation
  useEffect(() => {
    let interval;
    if (isActive && !completedExercises.has(activeExercise.id)) {
      interval = setInterval(() => {
        setHoldTimer((prev) => {
          if (prev >= activeExercise.holdSec) {
            // Rep completed!
            setCurrentReps((r) => {
              const nextR = r + 1;
              audioSubsystem.playTone('PING_ALERT');
              if (nextR >= activeExercise.targetReps) {
                // Exercise completed
                audioSubsystem.playTone('CHIME_OPTIMAL');
                audioSubsystem.speakCue(`Great job! ${activeExercise.title} completed.`);
                setCompletedExercises(new Set([...completedExercises, activeExercise.id]));
                setIsActive(false);
                return activeExercise.targetReps;
              }
              return nextR;
            });
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, activeExercise, completedExercises]);

  const handleStartExercise = () => {
    setIsActive(true);
    setCurrentReps(0);
    setHoldTimer(0);
    audioSubsystem.handlePostureAudioEvent('MICRO_BREAK_START');
  };

  const handleReset = () => {
    setIsActive(false);
    setCurrentReps(0);
    setHoldTimer(0);
  };

  const handleNextExercise = () => {
    handleReset();
    setCurrentExerciseIdx((idx) => (idx + 1) % MICRO_EXERCISES.length);
  };

  const isCurrentCompleted = completedExercises.has(activeExercise.id);
  const progressPercent = Math.round((currentReps / activeExercise.targetReps) * 100);

  return (
    <div className="glass-panel" style={{ padding: 22 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Sparkles size={18} color="#00f2fe" />
            Feature 5: AI Ergonomic Coach & Micro-Break Workout Tracker
          </h3>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginTop: 2 }}>
            Real-time vision pose-tracked biomechanical reset routines and rep counting
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="cyber-badge badge-warning">
            <Flame size={12} /> {streakCount} STREAK DAY
          </span>
          <span className="cyber-badge badge-cyan">
            {completedExercises.size} / {MICRO_EXERCISES.length} COMPLETED
          </span>
        </div>
      </div>

      {/* Main Exercise Interactive Stage */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 20, marginBottom: 20 }}>
        {/* Left Side: Exercise Focus Card */}
        <div style={{ background: 'rgba(12, 18, 34, 0.7)', borderRadius: 14, padding: 18, border: '1px solid var(--border-glass)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
            <div>
              <span className="cyber-badge badge-cyan" style={{ marginBottom: 6 }}>
                EXERCISE {currentExerciseIdx + 1} OF {MICRO_EXERCISES.length}
              </span>
              <h4 style={{ fontSize: '1.15rem', color: '#f8fafc', marginTop: 4 }}>{activeExercise.title}</h4>
              <div style={{ fontSize: '0.75rem', color: '#00f2fe', fontFamily: 'var(--font-mono)' }}>
                Target: {activeExercise.targetArea}
              </div>
            </div>

            {isCurrentCompleted && (
              <span className="cyber-badge badge-optimal">
                <CheckCircle2 size={14} /> COMPLETED
              </span>
            )}
          </div>

          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: 14 }}>
            {activeExercise.description}
          </p>

          <div style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.25)', borderRadius: 8, padding: '8px 12px', fontSize: '0.75rem', color: '#34d399', marginBottom: 16 }}>
            <strong>Clinical Biomechanical Benefit:</strong> {activeExercise.benefit}
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            {!isActive && !isCurrentCompleted && (
              <button className="cyber-btn cyber-btn-primary" onClick={handleStartExercise} style={{ padding: '8px 18px' }}>
                <Play size={14} /> Start Guided Reps
              </button>
            )}

            {isActive && (
              <button className="cyber-btn cyber-btn-danger" onClick={handleReset} style={{ padding: '8px 18px' }}>
                <RotateCcw size={14} /> Pause / Reset
              </button>
            )}

            {isCurrentCompleted && (
              <button className="cyber-btn cyber-btn-emerald" onClick={handleStartExercise} style={{ padding: '8px 18px' }}>
                <RotateCcw size={14} /> Repeat Exercise
              </button>
            )}

            <button className="cyber-btn cyber-btn-secondary" onClick={handleNextExercise} style={{ padding: '8px 16px' }}>
              Next Stretch <ChevronRight size={14} />
            </button>
          </div>
        </div>

        {/* Right Side: Live Rep Counter & Hold Ring */}
        <div style={{ background: 'rgba(15, 23, 42, 0.7)', borderRadius: 14, padding: 18, border: '1px solid var(--border-glass)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ position: 'relative', width: 140, height: 140, marginBottom: 12 }}>
            <svg viewBox="0 0 140 140" style={{ transform: 'rotate(-90deg)', width: '100%', height: '100%' }}>
              <circle cx="70" cy="70" r="58" fill="transparent" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
              <circle
                cx="70"
                cy="70"
                r="58"
                fill="transparent"
                stroke={isCurrentCompleted ? '#10b981' : '#00f2fe'}
                strokeWidth="10"
                strokeDasharray={2 * Math.PI * 58}
                strokeDashoffset={2 * Math.PI * 58 * (1 - progressPercent / 100)}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 0.3s ease' }}
              />
            </svg>

            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#f8fafc', fontFamily: 'var(--font-heading)', lineHeight: 1 }}>
                {currentReps} <span style={{ fontSize: '1rem', color: 'var(--text-dim)' }}>/ {activeExercise.targetReps}</span>
              </div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>REPETITIONS</div>
            </div>
          </div>

          <div style={{ textAlign: 'center' }}>
            {isActive ? (
              <div style={{ fontSize: '0.82rem', color: '#00f2fe', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                HOLDING FORM: {holdTimer}s / {activeExercise.holdSec}s
              </div>
            ) : isCurrentCompleted ? (
              <div style={{ fontSize: '0.82rem', color: '#10b981', fontWeight: 700 }}>
                ✓ EXERCISE COMPLETE
              </div>
            ) : (
              <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                Press "Start Guided Reps" to begin
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stretch Carousel / Selector */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
        {MICRO_EXERCISES.map((ex, idx) => (
          <div
            key={ex.id}
            onClick={() => {
              handleReset();
              setCurrentExerciseIdx(idx);
            }}
            style={{
              background: currentExerciseIdx === idx ? 'rgba(6, 182, 212, 0.12)' : 'rgba(15, 23, 42, 0.5)',
              border: currentExerciseIdx === idx ? '1px solid #00f2fe' : '1px solid var(--border-glass)',
              borderRadius: 10,
              padding: 12,
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>EXERCISE 0{idx + 1}</span>
              {completedExercises.has(ex.id) && <CheckCircle2 size={12} color="#10b981" />}
            </div>
            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#f8fafc' }}>{ex.title}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 4 }}>
              {ex.targetReps} reps • {ex.holdSec}s hold
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
