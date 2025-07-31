import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from './firebaseConfig';

export async function loginUser(email: string, password: string) {
  return await signInWithEmailAndPassword(auth, email, password);
}
