-- CreateTable
CREATE TABLE "FAQCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "icon" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FAQCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FAQItem" (
    "id" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "shortAnswer" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "slug" TEXT,
    "metaKeywords" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "categoryId" TEXT NOT NULL,
    "userId" TEXT,

    CONSTRAINT "FAQItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LicenseInfo" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "basePrice" DECIMAL(10,2) NOT NULL,
    "features" TEXT[],
    "limitations" TEXT[],
    "useCases" TEXT[],
    "maxCopies" INTEGER,
    "maxStreams" INTEGER,
    "maxVideos" INTEGER,
    "allowsLiveProfit" BOOLEAN NOT NULL DEFAULT false,
    "allowsRadioTV" BOOLEAN NOT NULL DEFAULT false,
    "allowsSync" BOOLEAN NOT NULL DEFAULT false,
    "includesWav" BOOLEAN NOT NULL DEFAULT true,
    "includesMp3" BOOLEAN NOT NULL DEFAULT true,
    "includesStems" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "userId" TEXT,

    CONSTRAINT "LicenseInfo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LicenseFeature" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "category" TEXT,
    "wavValue" TEXT NOT NULL,
    "trackoutValue" TEXT NOT NULL,
    "unlimitedValue" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LicenseFeature_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PrivacySection" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "icon" TEXT,
    "orderIndex" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT,

    CONSTRAINT "PrivacySection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TermsSection" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "icon" TEXT,
    "orderIndex" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "version" TEXT NOT NULL DEFAULT '1.0',
    "effectiveFrom" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT,

    CONSTRAINT "TermsSection_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FAQCategory_name_key" ON "FAQCategory"("name");

-- CreateIndex
CREATE UNIQUE INDEX "FAQCategory_slug_key" ON "FAQCategory"("slug");

-- CreateIndex
CREATE INDEX "FAQCategory_slug_idx" ON "FAQCategory"("slug");

-- CreateIndex
CREATE INDEX "FAQCategory_sortOrder_idx" ON "FAQCategory"("sortOrder");

-- CreateIndex
CREATE INDEX "FAQItem_categoryId_idx" ON "FAQItem"("categoryId");

-- CreateIndex
CREATE INDEX "FAQItem_featured_idx" ON "FAQItem"("featured");

-- CreateIndex
CREATE INDEX "FAQItem_isActive_idx" ON "FAQItem"("isActive");

-- CreateIndex
CREATE INDEX "FAQItem_sortOrder_idx" ON "FAQItem"("sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "FAQItem_slug_key" ON "FAQItem"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "LicenseInfo_name_key" ON "LicenseInfo"("name");

-- CreateIndex
CREATE UNIQUE INDEX "LicenseInfo_slug_key" ON "LicenseInfo"("slug");

-- CreateIndex
CREATE INDEX "LicenseInfo_slug_idx" ON "LicenseInfo"("slug");

-- CreateIndex
CREATE INDEX "LicenseInfo_isActive_idx" ON "LicenseInfo"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "LicenseFeature_slug_key" ON "LicenseFeature"("slug");

-- CreateIndex
CREATE INDEX "LicenseFeature_slug_idx" ON "LicenseFeature"("slug");

-- CreateIndex
CREATE INDEX "LicenseFeature_category_idx" ON "LicenseFeature"("category");

-- CreateIndex
CREATE INDEX "LicenseFeature_sortOrder_idx" ON "LicenseFeature"("sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "PrivacySection_slug_key" ON "PrivacySection"("slug");

-- CreateIndex
CREATE INDEX "PrivacySection_slug_idx" ON "PrivacySection"("slug");

-- CreateIndex
CREATE INDEX "PrivacySection_orderIndex_idx" ON "PrivacySection"("orderIndex");

-- CreateIndex
CREATE UNIQUE INDEX "TermsSection_slug_key" ON "TermsSection"("slug");

-- CreateIndex
CREATE INDEX "TermsSection_slug_idx" ON "TermsSection"("slug");

-- CreateIndex
CREATE INDEX "TermsSection_orderIndex_idx" ON "TermsSection"("orderIndex");

-- CreateIndex
CREATE INDEX "TermsSection_version_idx" ON "TermsSection"("version");

-- AddForeignKey
ALTER TABLE "FAQItem" ADD CONSTRAINT "FAQItem_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "FAQCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FAQItem" ADD CONSTRAINT "FAQItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LicenseInfo" ADD CONSTRAINT "LicenseInfo_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrivacySection" ADD CONSTRAINT "PrivacySection_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TermsSection" ADD CONSTRAINT "TermsSection_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
