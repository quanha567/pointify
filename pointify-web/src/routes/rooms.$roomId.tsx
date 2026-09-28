import { createFileRoute, useParams } from '@tanstack/react-router';
import { RoomProvider } from '@/features/room/context/room-store-context';
import { RoomPage } from '@/features/room/components/room-page';

export const Route = createFileRoute('/rooms/$roomId')({
  component: RoomRoutePage,
});

function RoomRoutePage() {
  const { roomId } = useParams({ from: '/rooms/$roomId' });

  return (
    <RoomProvider roomId={roomId} participant={null}>
      <RoomPage roomId={roomId} />
    </RoomProvider>
  );
}
