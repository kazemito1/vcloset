-- CreateTable
CREATE TABLE "Coupon" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "value" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "expiresAt" DATETIME,
    "maxUses" INTEGER,
    "usedCount" INTEGER NOT NULL DEFAULT 0,
    "minOrderValueCents" INTEGER,
    "sourceReferralId" TEXT,
    "sourceOrderId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Referral" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "referrerName" TEXT NOT NULL,
    "referrerEmail" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "referredDiscountType" TEXT NOT NULL DEFAULT 'PERCENT',
    "referredDiscountValue" INTEGER NOT NULL DEFAULT 10,
    "rewardType" TEXT NOT NULL DEFAULT 'FIXED',
    "rewardValue" INTEGER NOT NULL DEFAULT 2000,
    "usedCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Order" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "customerName" TEXT NOT NULL,
    "customerEmail" TEXT NOT NULL,
    "customerPhone" TEXT,
    "shippingAddress" TEXT NOT NULL,
    "totalCents" INTEGER NOT NULL,
    "discountCents" INTEGER NOT NULL DEFAULT 0,
    "couponCode" TEXT,
    "referralCode" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "paymentMethod" TEXT NOT NULL,
    "paymentRef" TEXT,
    "pixQrCode" TEXT,
    "pixQrCodeBase64" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Order" ("createdAt", "customerEmail", "customerName", "customerPhone", "id", "paymentMethod", "paymentRef", "pixQrCode", "pixQrCodeBase64", "shippingAddress", "status", "totalCents", "updatedAt") SELECT "createdAt", "customerEmail", "customerName", "customerPhone", "id", "paymentMethod", "paymentRef", "pixQrCode", "pixQrCodeBase64", "shippingAddress", "status", "totalCents", "updatedAt" FROM "Order";
DROP TABLE "Order";
ALTER TABLE "new_Order" RENAME TO "Order";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Coupon_code_key" ON "Coupon"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Referral_code_key" ON "Referral"("code");
