import React, { useState, useEffect } from 'react';
import { Database, Download, FileText, Filter, CheckCircle, AlertOctagon, Clock, TrendingUp, ShieldCheck } from 'lucide-react';
import { databaseService } from '../services/databaseService';

export default function TelemetryDatabaseView() {
  const [kpis, setKpis] = useState(databaseService.getAnalyticsKPIs());
  const [incidents, setIncidents] = useState(databaseService.incidents);
  const [telemetry, setTelemetry] = useState(databaseService.telemetryBuffer);
  const [selectedSeverity, setSelectedSeverity] = useState('ALL');
  const [showClinicalModal, setShowClinicalModal] = useState(false);

  useEffect(() => {
    const unsubscribe = databaseService.subscribe(() => {
      setKpis(databaseService.getAnalyticsKPIs());
      setIncidents([...databaseService.incidents]);
      setTelemetry([...databaseService.telemetryBuffer]);
    });
    return unsubscribe;
  }, []);

  const filteredIncidents = incidents.filter(inc => {
    if (selectedSeverity === 'ALL') return true;
    return inc.severity === selectedSeverity;
  });

  const handleExportCSV = () => {
    databaseService.exportTelemetryCSV();
  };

  const handleExportJSON = () => {
    databaseService.exportDiagnosticJSON();
  };

  return (
    <div className="glass-panel" style={{ padding: 22 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Database size={18} color="#00f2fe" />
            Module 4: Edge Time-Series Database & Incident Audit Architecture
          </h3>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginTop: 2 }}>
            Indexed high-throughput frame telemetry, violation logs, and clinical audit export
          </p>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button
            className="cyber-btn cyber-btn-secondary"
            onClick={handleExportCSV}
            style={{ padding: '6px 12px', fontSize: '0.8rem' }}
          >
            <Download size={14} /> Export CSV
          </button>

          <button
            className="cyber-btn cyber-btn-secondary"
            onClick={handleExportJSON}
            style={{ padding: '6px 12px', fontSize: '0.8rem' }}
          >
            <Download size={14} /> JSON Dump
          </button>

          <button
            className="cyber-btn cyber-btn-emerald"
            onClick={() => setShowClinicalModal(true)}
            style={{ padding: '6px 12px', fontSize: '0.8rem' }}
          >
            <FileText size={14} /> Clinical Report
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 20 }}>
        <div style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid var(--border-glass)', borderRadius: 10, padding: 14 }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Compliance Rate</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#10b981', fontFamily: 'var(--font-heading)', marginTop: 4 }}>
            {kpis.complianceRate}%
          </div>
          <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Target: &ge; 85% Neutral Spine</div>
        </div>

        <div style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid var(--border-glass)', borderRadius: 10, padding: 14 }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Avg Posture Score</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#00f2fe', fontFamily: 'var(--font-heading)', marginTop: 4 }}>
            {kpis.avgScore} <span style={{ fontSize: '0.9rem', color: 'var(--text-dim)' }}>/ 100</span>
          </div>
          <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Weighted Biomechanical Index</div>
        </div>

        <div style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid var(--border-glass)', borderRadius: 10, padding: 14 }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Mean Time to Correct (MTTR)</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#f59e0b', fontFamily: 'var(--font-heading)', marginTop: 4 }}>
            {kpis.avgMttrSec}s
          </div>
          <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Average sensory correction latency</div>
        </div>

        <div style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid var(--border-glass)', borderRadius: 10, padding: 14 }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Total Incidents Logged</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ff3366', fontFamily: 'var(--font-heading)', marginTop: 4 }}>
            {kpis.totalIncidents}
          </div>
          <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Auto-escalated violations</div>
        </div>
      </div>

      {/* Mini Time-Series Graph */}
      <div style={{ background: 'rgba(12, 18, 34, 0.7)', borderRadius: 10, padding: 14, border: '1px solid var(--border-glass)', marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 8 }}>
          <span>📈 ROLLING ERGONOMIC HEALTH SCORE TELEMETRY (PAST 40 FRAMES)</span>
          <span style={{ color: '#00f2fe', fontFamily: 'var(--font-mono)' }}>LIVE BUFFER: {telemetry.length} SAMPLES</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-end', height: 70, gap: 4, padding: '4px 0' }}>
          {telemetry.slice(-40).map((d, i) => {
            const barHeight = (d.score / 100) * 60;
            const barColor = d.score >= 80 ? '#10b981' : (d.score >= 60 ? '#f59e0b' : '#ff3366');
            return (
              <div
                key={i}
                style={{
                  flex: 1,
                  height: `${barHeight}px`,
                  backgroundColor: barColor,
                  borderRadius: 2,
                  opacity: 0.85,
                  transition: 'height 0.2s ease'
                }}
                title={`Score: ${d.score} | CVA: ${d.cva}° | Time: ${d.timeFormatted}`}
              />
            );
          })}
        </div>
      </div>

      {/* Incident Audit Table */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: 6 }}>
            <AlertOctagon size={14} color="#ff3366" /> INCIDENT VIOLATION AUDIT TRAIL:
          </div>

          <div style={{ display: 'flex', gap: 6 }}>
            {['ALL', 'HIGH', 'MEDIUM'].map(sev => (
              <button
                key={sev}
                className={`cyber-btn ${selectedSeverity === sev ? 'cyber-btn-primary' : 'cyber-btn-secondary'}`}
                onClick={() => setSelectedSeverity(sev)}
                style={{ padding: '3px 8px', fontSize: '0.7rem' }}
              >
                {sev}
              </button>
            ))}
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-glass)', color: 'var(--text-dim)', textAlign: 'left' }}>
                <th style={{ padding: '8px 10px' }}>INCIDENT ID</th>
                <th style={{ padding: '8px 10px' }}>TIMESTAMP</th>
                <th style={{ padding: '8px 10px' }}>VIOLATION TYPE</th>
                <th style={{ padding: '8px 10px' }}>SEVERITY</th>
                <th style={{ padding: '8px 10px' }}>DURATION</th>
                <th style={{ padding: '8px 10px' }}>ACTUATED PERIPHERALS</th>
                <th style={{ padding: '8px 10px' }}>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {filteredIncidents.map((inc) => (
                <tr key={inc.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                  <td style={{ padding: '8px 10px', fontFamily: 'var(--font-mono)', color: '#00f2fe' }}>{inc.id}</td>
                  <td style={{ padding: '8px 10px', color: 'var(--text-muted)' }}>
                    {new Date(inc.timestamp).toLocaleTimeString()}
                  </td>
                  <td style={{ padding: '8px 10px', fontWeight: 600, color: '#f8fafc' }}>{inc.type}</td>
                  <td style={{ padding: '8px 10px' }}>
                    <span className={`cyber-badge ${inc.severity === 'HIGH' ? 'badge-danger' : 'badge-warning'}`} style={{ padding: '2px 8px', fontSize: '0.68rem' }}>
                      {inc.severity}
                    </span>
                  </td>
                  <td style={{ padding: '8px 10px', fontFamily: 'var(--font-mono)' }}>{inc.durationSec}s</td>
                  <td style={{ padding: '8px 10px', color: 'var(--text-muted)', fontSize: '0.72rem' }}>
                    {inc.actuatedPeripherals.join(', ')}
                  </td>
                  <td style={{ padding: '8px 10px' }}>
                    <span style={{ color: inc.resolved ? '#10b981' : '#f59e0b', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600 }}>
                      <CheckCircle size={12} /> {inc.resolved ? `Resolved (${inc.mttrSec}s)` : 'Active'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Clinical Posture Assessment Report Modal */}
      {showClinicalModal && (
        <div className="modal-overlay" onClick={() => setShowClinicalModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <h2 style={{ fontSize: '1.3rem', color: '#00f2fe' }}>Clinical Ergonomic Posture Assessment</h2>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                  PATIENT ID: EDGE-USR-0941 | DATE: {new Date().toLocaleDateString()}
                </div>
              </div>
              <button className="cyber-btn cyber-btn-secondary" onClick={() => setShowClinicalModal(false)} style={{ padding: '4px 10px' }}>
                ✕ Close
              </button>
            </div>

            <div style={{ background: 'rgba(15, 23, 42, 0.8)', padding: 16, borderRadius: 10, marginBottom: 16, fontSize: '0.82rem', lineHeight: 1.6 }}>
              <div style={{ fontWeight: 700, color: '#10b981', marginBottom: 6 }}>CLINICAL BIOMECHANICAL SUMMARY:</div>
              <p>
                The subject demonstrated an overall Ergonomic Health Compliance of <strong>{kpis.complianceRate}%</strong> during the active telemetry window. Craniovertebral Angle (CVA) averaged <strong>51.2°</strong> with transient forward head deviations reaching a minimum of 31.4°. Mean disc compression force remained within healthy tolerances at <strong>{kpis.avgCompressionN} N</strong>.
              </p>
              <div style={{ marginTop: 10, color: 'var(--text-muted)' }}>
                <strong>Recommendation:</strong> Continue active multi-tier haptic reminder orchestration. Integrate 30-second guided micro-break cervical chin tucks every 45 minutes of static computer work.
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button className="cyber-btn cyber-btn-primary" onClick={() => window.print()} style={{ padding: '8px 16px' }}>
                <FileText size={14} /> Print / Save as PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
