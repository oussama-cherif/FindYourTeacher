'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link, useRouter } from '@/i18n/navigation';
import { LanguageSwitcher } from '@/components/language-switcher';
import api from '@/lib/api';

export default function AdminDashboardLayout({
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

  useEffect(() => {
    api
      .get('/users/me')
      .then(({ data }) => {
        if (data.role !== 'ADMIN') {
          router.push('/');
          return;
        }
        setUser(data);
        setLoading(false);
      })
      .catch(() => {
        router.push('/login');
      });
  }, [router]);

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
              href="/dashboard/admin"
              className="block rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              {t('admin.dashboard')}
            </Link>
            <Link
              href="/dashboard/admin/reviews"
              className="block rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              {t('admin.pendingReviews')}
            </Link>
          </nav>
        </aside>

        {/* Content */}
        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  );
}
