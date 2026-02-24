import { TeacherGroupDetail } from '@/components/teacher/teacher-group-detail';

export const dynamic = 'force-dynamic';

export default function TeacherGroupDetailPage({
  params,
}: {
  params: { id: string };
}) {
  return <TeacherGroupDetail groupId={params.id} />;
}
