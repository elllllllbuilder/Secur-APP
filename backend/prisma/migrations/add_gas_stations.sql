-- CreateTable
CREATE TABLE "GasStation" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "address" TEXT,
    "hasElectricCharger" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GasStation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FuelPrice" (
    "id" TEXT NOT NULL,
    "gasStationId" TEXT NOT NULL,
    "fuelType" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "reportedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reportedBy" TEXT,

    CONSTRAINT "FuelPrice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StationReport" (
    "id" TEXT NOT NULL,
    "gasStationId" TEXT NOT NULL,
    "reportType" TEXT NOT NULL,
    "comment" TEXT,
    "reportedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StationReport_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "GasStation_latitude_longitude_idx" ON "GasStation"("latitude", "longitude");

-- CreateIndex
CREATE INDEX "FuelPrice_gasStationId_idx" ON "FuelPrice"("gasStationId");

-- CreateIndex
CREATE INDEX "FuelPrice_reportedAt_idx" ON "FuelPrice"("reportedAt");

-- CreateIndex
CREATE INDEX "StationReport_gasStationId_idx" ON "StationReport"("gasStationId");

-- AddForeignKey
ALTER TABLE "FuelPrice" ADD CONSTRAINT "FuelPrice_gasStationId_fkey" FOREIGN KEY ("gasStationId") REFERENCES "GasStation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StationReport" ADD CONSTRAINT "StationReport_gasStationId_fkey" FOREIGN KEY ("gasStationId") REFERENCES "GasStation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
