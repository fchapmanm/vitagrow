import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: 'AIzaSyADyPBT3eTkA7Ff5FzAkiVe2mpFC-IWND4',
  authDomain: 'vitagrow-8e463.firebaseapp.com',
  projectId: 'vitagrow-8e463',
  storageBucket: 'vitagrow-8e463.firebasestorage.app',
  messagingSenderId: '421619100379',
  appId: '1:421619100379:web:a4fa5a101f9f51d2e0fafe',
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };