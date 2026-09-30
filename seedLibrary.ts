import { collection, getDocs, writeBatch, doc } from 'firebase/firestore';
import { db } from './src/lib/firebase.ts';
import { 
  INITIAL_LIBRARY_BOOKS,
  INITIAL_LIBRARY_AUDIOS
} from './src/data/libraryData.ts';

async function clearCollection(collectionPath: string) {
  console.log(`Clearing collection: ${collectionPath}...`);
  const collRef = collection(db, collectionPath);
  const snapshot = await getDocs(collRef);
  
  if (snapshot.size === 0) {
    console.log(`Collection ${collectionPath} is already empty.`);
    return;
  }

  const batch = writeBatch(db);
  snapshot.docs.forEach((document) => {
    batch.delete(document.ref);
  });
  
  await batch.commit();
  console.log(`Cleared ${snapshot.size} documents from ${collectionPath}.`);
}

async function seedCollection(collectionPath: string, data: any[]) {
  console.log(`Seeding collection: ${collectionPath} with ${data.length} documents...`);
  const batch = writeBatch(db);
  
  data.forEach((item) => {
    const docRef = item.id ? doc(db, collectionPath, item.id) : doc(collection(db, collectionPath));
    batch.set(docRef, item);
  });

  await batch.commit();
  console.log(`Successfully seeded ${collectionPath}.`);
}

async function run() {
  try {
    console.log('--- STARTING LIBRARY SEED ---');
    
    // 1. Clear existing collections
    await clearCollection('books');
    await clearCollection('library_audios');
    
    // 2. Seed with mock data
    await seedCollection('books', INITIAL_LIBRARY_BOOKS);
    await seedCollection('library_audios', INITIAL_LIBRARY_AUDIOS);
    
    console.log('--- LIBRARY SEED COMPLETE ---');
    process.exit(0);
  } catch (error) {
    console.error('Error during seeding:', error);
    process.exit(1);
  }
}

run();
