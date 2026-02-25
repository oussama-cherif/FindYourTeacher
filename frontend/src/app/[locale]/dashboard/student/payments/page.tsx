'use client';

import { useTranslations } from 'next-intl';
import { StudentPayments } from '@/components/student/student-payments';

export default function StudentPaymentsPage() {
  const t = useTranslations();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">
        {t('student.myPayments')}
      </h1>
      <StudentPayments />
    </div>
  );
}
