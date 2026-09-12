import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { hallsApi } from '../../api/halls.api';
import { useAuth } from '../../context/AuthContext';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import Skeleton from '../ui/Skeleton';

const WEEKDAYS = ['Du', 'Se', 'Chor', 'Pay', 'Ju', 'Sha', 'Ya'];
const MONTH_NAMES = [
  'Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun',
  'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr'
];

export function AvailabilityCalendar({
  hallId,
  selectedDate,
  onSelectDate,
  interactive = true,
}) {
  const { isAdmin } = useAuth();
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth() + 1); // 1-12
  const [activeAdminDetail, setActiveAdminDetail] = useState(null);

  // Fetch month availability
  const { data, isLoading, error } = useQuery({
    queryKey: ['hall-availability', hallId, currentYear, currentMonth],
    queryFn: () => hallsApi.getHallAvailability(hallId, { year: currentYear, month: currentMonth }),
    staleTime: 60 * 1000,
  });

  const handlePrevMonth = () => {
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentMonth(1);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  // Build calendar matrix
  // Month is 0-indexed in JS Date:
  const firstDayOfMonth = new Date(currentYear, currentMonth - 1, 1).getDay();
  // Monday is 1st day in Uzbekistan: convert Sunday (0) to 6, and Monday (1) to 0
  const startDayOffset = (firstDayOfMonth + 6) % 7;
  const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();

  const availabilityMap = {};
  if (data?.availability) {
    data.availability.forEach((item) => {
      availabilityMap[item.date] = item;
    });
  }

  // Tashkent today in YYYY-MM-DD
  const todayStr = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Tashkent' }).format(today);

  return (
    <div className="bg-white rounded-2xl border border-border p-5 sm:p-6 shadow-card">
      {/* Month header & navigation */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-5 h-5 text-bronze" />
          <h3 className="font-serif font-bold text-lg text-ink">
            {MONTH_NAMES[currentMonth - 1]} {currentYear}
          </h3>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handlePrevMonth}
            className="p-2 rounded-xl border border-border text-muted hover:text-ink hover:bg-canvas transition-colors"
            aria-label="Oldingi oy"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleNextMonth}
            className="p-2 rounded-xl border border-border text-muted hover:text-ink hover:bg-canvas transition-colors"
            aria-label="Keyingi oy"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-7 gap-2 py-8">
          {Array.from({ length: 35 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full rounded-xl" />
          ))}
        </div>
      ) : error ? (
        <div className="py-8 text-center text-sm text-rose-600">
          Kunlar mavjudligini yuklashda xatolik yuz berdi.
        </div>
      ) : (
        <div>
          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 sm:gap-1.5 mb-2 text-center">
            {WEEKDAYS.map((wd) => (
              <div key={wd} className="text-[11px] sm:text-xs font-semibold text-muted py-1">
                {wd}
              </div>
            ))}
          </div>

          {/* Calendar Day Grid */}
          <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
            {/* Empty slots for offset */}
            {Array.from({ length: startDayOffset }).map((_, i) => (
              <div key={`empty-${i}`} className="h-10 sm:h-12" />
            ))}

            {/* Month days */}
            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const dayNum = idx + 1;
              const dateStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(
                dayNum
              ).padStart(2, '0')}`;
              const dayInfo = availabilityMap[dateStr];
              const isPast = dateStr < todayStr;
              const isBooked = dayInfo?.status === 'BOOKED';
              const isSelected = selectedDate === dateStr;
              const isAvailable = !isPast && !isBooked;

              let style = 'bg-white border-border text-ink hover:border-bronze';
              let disabled = false;

              if (isSelected) {
                style = 'bg-bronze text-white border-bronze font-bold shadow-sm';
              } else if (isPast) {
                style = 'bg-canvas/50 border-border/40 text-muted/50 cursor-not-allowed';
                disabled = true;
              } else if (isBooked) {
                style = 'bg-rose-50/70 border-rose-200 text-rose-700 font-medium';
                if (!isAdmin) {
                  disabled = true;
                }
              } else if (isAvailable) {
                style = 'bg-emerald-50/40 border-emerald-200 text-emerald-900 font-medium hover:border-emerald-400 hover:bg-emerald-50';
              }

              return (
                <button
                  key={dateStr}
                  type="button"
                  aria-label={`${dateStr} ${isBooked ? 'band' : isAvailable ? "bo'sh" : "o'tgan"}`}
                  disabled={!interactive || (disabled && !isAdmin)}
                  onClick={() => {
                    if (isBooked && isAdmin && dayInfo?.booking) {
                      setActiveAdminDetail({ date: dateStr, booking: dayInfo.booking });
                    } else if (isAvailable && onSelectDate) {
                      onSelectDate(dateStr);
                    }
                  }}
                  className={`relative h-10 sm:h-12 rounded-xl border flex flex-col items-center justify-center text-xs transition-all duration-150 focus-visible:ring-2 focus-visible:ring-bronze focus:outline-none ${style}`}
                >
                  <span>{dayNum}</span>

                  {/* Status dot or badge */}
                  {!isSelected && (
                    <span className="mt-0.5">
                      {isBooked ? (
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 block" />
                      ) : isAvailable ? (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 block" />
                      ) : null}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Admin booked date popup detail */}
          {isAdmin && activeAdminDetail && (
            <div className="mt-4 p-4 rounded-xl border border-border bg-zinc-50 flex items-start justify-between gap-3 text-xs">
              <div className="space-y-1">
                <div className="font-bold text-ink">
                  Admin: {activeAdminDetail.date} kungi buyurtma ma'lumoti
                </div>
                <div className="text-muted">
                  Mijoz: {activeAdminDetail.booking.firstName} {activeAdminDetail.booking.lastName} (
                  {activeAdminDetail.booking.phone})
                </div>
                <div className="text-muted">
                  Mehmonlar: {activeAdminDetail.booking.guestCount} kishi | ID: {activeAdminDetail.booking.bookingId}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveAdminDetail(null)}
                className="text-muted hover:text-ink font-bold"
              >
                ✕
              </button>
            </div>
          )}

          {/* Legend */}
          <div className="mt-6 pt-4 border-t border-border/80 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-muted">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-md bg-emerald-100 border border-emerald-300 shrink-0" />
              <span>Bo'sh (tanlang)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-md bg-rose-100 border border-rose-300 shrink-0" />
              <span>Band qilingan</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-md bg-bronze border border-bronze shrink-0" />
              <span>Tanlangan sana</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-md bg-canvas border border-border shrink-0" />
              <span>O'tgan kunlar</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AvailabilityCalendar;
