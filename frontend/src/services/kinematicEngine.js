/**
 * Kinematic Geometry & Posture Evaluation Engine (Module 2)
 * Biomechanical angle computations, anthropometric normalizations, and ergonomic health scoring.
 */

// Clinical normal thresholds
export const KINEMATIC_THRESHOLDS = {
  CVA: {
    OPTIMAL: 50,    // degrees: >= 50 is normal
    MILD_RISK: 42,  // 42-49 is mild forward head posture (FHP)
    SEVERE_RISK: 35 // < 35 is severe FHP
  },
  SHOULDER_ASYMMETRY: {
    OPTIMAL: 2.5,   // degrees delta: <= 2.5 is balanced
    MILD_RISK: 5.0,  // 2.5 - 5.0 is moderate asymmetry
    SEVERE_RISK: 8.0 // > 8.0 is severe shoulder tilt
  },
  THORACIC_FLEXION: {
    OPTIMAL_MIN: 82, // degrees from horizontal: 82-95 is neutral spine
    OPTIMAL_MAX: 98,
    SLOUCH_FORWARD: 75,
    SLOUCH_BACKWARD: 105
  },
  SPINAL_LATERAL_TILT: {
    OPTIMAL: 2.0,   // degrees: <= 2.0 is centered
    MILD_RISK: 4.5,
    SEVERE_RISK: 7.0
  },
  GAZE_DISTANCE: {
    OPTIMAL_MIN_CM: 45, // 45 - 75 cm standard screen distance
    OPTIMAL_MAX_CM: 75,
    TOO_CLOSE_CM: 35,
    TOO_FAR_CM: 90
  }
};

export const POSTURE_STATES = {
  OPTIMAL: { id: 'OPTIMAL', label: 'Optimal Alignment', severity: 'low', color: '#10b981', badgeClass: 'badge-optimal' },
  MILD_FHP: { id: 'MILD_FHP', label: 'Mild Forward Head', severity: 'medium', color: '#f59e0b', badgeClass: 'badge-warning' },
  SEVERE_FHP: { id: 'SEVERE_FHP', label: 'Severe Forward Head', severity: 'high', color: '#ef4444', badgeClass: 'badge-danger' },
  THORACIC_SLOUCH: { id: 'THORACIC_SLOUCH', label: 'Thoracic Slouch', severity: 'high', color: '#ef4444', badgeClass: 'badge-danger' },
  SHOULDER_IMBALANCE: { id: 'SHOULDER_IMBALANCE', label: 'Shoulder Asymmetry', severity: 'medium', color: '#f59e0b', badgeClass: 'badge-warning' },
  LATERAL_DEVIATION: { id: 'LATERAL_DEVIATION', label: 'Spinal Lateral Lean', severity: 'medium', color: '#f59e0b', badgeClass: 'badge-warning' },
  ABSENT: { id: 'ABSENT', label: 'User Out of FOV', severity: 'low', color: '#64748b', badgeClass: 'badge-neutral' }
};

/**
 * Calculate 2D angle between three points in degrees (vertex at p2)
 */
export function calculateAngle(p1, p2, p3) {
  if (!p1 || !p2 || !p3) return 0;
  const radians = Math.atan2(p3.y - p2.y, p3.x - p2.x) - Math.atan2(p1.y - p2.y, p1.x - p2.x);
  let angle = Math.abs((radians * 180.0) / Math.PI);
  if (angle > 180.0) {
    angle = 360.0 - angle;
  }
  return Number(angle.toFixed(1));
}

/**
 * Calculate angle relative to horizontal plane
 */
export function calculateAngleToHorizontal(p1, p2) {
  if (!p1 || !p2) return 0;
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const angle = Math.atan2(Math.abs(dy), Math.abs(dx)) * (180.0 / Math.PI);
  return Number(angle.toFixed(1));
}

/**
 * Calculate Craniovertebral Angle (CVA)
 * Measures angle between line joining tragus (ear) to C7 spinous process (derived from neck/shoulder midpoint) and horizontal line.
 */
export function computeCVA(ear, c7Reference) {
  if (!ear || !c7Reference) return 52.0;
  const dx = ear.x - c7Reference.x;
  const dy = c7Reference.y - ear.y; // Inverted canvas Y
  let angle = Math.atan2(dy, Math.abs(dx) || 0.001) * (180.0 / Math.PI);
  return Number(Math.max(20, Math.min(75, angle)).toFixed(1));
}

/**
 * Calculate shoulder horizontal tilt / elevation asymmetry
 */
export function computeShoulderTilt(leftShoulder, rightShoulder) {
  if (!leftShoulder || !rightShoulder) return 0;
  const dy = Math.abs(rightShoulder.y - leftShoulder.y);
  const dx = Math.abs(rightShoulder.x - leftShoulder.x) || 1;
  const tiltDegrees = Math.atan2(dy, dx) * (180.0 / Math.PI);
  return Number(tiltDegrees.toFixed(1));
}

/**
 * Calculate thoracic spine slouch / trunk flexion angle
 */
export function computeThoracicFlexion(midShoulder, midHip) {
  if (!midShoulder || !midHip) return 90.0;
  const dx = midShoulder.x - midHip.x;
  const dy = midHip.y - midShoulder.y;
  const angle = Math.atan2(dy, dx) * (180.0 / Math.PI);
  return Number(Math.max(50, Math.min(130, angle)).toFixed(1));
}

/**
 * Calculate lateral spinal deviation from center axis
 */
export function computeLateralSpineDeviation(midShoulder, midHip, nose) {
  if (!midShoulder || !midHip) return 0;
  const spineCenterX = (midShoulder.x + midHip.x) / 2;
  const devRatio = Math.abs(midShoulder.x - spineCenterX) / ((Math.abs(midHip.y - midShoulder.y) || 1) * 0.1);
  const degrees = Math.min(20, devRatio * 3.5);
  return Number(degrees.toFixed(1));
}

/**
 * Estimate eye-to-screen distance (cm) from facial keypoint bounding geometry
 */
export function estimateGazeDistance(leftEye, rightEye, leftEar, rightEar) {
  if (!leftEye || !rightEye) return 55;
  const eyeDistance = Math.hypot(rightEye.x - leftEye.x, rightEye.y - leftEye.y);
  if (eyeDistance === 0) return 55;
  // Normalized inverse scaling: baseline eye distance of 0.12 of viewport corresponds to ~55cm
  const estimatedCm = Math.round(4500 / (eyeDistance * 600 + 40));
  return Math.max(25, Math.min(110, estimatedCm));
}

/**
 * Main Kinematic Posture Evaluator
 * Takes raw 17-keypoint skeletal dictionary and returns comprehensive kinematic metrics + Ergonomic Health Score
 */
export function evaluateKinematics(keypoints, calibration = null) {
  if (!keypoints || !keypoints.nose) {
    return {
      postureState: POSTURE_STATES.ABSENT,
      score: 0,
      cva: 0,
      shoulderTilt: 0,
      thoracicFlexion: 90,
      lateralDeviation: 0,
      gazeDistanceCm: 0,
      compressionForceN: 0,
      violations: [],
      rawKeypoints: null
    };
  }

  // Derive anatomical midpoints
  const leftShoulder = keypoints.left_shoulder || { x: 0.4, y: 0.35, score: 0.9 };
  const rightShoulder = keypoints.right_shoulder || { x: 0.6, y: 0.35, score: 0.9 };
  const leftEar = keypoints.left_ear || keypoints.left_eye;
  const rightEar = keypoints.right_ear || keypoints.right_eye;
  const activeEar = (leftEar && leftEar.score > (rightEar?.score || 0)) ? leftEar : (rightEar || leftEar);

  const midShoulder = {
    x: (leftShoulder.x + rightShoulder.x) / 2,
    y: (leftShoulder.y + rightShoulder.y) / 2
  };

  const leftHip = keypoints.left_hip || { x: leftShoulder.x, y: leftShoulder.y + 0.35, score: 0.8 };
  const rightHip = keypoints.right_hip || { x: rightShoulder.x, y: rightShoulder.y + 0.35, score: 0.8 };
  const midHip = {
    x: (leftHip.x + rightHip.x) / 2,
    y: (leftHip.y + rightHip.y) / 2
  };

  // C7 cervical reference point (slightly below mid-ear and posterior)
  const c7Reference = {
    x: midShoulder.x,
    y: midShoulder.y - 0.03
  };

  // Compute raw angles
  let cva = computeCVA(activeEar, c7Reference);
  let shoulderTilt = computeShoulderTilt(leftShoulder, rightShoulder);
  let thoracicFlexion = computeThoracicFlexion(midShoulder, midHip);
  let lateralDeviation = computeLateralSpineDeviation(midShoulder, midHip, keypoints.nose);
  let gazeDistanceCm = estimateGazeDistance(keypoints.left_eye, keypoints.right_eye, leftEar, rightEar);

  // Apply user calibration offset if available
  if (calibration) {
    if (calibration.cvaBaseline) {
      cva = cva + (52 - calibration.cvaBaseline);
    }
    if (calibration.shoulderBaseline) {
      shoulderTilt = Math.max(0, shoulderTilt - calibration.shoulderBaseline);
    }
  }

  // Evaluate Violations & Penalties
  const violations = [];
  let score = 100;

  // 1. CVA (Forward Head Posture)
  if (cva < KINEMATIC_THRESHOLDS.CVA.SEVERE_RISK) {
    score -= 35;
    violations.push({ type: 'CVA_SEVERE', message: 'Severe Forward Head Posture (<35° CVA)', penalty: 35 });
  } else if (cva < KINEMATIC_THRESHOLDS.CVA.MILD_RISK) {
    score -= 18;
    violations.push({ type: 'CVA_MILD', message: 'Mild Forward Head Drift (42°-49° CVA)', penalty: 18 });
  }

  // 2. Shoulder Asymmetry
  if (shoulderTilt > KINEMATIC_THRESHOLDS.SHOULDER_ASYMMETRY.SEVERE_RISK) {
    score -= 25;
    violations.push({ type: 'SHOULDER_SEVERE', message: `Severe Shoulder Drop (Delta: ${shoulderTilt}°)`, penalty: 25 });
  } else if (shoulderTilt > KINEMATIC_THRESHOLDS.SHOULDER_ASYMMETRY.MILD_RISK) {
    score -= 12;
    violations.push({ type: 'SHOULDER_MILD', message: `Moderate Shoulder Asymmetry (Delta: ${shoulderTilt}°)`, penalty: 12 });
  }

  // 3. Thoracic Flexion (Slouching)
  if (thoracicFlexion < KINEMATIC_THRESHOLDS.THORACIC_FLEXION.SLOUCH_FORWARD) {
    score -= 30;
    violations.push({ type: 'THORACIC_SLOUCH', message: 'Thoracic Kyphosis / Forward Slouch', penalty: 30 });
  } else if (thoracicFlexion > KINEMATIC_THRESHOLDS.THORACIC_FLEXION.SLOUCH_BACKWARD) {
    score -= 15;
    violations.push({ type: 'POSTERIOR_RECLINE', message: 'Excessive Posterior Recline', penalty: 15 });
  }

  // 4. Lateral Tilt
  if (lateralDeviation > KINEMATIC_THRESHOLDS.SPINAL_LATERAL_TILT.MILD_RISK) {
    score -= 10;
    violations.push({ type: 'LATERAL_LEAN', message: 'Lateral Spinal Imbalance', penalty: 10 });
  }

  // 5. Gaze Distance
  if (gazeDistanceCm < KINEMATIC_THRESHOLDS.GAZE_DISTANCE.TOO_CLOSE_CM) {
    score -= 12;
    violations.push({ type: 'SCREEN_PROXIMITY', message: `Screen Too Close (${gazeDistanceCm} cm)`, penalty: 12 });
  }

  score = Math.max(10, Math.min(100, Math.round(score)));

  // Determine Primary Posture Classification
  let postureState = POSTURE_STATES.OPTIMAL;
  if (cva < KINEMATIC_THRESHOLDS.CVA.SEVERE_RISK) {
    postureState = POSTURE_STATES.SEVERE_FHP;
  } else if (thoracicFlexion < KINEMATIC_THRESHOLDS.THORACIC_FLEXION.SLOUCH_FORWARD) {
    postureState = POSTURE_STATES.THORACIC_SLOUCH;
  } else if (shoulderTilt > KINEMATIC_THRESHOLDS.SHOULDER_ASYMMETRY.MILD_RISK) {
    postureState = POSTURE_STATES.SHOULDER_IMBALANCE;
  } else if (cva < KINEMATIC_THRESHOLDS.CVA.MILD_RISK) {
    postureState = POSTURE_STATES.MILD_FHP;
  } else if (lateralDeviation > KINEMATIC_THRESHOLDS.SPINAL_LATERAL_TILT.MILD_RISK) {
    postureState = POSTURE_STATES.LATERAL_DEVIATION;
  }

  // Spinal Disc Biomechanical Compression Force Estimation (Newtons)
  // Baseline neutral spine = ~280N; Slouched forward head + trunk flexion can exceed 750N
  const headWeightKg = 5.0; // standard adult head ~5kg
  const effectiveCvaRad = (90 - cva) * (Math.PI / 180);
  const headLeverArmCm = Math.sin(effectiveCvaRad) * 12; // cm moment arm
  const cervicalStrainN = Math.round(200 + (headWeightKg * 9.81 * (1 + headLeverArmCm / 3.0)));
  const lumbarStrainN = Math.round(280 + ((90 - thoracicFlexion) * 6.5) + (shoulderTilt * 8.0));
  const totalCompressionForceN = cervicalStrainN + lumbarStrainN;

  return {
    postureState,
    score,
    cva,
    shoulderTilt,
    thoracicFlexion,
    lateralDeviation,
    gazeDistanceCm,
    cervicalStrainN,
    lumbarStrainN,
    compressionForceN: totalCompressionForceN,
    violations,
    midShoulder,
    midHip,
    c7Reference,
    rawKeypoints: keypoints
  };
}
