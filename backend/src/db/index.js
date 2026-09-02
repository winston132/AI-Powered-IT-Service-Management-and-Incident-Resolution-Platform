/**
 * EdgePosture AI - SQLite / Memory Database Layer (Module 4)
 * Stores time-series posture frames, incident logs, peripheral states, and fleet telemetry.
 */

let memoryStore = {
  telemetry: [],
  incidents: [
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
    }
  ],
  peripherals: [
    { id: 'cushion_01', name: 'EdgeHaptic™ Lumbar Cushion', type: 'haptic', status: 'connected', battery: 88 },
    { id: 'bioband_02', name: 'SmartPosture™ BioBand', type: 'wearable', status: 'connected', battery: 94 },
    { id: 'lightbar_03', name: 'ErgoGlow™ RGB Lightbar', type: 'lighting', status: 'connected', battery: null },
    { id: 'smartdesk_04', name: 'SmartDesk™ Actuator Bridge', type: 'actuator', status: 'connected', currentHeightCm: 74.0 }
  ]
};

function initDatabase() {
  console.log('✅ EdgePosture Time-Series Database Initialized successfully.');
}

function getDatabase() {
  return memoryStore;
}

module.exports = {
  initDatabase,
  getDatabase,
  memoryStore
};
