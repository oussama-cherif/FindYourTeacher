'use client';

import { useLocale, useTranslations } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/navigation';

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations('common');

  const targetLocale = locale === 'fr' ? 'en' : 'fr';

  function handleSwitch() {
    router.replace(pathname, { locale: targetLocale });
  }

  return (
    <button
      onClick={handleSwitch}
      className="rounded border border-gray-300 px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 transition-colors"
    >
      {t('switchLanguage')}
    </button>
  );
}
