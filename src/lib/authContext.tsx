'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, onAuthStateChanged, signInWithPopup, signOut, GoogleAuthProvider } from 'firebase/auth';
import { auth, googleProvider, db } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useAgentStore } from '@/store/agentStore';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signInWithGoogle: async () => {},
  logout: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      // If user changes or logs out, clear the local chat state
      if (!currentUser || (user && currentUser.uid !== user.uid)) {
        useAgentStore.getState().clearLocalChat();
      }
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      const result = await signInWithPopup(auth, googleProvider);
      
      // Extract Google OAuth token for Calendar API
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential?.accessToken;
      
      if (token && result.user) {
        try {
          // Save token to Firestore so API routes can use it securely
          const userRef = doc(db, 'users', result.user.uid);
          await setDoc(userRef, {
            calendarToken: token,
            email: result.user.email,
            lastLogin: new Date().toISOString()
          }, { merge: true });
        } catch (dbError) {
          console.warn('Failed to save to Firestore. Did you create the database in the console?', dbError);
        }
      }

      router.push('/chat'); // Redirect to chat after successful login
    } catch (error) {
      console.error('Error signing in with Google', error);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      router.push('/');
    } catch (error) {
      console.error('Error signing out', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
