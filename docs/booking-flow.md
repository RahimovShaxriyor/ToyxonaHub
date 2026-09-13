# End-to-End Booking Lifecycle

## 1. Overview

The ToyxonaHub booking lifecycle is designed to minimize customer friction by allowing guests to freely discover venues, inspect availability, and customize services without requiring an account upfront. Authentication is requested only at the final confirmation step, with zero loss of customer selections.

---

## 2. Booking Journey Sequence Diagram

```mermaid
sequenceDiagram
    autonumber
    actor Customer as Customer (Guest / User)
    participant UI as Frontend (React SPA)
    participant API as Backend (Express API)
    participant DB as PostgreSQL Database
    participant Redis as Redis Cache

    Note over Customer,DB: Phase 1: Venue Discovery & Date Selection
    Customer->>UI: Visits /halls/:id (Venue Profile)
    UI->>API: GET /api/v1/wedding-halls/:id
    API->>Redis: Check cached hall details
    API-->>UI: Returns hall metadata, photos & services
    Customer->>UI: Views Availability Calendar
    UI->>API: GET /api/v1/wedding-halls/:id/availability?year=2026&month=9
    API->>DB: Query ACTIVE Bookings for hall in target month
    API-->>UI: Returns day status array (AVAILABLE, BOOKED, PAST)
    Customer->>UI: Selects available future date (e.g. 2026-09-24)
    Customer->>UI: Selects optional services (Singer, Cortege car, Menu)

    Note over Customer,DB: Phase 2: Guest Gate & Draft Preservation
    Customer->>UI: Clicks "Bron qilishni davom etish"
    alt User is not authenticated
        UI->>UI: Save draft to sessionStorage (hallId, date, guests, services)
        UI->>UI: Redirect to /login with state: { from: '/halls/:id' }
        Customer->>UI: Enters credentials or registers
        UI->>API: POST /api/v1/auth/login
        API-->>UI: 200 OK (Tokens + Profile)
        UI->>UI: Redirects back to /halls/:id
        UI->>UI: Restores draft from sessionStorage & opens Confirm Modal
    end

    Note over Customer,DB: Phase 3: Booking Submission & Concurrency Lock
    Customer->>UI: Confirms name & phone, clicks "Tasdiqlash va bron qilish"
    UI->>API: POST /api/v1/bookings (hallId, date, guests, services, phone)
    API->>API: Start database transaction ($transaction)
    API->>DB: Check for existing ACTIVE booking on (hallId, date)
    alt Date is already booked (Concurrent conflict)
        DB-->>API: Conflict detected (Index or SELECT)
        API-->>UI: 409 Conflict ("BOOKING_DATE_UNAVAILABLE")
        UI-->>Customer: Displays error: "Tanlangan sana allaqachon band qilingan!"
    else Date is available
        API->>API: Calculate authoritative pricing with Decimal.js
        API->>DB: INSERT Booking (status: ACTIVE, paymentStatus: PENDING)
        API->>DB: INSERT BookingSelectedService (Historical price snapshots)
        API->>Redis: Invalidate hall availability cache
        API-->>UI: 201 Created (Created Booking details + advance amount)
    end

    Note over Customer,DB: Phase 4: 20% Advance Payment Simulation
    UI-->>Customer: Closes Booking Modal, opens 20% Advance Payment Modal
    Customer->>UI: Clicks "20% avansni to'lash"
    UI->>API: POST /api/v1/bookings/:id/pay
    API->>DB: UPDATE Booking SET paymentStatus = 'PAID'
    API-->>UI: 200 OK ("Muvaffaqiyatli to'landi")
    UI->>UI: Navigate to /my-bookings
    UI-->>Customer: Displays active booking card with PAID 20% badge
```

---

## 3. Server-Authoritative Price Calculation

While the frontend computes a live preview estimate during service selection to provide instant feedback, the **backend is strictly authoritative** for all finalized transaction amounts.

When `POST /api/v1/bookings` is received, the calculation engine (`calculateBookingPrices`) executes the following operations using `Decimal.js`:

$$
\text{hallPrice} = \text{pricePerSeat} \times \text{guestCount}
$$

$$
\text{servicesPrice} = \sum \text{Verified Prices from DB for Singer, Car, Menu, Karnay}
$$

$$
\text{totalPrice} = \text{hallPrice} + \text{servicesPrice}
$$

$$
\text{advanceAmount} = \text{totalPrice} \times 0.20 \quad (\text{rounded to } 2 \text{ decimals})
$$

### Immutable Historical Snapshots
To prevent past customer bookings from fluctuating if venue owners subsequently change service fees, every selected service is recorded in `BookingSelectedService` with an immutable price snapshot:
- `nameSnapshot`: Exact service name at time of booking (e.g. *"Botir Qodirov"*).
- `priceSnapshot`: Exact fee applied at time of booking (e.g. `11000000.00`).

---

## 4. Concurrency & Double-Booking Protection

ToyxonaHub guarantees that two customers cannot reserve the same wedding hall on the same date:

1. **Transaction Pre-Check**: The backend service queries for any existing `ACTIVE` reservation on `(weddingHallId, bookingDate)` inside an interactive transaction.
2. **PostgreSQL Partial Unique Index**:
   ```sql
   CREATE UNIQUE INDEX unique_active_booking_per_hall_date
   ON "Booking" ("weddingHallId", "bookingDate")
   WHERE status = 'ACTIVE';
   ```
3. If two concurrent requests pass application checks simultaneously, the PostgreSQL storage engine forces one transaction to succeed and throws unique constraint error `P2002` on the other.
4. The error handler maps `P2002` on `bookingDate` directly to HTTP `409 Conflict` with code `BOOKING_DATE_UNAVAILABLE`.
5. The frontend invalidates query cache `['hall-availability', id]`, automatically re-rendering the date as occupied (`BOOKED`) on the calendar.

---

## 5. Simulated 20% Advance Payment

> [!NOTE]
> ToyxonaHub uses a **simulated mock payment workflow** to fulfill academic and demonstration contract requirements. No third-party payment gateways (e.g. Payme, Click, Stripe) are integrated.

- **Endpoint**: `POST /api/v1/bookings/:id/pay`
- **Idempotency Rules**:
  - If the booking status is `CANCELLED`, payment is rejected (`400 Bad Request`).
  - If `paymentStatus` is already `PAID`, subsequent calls return success without duplicating transactions.
  - Upon successful payment, the customer receives confirmation message *"Muvaffaqiyatli to'landi"*.
