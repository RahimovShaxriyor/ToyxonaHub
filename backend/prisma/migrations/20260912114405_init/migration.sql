-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'OWNER', 'USER');

-- CreateEnum
CREATE TYPE "District" AS ENUM ('BEKTEMIR', 'CHILONZOR', 'YASHNOBOD', 'MIROBOD', 'MIRZO_ULUGBEK', 'SERGELI', 'SHAYXONTOHUR', 'OLMAZOR', 'UCHTEPA', 'YAKKASAROY', 'YUNUSOBOD', 'YANGIHAYOT');

-- CreateEnum
CREATE TYPE "HallStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('ACTIVE', 'CANCELLED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PAID');

-- CreateEnum
CREATE TYPE "ServiceType" AS ENUM ('SINGER', 'KARNAY_SURNAY', 'MENU', 'CAR');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RefreshToken" (
    "id" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revoked" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OtpCode" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "codeHash" TEXT NOT NULL,
    "userId" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "isUsed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OtpCode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WeddingHall" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "district" "District" NOT NULL,
    "address" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL,
    "pricePerSeat" DECIMAL(14,2) NOT NULL,
    "phone" TEXT NOT NULL,
    "status" "HallStatus" NOT NULL DEFAULT 'PENDING',
    "ownerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WeddingHall_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WeddingHallImage" (
    "id" TEXT NOT NULL,
    "weddingHallId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WeddingHallImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Singer" (
    "id" TEXT NOT NULL,
    "weddingHallId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" DECIMAL(14,2) NOT NULL,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Singer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Car" (
    "id" TEXT NOT NULL,
    "weddingHallId" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "price" DECIMAL(14,2) NOT NULL,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Car_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MenuOption" (
    "id" TEXT NOT NULL,
    "weddingHallId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MenuOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KarnaySurnayService" (
    "id" TEXT NOT NULL,
    "weddingHallId" TEXT NOT NULL,
    "available" BOOLEAN NOT NULL DEFAULT true,
    "price" DECIMAL(14,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KarnaySurnayService_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Booking" (
    "id" TEXT NOT NULL,
    "weddingHallId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "bookingDate" DATE NOT NULL,
    "guestCount" INTEGER NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "hallPrice" DECIMAL(14,2) NOT NULL,
    "servicesPrice" DECIMAL(14,2) NOT NULL,
    "totalPrice" DECIMAL(14,2) NOT NULL,
    "advanceAmount" DECIMAL(14,2) NOT NULL,
    "status" "BookingStatus" NOT NULL DEFAULT 'ACTIVE',
    "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Booking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BookingSelectedService" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "sourceServiceId" TEXT,
    "serviceType" "ServiceType" NOT NULL,
    "nameSnapshot" TEXT NOT NULL,
    "priceSnapshot" DECIMAL(14,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BookingSelectedService_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_username_idx" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "RefreshToken_tokenHash_key" ON "RefreshToken"("tokenHash");

-- CreateIndex
CREATE INDEX "RefreshToken_userId_idx" ON "RefreshToken"("userId");

-- CreateIndex
CREATE INDEX "RefreshToken_tokenHash_idx" ON "RefreshToken"("tokenHash");

-- CreateIndex
CREATE INDEX "OtpCode_email_idx" ON "OtpCode"("email");

-- CreateIndex
CREATE INDEX "OtpCode_expiresAt_idx" ON "OtpCode"("expiresAt");

-- CreateIndex
CREATE INDEX "WeddingHall_status_idx" ON "WeddingHall"("status");

-- CreateIndex
CREATE INDEX "WeddingHall_district_idx" ON "WeddingHall"("district");

-- CreateIndex
CREATE INDEX "WeddingHall_ownerId_idx" ON "WeddingHall"("ownerId");

-- CreateIndex
CREATE INDEX "WeddingHallImage_weddingHallId_idx" ON "WeddingHallImage"("weddingHallId");

-- CreateIndex
CREATE INDEX "Singer_weddingHallId_idx" ON "Singer"("weddingHallId");

-- CreateIndex
CREATE INDEX "Car_weddingHallId_idx" ON "Car"("weddingHallId");

-- CreateIndex
CREATE INDEX "MenuOption_weddingHallId_idx" ON "MenuOption"("weddingHallId");

-- CreateIndex
CREATE UNIQUE INDEX "KarnaySurnayService_weddingHallId_key" ON "KarnaySurnayService"("weddingHallId");

-- CreateIndex
CREATE INDEX "Booking_weddingHallId_idx" ON "Booking"("weddingHallId");

-- CreateIndex
CREATE INDEX "Booking_userId_idx" ON "Booking"("userId");

-- CreateIndex
CREATE INDEX "Booking_bookingDate_idx" ON "Booking"("bookingDate");

-- CreateIndex
CREATE INDEX "Booking_status_idx" ON "Booking"("status");

-- CreateIndex
CREATE INDEX "BookingSelectedService_bookingId_idx" ON "BookingSelectedService"("bookingId");

-- AddForeignKey
ALTER TABLE "RefreshToken" ADD CONSTRAINT "RefreshToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OtpCode" ADD CONSTRAINT "OtpCode_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WeddingHall" ADD CONSTRAINT "WeddingHall_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WeddingHallImage" ADD CONSTRAINT "WeddingHallImage_weddingHallId_fkey" FOREIGN KEY ("weddingHallId") REFERENCES "WeddingHall"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Singer" ADD CONSTRAINT "Singer_weddingHallId_fkey" FOREIGN KEY ("weddingHallId") REFERENCES "WeddingHall"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Car" ADD CONSTRAINT "Car_weddingHallId_fkey" FOREIGN KEY ("weddingHallId") REFERENCES "WeddingHall"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MenuOption" ADD CONSTRAINT "MenuOption_weddingHallId_fkey" FOREIGN KEY ("weddingHallId") REFERENCES "WeddingHall"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KarnaySurnayService" ADD CONSTRAINT "KarnaySurnayService_weddingHallId_fkey" FOREIGN KEY ("weddingHallId") REFERENCES "WeddingHall"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_weddingHallId_fkey" FOREIGN KEY ("weddingHallId") REFERENCES "WeddingHall"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookingSelectedService" ADD CONSTRAINT "BookingSelectedService_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Concurrency Guarantee: PostgreSQL Partial Unique Index for Active Bookings
CREATE UNIQUE INDEX "unique_active_booking_per_hall_date" ON "Booking" ("weddingHallId", "bookingDate") WHERE "status" = 'ACTIVE';
