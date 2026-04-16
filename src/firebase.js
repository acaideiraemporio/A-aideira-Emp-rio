import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBxijAD-sPhCOOsXH9sn7RiyG102Vvn74E",
  authDomain: "acaideira-emporio.firebaseapp.com",
  projectId: "acaideira-emporio",
  storageBucket: "acaideira-emporio.firebasestorage.app",
  messagingSenderId: "570395713104",
  appId: "1:570395713104:web:5e7ef16337674b83b9fb55"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);