import { SessionRoom } from '@/components/session/session-room';

export const dynamic = 'force-dynamic';

export default function StudentSessionRoomPage({
  params,
}: {
  params: { id: string };
}) {
  return <SessionRoom sessionId={params.id} backHref="/dashboard/student/sessions" />;
}
