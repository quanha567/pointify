import { useMemo } from 'react';
import { useRoomQuery } from '../api/use-room';
import { useRoomStore } from '../context/room-store-context';
import { getFacilitatorKey } from '../utils/facilitator-storage';
import { DECK_CONFIGS, type DeckConfig } from '../constants/deck-configs';
import type { CardValue, ParticipantProjection, RoomProjection } from '../types/room.types';

export interface ActiveRoomState {
  room: RoomProjection | undefined;
  isLoading: boolean;
  error: Error | null;
  isFacilitator: boolean;
  activeDeckConfig: DeckConfig;
  currentParticipantInRoom: ParticipantProjection | undefined;
  selectedCard: CardValue | null;
  isSpectator: boolean;
  isRoundRevealed: boolean;
  currentJiraKey: string | undefined;
  hasJiraStory: boolean;
  consensusPoints: number | null | undefined;
}

export function useActiveRoom(): ActiveRoomState {
  const roomId = useRoomStore((s) => s.roomId);
  const participant = useRoomStore((s) => s.participant);

  const { data: room, isLoading, error } = useRoomQuery(roomId, participant?.id);

  return useMemo(() => {
    const isFacilitator =
      Boolean(getFacilitatorKey(roomId)) ||
      Boolean(participant?.id && room?.facilitatorId === participant.id);

    const activeDeckConfig = DECK_CONFIGS.find((d) => d.id === room?.deckType) || DECK_CONFIGS[0];

    const currentParticipantInRoom = room?.participants.find((p) => p.id === participant?.id);
    const selectedCard = currentParticipantInRoom?.estimatedValue ?? null;
    const isSpectator = currentParticipantInRoom?.isSpectator ?? participant?.isSpectator ?? false;

    const roundStatus = room?.currentRound.status;
    const isRoundRevealed = roundStatus === 'revealed' || roundStatus === 'completed';

    const jiraKeyMatch = room?.currentRound.topic?.match(/([A-Z][A-Z0-9]+-\d+)/);
    const currentJiraKey = room?.currentRound.linkedJiraIssue?.key || jiraKeyMatch?.[1];
    const hasJiraStory = Boolean(currentJiraKey);
    const consensusPoints = room?.currentRound.statistics?.average;

    return {
      room,
      isLoading,
      error: error as Error | null,
      isFacilitator,
      activeDeckConfig,
      currentParticipantInRoom,
      selectedCard,
      isSpectator,
      isRoundRevealed,
      currentJiraKey,
      hasJiraStory,
      consensusPoints,
    };
  }, [roomId, participant, room, isLoading, error]);
}
