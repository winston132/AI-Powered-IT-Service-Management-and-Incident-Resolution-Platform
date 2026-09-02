import React, { useRef, useEffect, useState } from 'react';
import { Activity, Rotate3d, ZoomIn, ZoomOut, AlertTriangle, ShieldCheck, Info } from 'lucide-react';

export default function SpineDigitalTwin({ kinematics }) {
  const canvasRef = useRef(null);
  const [viewAngle, setViewAngle] = useState('lateral'); // 'lateral' | 'anterior' | 'oblique'
  const [rotation, setRotation] = useState(0);
  const [zoom, setZoom] = useState(1.0);

  const cva = kinematics?.cva || 52;
  const thoracic = kinematics?.thoracicFlexion || 90;
  const lateral = kinematics?.lateralDeviation || 0;
  const compressionForce = kinematics?.compressionForceN || 320;
  const cervicalStrain = kinematics?.cervicalStrainN || 220;
  const lumbarStrain = kinematics?.lumbarStrainN || 290;

  useEffect(() => {
    let animationFrameId;

    const render = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      // Background grid
      ctx.fillStyle = '#050814';
      ctx.fillRect(0, 0, width, height);

      ctx.strokeStyle = 'rgba(6, 182, 212, 0.05)';
      ctx.lineWidth = 1;
      for (let x = 0; x < width; x += 30) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += 30) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      const centerX = width / 2;
      const topY = 70;
      const bottomY = height - 60;
      const spineLength = bottomY - topY;

      // Kinematic Curvature Offsets
      const forwardHeadRad = ((54 - cva) * Math.PI) / 180;
      const thoracicSlouchOffset = (90 - thoracic) * 1.5;
      const lateralShift = lateral * 3.5;

      // Draw Vertebrae & Discs
      // 7 Cervical, 12 Thoracic, 5 Lumbar = 24 segments
      const totalSegments = 24;
      const segmentHeight = spineLength / totalSegments;

      const vertebrae = [];

      for (let i = 0; i < totalSegments; i++) {
        const progress = i / totalSegments; // 0 (C1) to 1 (L5)
        const y = topY + i * segmentHeight;

        let xOffset = 0;
        let zOffset = 0;
        let section = 'cervical';
        let discStrain = cervicalStrain;

        if (i < 7) {
          // Cervical C1-C7
          section = 'cervical';
          discStrain = cervicalStrain;
          xOffset = Math.sin(forwardHeadRad) * (7 - i) * 6;
        } else if (i < 19) {
          // Thoracic T1-T12
          section = 'thoracic';
          discStrain = Math.round((cervicalStrain + lumbarStrain) / 2);
          const tProg = (i - 7) / 12;
          xOffset = -Math.sin(tProg * Math.PI) * thoracicSlouchOffset * 0.8;
        } else {
          // Lumbar L1-L5
          section = 'lumbar';
          discStrain = lumbarStrain;
          const lProg = (i - 19) / 5;
          xOffset = Math.sin(lProg * Math.PI) * 10;
        }

        // Apply 3D view projection
        let projX = centerX + xOffset;
        if (viewAngle === 'anterior') {
          projX = centerX + lateralShift * (1 - progress);
        } else if (viewAngle === 'oblique') {
          projX = centerX + (xOffset * 0.7) + (lateralShift * 0.5);
        }

        vertebrae.push({ x: projX, y, section, discStrain, idx: i + 1 });
      }

      // Draw Spinal Canal / Cord glow line
      ctx.save();
      ctx.strokeStyle = 'rgba(0, 242, 254, 0.4)';
      ctx.lineWidth = 4 * zoom;
      ctx.beginPath();
      vertebrae.forEach((v, idx) => {
        if (idx === 0) ctx.moveTo(v.x, v.y);
        else ctx.lineTo(v.x, v.y);
      });
      ctx.stroke();
      ctx.restore();

      // Draw Vertebrae Bodies and Intervertebral Discs
      vertebrae.forEach((v) => {
        let discColor = '#10b981';
        if (v.discStrain > 450) discColor = '#ff3366';
        else if (v.discStrain > 320) discColor = '#f59e0b';

        // Vertebral bone
        ctx.fillStyle = '#cbd5e1';
        ctx.shadowColor = 'rgba(0,0,0,0.8)';
        ctx.shadowBlur = 4;
        const vWidth = (v.section === 'cervical' ? 22 : (v.section === 'thoracic' ? 32 : 44)) * zoom;
        const vHeight = (segmentHeight * 0.55) * zoom;
        ctx.fillRect(v.x - vWidth / 2, v.y - vHeight / 2, vWidth, vHeight);

        // Intervertebral Disc with Stress Heatmap
        ctx.fillStyle = discColor;
        ctx.shadowColor = discColor;
        ctx.shadowBlur = v.discStrain > 450 ? 12 : 4;
        const discWidth = (vWidth * 0.85);
        const discHeight = (segmentHeight * 0.35) * zoom;
        ctx.fillRect(v.x - discWidth / 2, v.y + vHeight / 2, discWidth, discHeight);
      });

      // Anatomical Stress Callout Pins
      const c5 = vertebrae[4]; // C5/C6
      const l4 = vertebrae[22]; // L4/L5

      if (c5) {
        ctx.strokeStyle = cva < 42 ? '#ff3366' : '#00f2fe';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(c5.x + 30, c5.y);
        ctx.lineTo(c5.x + 80, c5.y);
        ctx.stroke();

        ctx.fillStyle = cva < 42 ? '#ff3366' : '#f8fafc';
        ctx.font = 'bold 11px "JetBrains Mono"';
        ctx.fillText(`C5/C6 Cervical: ${cervicalStrain}N`, c5.x + 85, c5.y + 4);
      }

      if (l4) {
        ctx.strokeStyle = thoracic < 80 ? '#ff3366' : '#00f2fe';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(l4.x + 35, l4.y);
        ctx.lineTo(l4.x + 80, l4.y);
        ctx.stroke();

        ctx.fillStyle = thoracic < 80 ? '#ff3366' : '#f8fafc';
        ctx.font = 'bold 11px "JetBrains Mono"';
        ctx.fillText(`L4/L5 Lumbar: ${lumbarStrain}N`, l4.x + 85, l4.y + 4);
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animationFrameId);
  }, [cva, thoracic, lateral, compressionForce, cervicalStrain, lumbarStrain, viewAngle, zoom]);

  return (
    <div className="glass-panel" style={{ padding: 22 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Rotate3d size={18} color="#00f2fe" />
            Feature 6: Ergonomic Digital Twin & 3D Biomechanical Spine Simulator
          </h3>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginTop: 2 }}>
            Real-time intradiscal compression pressure heatmap and musculoskeletal stress vectors
          </p>
        </div>

        <div style={{ display: 'flex', gap: 6 }}>
          {['lateral', 'anterior', 'oblique'].map((v) => (
            <button
              key={v}
              className={`cyber-btn ${viewAngle === v ? 'cyber-btn-primary' : 'cyber-btn-secondary'}`}
              onClick={() => setViewAngle(v)}
              style={{ padding: '4px 10px', fontSize: '0.75rem', textTransform: 'capitalize' }}
            >
              {v} View
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 20 }}>
        {/* 3D Canvas Stage */}
        <div style={{ position: 'relative', width: '100%', height: 380, background: '#04060f', borderRadius: 12, overflow: 'hidden', border: '1px solid var(--border-glass)' }}>
          <canvas
            ref={canvasRef}
            width={540}
            height={380}
            style={{ width: '100%', height: '100%', display: 'block' }}
          />

          <div style={{ position: 'absolute', bottom: 12, right: 12, display: 'flex', gap: 6 }}>
            <button className="cyber-btn cyber-btn-secondary" onClick={() => setZoom(z => Math.min(1.4, z + 0.1))} style={{ padding: '4px 8px' }}>
              <ZoomIn size={12} />
            </button>
            <button className="cyber-btn cyber-btn-secondary" onClick={() => setZoom(z => Math.max(0.7, z - 0.1))} style={{ padding: '4px 8px' }}>
              <ZoomOut size={12} />
            </button>
          </div>

          <div style={{ position: 'absolute', top: 12, left: 12, background: 'rgba(3, 7, 18, 0.7)', padding: '6px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>TOTAL INTRADISCAL FORCE</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: compressionForce > 550 ? '#ff3366' : '#00f2fe', fontFamily: 'var(--font-mono)' }}>
              {compressionForce} N
            </div>
          </div>
        </div>

        {/* Anatomical Load Breakdown & Clinical Risk Factors */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ background: 'rgba(12, 18, 34, 0.7)', borderRadius: 10, padding: 14, border: '1px solid var(--border-glass)' }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#f8fafc', marginBottom: 8 }}>
              BIOMECHANICAL SEGMENT STRESS:
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: '0.76rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: 4 }}>
                <span style={{ color: 'var(--text-muted)' }}>C1-C7 Cervical Complex:</span>
                <span style={{ fontWeight: 700, color: cervicalStrain > 320 ? '#ff3366' : '#10b981', fontFamily: 'var(--font-mono)' }}>
                  {cervicalStrain} N ({cva < 42 ? 'HYPERTENSION' : 'NORMAL'})
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: 4 }}>
                <span style={{ color: 'var(--text-muted)' }}>T1-T12 Thoracic Cage:</span>
                <span style={{ fontWeight: 700, color: thoracic < 80 ? '#f59e0b' : '#10b981', fontFamily: 'var(--font-mono)' }}>
                  {Math.round((cervicalStrain + lumbarStrain) / 2)} N ({thoracic < 80 ? 'KYPHOTIC' : 'NEUTRAL'})
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: 4 }}>
                <span style={{ color: 'var(--text-muted)' }}>L1-L5 Lumbar Base:</span>
                <span style={{ fontWeight: 700, color: lumbarStrain > 350 ? '#ff3366' : '#10b981', fontFamily: 'var(--font-mono)' }}>
                  {lumbarStrain} N ({lumbarStrain > 350 ? 'HIGH SHEAR' : 'NOMINAL'})
                </span>
              </div>
            </div>
          </div>

          <div style={{ background: 'rgba(15, 23, 42, 0.6)', borderRadius: 10, padding: 14, border: '1px solid var(--border-glass)', fontSize: '0.75rem', lineHeight: 1.5 }}>
            <div style={{ fontWeight: 700, color: '#00f2fe', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Info size={14} /> CLINICAL DISC MODEL NOTE:
            </div>
            Intradiscal pressure is computed from the moment arm of the cranial mass (5kg) multiplied by gravitational acceleration and forward tilt angle. Every 2.5cm of forward head posture adds approximately 45 Newtons of cervical disc compression.
          </div>
        </div>
      </div>
    </div>
  );
}
