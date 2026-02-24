'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

interface Slot {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

export function AvailabilityManager() {
  const t = useTranslations();
  const queryClient = useQueryClient();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { data: slots = [], isLoading } = useQuery<Slot[]>({
    queryKey: ['teacher', 'availability'],
    queryFn: () => api.get('/teachers/availability').then((r) => r.data),
  });

  const createMutation = useMutation({
    mutationFn: (body: {
      dayOfWeek: number;
      startTime: string;
      endTime: string;
    }) => api.post('/teachers/availability', body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher', 'availability'] });
      setSuccess(t('teacher.slotCreated'));
      setError('');
      setTimeout(() => setSuccess(''), 3000);
    },
    onError: (err: unknown) => {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setError(axiosErr.response?.data?.message ?? t('common.error'));
      setSuccess('');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (slotId: string) =>
      api.delete(`/teachers/availability/${slotId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher', 'availability'] });
      setSuccess(t('teacher.slotDeleted'));
      setTimeout(() => setSuccess(''), 3000);
    },
  });

  function handleAddSlot(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const dayOfWeek = Number(formData.get('dayOfWeek'));
    const startTime = formData.get('startTime') as string;
    const endTime = formData.get('endTime') as string;

    createMutation.mutate({ dayOfWeek, startTime, endTime });
    e.currentTarget.reset();
  }

  // Group slots by day
  const slotsByDay = new Map<number, Slot[]>();
  for (const slot of slots) {
    const existing = slotsByDay.get(slot.dayOfWeek) ?? [];
    existing.push(slot);
    slotsByDay.set(slot.dayOfWeek, existing);
  }

  if (isLoading) {
    return <p className="text-gray-500">{t('common.loading')}</p>;
  }

  return (
    <div className="space-y-6">
      {success && (
        <div className="rounded bg-green-50 p-3 text-sm text-green-600">
          {success}
        </div>
      )}
      {error && (
        <div className="rounded bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Add slot form */}
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {t('teacher.addSlot')}
        </h3>
        <form
          onSubmit={handleAddSlot}
          className="flex flex-wrap items-end gap-4"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('teacher.dayOfWeek')}
            </label>
            <select
              name="dayOfWeek"
              required
              className="rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {[0, 1, 2, 3, 4, 5, 6].map((day) => (
                <option key={day} value={day}>
                  {t(`days.${day}`)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('teacher.startTime')}
            </label>
            <input
              type="time"
              name="startTime"
              required
              className="rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('teacher.endTime')}
            </label>
            <input
              type="time"
              name="endTime"
              required
              className="rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            disabled={createMutation.isPending}
            className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {createMutation.isPending ? t('common.loading') : t('teacher.addSlot')}
          </button>
        </form>
      </div>

      {/* Slots grid by day */}
      {slots.length === 0 ? (
        <p className="text-gray-500">{t('teacher.noSlots')}</p>
      ) : (
        <div className="space-y-4">
          {[0, 1, 2, 3, 4, 5, 6].map((day) => {
            const daySlots = slotsByDay.get(day);
            if (!daySlots || daySlots.length === 0) return null;
            return (
              <div key={day} className="rounded-xl bg-white p-4 shadow-sm">
                <h4 className="font-semibold text-gray-900 mb-3">
                  {t(`days.${day}`)}
                </h4>
                <div className="flex flex-wrap gap-2">
                  {daySlots.map((slot) => (
                    <div
                      key={slot.id}
                      className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2"
                    >
                      <span className="text-sm text-gray-700">
                        {slot.startTime} – {slot.endTime}
                      </span>
                      <button
                        onClick={() => deleteMutation.mutate(slot.id)}
                        disabled={deleteMutation.isPending}
                        className="text-red-400 hover:text-red-600 text-sm transition-colors"
                        title={t('teacher.deleteSlot')}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
