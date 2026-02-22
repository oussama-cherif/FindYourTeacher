import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { LoginForm } from '@/components/auth/login-form';
import { LanguageSwitcher } from '@/components/language-switcher';

export default function LoginPage() {
  const t = useTranslations();

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="flex items-center justify-between px-6 py-4">
        <Link href="/" className="text-xl font-bold text-blue-600">
          {t('common.appName')}
        </Link>
        <LanguageSwitcher />
      </nav>
      <div className="flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-md">
          <h1 className="mb-6 text-2xl font-bold text-gray-900">
            {t('auth.loginTitle')}
          </h1>
          <LoginForm />
          <p className="mt-4 text-center text-sm text-gray-600">
            {t('auth.noAccount')}{' '}
            <Link href="/register" className="text-blue-600 hover:underline">
              {t('common.register')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
