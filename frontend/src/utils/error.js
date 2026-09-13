/**
 * Centralized API Error Normalization Utility
 * Extracts error codes, messages, and field-level validation errors
 * from standard backend API responses.
 */

const ERROR_TRANSLATIONS = {
  EMAIL_ALREADY_EXISTS: "Ushbu elektron pochta manzili allaqachon ro'yxatdan o'tgan.",
  USERNAME_ALREADY_EXISTS: "Ushbu foydalanuvchi nomi allaqachon band qilingan.",
  INVALID_CREDENTIALS: "Login yoki parol noto'g'ri.",
  BOOKING_DATE_UNAVAILABLE: "Kechirasiz, tanlangan sana allaqachon band qilingan! Boshqa sanani tanlang.",
  DUPLICATE_ENTRY: "Ushbu ma'lumot allaqachon tizimda mavjud.",
  VALIDATION_ERROR: "Iltimos, kiritilgan ma'lumotlarni tekshiring.",
  INVALID_PHONE: "Telefon raqamini to'g'ri formatda kiriting (masalan: +998901234567).",
  NOT_FOUND: "So'ralgan ma'lumot topilmadi.",
  UNAUTHORIZED: "Tizimga kirish talab etiladi.",
  FORBIDDEN: "Ushbu amalni bajarish uchun sizda yetarli ruxsat yo'q.",
  TOO_MANY_REQUESTS: "Juda ko'p so'rov yuborildi. Iltimos, birozdan so'ng qayta urinib ko'ring.",
  UPLOAD_ERROR: "Fayl yuklashda xatolik yuz berdi. Maksimal hajm 5MB.",
  INTERNAL_SERVER_ERROR: "Serverda kutilmagan xatolik yuz berdi. Iltimos, birozdan so'ng qayta urinib ko'ring.",
};

const FIELD_TRANSLATIONS = {
  firstName: 'Ism',
  lastName: 'Familiya',
  email: 'Elektron pochta',
  username: 'Foydalanuvchi nomi',
  password: 'Parol',
  phone: 'Telefon raqami',
  name: "To'yxona nomi",
  district: 'Tuman',
  address: 'Manzil',
  capacity: "Sig'im",
  pricePerSeat: "O'rindiq narxi",
  bookingDate: "To'y sanasi",
  guestCount: 'Mehmonlar soni',
};

/**
 * Normalizes any API error into a structured, predictable format.
 *
 * @param {any} error - The caught error (typically AxiosError)
 * @param {string} [fallbackMessage] - Optional custom fallback message
 * @returns {{ code: string, message: string, fieldErrors: Record<string, string>, status: number }}
 */
export function normalizeApiError(error, fallbackMessage = "Xatolik yuz berdi.") {
  // Handle network / offline errors
  if (error?.code === 'ERR_NETWORK' || error?.message === 'Network Error') {
    return {
      code: 'NETWORK_ERROR',
      message: "Internet bilan aloqa uzildi. Iltimos, internet aloqasini tekshiring.",
      fieldErrors: {},
      status: 0,
    };
  }

  // Handle timeout errors
  if (error?.code === 'ECONNABORTED' || error?.message?.includes('timeout')) {
    return {
      code: 'TIMEOUT',
      message: "Server javob berish vaqti tugadi. Iltimos, qayta urinib ko'ring.",
      fieldErrors: {},
      status: 408,
    };
  }

  const response = error?.response;
  const status = response?.status || 500;
  const data = response?.data;

  // Backend standard format: { success: false, error: { code, message, details } }
  const backendError = data?.error || (typeof data === 'object' ? data : null);
  const code = backendError?.code || (status === 404 ? 'NOT_FOUND' : status === 401 ? 'UNAUTHORIZED' : status === 403 ? 'FORBIDDEN' : status === 409 ? 'CONFLICT' : 'ERROR');

  const fieldErrors = {};

  // Extract Zod validation details: [{ field: 'phone', message: '...' }]
  if (Array.isArray(backendError?.details)) {
    backendError.details.forEach((item) => {
      const field = item.field || (Array.isArray(item.path) ? item.path.join('.') : undefined);
      if (field && item.message) {
        fieldErrors[field] = item.message;
      }
    });
  } else if (backendError?.details && typeof backendError.details === 'object') {
    Object.entries(backendError.details).forEach(([key, val]) => {
      if (typeof val === 'string') fieldErrors[key] = val;
    });
  }

  // Determine top-level user message
  let message = ERROR_TRANSLATIONS[code];

  if (!message) {
    if (backendError?.message && typeof backendError.message === 'string' && backendError.message !== 'Validation failed') {
      message = backendError.message;
    } else if (Object.keys(fieldErrors).length > 0) {
      const firstField = Object.keys(fieldErrors)[0];
      const fieldLabel = FIELD_TRANSLATIONS[firstField] || firstField;
      message = `${fieldLabel}: ${fieldErrors[firstField]}`;
    } else if (status === 401) {
      message = "Tizimga kirish talab etiladi yoki sessiya muddati tugagan.";
    } else if (status === 403) {
      message = "Ushbu amalni bajarish uchun sizda yetarli ruxsat yo'q.";
    } else if (status === 404) {
      message = "So'ralgan ma'lumot topilmadi.";
    } else {
      message = fallbackMessage;
    }
  }

  return {
    code,
    message,
    fieldErrors,
    status,
  };
}
