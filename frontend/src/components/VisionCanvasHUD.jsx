import React, { useRef, useEffect, useState } from 'react';
import { Camera, Video, Play, Pause, Eye, EyeOff, ShieldCheck, Zap, AlertTriangle, RefreshCw } from 'lucide-react';
import { PRESET_BIOMECHANICAL_CLIPS } from '../services/poseEstimationService';

export default function VisionCanvasHUD({
  poseService,
  kinematics,
  onAnomalyInject,
  activeAnomaly
}) {
  const canvasRef = useRef(null);
  const videoRef = useRef(null);
  const [streamMode, setStreamMode] = useState('synthetic'); // 'webcam' | 'preset' | 'synthetic'
  const [privacyMode, setPrivacyMode] = useState('normal'); // 'normal' | 'blur' | 'skeleton_only'
  const [activePreset, setActivePreset] = useState('normal');
  const [isMirror, setIsMirror] = useState(true);

  // Initialize canvas rendering loop
  useEffect(() => {
    let animationFrameId;

    const render = (time) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      const width = canvas.width;
      const height = canvas.height;

      // 1. Draw Background / Video Feed
      ctx.clearRect(0, 0, width, height);

      if (privacyMode === 'skeleton_only') {
        // High-tech deep grid background
        ctx.fillStyle = '#040714';
        ctx.fillRect(0, 0, width, height);

        // Cyber grid
        ctx.strokeStyle = 'rgba(6, 182, 212, 0.08)';
        ctx.lineWidth = 1;
        const gridSize = 40;
        for (let x = 0; x < width; x += gridSize) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, height);
          ctx.stroke();
        }
        for (let y = 0; y < height; y += gridSize) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(width, y);
          ctx.stroke();
        }
      } else if (streamMode === 'webcam' && videoRef.current && videoRef.current.readyState >= 2) {
        ctx.save();
        if (isMirror) {
          ctx.translate(width, 0);
          ctx.scale(-1, 1);
        }
        if (privacyMode === 'blur') {
          ctx.filter = 'blur(12px)';
        }
        ctx.drawImage(videoRef.current, 0, 0, width, height);
        ctx.restore();
      } else {
        // Stylized synthetic edge simulation background
        const grad = ctx.createLinearGradient(0, 0, 0, height);
        grad.addColorStop(0, '#0a1024');
        grad.addColorStop(1, '#050813');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);

        // Ergonomic desk worker silhouette outline
        ctx.fillStyle = 'rgba(255, 255, 255, 0.02)';
        ctx.beginPath();
        ctx.ellipse(width * 0.5, height * 0.85, width * 0.35, height * 0.3, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      // 2. Draw 17-Point Skeletal Keypoints & Anatomical Vectors
      if (kinematics && kinematics.rawKeypoints) {
        const kp = kinematics.rawKeypoints;
        const colorByState = kinematics.postureState?.color || '#00f2fe';

        const toScreen = (pt) => {
          if (!pt) return { x: 0, y: 0 };
          const px = isMirror ? (1 - pt.x) * width : pt.x * width;
          const py = pt.y * height;
          return { x: px, y: py };
        };

        // Bone connection pairs
        const bones = [
          // Torso
          ['left_shoulder', 'right_shoulder'],
          ['left_shoulder', 'left_hip'],
          ['right_shoulder', 'right_hip'],
          ['left_hip', 'right_hip'],
          // Arms
          ['left_shoulder', 'left_elbow'],
          ['left_elbow', 'left_wrist'],
          ['right_shoulder', 'right_elbow'],
          ['right_elbow', 'right_wrist'],
          // Head
          ['nose', 'left_eye'],
          ['nose', 'right_eye'],
          ['left_eye', 'left_ear'],
          ['right_eye', 'right_ear']
        ];

        // Draw bone glow and lines
        ctx.save();
        ctx.shadowColor = colorByState;
        ctx.shadowBlur = 10;
        ctx.strokeStyle = colorByState;
        ctx.lineWidth = 3.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        bones.forEach(([k1, k2]) => {
          if (kp[k1] && kp[k2] && kp[k1].score > 0.5 && kp[k2].score > 0.5) {
            const p1 = toScreen(kp[k1]);
            const p2 = toScreen(kp[k2]);
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        });

        // Draw Spinal Centerline Spline (C7 -> Mid-Shoulder -> Mid-Hip)
        if (kinematics.c7Reference && kinematics.midShoulder && kinematics.midHip) {
          const c7 = toScreen(kinematics.c7Reference);
          const ms = toScreen(kinematics.midShoulder);
          const mh = toScreen(kinematics.midHip);

          ctx.strokeStyle = '#00f2fe';
          ctx.setLineDash([4, 4]);
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.moveTo(c7.x, c7.y);
          ctx.quadraticCurveTo(ms.x, ms.y, mh.x, mh.y);
          ctx.stroke();
          ctx.setLineDash([]);
        }

        // Draw Craniovertebral Angle (CVA) Visual Arc
        const ear = kp.left_ear || kp.right_ear;
        if (ear && kinematics.c7Reference) {
          const earPt = toScreen(ear);
          const c7Pt = toScreen(kinematics.c7Reference);

          // Horizontal baseline from C7
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(c7Pt.x - 60, c7Pt.y);
          ctx.lineTo(c7Pt.x + 60, c7Pt.y);
          ctx.stroke();

          // Tragus to C7 vector
          ctx.strokeStyle = kinematics.cva < 42 ? '#ff3366' : '#10b981';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.moveTo(c7Pt.x, c7Pt.y);
          ctx.lineTo(earPt.x, earPt.y);
          ctx.stroke();

          // CVA text badge on canvas
          ctx.fillStyle = kinematics.cva < 42 ? '#ff3366' : '#10b981';
          ctx.font = 'bold 12px "JetBrains Mono"';
          ctx.fillText(`CVA: ${kinematics.cva}°`, earPt.x + 12, earPt.y - 8);
        }

        // Draw Shoulder Alignment Horizontal Line
        if (kp.left_shoulder && kp.right_shoulder) {
          const ls = toScreen(kp.left_shoulder);
          const rs = toScreen(kp.right_shoulder);

          ctx.strokeStyle = kinematics.shoulderTilt > 4 ? '#f59e0b' : 'rgba(0, 242, 254, 0.6)';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(ls.x, ls.y);
          ctx.lineTo(rs.x, rs.y);
          ctx.stroke();

          if (kinematics.shoulderTilt > 2.5) {
            ctx.fillStyle = '#f59e0b';
            ctx.font = 'bold 11px "JetBrains Mono"';
            ctx.fillText(`Δ ${kinematics.shoulderTilt}°`, (ls.x + rs.x) / 2, Math.min(ls.y, rs.y) - 10);
          }
        }

        // Draw Keypoint Nodes
        Object.keys(kp).forEach((key) => {
          const pt = kp[key];
          if (pt && pt.score > 0.5) {
            const screenPt = toScreen(pt);
            ctx.shadowBlur = 12;
            ctx.shadowColor = colorByState;

            // Outer ring
            ctx.beginPath();
            ctx.arc(screenPt.x, screenPt.y, 6.5, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
            ctx.fill();
            ctx.lineWidth = 2;
            ctx.strokeStyle = colorByState;
            ctx.stroke();

            // Core center
            ctx.beginPath();
            ctx.arc(screenPt.x, screenPt.y, 3, 0, Math.PI * 2);
            ctx.fillStyle = '#ffffff';
            ctx.fill();
          }
        });

        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animationFrameId);
  }, [kinematics, streamMode, privacyMode, isMirror]);

  const handleToggleWebcam = async () => {
    if (streamMode === 'webcam') {
      poseService.setMode('synthetic');
      setStreamMode('synthetic');
    } else {
      const res = await poseService.startWebcam(videoRef.current);
      if (res.success) {
        setStreamMode('webcam');
      } else {
        alert(`Webcam error: ${res.error}. Defaulting to Synthetic Edge Stream.`);
      }
    }
  };

  const handlePresetSelect = (presetId) => {
    setActivePreset(presetId);
    setStreamMode('preset');
    poseService.setMode('preset', presetId);
  };

  return (
    <div className="glass-panel vision-hud-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <div>
          <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Camera size={18} color="#00f2fe" />
            Module 1: Real-Time Edge Vision & 17-Point Kinematic HUD
          </h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: 2 }}>
            Low-latency on-device skeletal inference with biomechanical vector overlays
          </p>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button
            className={`cyber-btn ${streamMode === 'webcam' ? 'cyber-btn-emerald' : 'cyber-btn-secondary'}`}
            onClick={handleToggleWebcam}
            style={{ padding: '6px 12px', fontSize: '0.8rem' }}
          >
            <Camera size={14} />
            {streamMode === 'webcam' ? 'Webcam Active' : 'Start Webcam'}
          </button>

          <button
            className="cyber-btn cyber-btn-secondary"
            onClick={() => setIsMirror(!isMirror)}
            style={{ padding: '6px 12px', fontSize: '0.8rem' }}
          >
            <RefreshCw size={14} />
            {isMirror ? 'Mirrored' : 'Normal'}
          </button>
        </div>
      </div>

      {/* Hidden Video for Webcam capture */}
      <video
        ref={videoRef}
        playsInline
        muted
        style={{ display: 'none' }}
      />

      {/* Viewport View */}
      <div className="viewport-container">
        <canvas
          ref={canvasRef}
          width={800}
          height={500}
          className="viewport-canvas"
        />

        <div className="hud-corner-bracket corner-tl" />
        <div className="hud-corner-bracket corner-tr" />
        <div className="hud-corner-bracket corner-bl" />
        <div className="hud-corner-bracket corner-br" />
        <div className="scanline-effect" />

        {/* HUD In-Canvas Overlay Badges */}
        <div className="hud-overlay">
          <div className="hud-top-bar">
            <span className="cyber-badge badge-cyan">
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#00f2fe', animation: 'pulse 1.2s infinite' }} />
              STREAM: {streamMode.toUpperCase()}
            </span>

            <span className={`cyber-badge ${kinematics?.postureState?.badgeClass || 'badge-optimal'}`}>
              {kinematics?.postureState?.label || 'Tracking Active'}
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div style={{ background: 'rgba(3, 7, 18, 0.75)', padding: '6px 12px', borderRadius: 8, backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>INFERENCE CONFIDENCE</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#00f2fe', fontFamily: 'var(--font-mono)' }}>
                {Math.round((kinematics?.rawKeypoints?.nose?.score || 0.95) * 100)}%
              </div>
            </div>

            <div style={{ display: 'flex', gap: 6 }}>
              <button
                className={`cyber-btn ${privacyMode === 'normal' ? 'cyber-btn-primary' : 'cyber-btn-secondary'}`}
                onClick={() => setPrivacyMode('normal')}
                style={{ padding: '4px 10px', fontSize: '0.75rem' }}
              >
                <Eye size={12} /> RGB
              </button>
              <button
                className={`cyber-btn ${privacyMode === 'blur' ? 'cyber-btn-primary' : 'cyber-btn-secondary'}`}
                onClick={() => setPrivacyMode('blur')}
                style={{ padding: '4px 10px', fontSize: '0.75rem' }}
              >
                <EyeOff size={12} /> Blur
              </button>
              <button
                className={`cyber-btn ${privacyMode === 'skeleton_only' ? 'cyber-btn-primary' : 'cyber-btn-secondary'}`}
                onClick={() => setPrivacyMode('skeleton_only')}
                style={{ padding: '4px 10px', fontSize: '0.75rem' }}
              >
                <ShieldCheck size={12} /> Wireframe Only
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Preset Clips & Live Anomaly Injection Controls */}
      <div style={{ marginTop: 16 }}>
        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          ⚡ Edge Biomechanical Test Streams & Anomaly Injection Sandbox:
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 8 }}>
          {PRESET_BIOMECHANICAL_CLIPS.map(clip => (
            <button
              key={clip.id}
              className={`cyber-btn ${activePreset === clip.id && streamMode === 'preset' ? 'cyber-btn-primary' : 'cyber-btn-secondary'}`}
              onClick={() => handlePresetSelect(clip.id)}
              style={{ fontSize: '0.76rem', padding: '6px 10px', justifyContent: 'flex-start' }}
              title={clip.description}
            >
              <Play size={12} />
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{clip.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
