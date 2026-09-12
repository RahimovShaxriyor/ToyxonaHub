export const BOOKING_STATUS_CONFIG = {
  ACTIVE: {
    label: 'Faol',
    variant: 'info',
    bg: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  COMPLETED: {
    label: 'Tugallangan',
    variant: 'success',
    bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  CANCELLED: {
    label: 'Bekor qilingan',
    variant: 'danger',
    bg: 'bg-rose-50 text-rose-700 border-rose-200',
  },
};

export const PAYMENT_STATUS_CONFIG = {
  UNPAID: {
    label: "To'lanmagan",
    variant: 'warning',
    bg: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  ADVANCE_PAID: {
    label: "20% avans to'langan",
    variant: 'success',
    bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  FULLY_PAID: {
    label: "To'liq to'langan",
    variant: 'success',
    bg: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  },
};

export const HALL_STATUS_CONFIG = {
  PENDING: {
    label: 'Kutilmoqda',
    variant: 'warning',
    bg: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  APPROVED: {
    label: 'Tasdiqlangan',
    variant: 'success',
    bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  REJECTED: {
    label: 'Rad etilgan',
    variant: 'danger',
    bg: 'bg-rose-50 text-rose-700 border-rose-200',
  },
};

export const SERVICE_TYPE_CONFIG = {
  SINGER: {
    label: "San'atkor / Xonanda",
    shortLabel: 'Xonanda',
    color: 'text-purple-600',
  },
  CAR: {
    label: 'Kortej avtomobili',
    shortLabel: 'Kortej',
    color: 'text-blue-600',
  },
  MENU: {
    label: 'Taomnoma toifasi',
    shortLabel: 'Menyu',
    color: 'text-amber-600',
  },
  KARNAY_SURNAY: {
    label: 'Karnay-surnay guruhi',
    shortLabel: 'Karnay-surnay',
    color: 'text-rose-600',
  },
};
