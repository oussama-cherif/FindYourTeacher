'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

const LANGUAGE_KEYS = [
  'french',
  'english',
  'arabic',
  'german',
  'spanish',
  'italian',
] as const;

const AUDIENCE_KEYS = ['kids', 'adults', 'workers', 'elderly'] as const;

export function TeacherProfileForm() {
  const t = useTranslations();
  const queryClient = useQueryClient();
  const [success, setSuccess] = useState(false);

  const { data: profile, isLoading } = useQuery({
    queryKey: ['teacher', 'profile'],
    queryFn: () => api.get('/teachers/profile').then((r) => r.data),
  });

  const mutation = useMutation({
    mutationFn: (body: {
      bio?: string;
      languages: string[];
      audienceTypes: string[];
    }) => api.put('/teachers/profile', body).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher', 'profile'] });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    },
  });

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const languages = LANGUAGE_KEYS.filter(
      (key) => formData.get(`lang-${key}`) === 'on',
    );
    const audienceTypes = AUDIENCE_KEYS.filter(
      (key) => formData.get(`aud-${key}`) === 'on',
    );
    const bio = formData.get('bio') as string;

    mutation.mutate({ bio: bio || undefined, languages, audienceTypes });
  }

  if (isLoading) {
    return <p className="text-gray-500">{t('common.loading')}</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {success && (
        <div className="rounded bg-green-50 p-3 text-sm text-green-600">
          {t('teacher.profileSaved')}
        </div>
      )}
      {mutation.error && (
        <div className="rounded bg-red-50 p-3 text-sm text-red-600">
          {t('common.error')}
        </div>
      )}

      {/* Bio */}
      <div>
        <label
          htmlFor="bio"
          className="block text-sm font-medium text-gray-700"
        >
          {t('teacher.bio')}
        </label>
        <textarea
          id="bio"
          name="bio"
          rows={5}
          maxLength={1000}
          defaultValue={profile?.bio ?? ''}
          placeholder={t('teacher.bioPlaceholder')}
          className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      {/* Languages */}
      <div>
        <p className="text-sm font-medium text-gray-700 mb-2">
          {t('teacher.languages')}
        </p>
        <div className="flex flex-wrap gap-3">
          {LANGUAGE_KEYS.map((key) => (
            <label key={key} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name={`lang-${key}`}
                defaultChecked={profile?.languages?.includes(key)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">
                {t(`languageOptions.${key}`)}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Audience types */}
      <div>
        <p className="text-sm font-medium text-gray-700 mb-2">
          {t('teacher.audienceTypes')}
        </p>
        <div className="flex flex-wrap gap-3">
          {AUDIENCE_KEYS.map((key) => (
            <label key={key} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name={`aud-${key}`}
                defaultChecked={profile?.audienceTypes?.includes(key)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">
                {t(`audienceOptions.${key}`)}
              </span>
            </label>
          ))}
        </div>
      </div>

      <button
        type="submit"
        disabled={mutation.isPending}
        className="rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
      >
        {mutation.isPending ? t('common.loading') : t('teacher.saveProfile')}
      </button>
    </form>
  );
}
