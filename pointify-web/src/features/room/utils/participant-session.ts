export interface StoredParticipant {
  id: string;
  displayName: string;
  photoURL: string | null;
  isGuest: boolean;
  isSpectator: boolean;
}

const PARTICIPANT_SESSION_PREFIX = 'pointify_participant_';

export function getStoredParticipant(roomId: string): StoredParticipant | null {
  if (!roomId) return null;
  try {
    const raw = sessionStorage.getItem(`${PARTICIPANT_SESSION_PREFIX}${roomId}`);
    if (!raw) return null;
    return JSON.parse(raw) as StoredParticipant;
  } catch (error) {
    console.error('Failed to parse stored participant session:', error);
    return null;
  }
}

export function setStoredParticipant(roomId: string, participant: StoredParticipant): void {
  if (!roomId || !participant) return;
  try {
    sessionStorage.setItem(`${PARTICIPANT_SESSION_PREFIX}${roomId}`, JSON.stringify(participant));
  } catch (error) {
    console.error('Failed to save stored participant session:', error);
  }
}

export function clearStoredParticipant(roomId: string): void {
  if (!roomId) return;
  try {
    sessionStorage.removeItem(`${PARTICIPANT_SESSION_PREFIX}${roomId}`);
  } catch (error) {
    console.error('Failed to clear stored participant session:', error);
  }
}
