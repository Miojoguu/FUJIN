-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_AirQuality" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "weatherDataId" TEXT NOT NULL,
    "co" REAL,
    "no2" REAL,
    "o3" REAL,
    "so2" REAL,
    "pm2_5" REAL,
    "pm10" REAL,
    "usEpaIndex" INTEGER,
    CONSTRAINT "AirQuality_weatherDataId_fkey" FOREIGN KEY ("weatherDataId") REFERENCES "WeatherData" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_AirQuality" ("co", "id", "no2", "o3", "pm10", "pm2_5", "so2", "usEpaIndex", "weatherDataId") SELECT "co", "id", "no2", "o3", "pm10", "pm2_5", "so2", "usEpaIndex", "weatherDataId" FROM "AirQuality";
DROP TABLE "AirQuality";
ALTER TABLE "new_AirQuality" RENAME TO "AirQuality";
CREATE UNIQUE INDEX "AirQuality_weatherDataId_key" ON "AirQuality"("weatherDataId");
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
    CONSTRAINT "Forecast_weatherDataId_fkey" FOREIGN KEY ("weatherDataId") REFERENCES "WeatherData" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Forecast" ("date", "humidity", "id", "maxTemp", "minTemp", "moonPhase", "rainProb", "sunrise", "sunset", "uvIndex", "weatherDataId") SELECT "date", "humidity", "id", "maxTemp", "minTemp", "moonPhase", "rainProb", "sunrise", "sunset", "uvIndex", "weatherDataId" FROM "Forecast";
DROP TABLE "Forecast";
ALTER TABLE "new_Forecast" RENAME TO "Forecast";
CREATE UNIQUE INDEX "Forecast_date_key" ON "Forecast"("date");
CREATE TABLE "new_HourlyForecast" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "forecastId" TEXT NOT NULL,
    "time" DATETIME NOT NULL,
    "temp" REAL,
    "windSpeed" REAL,
    "humidity" INTEGER,
    "rainProb" INTEGER,
    "condition" TEXT,
    "iconUrl" TEXT,
    CONSTRAINT "HourlyForecast_forecastId_fkey" FOREIGN KEY ("forecastId") REFERENCES "Forecast" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_HourlyForecast" ("condition", "forecastId", "humidity", "iconUrl", "id", "rainProb", "temp", "time", "windSpeed") SELECT "condition", "forecastId", "humidity", "iconUrl", "id", "rainProb", "temp", "time", "windSpeed" FROM "HourlyForecast";
DROP TABLE "HourlyForecast";
ALTER TABLE "new_HourlyForecast" RENAME TO "HourlyForecast";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
