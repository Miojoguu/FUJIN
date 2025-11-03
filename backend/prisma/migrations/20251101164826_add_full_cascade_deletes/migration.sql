-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
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
    CONSTRAINT "WeatherData_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "UserLocation" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_WeatherData" ("dewPoint", "feelsLike", "humidity", "id", "locationId", "pressure", "rainProb", "temperature", "timestamp", "uvIndex", "windDirection", "windSpeed") SELECT "dewPoint", "feelsLike", "humidity", "id", "locationId", "pressure", "rainProb", "temperature", "timestamp", "uvIndex", "windDirection", "windSpeed" FROM "WeatherData";
DROP TABLE "WeatherData";
ALTER TABLE "new_WeatherData" RENAME TO "WeatherData";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
