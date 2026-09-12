import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCJdl3e4SzyZhSMgzXZuV02ae96q2ZtXB4",
  authDomain: "sih-181.firebaseapp.com",
  projectId: "sih-181",
  storageBucket: "sih-181.firebasestorage.app",
  messagingSenderId: "125163777038",
  appId: "1:125163777038:web:8b59652fa6e7f23827a05f",
  measurementId: "G-QN25B5151F"
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
