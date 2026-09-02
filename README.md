# 🦾 EdgePosture AI (VisionSensory™ Core)
### Real-Time Vision-Based Edge Computing System for Posture Analysis & Sensory Notification Orchestration

An enterprise-grade, edge-computing, computer-vision platform for continuous musculoskeletal posture analysis, kinematic geometric evaluation, dynamic hardware peripheral discovery, and multi-tier sensory notification orchestration.

---

## 🌟 Core Architecture & Module Breakdown

### 📹 Module 1: Computer Vision & Real-Time Pose Estimation
- **Multi-Source Edge Ingestion**: Live Webcam, Pre-recorded Biomechanical Reference Clips, Custom Video File Upload, and High-FPS Synthetic Edge Stream.
- **17-Point Skeletal Keypoints**: Real-time landmark tracking for upper and lower kinetic chains (Tragus, C7 Cervical Vertebra, Acromion shoulders, Thoracic/Lumbar spine vectors, Gaze angle).
- **HUD Viewport Overlay**: Glowing neon wireframe overlay with color-coded joint nodes, CVA arcs, shoulder asymmetry indicators, and privacy filters (RGB, Blur, Skeleton Wireframe only).
- **Edge Telemetry**: Real-time FPS, inference latency in milliseconds, WebGL/NPU delegate acceleration mode, and confidence scores.

### 📐 Module 2: Kinematic Geometry & Posture Evaluation Engine
- **Biomechanical Angle Calculations**:
  - **Craniovertebral Angle (CVA)**: Forward Head Posture (FHP) clinical index (Normal: &ge; 50°, Mild Risk: 42°-49°, Severe Risk: < 35°).
  - **Shoulder Symmetrical Tilt**: Left vs. Right acromion elevation delta.
  - **Thoracic Kyphosis Flexion**: Upper trunk angle relative to vertical axis (Neutral: 82°-98°).
  - **Coronal Spinal Deviation**: Lateral spinal imbalance / scoliotic drift.
  - **Screen Gaze Distance**: Real-time focal distance estimation (45 - 75 cm).
- **Intradiscal Spinal Force Engine**: Real-time disc compression force calculation in Newtons (C5/C7 cervical complex & L4/L5 lumbar base).
- **Ergonomic Health Score (EHS)**: 0-100 composite index with instant posture classification.
- **3-Step Anthropometric Baseline Calibration**: User-specific baseline lock wizard.

### 🎮 Module 3: Dynamic Interface Discovery & Peripheral Control Interface
- **Dynamic Hardware Bus Handshake**: Scans and interfaces with smart ergonomic devices:
  1. *EdgeHaptic™ Lumbar Cushion* (BLE GATT dual ERM vibration motors)
  2. *SmartPosture™ BioBand Wearable* (BLE 5.2 vibrotactile feedback)
  3. *ErgoGlow™ RGB Ambient Lightbar* (USB-HID / WebSerial 360° visual alert)
  4. *SmartDesk™ Motor Actuator Bridge* (TCP/REST motorized sit-stand desk controller)
  5. *TactileMat™ Ergonomic Stance Footbed* (I2C force matrix)
- **Sensory Escalation Engine**:
  - **Tier 1**: Ambient LED amber warning
  - **Tier 2**: Targeted haptic vibration pulse (90Hz - 160Hz)
  - **Tier 3**: Dual sensory (Haptic buzz + audible chime warning)
  - **Tier 4**: Auto-desk standing elevation trigger (106 cm)

### 🔊 Module 4: Integrated Audio Subsystem & Database Logging Architecture
- **Web Audio API Procedural Synthesizer**: Zero-asset-latency harmonic sound synthesis (528Hz calming chimes, 440Hz gentle pings, 432Hz binaural beats, and high-priority alarms).
- **Spatial Stereo Audio Panner**: Pans auditory correction cues directly to the offending side (e.g. dropped left shoulder).
- **Web Speech API Voice Coaching**: Natural language verbal cues ("Please align your shoulders", "Forward head posture detected").
- **Time-Series Edge Database**: High-throughput indexed frame telemetry store, incident audit trails with duration & MTTR, CSV / JSON diagnostic export, and Printable Clinical Assessment reports.

---

## 🚀 3 Advanced Features

### 🧘 Feature 5: AI Ergonomic Coach & Automated Micro-Breaks
- Real-time posture recovery coach that triggers guided 30-60 second micro-stretches (Chin Tucks, Scapular Retractions, Thoracic Extensions, Lateral Neck Stretches) with live vision pose tracking and repetition counters.

### 🦴 Feature 6: Ergonomic Digital Twin & 3D Biomechanical Spine Simulator
- Real-time 3D musculoskeletal spinal avatar (Cervical C1-C7, Thoracic T1-T12, Lumbar L1-L5) mirroring the user's posture with dynamic intradiscal compression pressure heatmaps.

### 🌐 Feature 7: Multi-Worker Edge Mesh & Fleet Health Surveillance Hub
- Enterprise mesh dashboard aggregating ergonomic compliance across multiple workstation nodes, tracking fleet health, and broadcasting corporate wellness alerts.

---

## 🎨 UI/UX Design System (60-70% Overhaul)
- **Aesthetics**: Cyberpunk / Medical-Tech Obsidian Glassmorphism with deep space slate (`#060913`), electric cyan (`#00f2fe`), emerald pulse (`#10b981`), amber warning (`#f59e0b`), and crimson alert (`#ff3366`).
- **Interactive Visualizers**: Live FFT frequency spectrum analyzer canvas, radial EHS gauge, and responsive tabbed modules.

---

## 💻 Quick Start & Running

### Option 1: Standalone Instant Launch (Zero Setup)
Simply open `index.html` in any modern web browser (Google Chrome, Microsoft Edge, Firefox, Safari).

### Option 2: Full React & Node.js Edge Stack

#### Run Backend API:
```bash
cd backend
npm install
npm start
```
*API runs at `http://localhost:5000/api`*

#### Run Frontend Web App:
```bash
cd frontend
npm install
npm run dev
```
*Frontend runs at `http://localhost:5173`*

---

## 🐳 Docker Deployment
```bash
docker-compose up --build
```
