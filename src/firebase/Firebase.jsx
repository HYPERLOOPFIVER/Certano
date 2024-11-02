// src/firebase/Firebase.js
import { collection, addDoc } from 'firebase/firestore';
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { onAuthStateChanged } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAsjPu0kt8ilUMK9QDu9TobEzTMMkbhiQg",
  authDomain: "certano-97049.firebaseapp.com",
  projectId: "certano-97049",
  storageBucket: "certano-97049.appspot.com",
  messagingSenderId: "713775491750",
  appId: "1:713775491750:web:6a2684643503e60ea6a267"
};

const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and Firestore
const auth = getAuth(app); // Export the auth instance
const db = getFirestore(app); // Export the Firestore instance

export { auth, db,onAuthStateChanged,addDoc,collection,app,getFirestore}; // Make sure both are exported
