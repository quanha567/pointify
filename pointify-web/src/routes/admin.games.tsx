import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/admin/games')({
  beforeLoad: () => {
    throw redirect({ to: '/admin/rooms' });
  },
  component: () => null,
});
