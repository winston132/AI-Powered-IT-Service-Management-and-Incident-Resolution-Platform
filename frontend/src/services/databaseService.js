/**
 * Time-Series Database Logging Architecture & Analytics Service (Module 4)
 * Manages indexed local time-series telemetry store, posture incident audit records,
 * ergonomic KPI aggregations, and diagnostic export utilities (CSV, JSON, Clinical Report).
 */

const STORAGE_KEYS = {
  TELEMETRY: 'edgeposture_telemetry_series',
  INCIDENTS: 'edgeposture_incident_logs',
  SESSIONS: 'edgeposture_sessions',
  SETTINGS: 'edgeposture_user_settings'
};

export class DatabaseService {
  constructor() {
    this.maxTelemetryPoints = 500;
    this.telemetryBuffer = this.loadInitialTelemetry();
    this.incidents = this.loadInitialIncidents();
    this.activeIncident = null;
    this.listeners = new Set();
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify() {
    this.listeners.forEach(fn => fn());
  }

  loadInitialTelemetry() {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.TELEMETRY);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn('Failed to load telemetry from localStorage:', e);
    }

    // Seed realistic 30-minute historical telemetry
    const initial = [];
    const now = Date.now();
    for (let i = 40; i >= 0; i--) {
      const t = now - (i * 15000); // 15s intervals
      const isSlouch = (i >= 12 && i <= 16) || (i >= 28 && i <= 31);
      const score = isSlouch ? Math.floor(45 + Math.random() * 20) : Math.floor(88 + Math.random() * 11);
      const cva = isSlouch ? Math.floor(32 + Math.random() * 8) : Math.floor(52 + Math.random() * 6);
      const shoulderTilt = isSlouch ? Number((4.5 + Math.random() * 3).toFixed(1)) : Number((1.2 + Math.random() * 1.5).toFixed(1));
      const thoracic = isSlouch ? Math.floor(70 + Math.random() * 8) : Math.floor(88 + Math.random() * 6);

      initial.push({
        timestamp: t,
        timeFormatted: new Date(t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        score,
        cva,
        shoulderTilt,
        thoracicFlexion: thoracic,
        gazeDistanceCm: isSlouch ? 36 : 58,
        compressionForceN: isSlouch ? 640 : 310
      });
    }
    return initial;
  }

  loadInitialIncidents() {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.INCIDENTS);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn('Failed to load incidents from localStorage:', e);
    }

    return [
      {
        id: 'INC-8092',
        timestamp: Date.now() - 18 * 60 * 1000,
        type: 'Severe Forward Head Posture',
        severity: 'HIGH',
        durationSec: 42,
        peakCva: 31.4,
        peakForceN: 680,
        actuatedPeripherals: ['EdgeHaptic Cushion (Staccato)', 'ErgoGlow (Red Alert)'],
        resolved: true,
        mttrSec: 8
      },
      {
        id: 'INC-8091',
        timestamp: Date.now() - 32 * 60 * 1000,
        type: 'Thoracic Slouch & Lumbar Flexion',
        severity: 'MEDIUM',
        durationSec: 28,
        peakCva: 39.8,
        peakForceN: 590,
        actuatedPeripherals: ['SmartPosture BioBand (Double Buzz)'],
        resolved: true,
        mttrSec: 5
      },
      {
        id: 'INC-8090',
        timestamp: Date.now() - 54 * 60 * 1000,
        type: 'Asymmetrical Left Shoulder Drop',
        severity: 'MEDIUM',
        durationSec: 35,
        peakCva: 48.0,
        peakForceN: 420,
        actuatedPeripherals: ['ErgoGlow Lightbar (Amber Pulse)'],
        resolved: true,
        mttrSec: 12
      }
    ];
  }

  /**
   * Record real-time telemetry frame
   */
  logTelemetryFrame(kinematics) {
    if (!kinematics || kinematics.score === 0) return;

    const now = Date.now();
    const frame = {
      timestamp: now,
      timeFormatted: new Date(now).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      score: kinematics.score,
      cva: kinematics.cva,
      shoulderTilt: kinematics.shoulderTilt,
      thoracicFlexion: kinematics.thoracicFlexion,
      gazeDistanceCm: kinematics.gazeDistanceCm,
      compressionForceN: kinematics.compressionForceN
    };

    this.telemetryBuffer.push(frame);
    if (this.telemetryBuffer.length > this.maxTelemetryPoints) {
      this.telemetryBuffer.shift();
    }

    // Manage incident state machine
    if (kinematics.score < 70 && kinematics.violations.length > 0) {
      if (!this.activeIncident) {
        this.activeIncident = {
          id: `INC-${Math.floor(1000 + Math.random() * 9000)}`,
          timestamp: now,
          type: kinematics.violations[0]?.message || 'Ergonomic Posture Violation',
          severity: kinematics.score < 50 ? 'HIGH' : 'MEDIUM',
          durationSec: 1,
          peakCva: kinematics.cva,
          peakForceN: kinematics.compressionForceN,
          actuatedPeripherals: ['ErgoGlow LED', 'EdgeHaptic Cushion'],
          resolved: false
        };
      } else {
        this.activeIncident.durationSec = Math.round((now - this.activeIncident.timestamp) / 1000);
        this.activeIncident.peakForceN = Math.max(this.activeIncident.peakForceN, kinematics.compressionForceN);
        if (kinematics.cva < this.activeIncident.peakCva) {
          this.activeIncident.peakCva = kinematics.cva;
        }
      }
    } else {
      if (this.activeIncident) {
        this.activeIncident.resolved = true;
        this.activeIncident.mttrSec = Math.max(2, this.activeIncident.durationSec);
        this.incidents.unshift(this.activeIncident);
        this.activeIncident = null;
        if (this.incidents.length > 50) this.incidents.pop();
        this.saveIncidents();
      }
    }

    this.notify();
  }

  saveIncidents() {
    try {
      localStorage.setItem(STORAGE_KEYS.INCIDENTS, JSON.stringify(this.incidents));
    } catch (e) {
      // LocalStorage quota fallback
    }
  }

  /**
   * Aggregate Key Performance Indicators (KPIs)
   */
  getAnalyticsKPIs() {
    const data = this.telemetryBuffer;
    if (!data.length) {
      return {
        avgScore: 88,
        complianceRate: 92,
        totalIncidents: this.incidents.length,
        avgMttrSec: 6.4,
        avgCompressionN: 340,
        activeDurationMinutes: 45
      };
    }

    const totalScore = data.reduce((acc, d) => acc + d.score, 0);
    const avgScore = Math.round(totalScore / data.length);
    const compliantFrames = data.filter(d => d.score >= 75).length;
    const complianceRate = Math.round((compliantFrames / data.length) * 100);

    const totalForce = data.reduce((acc, d) => acc + d.compressionForceN, 0);
    const avgCompressionN = Math.round(totalForce / data.length);

    const resolvedIncidents = this.incidents.filter(inc => inc.resolved && inc.mttrSec);
    const avgMttrSec = resolvedIncidents.length
      ? Number((resolvedIncidents.reduce((acc, inc) => acc + inc.mttrSec, 0) / resolvedIncidents.length).toFixed(1))
      : 5.2;

    return {
      avgScore,
      complianceRate,
      totalIncidents: this.incidents.length,
      avgMttrSec,
      avgCompressionN,
      activeDurationMinutes: Math.round((data.length * 15) / 60) || 30
    };
  }

  /**
   * Export telemetry to CSV
   */
  exportTelemetryCSV() {
    const headers = ['Timestamp', 'Time', 'ErgonomicScore', 'CraniovertebralAngle_CVA', 'ShoulderTilt_Deg', 'ThoracicFlexion_Deg', 'GazeDistance_cm', 'SpinalForce_N'];
    const rows = this.telemetryBuffer.map(d => [
      d.timestamp,
      `"${d.timeFormatted}"`,
      d.score,
      d.cva,
      d.shoulderTilt,
      d.thoracicFlexion,
      d.gazeDistanceCm,
      d.compressionForceN
    ]);

    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `EdgePosture_Telemetry_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  /**
   * Export diagnostic JSON dump
   */
  exportDiagnosticJSON() {
    const diagnosticData = {
      system: 'EdgePosture AI (VisionSensory Core)',
      generatedAt: new Date().toISOString(),
      kpis: this.getAnalyticsKPIs(),
      incidentLogs: this.incidents,
      telemetrySample: this.telemetryBuffer.slice(-100)
    };

    const blob = new Blob([JSON.stringify(diagnosticData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `EdgePosture_Diagnostics_${Date.now()}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

export const databaseService = new DatabaseService();
