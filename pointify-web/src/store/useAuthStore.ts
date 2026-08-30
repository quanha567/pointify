import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  onAuthStateChanged,
  type User as FirebaseUser,
} from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import { syncSessionWithBackend, logoutBackendSession } from '@/lib/api';

export interface AuthUserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

interface AuthState {
  user: AuthUserProfile | null;
  isGuest: boolean;
  guestName: string | null;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;

  // Actions
  initAuthListener: () => () => void;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  registerWithEmail: (email: string, pass: string, displayName: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  continueAsGuest: (name: string) => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isGuest: false,
      guestName: null,
      isLoading: false,
      isInitialized: false,
      error: null,

      initAuthListener: () => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
          if (firebaseUser) {
            const profile: AuthUserProfile = {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
              photoURL: firebaseUser.photoURL,
            };

            set({
              user: profile,
              isGuest: false,
              guestName: null,
              isLoading: false,
              isInitialized: true,
            });

            // Synchronize with Fastify backend & Firestore
            try {
              const token = await firebaseUser.getIdToken();
              await syncSessionWithBackend(token);
            } catch (syncErr) {
              console.warn('Background backend session sync notice:', syncErr);
            }
          } else {
            set((state) => ({
              user: null,
              isLoading: false,
              isInitialized: true,
              // Retain guest status if already guest
              isGuest: state.isGuest,
              guestName: state.guestName,
            }));
          }
        });
        return unsubscribe;
      },

      loginWithEmail: async (email: string, pass: string) => {
        set({ isLoading: true, error: null });
        try {
          const result = await signInWithEmailAndPassword(auth, email.trim(), pass);
          const profile: AuthUserProfile = {
            uid: result.user.uid,
            email: result.user.email,
            displayName: result.user.displayName || result.user.email?.split('@')[0] || 'User',
            photoURL: result.user.photoURL,
          };

          set({
            user: profile,
            isGuest: false,
            guestName: null,
            isLoading: false,
          });

          const token = await result.user.getIdToken();
          await syncSessionWithBackend(token);
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : 'Failed to sign in';
          set({ isLoading: false, error: message });
          throw err;
        }
      },

      registerWithEmail: async (email: string, pass: string, displayName: string) => {
        set({ isLoading: true, error: null });
        try {
          const result = await createUserWithEmailAndPassword(auth, email.trim(), pass);
          if (displayName.trim()) {
            await updateProfile(result.user, { displayName: displayName.trim() });
          }
          const profile: AuthUserProfile = {
            uid: result.user.uid,
            email: result.user.email,
            displayName: displayName.trim() || result.user.email?.split('@')[0] || 'User',
            photoURL: result.user.photoURL,
          };

          set({
            user: profile,
            isGuest: false,
            guestName: null,
            isLoading: false,
          });

          const token = await result.user.getIdToken();
          await syncSessionWithBackend(token);
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : 'Failed to create account';
          set({ isLoading: false, error: message });
          throw err;
        }
      },

      loginWithGoogle: async () => {
        set({ isLoading: true, error: null });
        try {
          const result = await signInWithPopup(auth, googleProvider);
          const profile: AuthUserProfile = {
            uid: result.user.uid,
            email: result.user.email,
            displayName: result.user.displayName || 'Google User',
            photoURL: result.user.photoURL,
          };

          set({
            user: profile,
            isGuest: false,
            guestName: null,
            isLoading: false,
          });

          const token = await result.user.getIdToken();
          await syncSessionWithBackend(token);
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : 'Google sign-in failed';
          set({ isLoading: false, error: message });
          throw err;
        }
      },

      logout: async () => {
        set({ isLoading: true, error: null });
        try {
          await logoutBackendSession();
          await signOut(auth);
          set({
            user: null,
            isGuest: false,
            guestName: null,
            isLoading: false,
          });
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : 'Failed to sign out';
          set({ isLoading: false, error: message });
          throw err;
        }
      },

      continueAsGuest: (name: string) => {
        set({
          user: null,
          isGuest: true,
          guestName: name.trim() || 'Guest Estimator',
          isLoading: false,
          error: null,
        });
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'pointify_auth_session',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        isGuest: state.isGuest,
        guestName: state.guestName,
      }),
    },
  ),
);
