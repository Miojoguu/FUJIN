-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "password_hash" TEXT,
    "provider" TEXT NOT NULL DEFAULT 'local',
    "provider_id" TEXT
);

-- CreateTable
CREATE TABLE "UserPreference" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "unitTemp" TEXT NOT NULL DEFAULT 'C',
    "unitSpeed" TEXT NOT NULL DEFAULT 'mph',
    "hourFormat" TEXT NOT NULL DEFAULT 'h24',
    "simplifiedMode" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "UserPreference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "UserLocation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "name" TEXT,
    "latitude" TEXT NOT NULL,
    "longitude" TEXT NOT NULL,
    CONSTRAINT "UserLocation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "WeatherData" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "locationId" TEXT NOT NULL,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "temperature" TEXT NOT NULL,
    "feelsLike" TEXT,
    "humidity" TEXT,
    "windSpeed" TEXT,
    "windDirection" TEXT,
    "rainProb" TEXT,
    "uvIndex" TEXT,
    "airQuality" TEXT,
    "pressure" TEXT,
    "dewPoint" TEXT,
    CONSTRAINT "WeatherData_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "UserLocation" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Forecast" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "weatherDataId" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "minTemp" TEXT,
    "maxTemp" TEXT,
    "rainProb" TEXT,
    "humidity" TEXT,
    "uvIndex" TEXT,
    CONSTRAINT "Forecast_weatherDataId_fkey" FOREIGN KEY ("weatherDataId") REFERENCES "WeatherData" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "OfficialAlert" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "regionCode" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "startTime" DATETIME NOT NULL,
    "endTime" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "UserAlert" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "threshold" REAL NOT NULL,
    "operator" TEXT NOT NULL,
    "timeOfDay" TEXT,
    CONSTRAINT "UserAlert_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "UserAlert_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "UserLocation" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_provider_provider_id_key" ON "User"("provider", "provider_id");

-- CreateIndex
CREATE UNIQUE INDEX "UserPreference_userId_key" ON "UserPreference"("userId");
