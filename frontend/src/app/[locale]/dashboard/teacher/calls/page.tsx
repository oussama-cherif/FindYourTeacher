'use client';

import { useTranslations } from 'next-intl';
import { TeacherCallsList } from '@/components/teacher/teacher-calls-list';

export default function TeacherCallsPage() {
  const t = useTranslations();

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">
        {t('teacher.calls')}
      </h1>
      <div className="mt-6">
        <TeacherCallsList />
      </div>
    </div>
  );
}
