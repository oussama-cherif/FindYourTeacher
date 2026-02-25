'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useQuery } from '@tanstack/react-query';
import { Link, useRouter } from '@/i18n/navigation';
import { LanguageSwitcher } from '@/components/language-switcher';
import api from '@/lib/api';

export default function TeacherDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = useTranslations();
  const router = useRouter();
  const [user, setUser] = useState<{ fullName: string; role: string } | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    api
      .get('/users/me')
      .then(({ data }) => {
        if (data.role !== 'TEACHER') {
          router.push('/');
          return;
        }
        setUser(data);
        setLoading(false);
        setReady(true);
      })
      .catch(() => {
        router.push('/login');
      });
  }, [router]);

  const { data: calls } = useQuery({
    queryKey: ['teacher', 'calls', 'badge'],
    queryFn: () => api.get('/onboarding/teacher').then((r) => r.data),
    enabled: ready,
    refetchInterval: 30000,
  });

  const pendingCalls = calls?.filter(
    (c: { status: string }) => c.status === 'PENDING',
  ).length ?? 0;

  const confirmedCalls = calls?.filter(
    (c: { status: string }) => c.status === 'CONFIRMED',
  ).length ?? 0;

  const { data: groupsData } = useQuery({
    queryKey: ['teacher', 'groups', 'badge'],
    queryFn: () => api.get('/groups/teacher').then((r) => r.data),
    enabled: ready,
    refetchInterval: 30000,
  });

  const pendingMemberships = groupsData?.pendingMemberships ?? 0;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500">{t('common.loading')}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top nav */}
      <nav className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
        <Link href="/" className="text-xl font-bold text-blue-600">
          {t('common.appName')}
        </Link>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">{user?.fullName}</span>
          <LanguageSwitcher />
          <button
            onClick={() => {
              api.post('/auth/logout').then(() => {
                router.push('/');
              });
            }}
            className="text-sm text-gray-500 hover:text-red-600 transition-colors"
          >
            {t('common.logout')}
          </button>
        </div>
      </nav>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 border-r border-gray-200 bg-white min-h-[calc(100vh-65px)] p-4">
          <nav className="space-y-1">
            <Link
              href="/dashboard/teacher"
              className="block rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              {t('teacher.dashboard')}
            </Link>
            <Link
              href="/dashboard/teacher/profile"
              className="block rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              {t('teacher.profile')}
            </Link>
            <Link
              href="/dashboard/teacher/availability"
              className="block rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              {t('teacher.availability')}
            </Link>
            <Link
              href="/dashboard/teacher/calls"
              className="flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              <span>{t('teacher.calls')}</span>
              <span className="flex items-center gap-1">
                {pendingCalls > 0 && (
                  <span className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1.5 text-xs font-bold text-white">
                    {pendingCalls}
                  </span>
                )}
                {confirmedCalls > 0 && (
                  <span className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-yellow-400 px-1.5 text-xs font-bold text-gray-900">
                    {confirmedCalls}
                  </span>
                )}
              </span>
            </Link>
            <Link
              href="/dashboard/teacher/sessions"
              className="block rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              {t('teacher.sessions')}
            </Link>
            <Link
              href="/dashboard/teacher/payments"
              className="block rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              {t('teacher.earnings')}
            </Link>
            <Link
              href="/dashboard/teacher/groups"
              className="flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              <span>{t('teacher.groups')}</span>
              {pendingMemberships > 0 && (
                <span className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1.5 text-xs font-bold text-white">
                  {pendingMemberships}
                </span>
              )}
            </Link>
          </nav>
        </aside>

        {/* Content */}
        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  );
}
