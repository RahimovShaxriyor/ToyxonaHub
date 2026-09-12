import Decimal from 'decimal.js';
import { ADVANCE_PAYMENT_PERCENTAGE } from '../constants/status.js';

export const calculateBookingPrices = ({ pricePerSeat, guestCount, selectedServices = [] }) => {
  const seatPriceDecimal = new Decimal(pricePerSeat);
  const countDecimal = new Decimal(guestCount);
  const hallPriceDecimal = seatPriceDecimal.times(countDecimal);

  const servicesPriceDecimal = selectedServices.reduce((acc, svc) => {
    return acc.plus(new Decimal(svc.price));
  }, new Decimal(0));

  const totalPriceDecimal = hallPriceDecimal.plus(servicesPriceDecimal);
  const advanceAmountDecimal = totalPriceDecimal.times(new Decimal(ADVANCE_PAYMENT_PERCENTAGE));

  return {
    hallPrice: hallPriceDecimal.toFixed(2),
    servicesPrice: servicesPriceDecimal.toFixed(2),
    totalPrice: totalPriceDecimal.toFixed(2),
    advanceAmount: advanceAmountDecimal.toFixed(2),
  };
};
