import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';

const serviceAccount = JSON.parse(fs.readFileSync('c:/Users/rolan/Videos/application mobile/valerion/functions/serviceAccountKey.json', 'utf8'));

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

async function fixDb() {
  const docRef = db.collection('daily_transmissions').doc('trans_2026_09_30');
  const docSnap = await docRef.get();
  
  if (docSnap.exists) {
    const data = docSnap.data();
    if (!data.title || !data.videoUrl) {
      console.log('Document is corrupted, deleting it so it reverts to mock or lets admin recreate it.');
      await docRef.delete();
      console.log('Deleted corrupted daily_transmissions/trans_2026_09_30');
    } else {
      console.log('Document seems fine.');
    }
  } else {
    console.log('Document does not exist.');
  }
}

fixDb().catch(console.error);
