import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';

const serviceAccount = JSON.parse(fs.readFileSync('c:/Users/rolan/Videos/application mobile/valerion/functions/serviceAccountKey.json', 'utf8'));

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

async function cleanAudios() {
  const audiosRef = db.collection('library_audios');
  const snapshot = await audiosRef.get();
  
  let deletedCount = 0;
  for (const doc of snapshot.docs) {
    const data = doc.data();
    if (!data.audioUrl || data.audioUrl.trim() === '') {
      console.log(`Deleting audio ${doc.id} because audioUrl is missing or empty.`);
      await doc.ref.delete();
      deletedCount++;
    }
  }
  
  console.log(`Deleted ${deletedCount} unplayable audios.`);
}

cleanAudios().catch(console.error);
