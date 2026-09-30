import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyB194GBuLhpU_cjhBdF_XQgWvCmgZIIots",
  authDomain: "valerion-55414.firebaseapp.com",
  projectId: "valerion-55414",
  storageBucket: "valerion-55414.firebasestorage.app",
  messagingSenderId: "317679762375",
  appId: "1:317679762375:web:934ba1978b23a8da0337e2",
  measurementId: "G-3RR1MZC97X"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
