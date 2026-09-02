import React, { useState } from 'react';
import { Network, Users, Radio, AlertTriangle, ShieldCheck, Send, Bell, CheckCircle2, Cpu } from 'lucide-react';
import { audioSubsystem } from '../services/audioSubsystem';

const INITIAL_FLEET_NODES = [
  {
    id: 'EDGE-NODE-01',
    name: 'Workstation Alpha (Primary Edge)',
    user: 'Engineer W. (Active)',
    score: 88,
    cva: 52.4,
    status: 'OPTIMAL',
    peripherals: '4 / 5 Active',
    latency: '12ms',
    deskHeight: '74cm',
    location: 'Building A - Dev Hub'
  },
  {
    id: 'EDGE-NODE-02',
    name: 'Biomechanics Ergonomics Lab B',
    user: 'Researcher Dr. Chen',
    score: 95,
    cva: 56.1,
    status: 'OPTIMAL',
    peripherals: '5 / 5 Active',
    latency: '9ms',
    deskHeight: '106cm (Standing)',
    location: 'Building C - BioLab'
  },
  {
    id: 'EDGE-NODE-03',
    name: 'Remote SecOps Station Delta',
    user: 'Analyst Sarah M.',
    score: 58,
    cva: 34.8,
    status: 'FORWARD_HEAD_ALERT',
    peripherals: '2 / 5 Active',
    latency: '24ms',
    deskHeight: '72cm',
    location: 'Remote VPN Node #8'
  },
  {
    id: 'EDGE-NODE-04',
    name: 'Executive Suite Desk 04',
    user: 'Director James V.',
    score: 91,
    cva: 53.0,
    status: 'OPTIMAL',
    peripherals: '3 / 5 Active',
    latency: '15ms',
    deskHeight: '76cm',
    location: 'Executive Floor'
  }
];

export default function FleetSurveillanceGrid() {
  const [nodes, setNodes] = useState(INITIAL_FLEET_NODES);
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [lastBroadcast, setLastBroadcast] = useState(null);

  const avgFleetScore = Math.round(nodes.reduce((a, b) => a + b.score, 0) / nodes.length);
  const activeAlertsCount = nodes.filter(n => n.score < 70).length;

  const handleBroadcast = (e) => {
    e.preventDefault();
    if (!broadcastMessage.trim()) return;

    audioSubsystem.playTone('PING_ALERT');
    audioSubsystem.speakCue(`Fleet Alert: ${broadcastMessage}`);
    setLastBroadcast({
      text: broadcastMessage,
      time: new Date().toLocaleTimeString(),
      target: 'All 4 Workstations'
    });
    setBroadcastMessage('');
  };

  const handleTriggerNodeHaptic = (nodeId) => {
    audioSubsystem.playTone('CHORD_WARNING');
    alert(`Sensory Haptic Correction Pulse dispatched to ${nodeId}`);
  };

  return (
    <div className="glass-panel" style={{ padding: 22 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Network size={18} color="#00f2fe" />
            Feature 7: Multi-Worker Edge Mesh & Fleet Surveillance Hub
          </h3>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginTop: 2 }}>
            Enterprise workplace ergonomic telemetry aggregation and OSHA/ISO 9241-5 compliance
          </p>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <span className="cyber-badge badge-cyan">
            <Radio size={12} /> 4 NODES ONLINE
          </span>
          <span className={`cyber-badge ${activeAlertsCount === 0 ? 'badge-optimal' : 'badge-danger'}`}>
            {activeAlertsCount} ACTIVE FLEET ALERTS
          </span>
        </div>
      </div>

      {/* Fleet Overview Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 20 }}>
        <div style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid var(--border-glass)', borderRadius: 10, padding: 14 }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>FLEET POSTURE HEALTH INDEX</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#00f2fe', fontFamily: 'var(--font-heading)', marginTop: 4 }}>
            {avgFleetScore} <span style={{ fontSize: '0.9rem', color: 'var(--text-dim)' }}>/ 100</span>
          </div>
          <div style={{ fontSize: '0.68rem', color: '#10b981' }}>+4.2% from yesterday</div>
        </div>

        <div style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid var(--border-glass)', borderRadius: 10, padding: 14 }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>OSHA / ISO 9241 COMPLIANCE</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#10b981', fontFamily: 'var(--font-heading)', marginTop: 4 }}>
            96.4%
          </div>
          <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Workplace Ergonomics Standard</div>
        </div>

        <div style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid var(--border-glass)', borderRadius: 10, padding: 14 }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>MESH SYNC LATENCY</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#f8fafc', fontFamily: 'var(--font-heading)', marginTop: 4 }}>
            15 ms
          </div>
          <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Peer-to-peer WebRTC edge link</div>
        </div>
      </div>

      {/* Fleet Workstations Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 14, marginBottom: 20 }}>
        {nodes.map((node) => {
          const isAlert = node.score < 70;
          return (
            <div
              key={node.id}
              style={{
                background: 'rgba(12, 18, 34, 0.7)',
                border: isAlert ? '1px solid #ff3366' : '1px solid var(--border-glass)',
                boxShadow: isAlert ? '0 0 16px rgba(255, 51, 102, 0.25)' : 'none',
                borderRadius: 12,
                padding: 16
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f8fafc' }}>{node.name}</div>
                  <div style={{ fontSize: '0.72rem', color: '#00f2fe', fontFamily: 'var(--font-mono)' }}>{node.id} • {node.user}</div>
                </div>
                <span className={`cyber-badge ${isAlert ? 'badge-danger' : 'badge-optimal'}`} style={{ fontSize: '0.68rem' }}>
                  {node.status}
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, margin: '10px 0', fontSize: '0.75rem' }}>
                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '6px 8px', borderRadius: 6 }}>
                  <span style={{ color: 'var(--text-dim)' }}>SCORE:</span> <strong style={{ color: isAlert ? '#ff3366' : '#10b981', fontFamily: 'var(--font-mono)' }}>{node.score}/100</strong>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '6px 8px', borderRadius: 6 }}>
                  <span style={{ color: 'var(--text-dim)' }}>CVA:</span> <strong style={{ color: '#f8fafc', fontFamily: 'var(--font-mono)' }}>{node.cva}°</strong>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '6px 8px', borderRadius: 6 }}>
                  <span style={{ color: 'var(--text-dim)' }}>HARDWARE:</span> <span style={{ color: 'var(--text-muted)' }}>{node.peripherals}</span>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '6px 8px', borderRadius: 6 }}>
                  <span style={{ color: 'var(--text-dim)' }}>DESK:</span> <span style={{ color: 'var(--text-muted)' }}>{node.deskHeight}</span>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>{node.location}</span>
                <button
                  className="cyber-btn cyber-btn-secondary"
                  onClick={() => handleTriggerNodeHaptic(node.id)}
                  style={{ padding: '4px 10px', fontSize: '0.72rem' }}
                >
                  <Send size={11} /> Ping Haptic
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Enterprise Broadcast Dispatcher */}
      <div style={{ background: 'rgba(15, 23, 42, 0.7)', borderRadius: 12, padding: 16, border: '1px solid var(--border-glass)' }}>
        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#f8fafc', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
          <Bell size={14} color="#00f2fe" /> FLEET POSTURE BROADCAST DISPATCHER:
        </div>

        <form onSubmit={handleBroadcast} style={{ display: 'flex', gap: 10 }}>
          <input
            type="text"
            placeholder="Type corporate wellness alert or micro-break instruction..."
            value={broadcastMessage}
            onChange={(e) => setBroadcastMessage(e.target.value)}
            style={{
              flex: 1,
              background: 'rgba(4, 6, 12, 0.8)',
              border: '1px solid var(--border-glass)',
              borderRadius: 8,
              padding: '8px 14px',
              color: '#fff',
              fontSize: '0.82rem',
              outline: 'none'
            }}
          />
          <button type="submit" className="cyber-btn cyber-btn-primary" style={{ padding: '8px 16px' }}>
            <Send size={14} /> Broadcast to Fleet
          </button>
        </form>

        {lastBroadcast && (
          <div style={{ marginTop: 10, fontSize: '0.74rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: 6 }}>
            <CheckCircle2 size={12} /> Broadcast sent at {lastBroadcast.time}: "{lastBroadcast.text}" → {lastBroadcast.target}
          </div>
        )}
      </div>
    </div>
  );
}
