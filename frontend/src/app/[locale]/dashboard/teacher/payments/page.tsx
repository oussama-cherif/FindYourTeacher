'use client';

import { useTranslations } from 'next-intl';
import { TeacherEarnings } from '@/components/teacher/teacher-earnings';

export default function TeacherPaymentsPage() {
  const t = useTranslations();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">
        {t('teacher.earnings')}
      </h1>
      <TeacherEarnings />
    </div>
  );
}
