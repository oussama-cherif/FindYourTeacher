'use client';

import { useTranslations } from 'next-intl';
import { useQuery } from '@tanstack/react-query';
import { Link } from '@/i18n/navigation';
import { LanguageSwitcher } from '@/components/language-switcher';
import axios from 'axios';

interface TeacherPublicProfile {
  id: string;
  fullName: string;
  avatarUrl?: string | null;
  createdAt: string;
  teacherProfile: {
    bio?: string | null;
    languages: string[];
    audienceTypes: string[];
    recommendationCount: number;
    hasStarBadge: boolean;
  };
  availabilitySlots: {
    id: string;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
  }[];
}

export function TeacherPublicProfile({ teacherId }: { teacherId: string }) {
  const t = useTranslations();

  const { data: teacher, isLoading } = useQuery<TeacherPublicProfile>({
    queryKey: ['teachers', 'profile', teacherId],
    queryFn: () =>
      axios
        .get(`${process.env.NEXT_PUBLIC_API_URL}/teachers/${teacherId}`)
        .then((r) => r.data),
  });

  // Group slots by day
  const slotsByDay = new Map<number, NonNullable<TeacherPublicProfile>['availabilitySlots']>();
  if (teacher?.availabilitySlots) {
    for (const slot of teacher.availabilitySlots) {
      const existing = slotsByDay.get(slot.dayOfWeek) ?? [];
      existing.push(slot);
      slotsByDay.set(slot.dayOfWeek, existing);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
        <Link href="/" className="text-xl font-bold text-blue-600">
          {t('common.appName')}
        </Link>
        <div className="flex items-center gap-4">
          <LanguageSwitcher />
          <Link
            href="/teachers"
            className="text-gray-700 hover:text-blue-600 transition-colors"
          >
            {t('common.back')}
          </Link>
        </div>
      </nav>

      <div className="mx-auto max-w-3xl px-6 py-8">
        {isLoading ? (
          <p className="text-gray-500">{t('common.loading')}</p>
        ) : !teacher ? (
          <p className="text-gray-500">{t('teachers.noResults')}</p>
        ) : (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start gap-4">
              <div className="h-16 w-16 flex-shrink-0 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-2xl font-semibold text-blue-600">
                  {teacher.fullName.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold text-gray-900">
                    {teacher.fullName}
                  </h1>
                  {teacher.teacherProfile.hasStarBadge && (
                    <span className="text-yellow-500 text-xl">★</span>
                  )}
                </div>
                <p className="text-sm text-gray-500">
                  {t('teachers.memberSince', {
                    date: new Date(teacher.createdAt).toLocaleDateString(),
                  })}
                </p>
                <p className="text-sm text-gray-500">
                  {t('teachers.recommendations', {
                    count: teacher.teacherProfile.recommendationCount,
                  })}
                </p>
              </div>
            </div>

            {/* Languages & audience */}
            <div className="rounded-xl bg-white p-6 shadow-sm">
              <div className="flex flex-wrap gap-2 mb-3">
                {teacher.teacherProfile.languages.map((lang) => (
                  <span
                    key={lang}
                    className="inline-block rounded bg-blue-50 px-3 py-1 text-sm text-blue-700"
                  >
                    {t(`languageOptions.${lang}`)}
                  </span>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                {teacher.teacherProfile.audienceTypes.map((aud) => (
                  <span
                    key={aud}
                    className="inline-block rounded bg-gray-100 px-3 py-1 text-sm text-gray-600"
                  >
                    {t(`audienceOptions.${aud}`)}
                  </span>
                ))}
              </div>
            </div>

            {/* Bio */}
            {teacher.teacherProfile.bio && (
              <div className="rounded-xl bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 mb-3">
                  {t('teacher.bio')}
                </h2>
                <p className="text-gray-700 whitespace-pre-line">
                  {teacher.teacherProfile.bio}
                </p>
              </div>
            )}

            {/* Availability */}
            <div className="rounded-xl bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                {t('teachers.availableSlots')}
              </h2>
              {teacher.availabilitySlots.length === 0 ? (
                <p className="text-gray-500">{t('teacher.noSlots')}</p>
              ) : (
                <div className="space-y-3">
                  {[0, 1, 2, 3, 4, 5, 6].map((day) => {
                    const daySlots = slotsByDay.get(day);
                    if (!daySlots || daySlots.length === 0) return null;
                    return (
                      <div key={day}>
                        <h4 className="text-sm font-medium text-gray-700 mb-1">
                          {t(`days.${day}`)}
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {daySlots.map((slot) => (
                            <span
                              key={slot.id}
                              className="rounded border border-gray-200 bg-gray-50 px-3 py-1 text-sm text-gray-700"
                            >
                              {slot.startTime} – {slot.endTime}
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Book button (disabled for now) */}
            <button
              disabled
              className="w-full rounded-lg bg-blue-600 px-4 py-3 text-white opacity-50 cursor-not-allowed"
            >
              {t('teachers.bookingSoon')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
