import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, User as FirebaseUser } from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, isFirebaseConfigured } from '../services/firebase.ts';
import { User, UserDocument, UserPlan } from '../types.ts';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isFirebaseConfigured()) {
        console.warn("Firebase não está configurado. O sistema de autenticação está desabilitado. Cole suas credenciais em 'services/firebase.ts'.");
        setLoading(false);
        return;
    }
    
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        // Fetch user document from Firestore to get their plan
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const userDocSnap = await getDoc(userDocRef);
        
        let userPlan: UserPlan = 'free'; // Default to 'free'
        if (userDocSnap.exists()) {
            const userData = userDocSnap.data() as UserDocument;
            userPlan = userData.plan || 'free';
        }

        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          plan: userPlan,
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const register = async (email: string, password: string): Promise<void> => {
     if (!isFirebaseConfigured()) {
        throw new Error("A configuração do Firebase está incompleta. Verifique o arquivo 'services/firebase.ts'.");
    }
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const newUser = userCredential.user;
        
        await setDoc(doc(db, 'users', newUser.uid), {
            uid: newUser.uid,
            email: newUser.email,
            createdAt: serverTimestamp(),
            plan: 'free',
        } as UserDocument);

    } catch (error: any) {
        if (error.code === 'auth/email-already-in-use') {
            throw new Error('Este email já está em uso.');
        } else if (error.code === 'auth/weak-password') {
            throw new Error('A senha deve ter pelo menos 6 caracteres.');
        }
        throw new Error('Ocorreu um erro ao criar a conta.');
    }
  };

  const login = async (email: string, password: string): Promise<void> => {
    if (!isFirebaseConfigured()) {
        throw new Error("A configuração do Firebase está incompleta. Verifique o arquivo 'services/firebase.ts'.");
    }
    try {
        await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any)
 {
        if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
            throw new Error('Email ou senha incorretos.');
        }
        throw new Error('Ocorreu um erro ao fazer login.');
    }
  };

  const logout = async () => {
    if (isFirebaseConfigured()) {
        await signOut(auth);
    }
    setUser(null);
  };

  const isAuthenticated = !!user;
  
  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};