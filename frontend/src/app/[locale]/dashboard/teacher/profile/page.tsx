'use client';

import { useTranslations } from 'next-intl';
import { TeacherProfileForm } from '@/components/teacher/teacher-profile-form';

export default function TeacherProfilePage() {
  const t = useTranslations();

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        {t('teacher.editProfile')}
      </h1>
      <div className="max-w-2xl rounded-xl bg-white p-6 shadow-sm">
        <TeacherProfileForm />
      </div>
    </div>
  );
}
