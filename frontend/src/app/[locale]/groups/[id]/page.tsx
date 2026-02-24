import { GroupPublicDetail } from '@/components/groups/group-public-detail';

export const dynamic = 'force-dynamic';

export default function GroupDetailPage({
  params,
}: {
  params: { id: string };
}) {
  return <GroupPublicDetail groupId={params.id} />;
}
