import { TeacherPublicProfile } from '@/components/teacher/teacher-public-profile';

export const dynamic = 'force-dynamic';

export default function TeacherProfilePage({
  params,
}: {
  params: { id: string };
}) {
  return <TeacherPublicProfile teacherId={params.id} />;
}
