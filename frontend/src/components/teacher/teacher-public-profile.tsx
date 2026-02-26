'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Link } from '@/i18n/navigation';
import { LanguageSwitcher } from '@/components/language-switcher';
import axios from 'axios';
import api from '@/lib/api';
import { RecommendationsList } from '@/components/recommendations/recommendations-list';
import { RecommendationForm } from '@/components/recommendations/recommendation-form';

interface TeacherPublicProfileData {
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
    averageRating?: string | null;
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
  const tDays = useTranslations('days');

  const [currentUser, setCurrentUser] = useState<{
    id: string;
    role: string;
  } | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [selectedSlotId, setSelectedSlotId] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [notes, setNotes] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingError, setBookingError] = useState('');

  // Check auth state
  useEffect(() => {
    api
      .get('/users/me')
      .then(({ data }) => {
        setCurrentUser(data);
        setAuthChecked(true);
      })
      .catch(() => {
        setAuthChecked(true);
      });
  }, []);

  const { data: teacher, isLoading } = useQuery<TeacherPublicProfileData>({
    queryKey: ['teachers', 'profile', teacherId],
    queryFn: () =>
      axios
        .get(`${process.env.NEXT_PUBLIC_API_URL}/teachers/${teacherId}`)
        .then((r) => r.data),
  });

  const bookMutation = useMutation({
    mutationFn: (data: {
      teacherId: string;
      slotId: string;
      scheduledAt: string;
      studentNotes?: string;
    }) => api.post('/onboarding', data),
    onSuccess: () => {
      setBookingSuccess(true);
      setShowBookingForm(false);
      setBookingError('');
    },
    onError: (err: { response?: { status?: number } }) => {
      if (err.response?.status === 409) {
        setBookingError(t('teachers.slotAlreadyBooked'));
      } else {
        setBookingError(t('common.error'));
      }
    },
  });

  // Group slots by day
  const slotsByDay = new Map<
    number,
    NonNullable<TeacherPublicProfileData>['availabilitySlots']
  >();
  if (teacher?.availabilitySlots) {
    for (const slot of teacher.availabilitySlots) {
      const existing = slotsByDay.get(slot.dayOfWeek) ?? [];
      existing.push(slot);
      slotsByDay.set(slot.dayOfWeek, existing);
    }
  }

  function handleBooking(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedSlotId || !selectedDate) return;

    const slot = teacher?.availabilitySlots.find(
      (s) => s.id === selectedSlotId,
    );
    if (!slot) return;

    const scheduledAt = `${selectedDate}T${slot.startTime}:00.000Z`;

    bookMutation.mutate({
      teacherId,
      slotId: selectedSlotId,
      scheduledAt,
      ...(notes.trim() && { studentNotes: notes.trim() }),
    });
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
                <div className="flex items-center gap-2">
                  <p className="text-sm text-gray-500">
                    {t('teachers.recommendations', {
                      count: teacher.teacherProfile.recommendationCount,
                    })}
                  </p>
                  {teacher.teacherProfile.averageRating && (
                    <span className="text-sm text-yellow-500">
                      ★ {Number(teacher.teacherProfile.averageRating).toFixed(1)}
                    </span>
                  )}
                </div>
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
                          {tDays(String(day))}
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

            {/* Recommendations */}
            <div className="rounded-xl bg-white p-6 shadow-sm">
              <RecommendationsList teacherId={teacherId} />
            </div>

            {/* Leave a review (student only, after auth check) */}
            {authChecked && currentUser?.role === 'STUDENT' && (
              <RecommendationForm teacherId={teacherId} />
            )}

            {/* Booking section */}
            {bookingSuccess ? (
              <div className="rounded-xl bg-green-50 p-6 text-center">
                <p className="text-green-700 font-medium">
                  {t('teachers.bookingConfirmed')}
                </p>
              </div>
            ) : authChecked && !currentUser ? (
              // Guest — link to login
              <Link
                href="/login"
                className="block w-full rounded-lg bg-blue-600 px-4 py-3 text-center text-white hover:bg-blue-700 transition-colors"
              >
                {t('teachers.loginToBook')}
              </Link>
            ) : authChecked && currentUser?.role === 'TEACHER' ? (
              // Teacher — don't show booking
              null
            ) : authChecked && currentUser?.role === 'STUDENT' ? (
              teacher.availabilitySlots.length === 0 ? (
                <button
                  disabled
                  className="w-full rounded-lg bg-blue-600 px-4 py-3 text-white opacity-50 cursor-not-allowed"
                >
                  {t('teachers.noSlotsAvailable')}
                </button>
              ) : !showBookingForm ? (
                <button
                  onClick={() => setShowBookingForm(true)}
                  className="w-full rounded-lg bg-blue-600 px-4 py-3 text-white hover:bg-blue-700 transition-colors"
                >
                  {t('teachers.bookOnboarding')}
                </button>
              ) : (
                <div className="rounded-xl bg-white p-6 shadow-sm">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    {t('teachers.bookOnboarding')}
                  </h2>

                  {bookingError && (
                    <div className="mb-4 rounded bg-red-50 p-3 text-sm text-red-600">
                      {bookingError}
                    </div>
                  )}

                  <form onSubmit={handleBooking} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        {t('teachers.selectSlot')}
                      </label>
                      <select
                        value={selectedSlotId}
                        onChange={(e) => setSelectedSlotId(e.target.value)}
                        required
                        className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="">--</option>
                        {teacher.availabilitySlots.map((slot) => (
                          <option key={slot.id} value={slot.id}>
                            {tDays(String(slot.dayOfWeek))} {slot.startTime} –{' '}
                            {slot.endTime}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        {t('teachers.selectDate')}
                      </label>
                      <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => {
                          const date = new Date(e.target.value + 'T00:00:00');
                          const slot = teacher?.availabilitySlots.find(
                            (s) => s.id === selectedSlotId,
                          );
                          // JS: 0=Sunday, Prisma: 0=Monday → convert
                          const jsDay = date.getDay();
                          const slotDay = slot ? (slot.dayOfWeek + 1) % 7 : -1;
                          if (slot && jsDay !== slotDay) {
                            setSelectedDate('');
                            setBookingError(
                              t('teachers.wrongDay', {
                                day: tDays(String(slot.dayOfWeek)),
                              }),
                            );
                            return;
                          }
                          setBookingError('');
                          setSelectedDate(e.target.value);
                        }}
                        required
                        min={new Date().toISOString().split('T')[0]}
                        className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        {t('teachers.notesPlaceholder')}
                      </label>
                      <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        maxLength={500}
                        rows={3}
                        className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>

                    <div className="flex gap-3">
                      <button
                        type="submit"
                        disabled={bookMutation.isPending}
                        className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
                      >
                        {t('teachers.confirmBooking')}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowBookingForm(false)}
                        className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        {t('common.cancel')}
                      </button>
                    </div>
                  </form>
                </div>
              )
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
