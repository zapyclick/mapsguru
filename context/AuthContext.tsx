import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, User as FirebaseUser } from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp, updateDoc, Timestamp } from 'firebase/firestore';
import { auth, db, isFirebaseConfigured } from '../services/firebase.ts';
import { User, UserDocument, UserPlan } from '../types.ts';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
  canUserGeneratePost: () => Promise<boolean>;
  incrementUserPostCount: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper to check if a week has passed
const hasWeekPassed = (startDate: Date): boolean => {
    const oneWeekInMs = 7 * 24 * 60 * 60 * 1000;
    const now = new Date();
    return now.getTime() - startDate.getTime() >= oneWeekInMs;
};

// FIX: Made children optional to resolve a TypeScript error in App.tsx where
// the compiler incorrectly reported that the 'children' prop was missing.
export const AuthProvider = ({ children }: { children?: ReactNode }) => {
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
        // Fetch user document from Firestore to get their plan and usage data
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const userDocSnap = await getDoc(userDocRef);
        
        const defaultUser: User = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            plan: 'free',
            postCount: 0,
            lastPostResetDate: new Date(),
            subscriptionEndDate: null,
        };

        if (userDocSnap.exists()) {
            const data = userDocSnap.data() as UserDocument;
            setUser({
                ...defaultUser,
                plan: data.plan || 'free',
                postCount: data.postCount || 0,
                lastPostResetDate: (data.lastPostResetDate as Timestamp)?.toDate() || new Date(),
                subscriptionEndDate: (data.subscriptionEndDate as Timestamp)?.toDate() || null,
            });
        } else {
            // This case might happen for users created before the system had firestore docs
            setUser(defaultUser);
        }
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
        
        // Initialize user document with free plan defaults
        const userDoc: UserDocument = {
            uid: newUser.uid,
            email: newUser.email!,
            createdAt: serverTimestamp(),
            plan: 'free',
            postCount: 0,
            lastPostResetDate: serverTimestamp(),
        };
        await setDoc(doc(db, 'users', newUser.uid), userDoc);

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
  
  const canUserGeneratePost = async (): Promise<boolean> => {
    if (!user) return false;

    // Pro and Courtesy users have unlimited access as long as their subscription is valid
    if (user.plan === 'pro' || user.plan === 'cortesia') {
        if(user.subscriptionEndDate && user.subscriptionEndDate > new Date()) {
            return true;
        }
        // Handle expired subscription case (though a backend job should ideally handle this)
        return false;
    }
    
    // Free user logic
    if (user.plan === 'free') {
      const userDocRef = doc(db, 'users', user.uid);
      
      // Check if a week has passed to reset the counter
      if (user.lastPostResetDate && hasWeekPassed(user.lastPostResetDate)) {
        await updateDoc(userDocRef, { postCount: 0, lastPostResetDate: serverTimestamp() });
        setUser(prevUser => prevUser ? { ...prevUser, postCount: 0, lastPostResetDate: new Date() } : null);
        return true;
      }
      // If week has not passed, check if they are under the limit
      return user.postCount < 1;
    }

    return false;
  };

  const incrementUserPostCount = async (): Promise<void> => {
      if (!user || user.plan !== 'free') return;

      const newCount = user.postCount + 1;
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, { postCount: newCount });
      setUser(prevUser => prevUser ? { ...prevUser, postCount: newCount } : null);
  };


  const isAuthenticated = !!user;
  
  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    register,
    logout,
    canUserGeneratePost,
    incrementUserPostCount,
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