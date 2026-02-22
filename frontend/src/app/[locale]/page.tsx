import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { LanguageSwitcher } from '@/components/language-switcher';

export default function LandingPage() {
  const t = useTranslations();

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
        <span className="text-xl font-bold text-blue-600">
          {t('common.appName')}
        </span>
        <div className="flex items-center gap-4">
          <LanguageSwitcher />
          <Link
            href="/login"
            className="text-gray-700 hover:text-blue-600 transition-colors"
          >
            {t('common.login')}
          </Link>
          <Link
            href="/register"
            className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 transition-colors"
          >
            {t('common.register')}
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="mx-auto max-w-4xl px-6 py-24 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
          {t('landing.heroTitle')}
        </h1>
        <p className="mt-6 text-lg text-gray-600">
          {t('landing.heroSubtitle')}
        </p>
        <div className="mt-10 flex justify-center gap-4 flex-wrap">
          <Link
            href="/register"
            className="rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700 transition-colors"
          >
            {t('landing.ctaStudent')}
          </Link>
          <Link
            href="/register"
            className="rounded-lg border border-blue-600 px-6 py-3 text-blue-600 hover:bg-blue-50 transition-colors"
          >
            {t('landing.ctaTeacher')}
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="bg-gray-50 py-20">
        <div className="mx-auto max-w-5xl px-6">
          <h2 className="text-center text-3xl font-bold text-gray-900 mb-12">
            {t('landing.featuresTitle')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="rounded-xl bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {t('landing.feature1Title')}
              </h3>
              <p className="text-gray-600">{t('landing.feature1Desc')}</p>
            </div>
            <div className="rounded-xl bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {t('landing.feature2Title')}
              </h3>
              <p className="text-gray-600">{t('landing.feature2Desc')}</p>
            </div>
            <div className="rounded-xl bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {t('landing.feature3Title')}
              </h3>
              <p className="text-gray-600">{t('landing.feature3Desc')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 text-center text-sm text-gray-500">
        FindYourTeacher — {t('common.tagline')}
      </footer>
    </div>
  );
}
