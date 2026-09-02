const express = require('express');
const router = express.Router();
const { getDatabase } = require('../db');

// GET /api/telemetry - Retrieve rolling telemetry buffer
router.get('/telemetry', (req, res) => {
  const db = getDatabase();
  res.json({
    status: 'success',
    data: db.telemetry.slice(-100),
    totalSamples: db.telemetry.length
  });
});

// POST /api/telemetry - Ingest edge posture telemetry frame
router.post('/telemetry', (req, res) => {
  const db = getDatabase();
  const frame = {
    ...req.body,
    timestamp: Date.now()
  };
  db.telemetry.push(frame);
  if (db.telemetry.length > 1000) db.telemetry.shift();

  res.status(201).json({ status: 'success', recorded: frame });
});

// GET /api/incidents - List posture violation incidents
router.get('/incidents', (req, res) => {
  const db = getDatabase();
  res.json({
    status: 'success',
    data: db.incidents
  });
});

// POST /api/peripherals/actuate - Trigger sensory actuator
router.post('/peripherals/actuate', (req, res) => {
  const { deviceId, pattern, intensity } = req.body;
  res.json({
    status: 'success',
    message: `Actuation command [${pattern || 'PULSE'}] dispatched to ${deviceId || 'ALL_HAPTIC'}`
  });
});

// GET /api/fleet - Fleet health aggregation
router.get('/fleet', (req, res) => {
  res.json({
    status: 'success',
    fleetIndex: 88.5,
    activeNodes: 4,
    complianceRate: 96.4
  });
});

module.exports = router;
