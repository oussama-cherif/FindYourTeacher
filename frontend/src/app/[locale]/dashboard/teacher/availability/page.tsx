'use client';

import { useTranslations } from 'next-intl';
import { AvailabilityManager } from '@/components/teacher/availability-manager';

export default function TeacherAvailabilityPage() {
  const t = useTranslations();

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        {t('teacher.manageAvailability')}
      </h1>
      <AvailabilityManager />
    </div>
  );
}
