'use client';

import { useTranslations } from 'next-intl';
import { TeacherSessionsManager } from '@/components/teacher/teacher-sessions-manager';

export default function TeacherSessionsPage() {
  const t = useTranslations();

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">
        {t('teacher.sessions')}
      </h1>
      <div className="mt-6">
        <TeacherSessionsManager />
      </div>
    </div>
  );
}
