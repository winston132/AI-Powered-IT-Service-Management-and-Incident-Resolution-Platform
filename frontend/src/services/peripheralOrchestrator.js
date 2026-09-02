/**
 * Dynamic Interface Discovery & Peripheral Control Interface (Module 3)
 * Manages smart peripheral discovery, WebHID/BLE protocol simulation,
 * multi-tier sensory escalation policies, and hardware actuation triggers.
 */

export const INITIAL_PERIPHERALS = [
  {
    id: 'periph_cushion_01',
    name: 'EdgeHaptic™ Lumbar Cushion',
    type: 'haptic',
    protocol: 'BLE GATT (Nordic nRF52840)',
    status: 'connected',
    battery: 88,
    rssi: -58,
    firmware: 'v2.4.1-edge',
    activePattern: null,
    capabilities: ['dual_erm_vibration', 'zone_targeting', 'pwm_intensity'],
    metrics: { totalActuations: 142, dutyCycleMs: 450 }
  },
  {
    id: 'periph_bioband_02',
    name: 'SmartPosture™ BioBand Wearable',
    type: 'wearable',
    protocol: 'BLE 5.2 (Custom Posture UUID)',
    status: 'connected',
    battery: 94,
    rssi: -64,
    firmware: 'v1.8.0',
    activePattern: null,
    capabilities: ['lra_haptics', 'quaternion_imu', 'temperature_telemetry'],
    metrics: { totalActuations: 89, dutyCycleMs: 300 }
  },
  {
    id: 'periph_lightbar_03',
    name: 'ErgoGlow™ RGB Monitor Lightbar',
    type: 'lighting',
    protocol: 'USB-HID / WebSerial (FTDI)',
    status: 'connected',
    battery: null, // AC powered
    rssi: null,
    firmware: 'v3.1.2-rgb',
    activeColor: '#10b981', // green normal
    brightness: 80,
    capabilities: ['addressable_rgb', 'smooth_fade', 'strobe_alert', 'ambient_lux'],
    metrics: { totalActuations: 230, dutyCycleMs: 1200 }
  },
  {
    id: 'periph_smartdesk_04',
    name: 'SmartDesk™ Motor Actuator Bridge',
    type: 'actuator',
    protocol: 'TCP / REST Bridge (ESP32-S3)',
    status: 'connected',
    battery: null,
    rssi: -52,
    firmware: 'v4.0.5',
    currentHeightCm: 74.0,
    targetHeightCm: 74.0,
    isMoving: false,
    capabilities: ['height_telemetry', 'preset_sit_stand', 'collision_sensor'],
    metrics: { totalActuations: 18, dutyCycleMs: 5000 }
  },
  {
    id: 'periph_footbed_05',
    name: 'TactileMat™ Ergonomic Stance Footbed',
    type: 'sensor',
    protocol: 'I2C / WebSerial',
    status: 'connected',
    battery: 72,
    rssi: -71,
    firmware: 'v1.2.0',
    capabilities: ['force_matrix', 'fidgeting_index', 'standing_timer'],
    metrics: { totalActuations: 64, dutyCycleMs: 100 }
  }
];

export const HAPTIC_PATTERNS = {
  GENTLE_PULSE: { id: 'GENTLE_PULSE', name: 'Gentle Reminder Pulse', durationMs: 400, frequencyHz: 90, intensity: 40 },
  DOUBLE_BUZZ: { id: 'DOUBLE_BUZZ', name: 'Dual Acromion Buzz', durationMs: 700, frequencyHz: 160, intensity: 75 },
  STACCATO_WARNING: { id: 'STACCATO_WARNING', name: 'Staccato Slouch Alert', durationMs: 900, frequencyHz: 210, intensity: 90 },
  CONTINUOUS_CORRECTIVE: { id: 'CONTINUOUS_CORRECTIVE', name: 'Continuous Alignment Guide', durationMs: 1500, frequencyHz: 120, intensity: 60 }
};

export class PeripheralOrchestrator {
  constructor() {
    this.peripherals = [...INITIAL_PERIPHERALS];
    this.listeners = new Set();
    this.escalationPolicy = {
      tier1DelaySec: 3,   // Ambient light glow shift
      tier2DelaySec: 6,   // Haptic vibration
      tier3DelaySec: 12,  // Dual haptic + audio chime
      tier4DelaySec: 30,  // Auto-elevate sit-stand desk
      autoEscalate: true
    };
    this.slouchDurationSec = 0;
    this.activeEscalationTier = 0;
    this.lastTriggerTime = 0;
    this.cooldownMs = 4000;
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify() {
    this.listeners.forEach(fn => fn(this.getSnapshot()));
  }

  getSnapshot() {
    return {
      peripherals: [...this.peripherals],
      escalationPolicy: { ...this.escalationPolicy },
      slouchDurationSec: this.slouchDurationSec,
      activeEscalationTier: this.activeEscalationTier
    };
  }

  /**
   * Scan & discover dynamic peripheral interfaces
   */
  async scanForPeripherals() {
    // Simulate discovery handshake over WebHID / BLE / WebSerial
    const mockNewDevice = {
      id: `periph_mesh_${Math.floor(Math.random() * 900 + 100)}`,
      name: `EdgeNode™ Haptic Band #${Math.floor(Math.random() * 50 + 10)}`,
      type: 'wearable',
      protocol: 'BLE GATT 5.3',
      status: 'connected',
      battery: Math.floor(Math.random() * 30 + 70),
      rssi: -Math.floor(Math.random() * 30 + 45),
      firmware: 'v2.1.0-mesh',
      activePattern: null,
      capabilities: ['vibrotactile_pulse', 'imu_sync'],
      metrics: { totalActuations: 0, dutyCycleMs: 300 }
    };

    this.peripherals.push(mockNewDevice);
    this.notify();
    return mockNewDevice;
  }

  /**
   * Disconnect or toggle peripheral state
   */
  toggleDeviceConnection(deviceId) {
    this.peripherals = this.peripherals.map(dev => {
      if (dev.id === deviceId) {
        const nextStatus = dev.status === 'connected' ? 'disconnected' : 'connected';
        return { ...dev, status: nextStatus };
      }
      return dev;
    });
    this.notify();
  }

  /**
   * Trigger targeted haptic pattern on connected cushions or bands
   */
  triggerHaptic(patternId = 'DOUBLE_BUZZ', targetDeviceId = null) {
    const pattern = HAPTIC_PATTERNS[patternId] || HAPTIC_PATTERNS.DOUBLE_BUZZ;
    
    this.peripherals = this.peripherals.map(dev => {
      if ((!targetDeviceId || dev.id === targetDeviceId) && (dev.type === 'haptic' || dev.type === 'wearable') && dev.status === 'connected') {
        const updated = {
          ...dev,
          activePattern: pattern.name,
          metrics: { ...dev.metrics, totalActuations: dev.metrics.totalActuations + 1 }
        };
        // Reset active pattern after duration
        setTimeout(() => {
          this.clearActivePattern(dev.id);
        }, pattern.durationMs);
        return updated;
      }
      return dev;
    });

    this.notify();
    return { success: true, pattern: pattern.name };
  }

  clearActivePattern(deviceId) {
    this.peripherals = this.peripherals.map(dev => {
      if (dev.id === deviceId) {
        return { ...dev, activePattern: null };
      }
      return dev;
    });
    this.notify();
  }

  /**
   * Set ErgoGlow lightbar color and brightness
   */
  setLightbarState(hexColor = '#10b981', brightness = 80) {
    this.peripherals = this.peripherals.map(dev => {
      if (dev.type === 'lighting' && dev.status === 'connected') {
        return {
          ...dev,
          activeColor: hexColor,
          brightness,
          metrics: { ...dev.metrics, totalActuations: dev.metrics.totalActuations + 1 }
        };
      }
      return dev;
    });
    this.notify();
  }

  /**
   * Adjust SmartDesk height actuator
   */
  adjustDeskHeight(targetHeightCm) {
    this.peripherals = this.peripherals.map(dev => {
      if (dev.type === 'actuator' && dev.status === 'connected') {
        const updated = {
          ...dev,
          targetHeightCm,
          isMoving: true,
          metrics: { ...dev.metrics, totalActuations: dev.metrics.totalActuations + 1 }
        };
        setTimeout(() => {
          this.finalizeDeskHeight(dev.id, targetHeightCm);
        }, 1200);
        return updated;
      }
      return dev;
    });
    this.notify();
  }

  finalizeDeskHeight(deviceId, targetHeightCm) {
    this.peripherals = this.peripherals.map(dev => {
      if (dev.id === deviceId) {
        return { ...dev, currentHeightCm: targetHeightCm, isMoving: false };
      }
      return dev;
    });
    this.notify();
  }

  /**
   * Orchestrate posture sensory notifications based on kinematic posture state and continuous duration
   */
  processPostureTelemetry(kinematics, audioCallback = null) {
    const now = Date.now();
    const isViolating = kinematics.score < 75 || kinematics.violations.length > 0;

    if (!isViolating) {
      this.slouchDurationSec = 0;
      this.activeEscalationTier = 0;
      this.setLightbarState('#10b981', 60); // calm green
      return;
    }

    // Accumulate slouch duration
    this.slouchDurationSec += 1;

    // Check cooldown
    if (now - this.lastTriggerTime < this.cooldownMs) {
      return;
    }

    const { tier1DelaySec, tier2DelaySec, tier3DelaySec, tier4DelaySec, autoEscalate } = this.escalationPolicy;

    if (!autoEscalate) return;

    if (this.slouchDurationSec >= tier4DelaySec) {
      // Tier 4: Sit-Stand Desk Trigger + High Alert
      this.activeEscalationTier = 4;
      this.setLightbarState('#ff0055', 100);
      this.triggerHaptic('STACCATO_WARNING');
      this.adjustDeskHeight(106.0); // Elevate to standing height
      if (audioCallback) audioCallback('TIER4_VOICE_DESK');
      this.lastTriggerTime = now;
    } else if (this.slouchDurationSec >= tier3DelaySec) {
      // Tier 3: Dual Sensory (Haptic + Audio Warning)
      this.activeEscalationTier = 3;
      this.setLightbarState('#ef4444', 90);
      this.triggerHaptic('DOUBLE_BUZZ');
      if (audioCallback) audioCallback('TIER3_AUDIO_CHIME');
      this.lastTriggerTime = now;
    } else if (this.slouchDurationSec >= tier2DelaySec) {
      // Tier 2: Targeted Haptic Cushion Pulse
      this.activeEscalationTier = 2;
      this.setLightbarState('#f59e0b', 85);
      this.triggerHaptic('GENTLE_PULSE');
      if (audioCallback) audioCallback('TIER2_GENTLE_PING');
      this.lastTriggerTime = now;
    } else if (this.slouchDurationSec >= tier1DelaySec) {
      // Tier 1: Ambient Visual Amber Glow
      this.activeEscalationTier = 1;
      this.setLightbarState('#f59e0b', 75);
    }

    this.notify();
  }
}

export const peripheralOrchestrator = new PeripheralOrchestrator();
