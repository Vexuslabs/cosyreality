import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { auth, isFirebaseConfigured } from '../firebase/firebase';
import { UserProfile, AdminRole } from '../types';
import { getUserProfile, saveUserProfile } from '../services/usersService';

interface AuthContextType {
  user: FirebaseUser | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, pass: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  isSalesAdmin: boolean;
  isInventoryManager: boolean;
  canManageSettings: boolean;
  canManageProjects: boolean;
  canManageInventory: boolean;
  canManageLeads: boolean;
  demoLoginAs: (role: AdminRole, name?: string, email?: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_DEMO_USER_KEY = 'cosy_reality_demo_auth_user';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check if demo user saved in localStorage
    const savedDemo = localStorage.getItem(LOCAL_DEMO_USER_KEY);
    if (savedDemo) {
      try {
        const parsed = JSON.parse(savedDemo) as UserProfile;
        setUserProfile(parsed);
        setLoading(false);
      } catch {
        // continue to firebase
      }
    }

    if (isFirebaseConfigured && auth) {
      const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
        setUser(fbUser);
        if (fbUser) {
          try {
            let profile = await getUserProfile(fbUser.uid);
            if (!profile) {
              // If initial user without doc, check if super_admin bootstrap or standard
              profile = {
                uid: fbUser.uid,
                name: fbUser.displayName || fbUser.email?.split('@')[0] || 'Administrator',
                email: fbUser.email || '',
                role: 'super_admin',
                active: true,
                createdAt: Date.now(),
                updatedAt: Date.now(),
              };
              await saveUserProfile(profile);
            }
            setUserProfile(profile);
          } catch (err) {
            console.warn('Error retrieving user profile from Firestore:', err);
          }
        } else if (!localStorage.getItem(LOCAL_DEMO_USER_KEY)) {
          setUserProfile(null);
        }
        setLoading(false);
      });

      return () => unsubscribe();
    } else {
      setLoading(false);
    }
  }, []);

  const signIn = async (email: string, pass: string) => {
    if (isFirebaseConfigured && auth) {
      const cred = await signInWithEmailAndPassword(auth, email, pass);
      const profile = await getUserProfile(cred.user.uid);
      if (profile && !profile.active) {
        await firebaseSignOut(auth);
        throw new Error('This account has been deactivated. Please contact Super Admin.');
      }
      setUser(cred.user);
      if (profile) setUserProfile(profile);
    } else {
      // Offline / dev preview simulation
      const simulatedRole: AdminRole = email.includes('sales')
        ? 'sales_admin'
        : email.includes('inv')
        ? 'inventory_manager'
        : 'super_admin';

      const demoProfile: UserProfile = {
        uid: 'demo_' + Math.random().toString(36).substring(2, 8),
        name: email.split('@')[0] || 'Cosy Reality Admin',
        email,
        role: simulatedRole,
        active: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      setUserProfile(demoProfile);
      localStorage.setItem(LOCAL_DEMO_USER_KEY, JSON.stringify(demoProfile));
    }
  };

  const signOut = async () => {
    localStorage.removeItem(LOCAL_DEMO_USER_KEY);
    if (isFirebaseConfigured && auth) {
      await firebaseSignOut(auth);
    }
    setUser(null);
    setUserProfile(null);
  };

  const resetPassword = async (email: string) => {
    if (isFirebaseConfigured && auth) {
      await sendPasswordResetEmail(auth, email);
    } else {
      console.log('Password reset simulation for:', email);
    }
  };

  const demoLoginAs = (role: AdminRole, name: string = 'Cosy Reality Admin', email?: string) => {
    const demoProfile: UserProfile = {
      uid: 'demo_' + role + '_' + Date.now(),
      name,
      email: email || `${role}@cosyreality.com`,
      role,
      active: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setUserProfile(demoProfile);
    localStorage.setItem(LOCAL_DEMO_USER_KEY, JSON.stringify(demoProfile));
  };

  const role = userProfile?.role;
  const isAdmin = !!role && ['super_admin', 'sales_admin', 'inventory_manager'].includes(role);
  const isSuperAdmin = role === 'super_admin';
  const isSalesAdmin = role === 'sales_admin';
  const isInventoryManager = role === 'inventory_manager';

  const canManageSettings = isSuperAdmin;
  const canManageProjects = isSuperAdmin || isSalesAdmin;
  const canManageInventory = isSuperAdmin || isInventoryManager;
  const canManageLeads = isSuperAdmin || isSalesAdmin || isInventoryManager;

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        loading,
        signIn,
        signOut,
        resetPassword,
        isAdmin,
        isSuperAdmin,
        isSalesAdmin,
        isInventoryManager,
        canManageSettings,
        canManageProjects,
        canManageInventory,
        canManageLeads,
        demoLoginAs,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
