import React, { useState, useEffect, useRef } from 'react';
import Navbar from './components/Navbar';
import VisionCanvasHUD from './components/VisionCanvasHUD';
import KinematicMetricsPanel from './components/KinematicMetricsPanel';
import PeripheralControlCard from './components/PeripheralControlCard';
import AudioSynthesizerVisualizer from './components/AudioSynthesizerVisualizer';
import TelemetryDatabaseView from './components/TelemetryDatabaseView';
import MicroBreakCoach from './components/MicroBreakCoach';
import SpineDigitalTwin from './components/SpineDigitalTwin';
import FleetSurveillanceGrid from './components/FleetSurveillanceGrid';
import SystemCalibrationModal from './components/SystemCalibrationModal';

import { poseService } from './services/poseEstimationService';
import { evaluateKinematics, POSTURE_STATES } from './services/kinematicEngine';
import { peripheralOrchestrator } from './services/peripheralOrchestrator';
import { audioSubsystem } from './services/audioSubsystem';
import { databaseService } from './services/databaseService';

import { Camera, Radio, Volume2, Database, Sparkles, Rotate3d, Network, Activity } from 'lucide-react';
import './App.css';

export default function App() {
  const [activeTab, setActiveTab] = useState('studio'); // 'studio' | 'peripherals' | 'audio' | 'database' | 'coach' | 'spine' | 'fleet'
  const [kinematics, setKinematics] = useState(null);
  const [fps, setFps] = useState(30);
  const [latencyMs, setLatencyMs] = useState(12);
  const [isMuted, setIsMuted] = useState(false);
  const [calibrationModalOpen, setCalibrationModalOpen] = useState(false);
  const [userCalibration, setUserCalibration] = useState(null);
  const [activeAnomaly, setActiveAnomaly] = useState(null);

  const prevPostureStateRef = useRef(null);

  // Real-Time Pose Inference & Kinematic Evaluation Loop
  useEffect(() => {
    let animId;
    let lastLoggedTime = 0;

    const processFrame = (timestamp) => {
      const poseData = poseService.getPoseFrame(timestamp);

      if (poseData && poseData.keypoints) {
        const evalResults = evaluateKinematics(poseData.keypoints, userCalibration);
        setKinematics(evalResults);
        setFps(poseData.telemetry.fps);
        setLatencyMs(poseData.telemetry.latencyMs);

        // Sensory notification processing
        peripheralOrchestrator.processPostureTelemetry(evalResults, (audioEvent) => {
          audioSubsystem.handlePostureAudioEvent(audioEvent, evalResults);
        });

        // Detect posture transitions (e.g. from poor back to optimal)
        if (prevPostureStateRef.current && prevPostureStateRef.current.id !== evalResults.postureState.id) {
          if (evalResults.postureState.id === POSTURE_STATES.OPTIMAL.id && prevPostureStateRef.current.severity === 'high') {
            audioSubsystem.handlePostureAudioEvent('RECOVERY_OPTIMAL');
          }
        }
        prevPostureStateRef.current = evalResults.postureState;

        // Log telemetry frame every 1000ms
        if (timestamp - lastLoggedTime > 1000) {
          databaseService.logTelemetryFrame(evalResults);
          lastLoggedTime = timestamp;
        }
      }

      animId = requestAnimationFrame(processFrame);
    };

    animId = requestAnimationFrame(processFrame);
    return () => cancelAnimationFrame(animId);
  }, [userCalibration]);

  const handleToggleMute = () => {
    const nextMuted = audioSubsystem.toggleMute();
    setIsMuted(nextMuted);
  };

  const handleSaveCalibration = (calib) => {
    setUserCalibration(calib);
  };

  const handleAnomalyInject = (anomalyType) => {
    if (activeAnomaly === anomalyType) {
      poseService.clearAnomaly();
      setActiveAnomaly(null);
    } else {
      poseService.injectAnomaly(anomalyType);
      setActiveAnomaly(anomalyType);
    }
  };

  return (
    <div className="app-container">
      {/* Top Telemetry Header */}
      <Navbar
        fps={fps}
        latencyMs={latencyMs}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        onOpenCalibration={() => setCalibrationModalOpen(true)}
        connectedPeripheralCount={4}
        postureState={kinematics?.postureState}
      />

      {/* Tab Navigation Strip */}
      <nav className="tab-navigation">
        <button
          className={`tab-btn ${activeTab === 'studio' ? 'active' : ''}`}
          onClick={() => setActiveTab('studio')}
        >
          <Camera size={16} /> Edge Vision Studio (Mod 1 & 2)
        </button>

        <button
          className={`tab-btn ${activeTab === 'peripherals' ? 'active' : ''}`}
          onClick={() => setActiveTab('peripherals')}
        >
          <Radio size={16} /> Peripheral Orchestrator (Mod 3)
        </button>

        <button
          className={`tab-btn ${activeTab === 'audio' ? 'active' : ''}`}
          onClick={() => setActiveTab('audio')}
        >
          <Volume2 size={16} /> Procedural Audio Lab (Mod 4)
        </button>

        <button
          className={`tab-btn ${activeTab === 'database' ? 'active' : ''}`}
          onClick={() => setActiveTab('database')}
        >
          <Database size={16} /> Telemetry & Incidents (Mod 4)
        </button>

        <button
          className={`tab-btn ${activeTab === 'coach' ? 'active' : ''}`}
          onClick={() => setActiveTab('coach')}
        >
          <Sparkles size={16} /> AI Ergonomic Coach (Feature 5)
        </button>

        <button
          className={`tab-btn ${activeTab === 'spine' ? 'active' : ''}`}
          onClick={() => setActiveTab('spine')}
        >
          <Rotate3d size={16} /> 3D Spine Digital Twin (Feature 6)
        </button>

        <button
          className={`tab-btn ${activeTab === 'fleet' ? 'active' : ''}`}
          onClick={() => setActiveTab('fleet')}
        >
          <Network size={16} /> Fleet Mesh Grid (Feature 7)
        </button>
      </nav>

      {/* Main Tabbed Viewport */}
      <main className="main-content">
        {activeTab === 'studio' && (
          <div className="studio-grid">
            <VisionCanvasHUD
              poseService={poseService}
              kinematics={kinematics}
              onAnomalyInject={handleAnomalyInject}
              activeAnomaly={activeAnomaly}
            />
            <KinematicMetricsPanel kinematics={kinematics} />
          </div>
        )}

        {activeTab === 'peripherals' && (
          <PeripheralControlCard />
        )}

        {activeTab === 'audio' && (
          <AudioSynthesizerVisualizer
            isMuted={isMuted}
            onToggleMute={handleToggleMute}
          />
        )}

        {activeTab === 'database' && (
          <TelemetryDatabaseView />
        )}

        {activeTab === 'coach' && (
          <MicroBreakCoach kinematics={kinematics} />
        )}

        {activeTab === 'spine' && (
          <SpineDigitalTwin kinematics={kinematics} />
        )}

        {activeTab === 'fleet' && (
          <FleetSurveillanceGrid />
        )}
      </main>

      {/* Baseline Calibration Wizard Modal */}
      <SystemCalibrationModal
        isOpen={calibrationModalOpen}
        onClose={() => setCalibrationModalOpen(false)}
        kinematics={kinematics}
        onSaveCalibration={handleSaveCalibration}
      />
    </div>
  );
}
