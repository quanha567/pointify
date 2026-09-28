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
  const { user } = useAuthStore();

  const [participant, setParticipant] = useState<StoredParticipant | null>(() => {
    const stored = getStoredParticipant(roomId);
    if (stored) return stored;

    // Auto-create from authenticated user if available
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

    return null;
  });

  const [isJoinDialogOpen, setIsJoinDialogOpen] = useState(!participant);

  // Synchronize when auth changes
  useEffect(() => {
    if (!participant && user?.uid) {
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
    }
  }, [user, roomId, participant]);

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
