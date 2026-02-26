'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Link } from '@/i18n/navigation';
import { LanguageSwitcher } from '@/components/language-switcher';
import { TeacherCard } from '@/components/teacher/teacher-card';
import axios from 'axios';

const LANGUAGE_KEYS = [
  'french',
  'english',
  'arabic',
  'german',
  'spanish',
  'italian',
] as const;

const AUDIENCE_KEYS = ['kids', 'adults', 'workers', 'elderly'] as const;

export default function BrowseTeachersPage() {
  const t = useTranslations();
  const [currentUser, setCurrentUser] = useState<{ role: string } | null>(null);

  useEffect(() => {
    api.get('/users/me').then(({ data }) => setCurrentUser(data)).catch(() => {});
  }, []);

  const dashboardPath = currentUser?.role === 'TEACHER'
    ? '/dashboard/teacher'
    : '/dashboard/student';

  const [search, setSearch] = useState('');
  const [language, setLanguage] = useState('');
  const [audienceType, setAudienceType] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['teachers', 'list', page, search, language, audienceType],
    queryFn: () => {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', '12');
      if (search) params.set('search', search);
      if (language) params.set('language', language);
      if (audienceType) params.set('audienceType', audienceType);
      return axios
        .get(
          `${process.env.NEXT_PUBLIC_API_URL}/teachers?${params.toString()}`,
        )
        .then((r) => r.data);
    },
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Nav */}
      <nav className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
        <Link href="/" className="text-xl font-bold text-blue-600">
          {t('common.appName')}
        </Link>
        <div className="flex items-center gap-4">
          <LanguageSwitcher />
          {currentUser ? (
            <Link
              href={dashboardPath}
              className="text-gray-700 hover:text-blue-600 transition-colors"
            >
              {t('common.myDashboard')}
            </Link>
          ) : (
            <Link
              href="/login"
              className="text-gray-700 hover:text-blue-600 transition-colors"
            >
              {t('common.login')}
            </Link>
          )}
        </div>
      </nav>

      <div className="mx-auto max-w-6xl px-6 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          {t('teachers.browseTitle')}
        </h1>

        {/* Filters */}
        <div className="mb-8 flex flex-wrap gap-4">
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder={t('teachers.searchPlaceholder')}
            className="rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <select
            value={language}
            onChange={(e) => {
              setLanguage(e.target.value);
              setPage(1);
            }}
            className="rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">{t('teachers.allLanguages')}</option>
            {LANGUAGE_KEYS.map((key) => (
              <option key={key} value={key}>
                {t(`languageOptions.${key}`)}
              </option>
            ))}
          </select>

          <select
            value={audienceType}
            onChange={(e) => {
              setAudienceType(e.target.value);
              setPage(1);
            }}
            className="rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">{t('teachers.allAudiences')}</option>
            {AUDIENCE_KEYS.map((key) => (
              <option key={key} value={key}>
                {t(`audienceOptions.${key}`)}
              </option>
            ))}
          </select>
        </div>

        {/* Results */}
        {isLoading ? (
          <p className="text-gray-500">{t('common.loading')}</p>
        ) : data?.data?.length === 0 ? (
          <p className="text-gray-500">{t('teachers.noResults')}</p>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {data?.data?.map(
                (teacher: {
                  id: string;
                  fullName: string;
                  avatarUrl?: string | null;
                  teacherProfile: {
                    bio?: string | null;
                    languages: string[];
                    audienceTypes: string[];
                    recommendationCount: number;
                    hasStarBadge: boolean;
                    averageRating?: string | null;
                  } | null;
                }) => (
                  <TeacherCard key={teacher.id} teacher={teacher} />
                ),
              )}
            </div>

            {/* Pagination */}
            {data?.meta && data.meta.totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-4">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm disabled:opacity-50 hover:bg-gray-100 transition-colors"
                >
                  {t('common.previous')}
                </button>
                <span className="text-sm text-gray-600">
                  {page} / {data.meta.totalPages}
                </span>
                <button
                  onClick={() =>
                    setPage((p) => Math.min(data.meta.totalPages, p + 1))
                  }
                  disabled={page >= data.meta.totalPages}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm disabled:opacity-50 hover:bg-gray-100 transition-colors"
                >
                  {t('common.next')}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
