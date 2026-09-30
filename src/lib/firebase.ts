import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeFirestore, setLogLevel } from 'firebase/firestore';
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

// Silence internal Firestore warning and offline retry notices
setLogLevel('silent');

// Initialize Firebase App safely
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Use initializeFirestore with auto-detect long polling to prevent WebChannel disconnects in iframes
export const db = initializeFirestore(app, {
  experimentalAutoDetectLongPolling: true,
});

export const auth = getAuth(app);

