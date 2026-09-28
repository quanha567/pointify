import { useQuery, useMutation, useQueryClient, queryOptions } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { createRoomApi, getRoomApi } from './room.api';
import { saveFacilitatorKey } from '../utils/facilitator-storage';
import { useAppStore } from '@/store/useAppStore';
import type { CreateRoomDto, DeckType, ParticipantRole } from '../types/room.types';

export const roomKeys = {
  all: ['rooms'] as const,
  details: () => [...roomKeys.all, 'detail'] as const,
  detail: (roomId: string) => [...roomKeys.details(), roomId] as const,
};

export const roomQueries = {
  detail: (roomId: string, viewerId?: string) =>
    queryOptions({
      queryKey: roomKeys.detail(roomId),
      queryFn: () => getRoomApi(roomId, viewerId),
      enabled: Boolean(roomId),
      staleTime: 1000 * 5, // 5 seconds
    }),
};

export function useRoomQuery(roomId: string, viewerId?: string) {
  return useQuery(roomQueries.detail(roomId, viewerId));
}

export function useCreateRoomMutation(options?: { onSuccess?: () => void }) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { t } = useTranslation(['room', 'common']);
  const { addRecentRoom } = useAppStore();

  return useMutation({
    mutationFn: (payload: CreateRoomDto) => createRoomApi(payload),
    onSuccess: (res) => {
      const room = res.room;
      // 1. Save Facilitator Key in local storage for session persistence
      if (res.facilitatorKey) {
        saveFacilitatorKey(room.id, res.facilitatorKey);
      }

      // 2. Add to recent rooms list
      addRecentRoom({
        code: room.id,
        name: room.name,
        deckType: room.deckType as DeckType,
        lastVisited: t('recentRooms.justNow'),
        role: 'estimator' as ParticipantRole,
      });

      // 3. Invalidate/seed room cache
      queryClient.setQueryData(roomKeys.detail(room.id), room);

      // 4. Toast notification
      toast.success(t('createRoom.successToast', { name: room.name, code: room.id }));

      // 5. Trigger optional callback (e.g. close modal)
      options?.onSuccess?.();

      // 6. Navigate directly to the room
      void navigate({
        to: '/rooms/$roomId',
        params: { roomId: room.id },
      });
    },
    onError: (err: Error) => {
      toast.error(err?.message || t('common:common.error'));
    },
  });
}
