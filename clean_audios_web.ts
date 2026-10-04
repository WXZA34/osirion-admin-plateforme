import { collection, getDocs, deleteDoc } from 'firebase/firestore';
import { db } from './src/lib/firebase';

async function cleanAudios() {
  const audiosRef = collection(db, 'library_audios');
  const snapshot = await getDocs(audiosRef);
  
  let deletedCount = 0;
  for (const doc of snapshot.docs) {
    const data = doc.data();
    if (!data.audioUrl || data.audioUrl.trim() === '') {
      console.log(`Deleting audio ${doc.id} because audioUrl is missing or empty.`);
      await deleteDoc(doc.ref);
      deletedCount++;
    }
  }
  
  console.log(`Deleted ${deletedCount} unplayable audios.`);
  process.exit(0);
}

cleanAudios().catch(console.error);
