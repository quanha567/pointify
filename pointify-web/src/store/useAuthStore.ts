import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  sendPasswordResetEmail,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  type User as FirebaseUser,
} from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import {
  syncSessionWithBackend,
  logoutBackendSession,
  updateCurrentProfile,
} from '@/features/auth/api/auth.api';

export interface AuthUserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  role?: 'admin' | 'member';
  status?: 'active' | 'disabled';
  providerId?: string;
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
  loginWithEmail: (email: string, pass: string, rememberMe?: boolean) => Promise<void>;
  registerWithEmail: (
    email: string,
    pass: string,
    displayName: string,
    rememberMe?: boolean,
  ) => Promise<void>;
  loginWithGoogle: (rememberMe?: boolean) => Promise<void>;
  logout: () => Promise<void>;
  continueAsGuest: (name: string) => void;
  clearError: () => void;
  updateProfileData: (displayName: string, photoURL?: string | null) => Promise<void>;
  changePassword: (currentPass: string, newPass: string) => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
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
            const providerId =
              firebaseUser.providerData[0]?.providerId ||
              (firebaseUser.isAnonymous ? 'anonymous' : 'password');

            const profile: AuthUserProfile = {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
              photoURL: firebaseUser.photoURL,
              providerId,
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
              const syncRes = await syncSessionWithBackend(token);
              if (syncRes.success && syncRes.user) {
                set((state) => ({
                  user: state.user
                    ? {
                        ...state.user,
                        role: syncRes.user.role,
                        status: syncRes.user.status,
                      }
                    : null,
                }));
              }
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

      loginWithEmail: async (email: string, pass: string, rememberMe?: boolean) => {
        set({ isLoading: true, error: null });
        try {
          if (typeof rememberMe === 'boolean') {
            await setPersistence(
              auth,
              rememberMe ? browserLocalPersistence : browserSessionPersistence,
            );
          }
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

      registerWithEmail: async (
        email: string,
        pass: string,
        displayName: string,
        rememberMe?: boolean,
      ) => {
        set({ isLoading: true, error: null });
        try {
          if (typeof rememberMe === 'boolean') {
            await setPersistence(
              auth,
              rememberMe ? browserLocalPersistence : browserSessionPersistence,
            );
          }
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

      loginWithGoogle: async (rememberMe?: boolean) => {
        set({ isLoading: true, error: null });
        try {
          if (typeof rememberMe === 'boolean') {
            await setPersistence(
              auth,
              rememberMe ? browserLocalPersistence : browserSessionPersistence,
            );
          }
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

      updateProfileData: async (displayName: string, photoURL?: string | null) => {
        set({ isLoading: true, error: null });
        try {
          const trimmedName = displayName.trim();

          // 1. Optimistic update so UI reflects immediately without page refresh
          set((state) => ({
            user: state.user
              ? {
                  ...state.user,
                  displayName: trimmedName || state.user.displayName,
                  photoURL: photoURL !== undefined ? photoURL : state.user.photoURL,
                }
              : null,
          }));

          // 2. Update Firebase Auth user profile
          if (auth.currentUser) {
            await updateProfile(auth.currentUser, {
              displayName: trimmedName || undefined,
              photoURL: photoURL !== undefined ? photoURL : undefined,
            });
          }

          // 3. Sync to backend database
          try {
            await updateCurrentProfile({
              displayName: trimmedName || undefined,
              photoURL: photoURL !== undefined ? photoURL : undefined,
            });
          } catch (syncErr) {
            console.warn('Backend user profile sync warning (non-blocking):', syncErr);
          }

          set({ isLoading: false });
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : 'Failed to update profile';
          set({ isLoading: false, error: message });
          throw err;
        }
      },

      changePassword: async (currentPass: string, newPass: string) => {
        set({ isLoading: true, error: null });
        try {
          const currentUser = auth.currentUser;
          if (!currentUser || !currentUser.email) {
            throw new Error('No authenticated user with email found');
          }

          // Re-authenticate with current password
          const credential = EmailAuthProvider.credential(currentUser.email, currentPass);
          await reauthenticateWithCredential(currentUser, credential);

          // Update to new password
          await updatePassword(currentUser, newPass);
          set({ isLoading: false });
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : 'Failed to change password';
          set({ isLoading: false, error: message });
          throw err;
        }
      },

      sendPasswordReset: async (email: string) => {
        set({ isLoading: true, error: null });
        try {
          await sendPasswordResetEmail(auth, email.trim());
          set({ isLoading: false });
        } catch (err: unknown) {
          const message =
            err instanceof Error ? err.message : 'Failed to send password reset email';
          set({ isLoading: false, error: message });
          throw err;
        }
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
