import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyB194GBuLhpU_cjhBdF_XQgWvCmgZIIots",
  authDomain: "valerion-55414.firebaseapp.com",
  projectId: "valerion-55414",
  storageBucket: "valerion-55414.firebasestorage.app",
  messagingSenderId: "317679762375",
  appId: "1:317679762375:web:934ba1978b23a8da0337e2",
  measurementId: "G-3RR1MZC97X"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function countUsers() {
  try {
    const usersCol = collection(db, 'users');
    const snapshot = await getDocs(usersCol);
    console.log(`Total users in Firestore: ${snapshot.size}`);
    process.exit(0);
  } catch (err) {
    console.error("Error fetching users:", err);
    process.exit(1);
  }
}

countUsers();
