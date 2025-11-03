/*
  Warnings:

  - You are about to alter the column `humidity` on the `Forecast` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - You are about to alter the column `maxTemp` on the `Forecast` table. The data in that column could be lost. The data in that column will be cast from `String` to `Float`.
  - You are about to alter the column `minTemp` on the `Forecast` table. The data in that column could be lost. The data in that column will be cast from `String` to `Float`.
  - You are about to alter the column `rainProb` on the `Forecast` table. The data in that column could be lost. The data in that column will be cast from `String` to `Float`.
  - You are about to alter the column `uvIndex` on the `Forecast` table. The data in that column could be lost. The data in that column will be cast from `String` to `Float`.
  - You are about to alter the column `latitude` on the `UserLocation` table. The data in that column could be lost. The data in that column will be cast from `String` to `Float`.
  - You are about to alter the column `longitude` on the `UserLocation` table. The data in that column could be lost. The data in that column will be cast from `String` to `Float`.
  - You are about to drop the column `airQuality` on the `WeatherData` table. All the data in the column will be lost.
  - You are about to alter the column `dewPoint` on the `WeatherData` table. The data in that column could be lost. The data in that column will be cast from `String` to `Float`.
  - You are about to alter the column `feelsLike` on the `WeatherData` table. The data in that column could be lost. The data in that column will be cast from `String` to `Float`.
  - You are about to alter the column `humidity` on the `WeatherData` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - You are about to alter the column `pressure` on the `WeatherData` table. The data in that column could be lost. The data in that column will be cast from `String` to `Float`.
  - You are about to alter the column `rainProb` on the `WeatherData` table. The data in that column could be lost. The data in that column will be cast from `String` to `Float`.
  - You are about to alter the column `temperature` on the `WeatherData` table. The data in that column could be lost. The data in that column will be cast from `String` to `Float`.
  - You are about to alter the column `uvIndex` on the `WeatherData` table. The data in that column could be lost. The data in that column will be cast from `String` to `Float`.
  - You are about to alter the column `windSpeed` on the `WeatherData` table. The data in that column could be lost. The data in that column will be cast from `String` to `Float`.

*/
-- CreateTable
CREATE TABLE "AirQuality" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "weatherDataId" TEXT NOT NULL,
    "co" REAL,
    "no2" REAL,
    "o3" REAL,
    "so2" REAL,
    "pm2_5" REAL,
    "pm10" REAL,
    "usEpaIndex" INTEGER,
    CONSTRAINT "AirQuality_weatherDataId_fkey" FOREIGN KEY ("weatherDataId") REFERENCES "WeatherData" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "HourlyForecast" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "forecastId" TEXT NOT NULL,
    "time" DATETIME NOT NULL,
    "temp" REAL,
    "windSpeed" REAL,
    "humidity" INTEGER,
    "rainProb" INTEGER,
    "condition" TEXT,
    "iconUrl" TEXT,
    CONSTRAINT "HourlyForecast_forecastId_fkey" FOREIGN KEY ("forecastId") REFERENCES "Forecast" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Forecast" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "weatherDataId" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "minTemp" REAL,
    "maxTemp" REAL,
    "rainProb" REAL,
    "humidity" INTEGER,
    "uvIndex" REAL,
    "sunrise" TEXT,
    "sunset" TEXT,
    "moonPhase" TEXT,
    CONSTRAINT "Forecast_weatherDataId_fkey" FOREIGN KEY ("weatherDataId") REFERENCES "WeatherData" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Forecast" ("date", "humidity", "id", "maxTemp", "minTemp", "rainProb", "uvIndex", "weatherDataId") SELECT "date", "humidity", "id", "maxTemp", "minTemp", "rainProb", "uvIndex", "weatherDataId" FROM "Forecast";
DROP TABLE "Forecast";
ALTER TABLE "new_Forecast" RENAME TO "Forecast";
CREATE UNIQUE INDEX "Forecast_date_key" ON "Forecast"("date");
CREATE TABLE "new_UserLocation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "name" TEXT,
    "latitude" REAL NOT NULL,
    "longitude" REAL NOT NULL,
    CONSTRAINT "UserLocation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_UserLocation" ("id", "latitude", "longitude", "name", "userId") SELECT "id", "latitude", "longitude", "name", "userId" FROM "UserLocation";
DROP TABLE "UserLocation";
ALTER TABLE "new_UserLocation" RENAME TO "UserLocation";
CREATE TABLE "new_WeatherData" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "locationId" TEXT NOT NULL,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "temperature" REAL,
    "feelsLike" REAL,
    "humidity" INTEGER,
    "windSpeed" REAL,
    "windDirection" TEXT,
    "rainProb" REAL,
    "uvIndex" REAL,
    "pressure" REAL,
    "dewPoint" REAL,
    CONSTRAINT "WeatherData_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "UserLocation" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_WeatherData" ("dewPoint", "feelsLike", "humidity", "id", "locationId", "pressure", "rainProb", "temperature", "timestamp", "uvIndex", "windDirection", "windSpeed") SELECT "dewPoint", "feelsLike", "humidity", "id", "locationId", "pressure", "rainProb", "temperature", "timestamp", "uvIndex", "windDirection", "windSpeed" FROM "WeatherData";
DROP TABLE "WeatherData";
ALTER TABLE "new_WeatherData" RENAME TO "WeatherData";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "AirQuality_weatherDataId_key" ON "AirQuality"("weatherDataId");
