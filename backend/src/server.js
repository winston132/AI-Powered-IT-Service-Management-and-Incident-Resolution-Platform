const express = require('express');
const cors = require('cors');
const path = require('path');
const { initDatabase } = require('./db');
const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS & JSON Parsing
app.use(cors());
app.use(express.json());

// Initialize DB schema and seed data
initDatabase();

// Mount API Routes
app.use('/api', apiRoutes);

// Health Check Endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'EdgePosture AI - Vision-Based Edge Telemetry Server',
    modules: [
      'Module 1: Computer Vision & Real-Time Pose Estimation',
      'Module 2: Kinematic Geometry & Posture Evaluation Engine',
      'Module 3: Dynamic Interface Discovery & Peripheral Control Interface',
      'Module 4: Integrated Audio Subsystem & Database Logging Architecture',
      'Feature 5: AI Ergonomic Coach & Automated Micro-Breaks',
      'Feature 6: Ergonomic Digital Twin & 3D Spine Simulator',
      'Feature 7: Multi-Worker Edge Mesh & Fleet Surveillance Hub'
    ],
    timestamp: new Date().toISOString()
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err.stack);
  res.status(500).json({ error: 'Internal Server Error', details: err.message });
});

// Start Server
app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🦾 EdgePosture AI (VisionSensory Core) Backend API`);
  console.log(`Listening on http://localhost:${PORT}`);
  console.log(`API Base URL: http://localhost:${PORT}/api`);
  console.log(`=======================================================`);
});
