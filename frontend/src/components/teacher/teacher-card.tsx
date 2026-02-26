'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

interface TeacherCardProps {
  teacher: {
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
  };
}

export function TeacherCard({ teacher }: TeacherCardProps) {
  const t = useTranslations();
  const profile = teacher.teacherProfile;

  return (
    <div className="rounded-xl bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start gap-4">
        {/* Avatar placeholder */}
        <div className="h-12 w-12 flex-shrink-0 rounded-full bg-blue-100 flex items-center justify-center">
          <span className="text-lg font-semibold text-blue-600">
            {teacher.fullName.charAt(0).toUpperCase()}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-gray-900 truncate">
              {teacher.fullName}
            </h3>
            {profile?.hasStarBadge && (
              <span className="text-yellow-500" title="Star teacher">
                ★
              </span>
            )}
          </div>
          {profile?.languages && profile.languages.length > 0 && (
            <div className="mt-1 flex flex-wrap gap-1">
              {profile.languages.map((lang) => (
                <span
                  key={lang}
                  className="inline-block rounded bg-blue-50 px-2 py-0.5 text-xs text-blue-700"
                >
                  {t(`languageOptions.${lang}`)}
                </span>
              ))}
            </div>
          )}
          {profile?.audienceTypes && profile.audienceTypes.length > 0 && (
            <div className="mt-1 flex flex-wrap gap-1">
              {profile.audienceTypes.map((aud) => (
                <span
                  key={aud}
                  className="inline-block rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600"
                >
                  {t(`audienceOptions.${aud}`)}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {profile?.bio && (
        <p className="mt-3 text-sm text-gray-600 line-clamp-2">
          {profile.bio}
        </p>
      )}

      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {profile?.averageRating && (
            <span className="text-sm text-yellow-500">
              ★ {Number(profile.averageRating).toFixed(1)}
            </span>
          )}
          <span className="text-sm text-gray-500">
            {t('teachers.recommendations', {
              count: profile?.recommendationCount ?? 0,
            })}
          </span>
        </div>
        <Link
          href={`/teachers/${teacher.id}`}
          className="text-sm font-medium text-blue-600 hover:underline"
        >
          {t('teachers.viewProfile')}
        </Link>
      </div>
    </div>
  );
}
