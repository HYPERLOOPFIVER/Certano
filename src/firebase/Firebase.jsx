// src/firebase/Firebase.js (or Firebase.jsx)
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyAsjPu0kt8ilUMK9QDu9TobEzTMMkbhiQg",
  authDomain: "certano-97049.firebaseapp.com",
  projectId: "certano-97049",
  storageBucket: "certano-97049.appspot.com",
  messagingSenderId: "713775491750",
  appId: "1:713775491750:web:6a2684643503e60ea6a267"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app); // Create storage instance

// Export the services you need
export { 
  auth, 
  db, 
  storage, 
  onAuthStateChanged, 
  getFirestore, 
  getStorage 
};