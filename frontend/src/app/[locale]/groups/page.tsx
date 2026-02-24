'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useQuery } from '@tanstack/react-query';
import { Link } from '@/i18n/navigation';
import { LanguageSwitcher } from '@/components/language-switcher';
import { GroupCard } from '@/components/groups/group-card';
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

const LEVEL_KEYS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const;

export default function BrowseGroupsPage() {
  const t = useTranslations();
  const [language, setLanguage] = useState('');
  const [level, setLevel] = useState('');
  const [audienceType, setAudienceType] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['groups', 'list', page, language, level, audienceType],
    queryFn: () => {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', '12');
      if (language) params.set('language', language);
      if (level) params.set('level', level);
      if (audienceType) params.set('audienceType', audienceType);
      return axios
        .get(
          `${process.env.NEXT_PUBLIC_API_URL}/groups?${params.toString()}`,
        )
        .then((r) => r.data);
    },
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
        <Link href="/" className="text-xl font-bold text-blue-600">
          {t('common.appName')}
        </Link>
        <div className="flex items-center gap-4">
          <LanguageSwitcher />
          <Link
            href="/login"
            className="text-gray-700 hover:text-blue-600 transition-colors"
          >
            {t('common.login')}
          </Link>
        </div>
      </nav>

      <div className="mx-auto max-w-6xl px-6 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          {t('groups.browseTitle')}
        </h1>

        {/* Filters */}
        <div className="mb-8 flex flex-wrap gap-4">
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
            value={level}
            onChange={(e) => {
              setLevel(e.target.value);
              setPage(1);
            }}
            className="rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">{t('groups.allLevels')}</option>
            {LEVEL_KEYS.map((key) => (
              <option key={key} value={key}>
                {t(`levelOptions.${key}`)}
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
          <p className="text-gray-500">{t('groups.noGroups')}</p>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {data?.data?.map(
                (group: {
                  id: string;
                  name: string;
                  language: string;
                  level: string;
                  audienceType: string;
                  maxStudents: number;
                  pricePerSession: string;
                  teacher: {
                    user: {
                      id: string;
                      fullName: string;
                      avatarUrl: string | null;
                    };
                  };
                  _count: { memberships: number };
                }) => <GroupCard key={group.id} group={group} />,
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
