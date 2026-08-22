-- CreateTable
CREATE TABLE "CustomerCredit" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "customerEmail" TEXT NOT NULL,
    "balanceCents" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "CreditTransaction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "creditId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "amountCents" INTEGER NOT NULL,
    "orderId" TEXT,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CreditTransaction_creditId_fkey" FOREIGN KEY ("creditId") REFERENCES "CustomerCredit" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Order" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "customerName" TEXT NOT NULL,
    "customerEmail" TEXT NOT NULL,
    "customerPhone" TEXT,
    "customerCpf" TEXT,
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
    "creditUsedCents" INTEGER NOT NULL DEFAULT 0,
    "referralCreditGranted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Order" ("couponCode", "createdAt", "customerCpf", "customerEmail", "customerName", "customerPhone", "discountCents", "id", "paymentMethod", "paymentRef", "pixQrCode", "pixQrCodeBase64", "referralCode", "shippingAddress", "status", "totalCents", "updatedAt") SELECT "couponCode", "createdAt", "customerCpf", "customerEmail", "customerName", "customerPhone", "discountCents", "id", "paymentMethod", "paymentRef", "pixQrCode", "pixQrCodeBase64", "referralCode", "shippingAddress", "status", "totalCents", "updatedAt" FROM "Order";
DROP TABLE "Order";
ALTER TABLE "new_Order" RENAME TO "Order";
CREATE TABLE "new_StoreSettings" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'default',
    "storeName" TEXT NOT NULL DEFAULT 'V.CLOSET',
    "storeSlogan" TEXT,
    "freeShippingCents" INTEGER NOT NULL DEFAULT 29900,
    "whatsappNumber" TEXT NOT NULL DEFAULT '',
    "instagramUrl" TEXT,
    "facebookUrl" TEXT,
    "tiktokUrl" TEXT,
    "referralCreditCents" INTEGER NOT NULL DEFAULT 1000,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_StoreSettings" ("facebookUrl", "freeShippingCents", "id", "instagramUrl", "storeName", "storeSlogan", "tiktokUrl", "updatedAt", "whatsappNumber") SELECT "facebookUrl", "freeShippingCents", "id", "instagramUrl", "storeName", "storeSlogan", "tiktokUrl", "updatedAt", "whatsappNumber" FROM "StoreSettings";
DROP TABLE "StoreSettings";
ALTER TABLE "new_StoreSettings" RENAME TO "StoreSettings";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "CustomerCredit_customerEmail_key" ON "CustomerCredit"("customerEmail");
