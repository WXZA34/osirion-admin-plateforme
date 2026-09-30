import { collection, getDocs, writeBatch, doc } from 'firebase/firestore';
import { db } from './src/lib/firebase.ts';
import { 
  INITIAL_BASTIONS_SPOTS, 
  INITIAL_HEX_TERRITORIES, 
  INITIAL_LIVE_DUELS, 
  INITIAL_COLOSSEUM_RUNS, 
  INITIAL_COLOSSEUM_TOURNAMENTS, 
  INITIAL_FORGE_ROUTES, 
  INITIAL_NO_GO_ZONES 
} from './src/data/arenaData.ts';

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
    // If item has an id, use it as document ID, otherwise let Firestore generate one
    const docRef = item.id ? doc(db, collectionPath, item.id) : doc(collection(db, collectionPath));
    // Don't save the id inside the document if it's the document key, but we can just save it.
    batch.set(docRef, item);
  });

  await batch.commit();
  console.log(`Successfully seeded ${collectionPath}.`);
}

async function run() {
  try {
    console.log('--- STARTING ARENA SEED ---');
    
    // 1. Clear existing collections
    await clearCollection('bastions');
    await clearCollection('territories');
    await clearCollection('live_duels');
    await clearCollection('colosseum_runs');
    await clearCollection('colosseum_tournaments');
    await clearCollection('forge_routes');
    await clearCollection('tactical_no_go_zones');
    
    // 2. Seed with mock data
    await seedCollection('bastions', INITIAL_BASTIONS_SPOTS);
    await seedCollection('territories', INITIAL_HEX_TERRITORIES);
    await seedCollection('live_duels', INITIAL_LIVE_DUELS);
    await seedCollection('colosseum_runs', INITIAL_COLOSSEUM_RUNS);
    await seedCollection('colosseum_tournaments', INITIAL_COLOSSEUM_TOURNAMENTS);
    await seedCollection('forge_routes', INITIAL_FORGE_ROUTES);
    await seedCollection('tactical_no_go_zones', INITIAL_NO_GO_ZONES);
    
    console.log('--- ARENA SEED COMPLETE ---');
    process.exit(0);
  } catch (error) {
    console.error('Error during seeding:', error);
    process.exit(1);
  }
}

run();
