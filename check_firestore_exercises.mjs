import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyB194GBuLhpU_cjhBdF_XQgWvCmgZIIots",
  authDomain: "valerion-55414.firebaseapp.com",
  projectId: "valerion-55414",
  storageBucket: "valerion-55414.firebasestorage.app",
  messagingSenderId: "317679762375",
  appId: "1:317679762375:web:934ba1978b23a8da0337e2",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function checkExercises() {
  const snap = await getDocs(collection(db, 'exercises'));
  console.log(`Total documents dans 'exercises': ${snap.size}`);

  let validCount = 0;
  let aiSupportedCount = 0;
  let missingMinAngle = 0;
  let missingMaxAngle = 0;
  let missingEngine = 0;
  let missingHasAiSupport = 0;
  let missingExecutionMode = 0;
  let missingTargetArea = 0;
  let missingTrainingType = 0;

  const samplesWithMissing = [];
  const configuredAiExercises = [];

  snap.forEach(doc => {
    if (doc.id.startsWith('_')) return; // ignore technical docs
    validCount++;
    const data = doc.data();

    const isAi = data.hasAiSupport === true || data.executionMode === 'MODE_VISION' || data.aiPoseDetection === true;
    if (isAi) {
      aiSupportedCount++;
    }

    const missing = [];
    if (data.minAngle === undefined) missing.push('minAngle');
    if (data.maxAngle === undefined) missing.push('maxAngle');
    if (data.aiEngine === undefined) missing.push('aiEngine');
    if (data.hasAiSupport === undefined) missing.push('hasAiSupport');
    if (data.executionMode === undefined) missing.push('executionMode');
    if (data.targetArea === undefined) missing.push('targetArea');
    if (data.trainingType === undefined) missing.push('trainingType');

    if (missing.length > 0) {
      if (samplesWithMissing.length < 10) {
        samplesWithMissing.push({ id: doc.id, name: data.name, missing });
      }
    } else {
      if (configuredAiExercises.length < 5) {
        configuredAiExercises.push({
          id: doc.id,
          name: data.name,
          engine: data.aiEngine,
          minAngle: data.minAngle,
          maxAngle: data.maxAngle,
          hasAiSupport: data.hasAiSupport,
          mode: data.executionMode
        });
      }
    }

    if (data.minAngle === undefined) missingMinAngle++;
    if (data.maxAngle === undefined) missingMaxAngle++;
    if (data.aiEngine === undefined) missingEngine++;
    if (data.hasAiSupport === undefined) missingHasAiSupport++;
    if (data.executionMode === undefined) missingExecutionMode++;
    if (data.targetArea === undefined) missingTargetArea++;
    if (data.trainingType === undefined) missingTrainingType++;
  });

  console.log(`\n--- RÉSUMÉ DES EXERCICES ---`);
  console.log(`Exercices valides (hors docs techniques): ${validCount}`);
  console.log(`Exercices avec Vision IA active: ${aiSupportedCount}`);
  console.log(`\n--- CHAMPS MANQUANTS DIRECTS DANS FIRESTORE ---`);
  console.log(`Sans minAngle: ${missingMinAngle} / ${validCount}`);
  console.log(`Sans maxAngle: ${missingMaxAngle} / ${validCount}`);
  console.log(`Sans aiEngine: ${missingEngine} / ${validCount}`);
  console.log(`Sans hasAiSupport: ${missingHasAiSupport} / ${validCount}`);
  console.log(`Sans executionMode: ${missingExecutionMode} / ${validCount}`);
  console.log(`Sans targetArea: ${missingTargetArea} / ${validCount}`);
  console.log(`Sans trainingType: ${missingTrainingType} / ${validCount}`);

  if (samplesWithMissing.length > 0) {
    console.log(`\nÉchantillon d'exercices avec champs manquants :`);
    console.log(JSON.stringify(samplesWithMissing, null, 2));
  }

  process.exit(0);
}

checkExercises().catch(err => {
  console.error("Erreur:", err);
  process.exit(1);
});
