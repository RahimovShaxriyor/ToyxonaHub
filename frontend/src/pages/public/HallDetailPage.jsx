import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { hallsApi } from '../../api/halls.api';
import { servicesApi } from '../../api/services.api';
import { bookingsApi } from '../../api/bookings.api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import ImageGallery from '../../components/common/ImageGallery';
import AvailabilityCalendar from '../../components/common/AvailabilityCalendar';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import Skeleton, { HallDetailSkeleton } from '../../components/ui/Skeleton';
import { formatPrice, formatDate, formatFriendlyDate } from '../../utils/formatters';
import { cleanPhoneNumber } from '../../utils/phone';
import { normalizeApiError } from '../../utils/error';
import {
  MapPin,
  Phone,
  Users,
  CheckCircle2,
  Calendar,
  Sparkles,
  CreditCard,
  Music,
  Car,
  Utensils,
  Volume2,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';

export function HallDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const { user, isAuthenticated, savePendingBooking, getPendingBooking, clearPendingBooking } = useAuth();
  const toast = useToast();

  // Booking selection state
  const [selectedDate, setSelectedDate] = useState('');
  const [guestCount, setGuestCount] = useState(200);
  const [selectedSingerId, setSelectedSingerId] = useState('');
  const [selectedCarId, setSelectedCarId] = useState('');
  const [selectedMenuId, setSelectedMenuId] = useState('');
  const [includeKarnaySurnay, setIncludeKarnaySurnay] = useState(false);

  // Booking modal state
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');

  // Payment post-booking modal state
  const [createdBooking, setCreatedBooking] = useState(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isCalendarHighlighted, setIsCalendarHighlighted] = useState(false);

  // Fetch hall details
  const {
    data: hall,
    isLoading: isHallLoading,
    error: hallError,
  } = useQuery({
    queryKey: ['hall', id],
    queryFn: () => hallsApi.getHallById(id),
  });

  // Fetch hall services
  const { data: services = [] } = useQuery({
    queryKey: ['hall-services', id],
    queryFn: () => servicesApi.getHallServices(id),
    enabled: !!id,
  });

  // Check and restore draft booking if returning from login
  useEffect(() => {
    if (id) {
      const draft = getPendingBooking(id);
      if (draft) {
        if (draft.selectedDate) setSelectedDate(draft.selectedDate);
        if (draft.guestCount) setGuestCount(draft.guestCount);
        if (draft.selectedSingerId) setSelectedSingerId(draft.selectedSingerId);
        if (draft.selectedCarId) setSelectedCarId(draft.selectedCarId);
        if (draft.selectedMenuId) setSelectedMenuId(draft.selectedMenuId);
        if (draft.includeKarnaySurnay) setIncludeKarnaySurnay(draft.includeKarnaySurnay);
        if (draft.openModal) setIsBookingModalOpen(true);
        clearPendingBooking(id);
        toast.info("Saqlangan bron ma'lumotlaringiz tiklandi.");
      }
    }
  }, [id, getPendingBooking, clearPendingBooking, toast]);

  // Autofill user contact details when user logs in or modal opens
  useEffect(() => {
    if (user) {
      if (user.firstName && !firstName) setFirstName(user.firstName);
      if (user.lastName && !lastName) setLastName(user.lastName);
      if (user.phone && !phone) setPhone(user.phone);
    }
  }, [user, firstName, lastName, phone]);

  // Group services
  const singers = services.filter((s) => s.serviceType === 'SINGER');
  const cars = services.filter((s) => s.serviceType === 'CAR');
  const menus = services.filter((s) => s.serviceType === 'MENU');
  const karnayServices = services.filter((s) => s.serviceType === 'KARNAY_SURNAY');

  // Calculate estimated total price
  const basePrice = (hall?.pricePerSeat || 0) * (Number(guestCount) || 0);

  const selectedSinger = singers.find((s) => s.id === selectedSingerId);
  const selectedCar = cars.find((s) => s.id === selectedCarId);
  const selectedMenu = menus.find((s) => s.id === selectedMenuId);
  const karnayItem = karnayServices[0];

  const servicesPrice =
    (selectedSinger?.price || 0) +
    (selectedCar?.price || 0) +
    (selectedMenu?.price || 0) +
    (includeKarnaySurnay && karnayItem ? karnayItem.price : 0);

  const totalEstimate = basePrice + servicesPrice;
  const advanceEstimate = Math.round(totalEstimate * 0.2);

  // Handle open booking flow
  const handleOpenBooking = () => {
    if (!selectedDate) {
      toast.warning("Iltimos, avval kalendardan bo'sh to'y sanasini tanlang.");
      const calendarEl = document.getElementById('availability-calendar-section');
      if (calendarEl) {
        calendarEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      setIsCalendarHighlighted(true);
      setTimeout(() => {
        setIsCalendarHighlighted(false);
      }, 1200);
      return;
    }

    if (!isAuthenticated) {
      // Save draft to sessionStorage so user doesn't lose selections
      savePendingBooking(id, {
        hallName: hall?.name || '',
        selectedDate,
        guestCount,
        selectedSingerId,
        selectedCarId,
        selectedMenuId,
        includeKarnaySurnay,
        openModal: true,
      });

      toast.info('Bronni davom ettirish uchun tizimga kiring yoki ro\'yxatdan o\'ting.');
      navigate('/login', {
        state: { from: location, message: 'Bronni yakunlash uchun tizimga kiring.' },
      });
      return;
    }

    setIsBookingModalOpen(true);
  };

  // Create Booking Mutation
  const createBookingMutation = useMutation({
    mutationFn: (payload) => bookingsApi.createBooking(payload),
    onSuccess: (res) => {
      const data = res.data || res;
      queryClient.invalidateQueries({ queryKey: ['hall-availability', id] });
      setIsBookingModalOpen(false);
      setCreatedBooking(data);
      setIsPaymentModalOpen(true);
      toast.success("To'yxona muvaffaqiyatli bron qilindi! Endi 20% avans to'lovini amalga oshiring.");
    },
    onError: (err) => {
      if (err.response?.status === 409) {
        toast.error("Kechirasiz, tanlangan sana allaqachon band qilingan! Iltimos, kalendardan boshqa sanani tanlang.");
        queryClient.invalidateQueries({ queryKey: ['hall-availability', id] });
      } else {
        const normalized = normalizeApiError(err, 'Bron qilishda xatolik yuz berdi.');
        toast.error(normalized.message);
      }
    },
  });

  const handleConfirmBooking = (e) => {
    e.preventDefault();

    if (!selectedDate) {
      toast.error('To\'y sanasi tanlanmagan.');
      return;
    }
    if (!firstName || !lastName || !phone) {
      toast.error('Ism, familiya va telefon raqamini kiriting.');
      return;
    }

    const cleanedPhone = cleanPhoneNumber(phone);
    if (!cleanedPhone || !/^\+998\d{9}$/.test(cleanedPhone)) {
      toast.error("Telefon raqamini to'g'ri formatda kiriting (masalan: +998901234567).");
      return;
    }

    const payload = {
      weddingHallId: id,
      bookingDate: selectedDate,
      guestCount: Number(guestCount),
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      phone: cleanedPhone,
      selectedSingerId: selectedSingerId || undefined,
      selectedCarId: selectedCarId || undefined,
      selectedMenuId: selectedMenuId || undefined,
      includeKarnaySurnay: includeKarnaySurnay || undefined,
    };

    createBookingMutation.mutate(payload);
  };

  // Pay Advance Mutation
  const payMutation = useMutation({
    mutationFn: (bookingId) => bookingsApi.payBooking(bookingId),
    onSuccess: () => {
      setIsPaymentModalOpen(false);
      toast.success("Muvaffaqiyatli to'landi");
      navigate('/my-bookings');
    },
    onError: (err) => {
      const normalized = normalizeApiError(err, "To'lovni amalga oshirishda xatolik yuz berdi.");
      toast.error(normalized.message);
    },
  });

  if (isHallLoading) {
    return <HallDetailSkeleton />;
  }

  if (hallError || !hall) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center animate-in fade-in duration-ui">
        <AlertCircle className="w-12 h-12 text-rose-600 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-ink">To'yxona topilmadi</h2>
        <p className="text-sm text-muted mt-2">
          Ushbu to'yxona mavjud emas yoki admin tomonidan tasdiqlanmagan.
        </p>
        <Button
          variant="primary"
          size="md"
          className="mt-6"
          onClick={() => navigate('/catalog')}
        >
          Katalogga qaytish
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12 pb-28 lg:pb-12 page-enter">
      {/* Header Info */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="bronze" size="md">
            <MapPin className="w-3.5 h-3.5 text-bronze" />
            {hall.district} tumani
          </Badge>
          <Badge variant="default" size="md">
            <Users className="w-3.5 h-3.5 text-muted" />
            {hall.capacity} kishilik sig'im
          </Badge>
        </div>

        <h1 className="font-serif text-3xl sm:text-5xl font-extrabold text-ink tracking-tight">
          {hall.name}
        </h1>

        <div className="flex flex-wrap items-center gap-6 text-sm text-muted">
          <span className="flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-bronze shrink-0" />
            {hall.address}
          </span>
          <span className="flex items-center gap-1.5">
            <Phone className="w-4 h-4 text-bronze shrink-0" />
            <span>{hall.phone || hall.contactPhone}</span>
          </span>
        </div>
      </div>

      {/* Gallery */}
      <section>
        <ImageGallery images={hall.images} hallName={hall.name} />
      </section>

      {/* Main Grid: Details + Sticky Booking Box */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left Column: Description, Services & Calendar */}
        <div className="lg:col-span-2 space-y-10">
          {/* About Hall */}
          <div className="bg-white rounded-2xl border border-border p-6 sm:p-8 shadow-card space-y-4">
            <h2 className="font-serif font-bold text-xl text-ink">To'yxona haqida</h2>
            <p className="text-sm sm:text-base text-muted leading-relaxed whitespace-pre-line">
              {hall.description || "Ushbu to'yxona bo'yicha to'liq tavsif tez orada qo'shiladi."}
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-6 border-t border-border/80">
              <div className="p-4 rounded-xl bg-canvas border border-border/60">
                <span className="text-xs text-muted block">O'rindiq narxi</span>
                <span className="text-lg font-bold text-ink block mt-1">
                  {formatPrice(hall.pricePerSeat)}
                </span>
              </div>
              <div className="p-4 rounded-xl bg-canvas border border-border/60">
                <span className="text-xs text-muted block">Maksimal sig'im</span>
                <span className="text-lg font-bold text-ink block mt-1">
                  {hall.capacity} kishi
                </span>
              </div>
              <div className="p-4 rounded-xl bg-canvas border border-border/60 col-span-2 sm:col-span-1">
                <span className="text-xs text-muted block">Tuman</span>
                <span className="text-lg font-bold text-ink block mt-1 truncate">
                  {hall.district}
                </span>
              </div>
            </div>
          </div>

          {/* Availability Calendar */}
          <div
            id="availability-calendar-section"
            className={`space-y-3 rounded-2xl p-3 transition-all duration-300 ${
              isCalendarHighlighted ? 'ring-2 ring-bronze ring-offset-2 bg-bronze-50/20' : ''
            }`}
          >
            <div className="flex items-center justify-between">
              <h2 className="font-serif font-bold text-xl text-ink flex items-center gap-2">
                <Calendar className="w-5 h-5 text-bronze" />
                Bo'sh kunlar kalendari
              </h2>
              {selectedDate && (
                <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                  Tanlangan sana: {formatFriendlyDate(selectedDate)}
                </span>
              )}
            </div>
            <p className="text-xs text-muted">
              To'yingizni rejalashtirayotgan sanani tanlang. Yashil belgilangan kunlar bo'sh
              hisoblanadi.
            </p>

            <AvailabilityCalendar
              hallId={hall.id}
              selectedDate={selectedDate}
              onSelectDate={(date) => {
                setSelectedDate(date);
                toast.success(`${formatFriendlyDate(date)} sanasi tanlandi.`);
              }}
            />
          </div>

          {/* Additional Services Selection */}
          <div className="bg-white rounded-2xl border border-border p-6 sm:p-8 shadow-card space-y-6">
            <div>
              <h2 className="font-serif font-bold text-xl text-ink flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-bronze" />
                Qo'shimcha tantana xizmatlari
              </h2>
              <p className="text-xs text-muted mt-1">
                To'yxona bilan birgalikda taqdim etiladigan rasmiy san'atkor, kortej va menyu
                xizmatlarini bron qiling.
              </p>
            </div>

            {services.length === 0 && (
              <div className="text-center py-8 px-4 text-muted text-xs bg-canvas/60 rounded-xl border border-dashed border-border">
                Xizmatlar mavjud emas
              </div>
            )}

            {/* Singers */}
            {singers.length > 0 && (
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-wider text-ink flex items-center gap-2">
                  <Music className="w-4 h-4 text-purple-600" />
                  Xonanda / San'atkor
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div
                    onClick={() => setSelectedSingerId('')}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      selectedSingerId === ''
                        ? 'border-bronze bg-bronze-50/50 font-semibold'
                        : 'border-border hover:border-border-dark bg-white'
                    }`}
                  >
                    <div className="text-xs text-ink">Xonanda kerak emas</div>
                    <div className="text-[11px] text-muted mt-0.5">Faqat to'yxona zali</div>
                  </div>
                  {singers.map((s) => (
                    <div
                      key={s.id}
                      onClick={() => setSelectedSingerId(s.id)}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                        selectedSingerId === s.id
                          ? 'border-bronze bg-bronze-50/50 font-semibold ring-1 ring-bronze'
                          : 'border-border hover:border-border-dark bg-white'
                      }`}
                    >
                      <div className="text-xs text-ink">{s.name}</div>
                      <div className="text-xs font-bold text-bronze mt-1">
                        +{formatPrice(s.price)}
                      </div>
                      {s.description && (
                        <div className="text-[11px] text-muted mt-1">{s.description}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Cars */}
            {cars.length > 0 && (
              <div className="space-y-3 pt-4 border-t border-border/70">
                <label className="text-xs font-bold uppercase tracking-wider text-ink flex items-center gap-2">
                  <Car className="w-4 h-4 text-blue-600" />
                  Kortej avtomobili
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div
                    onClick={() => setSelectedCarId('')}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      selectedCarId === ''
                        ? 'border-bronze bg-bronze-50/50 font-semibold'
                        : 'border-border hover:border-border-dark bg-white'
                    }`}
                  >
                    <div className="text-xs text-ink">Kortej kerak emas</div>
                    <div className="text-[11px] text-muted mt-0.5">O'z avtomobillarimiz bilan</div>
                  </div>
                  {cars.map((c) => (
                    <div
                      key={c.id}
                      onClick={() => setSelectedCarId(c.id)}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                        selectedCarId === c.id
                          ? 'border-bronze bg-bronze-50/50 font-semibold ring-1 ring-bronze'
                          : 'border-border hover:border-border-dark bg-white'
                      }`}
                    >
                      <div className="text-xs text-ink">{c.name}</div>
                      <div className="text-xs font-bold text-bronze mt-1">
                        +{formatPrice(c.price)}
                      </div>
                      {c.description && (
                        <div className="text-[11px] text-muted mt-1">{c.description}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Menus */}
            {menus.length > 0 && (
              <div className="space-y-3 pt-4 border-t border-border/70">
                <label className="text-xs font-bold uppercase tracking-wider text-ink flex items-center gap-2">
                  <Utensils className="w-4 h-4 text-amber-600" />
                  Maxsus taomnoma to'plami
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div
                    onClick={() => setSelectedMenuId('')}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      selectedMenuId === ''
                        ? 'border-bronze bg-bronze-50/50 font-semibold'
                        : 'border-border hover:border-border-dark bg-white'
                    }`}
                  >
                    <div className="text-xs text-ink">Standart to'y menyusi</div>
                    <div className="text-[11px] text-muted mt-0.5">Qo'shimcha taomlarsiz</div>
                  </div>
                  {menus.map((m) => (
                    <div
                      key={m.id}
                      onClick={() => setSelectedMenuId(m.id)}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                        selectedMenuId === m.id
                          ? 'border-bronze bg-bronze-50/50 font-semibold ring-1 ring-bronze'
                          : 'border-border hover:border-border-dark bg-white'
                      }`}
                    >
                      <div className="text-xs text-ink">{m.name}</div>
                      <div className="text-xs font-bold text-bronze mt-1">
                        +{formatPrice(m.price)}
                      </div>
                      {m.description && (
                        <div className="text-[11px] text-muted mt-1">{m.description}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Karnay Surnay */}
            {karnayItem && (
              <div className="pt-4 border-t border-border/70">
                <label className="flex items-start gap-3 p-3.5 rounded-xl border border-border bg-canvas/40 cursor-pointer hover:border-border-dark">
                  <input
                    type="checkbox"
                    checked={includeKarnaySurnay}
                    onChange={(e) => setIncludeKarnaySurnay(e.target.checked)}
                    className="mt-1 w-4 h-4 rounded text-bronze focus:ring-bronze"
                  />
                  <div>
                    <div className="text-sm font-semibold text-ink flex items-center gap-2">
                      <Volume2 className="w-4 h-4 text-rose-600" />
                      Karnay-surnay va nog'ora guruhi (+{formatPrice(karnayItem.price)})
                    </div>
                    <p className="text-xs text-muted mt-0.5">
                      Kelin-kuyov va mehmonlarni tantanali kutib olish uchun milliy ansambl
                    </p>
                  </div>
                </label>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Sticky Pricing & Booking Card (Desktop) */}
        <div className="hidden lg:block lg:col-span-1">
          <div className="bg-white rounded-2xl border border-border p-6 shadow-dropdown sticky top-28 space-y-6">
            <div>
              <span className="text-xs text-muted block">Boshlang'ich narx</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-serif font-bold text-ink">
                  {formatPrice(hall.pricePerSeat)}
                </span>
                <span className="text-xs text-muted">/ kishi boshiga</span>
              </div>
            </div>

            {/* Guest Count Selector */}
            <div className="space-y-1.5 pt-4 border-t border-border/70">
              <label className="block text-xs font-semibold text-ink uppercase tracking-wider">
                Mehmonlar soni
              </label>
              <input
                type="number"
                min="50"
                max={hall.capacity}
                step="10"
                value={guestCount}
                onChange={(e) => setGuestCount(Math.max(1, Number(e.target.value)))}
                className="w-full rounded-xl border border-border px-3.5 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-bronze/20 focus:border-bronze"
              />
              <span className="text-[11px] text-muted">Maksimal sig'im: {hall.capacity} kishi</span>
            </div>

            {/* Selected Date indicator */}
            <div className="p-3 rounded-xl bg-canvas border border-border/70 text-xs">
              <span className="text-muted block">Tanlangan sana:</span>
              <span className="font-bold text-ink mt-0.5 block">
                {selectedDate ? formatFriendlyDate(selectedDate) : "Kalendardan tanlang"}
              </span>
            </div>

            {/* Price Breakdown Calculation */}
            <div className="space-y-2 pt-4 border-t border-border/70 text-xs">
              <div className="flex justify-between text-muted">
                <span>Zal narxi ({guestCount} x {formatPrice(hall.pricePerSeat)})</span>
                <span className="font-medium text-ink">{formatPrice(basePrice)}</span>
              </div>

              {selectedSinger && (
                <div className="flex justify-between text-muted">
                  <span>Xonanda ({selectedSinger.name})</span>
                  <span className="font-medium text-ink">{formatPrice(selectedSinger.price)}</span>
                </div>
              )}

              {selectedCar && (
                <div className="flex justify-between text-muted">
                  <span>Kortej ({selectedCar.name})</span>
                  <span className="font-medium text-ink">{formatPrice(selectedCar.price)}</span>
                </div>
              )}

              {selectedMenu && (
                <div className="flex justify-between text-muted">
                  <span>Menyu to'plami</span>
                  <span className="font-medium text-ink">{formatPrice(selectedMenu.price)}</span>
                </div>
              )}

              {includeKarnaySurnay && karnayItem && (
                <div className="flex justify-between text-muted">
                  <span>Karnay-surnay</span>
                  <span className="font-medium text-ink">{formatPrice(karnayItem.price)}</span>
                </div>
              )}

              <div className="pt-3 border-t border-border/80 flex justify-between items-baseline font-bold text-sm text-ink">
                <span>Taxminiy jami:</span>
                <span className="text-base text-bronze">{formatPrice(totalEstimate)}</span>
              </div>

              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex justify-between items-center text-xs font-semibold">
                <span>20% avans to'lovi:</span>
                <span>{formatPrice(advanceEstimate)}</span>
              </div>
            </div>

            <Button
              variant="primary"
              size="lg"
              className="w-full justify-center shadow-md"
              onClick={handleOpenBooking}
            >
              {selectedDate ? "Bron qilishni davom etish" : "Sanani tanlang"}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Sticky Bottom CTA Bar */}
      {!isBookingModalOpen && !isPaymentModalOpen && (
        <div className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-border p-4 pb-[max(1rem,env(safe-area-inset-bottom))] z-30 lg:hidden shadow-lg flex items-center justify-between gap-4 animate-fade-slide-up">
          <div>
            <span className="text-[11px] text-muted block">Jami taxminiy narx:</span>
            <span className="text-base font-bold text-bronze">
              {formatPrice(totalEstimate)}
            </span>
            <span className="text-[10px] text-muted block">
              {selectedDate ? formatDate(selectedDate) : "Sana tanlanmagan"}
            </span>
          </div>

          <Button
            variant="primary"
            size="md"
            onClick={handleOpenBooking}
          >
            Bron qilish
          </Button>
        </div>
      )}

      {/* Modal: Confirm Booking Form */}
      <Modal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        title="To'yxonani bron qilish"
        description={`${hall.name} uchun ${formatFriendlyDate(selectedDate)} sanasiga buyurtmani tasdiqlang.`}
      >
        <form onSubmit={handleConfirmBooking} className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Ism"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Ali"
              required
            />
            <Input
              label="Familiya"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Valiyev"
              required
            />
          </div>

          <Input
            label="Telefon raqami"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+998 90 123 45 67"
            required
          />

          <div className="p-4 rounded-xl bg-canvas border border-border/80 space-y-2 text-xs">
            <div className="font-semibold text-ink">Buyurtma tafsilotlari:</div>
            <div className="flex justify-between text-muted">
              <span>Sana:</span>
              <span className="font-bold text-ink">{formatFriendlyDate(selectedDate)}</span>
            </div>
            <div className="flex justify-between text-muted">
              <span>Mehmonlar:</span>
              <span className="font-bold text-ink">{guestCount} kishi</span>
            </div>
            <div className="flex justify-between text-muted">
              <span>Jami hisoblangan narx:</span>
              <span className="font-bold text-ink">{formatPrice(totalEstimate)}</span>
            </div>
            <div className="flex justify-between text-emerald-700 font-bold pt-1 border-t border-border">
              <span>To'lanadigan 20% avans:</span>
              <span>{formatPrice(advanceEstimate)}</span>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3">
            <Button
              variant="secondary"
              size="md"
              type="button"
              onClick={() => setIsBookingModalOpen(false)}
            >
              Bekor qilish
            </Button>
            <Button
              variant="primary"
              size="md"
              type="submit"
              isLoading={createBookingMutation.isPending}
            >
              Tasdiqlash va bron qilish
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Immediate Mock Payment */}
      <Modal
        isOpen={isPaymentModalOpen}
        onClose={() => {
          setIsPaymentModalOpen(false);
          navigate('/my-bookings');
        }}
        title="20% Avans to'lovini amalga oshirish"
        description="To'yxona bandligini kafolatlash uchun 20% miqdoridagi avans to'lovini tasdiqlang."
      >
        {createdBooking && (
          <div className="space-y-4 mt-4">
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 space-y-2">
              <div className="flex items-center gap-2 font-bold text-sm text-emerald-800">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                Bron muvaffaqiyatli yaratildi!
              </div>
              <p className="text-muted">
                To'yxonangiz rasmiy tizimda band qilindi. Quyidagi 20% avans summasini to'lash orqali bronni faollashtiring.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-canvas border border-border space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted">Jami hisoblangan summa:</span>
                <span className="font-bold text-ink">
                  {formatPrice(createdBooking.totalPrice)}
                </span>
              </div>
              <div className="flex justify-between text-base font-bold text-emerald-700 pt-2 border-t border-border">
                <span>To'lanishi kerak bo'lgan avans (20%):</span>
                <span>{formatPrice(createdBooking.advancePayment)}</span>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 pt-4">
              <Button
                variant="ghost"
                size="md"
                onClick={() => {
                  setIsPaymentModalOpen(false);
                  navigate('/my-bookings');
                }}
              >
                Keyinroq to'lash
              </Button>
              <Button
                variant="success"
                size="md"
                isLoading={payMutation.isPending}
                onClick={() => payMutation.mutate(createdBooking.id)}
              >
                <CreditCard className="w-4 h-4" />
                20% avansni to'lash
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default HallDetailPage;
