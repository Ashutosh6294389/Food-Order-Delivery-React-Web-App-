import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBu5_nWbZEz1DUR1zFAIAelLdrI2rN3Ep0",
  authDomain: "minifoodorderapp-46543.firebaseapp.com",
  projectId: "minifoodorderapp-46543",
  storageBucket: "minifoodorderapp-46543.firebasestorage.app",
  messagingSenderId: "199394988171",
  appId: "1:199394988171:web:0fdfc40cfd6f12584dc48e",
  measurementId: "G-ZGGKJT6QHP"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth=getAuth(app);

export { auth };

export { db };