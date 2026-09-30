import {
  DojoTargetArea,
  DojoTrainingType,
  DojoExecutionMode,
  DojoMode,
  DojoConfigProfile,
  MovementSplit,
} from '../types/admin';

export interface InferredDojoMetadata {
  targetArea: DojoTargetArea;
  trainingType: DojoTrainingType;
  executionMode: DojoExecutionMode;
  dojoMode: DojoMode;
  configProfile: DojoConfigProfile;
  movementSplit: MovementSplit;
  hasAiSupport: boolean;
}

export function inferDojoMetadata(raw: any, id: string): InferredDojoMetadata {
  const name = (raw.name || id || '').toLowerCase();
  const bodyPart = (raw.targetBodyPart || '').toUpperCase();
  const diff = (raw.difficulty || '').toLowerCase();

  // 1. Target Area (Rubrique principale Dojo)
  let targetArea: DojoTargetArea = raw.targetArea;
  if (!targetArea) {
    if (
      bodyPart === 'FULL_BODY' ||
      name.includes('burpee') ||
      name.includes('jumping') ||
      name.includes('high knee') ||
      name.includes('montées de genoux') ||
      name.includes('mountain climber') ||
      name.includes('fente') ||
      name.includes('shadow')
    ) {
      targetArea = 'CORPS_ENTIER';
    } else if (
      bodyPart === 'LOWER' ||
      name.includes('squat') ||
      name.includes('fessier') ||
      name.includes('nordic') ||
      name.includes('leg') ||
      name.includes('step')
    ) {
      targetArea = 'BAS_DU_CORPS';
    } else if (
      bodyPart === 'CORE' ||
      name.includes('abdo') ||
      name.includes('crunch') ||
      name.includes('plank') ||
      name.includes('gainage') ||
      name.includes('hollow') ||
      name.includes('l-sit') ||
      name.includes('l_sit') ||
      name.includes('twist') ||
      name.includes('rollout') ||
      name.includes('dragon flag') ||
      name.includes('bicyclette')
    ) {
      targetArea = 'SANGLE_ABDOS';
    } else if (
      bodyPart === 'LIMB' ||
      name.includes('poignet') ||
      name.includes('mollet') ||
      name.includes('biceps') ||
      name.includes('rotateur') ||
      name.includes('cercle') ||
      name.includes('isométr') ||
      name.includes('curl')
    ) {
      targetArea = 'CIBLAGE_ISOLE';
    } else {
      targetArea = 'HAUT_DU_CORPS';
    }
  }

  // 2. Training Type (Force vs Endurance)
  let trainingType: DojoTrainingType = raw.trainingType === 'ENDURANCE' ? 'ENDURANCE' : 'FORCE';

  // 3. Movement Split
  let movementSplit: MovementSplit = raw.movementSplit;
  if (!movementSplit) {
    if (
      targetArea === 'CORPS_ENTIER' ||
      name.includes('burpee') ||
      name.includes('jumping') ||
      name.includes('muscle up') ||
      name.includes('combo')
    ) {
      movementSplit = 'FULL_BODY';
    } else if (targetArea === 'BAS_DU_CORPS') {
      movementSplit = 'LEGS';
    } else if (targetArea === 'SANGLE_ABDOS') {
      movementSplit = 'CORE';
    } else if (
      name.includes('pull') ||
      name.includes('traction') ||
      name.includes('chin') ||
      name.includes('row') ||
      name.includes('australi') ||
      name.includes('curl') ||
      name.includes('tirage') ||
      name.includes('lever')
    ) {
      movementSplit = 'PULL';
    } else {
      movementSplit = 'PUSH';
    }
  }

  // 4. Dojo Mode (Détection IA)
  let dojoMode: DojoMode = raw.dojoMode;
  if (!dojoMode) {
    if (
      name.includes('hold') ||
      name.includes('l-sit') ||
      name.includes('l_sit') ||
      name.includes('plank') ||
      name.includes('gainage') ||
      name.includes('hollow') ||
      name.includes('chaise') ||
      name.includes('isométr') ||
      name.includes('hang')
    ) {
      dojoMode = 'STATIC_HOLD';
    } else if (
      name.includes('amrap') ||
      name.includes('max') ||
      name.includes('chrono') ||
      name.includes('montées de genoux') ||
      name.includes('jumping')
    ) {
      dojoMode = 'AMRAP_TIMED';
    } else if (
      name.includes('drill') ||
      name.includes('éducatif') ||
      name.includes('progression') ||
      name.includes('transition')
    ) {
      dojoMode = 'PROGRESSION_DRILL';
    } else {
      dojoMode = 'DYNAMIC_REPS';
    }
  }

  // 5. Config Profile (Tolérance biomécanique)
  let configProfile: DojoConfigProfile = raw.configProfile;
  if (!configProfile) {
    if (dojoMode === 'STATIC_HOLD') {
      configProfile = 'ISOMETRIC_CHRONO';
    } else if (
      diff.includes('élite') ||
      diff.includes('elite') ||
      name.includes('muscle up') ||
      name.includes('lever') ||
      name.includes('planche') ||
      name.includes('dragon') ||
      name.includes('pistol')
    ) {
      configProfile = 'STRICT_COMPETITION';
    } else if (
      diff.includes('débutant') ||
      diff.includes('facile') ||
      name.includes('genoux') ||
      name.includes('assist')
    ) {
      configProfile = 'NOVICE_ASSISTED';
    } else {
      configProfile = 'STANDARD_DAILY';
    }
  }

  // 6. Execution Mode (Vision IA vs Guide)
  let executionMode: DojoExecutionMode = raw.executionMode;
  if (!executionMode) {
    if (
      name.includes('cercle') ||
      name.includes('shadow') ||
      name.includes('rotation') ||
      name.includes('étirement')
    ) {
      executionMode = 'MODE_GUIDE';
    } else {
      executionMode = 'MODE_VISION';
    }
  }

  // 7. Has AI Support (True if Mode Vision & Camera trackable)
  const hasAiSupport = typeof raw.hasAiSupport === 'boolean'
    ? raw.hasAiSupport
    : executionMode === 'MODE_VISION';

  return {
    targetArea,
    trainingType,
    executionMode,
    dojoMode,
    configProfile,
    movementSplit,
    hasAiSupport,
  };
}
