import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import { User } from '../types';
import { User as FirebaseUser } from 'firebase/auth'; // Apenas para tipagem

// --- Configuração e Inicialização ---

// Suas credenciais do Firebase (SUBSTITUA PELAS SUAS)
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Inicializa o Firebase apenas uma vez
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

// Obtém as instâncias dos serviços usando a sintaxe v8
const auth = firebase.auth();
const db = firebase.firestore();

// --- Funções de Autenticação ---

/**
 * Cadastra um novo usuário e cria seu perfil no Firestore.
 */
export const signUp = async (email: string, password: string): Promise<FirebaseUser> => {
    const userCredential = await auth.createUserWithEmailAndPassword(email, password);
    const user = userCredential.user;

    if (!user) {
      throw new Error("Falha ao criar usuário.");
    }

    const trialEndDate = new Date();
    trialEndDate.setDate(trialEndDate.getDate() + 14);

    const newUserProfile: User = {
        uid: user.uid,
        email: user.email!,
        plan: 'trial',
        registrationDate: new Date().toISOString(),
        trialEndDate: trialEndDate.toISOString()
    };
    
    // A sintaxe do Firestore v8
    await db.collection("users").doc(user.uid).set(newUserProfile);
    
    return user as FirebaseUser;
};

/**
 * Autentica um usuário existente.
 */
export const signIn = async (email: string, password: string): Promise<FirebaseUser> => {
    const userCredential = await auth.signInWithEmailAndPassword(email, password);
    if (!userCredential.user) {
        throw new Error("Usuário não encontrado após o login.");
    }
    return userCredential.user as FirebaseUser;
};

/**
 * Desconecta o usuário atual.
 */
export const signOut = (): Promise<void> => {
    return auth.signOut();
};

/**
 * Observa mudanças no estado de autenticação.
 */
export const onAuthChange = (callback: (user: FirebaseUser | null) => void) => {
    return auth.onAuthStateChanged(callback);
};

// --- Funções do Firestore ---

/**
 * Busca o perfil de um usuário no Firestore.
 */
export const getUserProfile = async (uid: string): Promise<User | null> => {
    const userDocRef = db.collection("users").doc(uid);
    const userDocSnap = await userDocRef.get();

    if (userDocSnap.exists) {
        return userDocSnap.data() as User;
    } else {
        console.warn(`Nenhum perfil de usuário encontrado para o UID: ${uid}`);
        return null;
    }
};

// Exporta as instâncias para uso direto se necessário
export { auth, db };
