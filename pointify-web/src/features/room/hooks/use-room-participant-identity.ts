import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/useAuthStore';
import {
  getStoredParticipant,
  setStoredParticipant,
  type StoredParticipant,
} from '../utils/participant-session';

/**
 * Manages participant identity for a room session:
 * - Restores from sessionStorage
 * - Auto-creates from authenticated user
 * - Syncs when auth state changes
 * - Manages join dialog visibility
 */
export function useRoomParticipantIdentity(roomId: string) {
  const { t } = useTranslation('room');
  const { user, isInitialized } = useAuthStore();

  const [participant, setParticipant] = useState<StoredParticipant | null>(() => {
    // 1. Prioritize authenticated user if available
    if (user?.uid) {
      const authParticipant: StoredParticipant = {
        id: user.uid,
        displayName: user.displayName || 'Tài khoản',
        photoURL: user.photoURL || null,
        isGuest: false,
        isSpectator: false,
      };
      setStoredParticipant(roomId, authParticipant);
      return authParticipant;
    }

    // 2. Fall back to stored session in sessionStorage
    const stored = getStoredParticipant(roomId);
    if (stored) return stored;

    return null;
  });

  const [isJoinDialogOpen, setIsJoinDialogOpen] = useState(
    () => isInitialized && !participant && !user?.uid,
  );

  // Synchronize when auth state resolves
  useEffect(() => {
    if (user?.uid) {
      if (participant?.id === user.uid) return;
      const authParticipant: StoredParticipant = {
        id: user.uid,
        displayName: user.displayName || 'Tài khoản',
        photoURL: user.photoURL || null,
        isGuest: false,
        isSpectator: false,
      };
      setStoredParticipant(roomId, authParticipant);
      setParticipant(authParticipant);
      setIsJoinDialogOpen(false);
    } else if (isInitialized && !participant) {
      setIsJoinDialogOpen(true);
    }
  }, [user, roomId, participant, isInitialized]);

  const handleJoinSubmit = useCallback(
    (newParticipant: StoredParticipant, joinRoom: (p: StoredParticipant) => void) => {
      joinRoom(newParticipant);
      setParticipant(newParticipant);
      setIsJoinDialogOpen(false);
      toast.success(t('room.joinedSuccess'));
    },
    [t],
  );

  const handleParticipantJoined = useCallback((p: StoredParticipant) => {
    setParticipant(p);
    setIsJoinDialogOpen(false);
  }, []);

  return {
    participant,
    isJoinDialogOpen,
    handleJoinSubmit,
    handleParticipantJoined,
  };
}
