import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc 
} from 'firebase/firestore';

// Configuration from firebase-applet-config.json
const firebaseConfig = {
  apiKey: "AIzaSyBu3eSXRB-J0Ql_Ug7KizKzCUiHhtKjoMk",
  authDomain: "gen-lang-client-0173516195.firebaseapp.com",
  projectId: "gen-lang-client-0173516195",
  databaseId: "ai-studio-luminafinance-1d93dd38-f1db-4858-8547-808f3438b008",
  storageBucket: "gen-lang-client-0173516195.firebasestorage.app",
  messagingSenderId: "535197997641",
  appId: "1:535197997641:web:4379b3ceabb0a3d3817d98"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app, firebaseConfig.databaseId);

export { 
  app, 
  auth, 
  db, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
};

// Types for cloud storage
import { Transaction, BankAccount, CreditCard, FinancialGoal, CategoryBudget, AutoRule } from './types';

export interface UserCloudData {
  accounts: BankAccount[];
  transactions: Transaction[];
  cards: CreditCard[];
  goals: FinancialGoal[];
  budgets: CategoryBudget[];
  rules: AutoRule[];
}

/**
 * Saves all user data to Firestore
 */
export async function saveUserData(uid: string, data: Partial<UserCloudData>) {
  try {
    const userRef = doc(db, 'users', uid);
    await setDoc(userRef, data, { merge: true });
    console.log('Dados do usuário salvos na nuvem com sucesso.');
  } catch (error) {
    console.error('Erro ao salvar dados na nuvem:', error);
  }
}

/**
 * Fetches user data from Firestore
 */
export async function fetchUserData(uid: string): Promise<UserCloudData | null> {
  try {
    const userRef = doc(db, 'users', uid);
    const docSnap = await getDoc(userRef);
    if (docSnap.exists()) {
      return docSnap.data() as UserCloudData;
    }
    return null;
  } catch (error) {
    console.error('Erro ao buscar dados da nuvem:', error);
    return null;
  }
}
