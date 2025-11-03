// src/contexts/WeatherContext.tsx
import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useCallback, // 1. IMPORTAR useCallback
} from "react";

// ... (Interface CurrentLocationCoords)
interface CurrentLocationCoords {
  latitude: number;
  longitude: number;
}

interface WeatherContextData {
  currentLocationId: string | null;
  currentLocationCoords: CurrentLocationCoords | null;
  setCurrentContext: (
    id: string | null,
    coords: CurrentLocationCoords | null
  ) => void;
  homeScreenRefreshToggle: boolean;
  triggerHomeRefresh: () => void;
}

const WeatherContext = createContext<WeatherContextData>(
  {} as WeatherContextData
);

export const WeatherProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [currentLocationId, setCurrentLocationId] = useState<string | null>(
    null
  );
  const [currentLocationCoords, setCurrentLocationCoords] =
    useState<CurrentLocationCoords | null>(null);

  const [homeScreenRefreshToggle, setHomeScreenRefreshToggle] = useState(false);

  // 2. ENVOLVER A FUNÇÃO EM useCallback
  const setCurrentContext = useCallback(
    (id: string | null, coords: CurrentLocationCoords | null) => {
      setCurrentLocationId(id);
      setCurrentLocationCoords(coords);
    },
    [] // Array de dependências vazio (a função nunca muda)
  );

  // 3. ENVOLVER A FUNÇÃO EM useCallback
  const triggerHomeRefresh = useCallback(() => {
    setHomeScreenRefreshToggle((prev) => !prev);
  }, []);

  return (
    <WeatherContext.Provider
      value={{
        currentLocationId,
        currentLocationCoords,
        setCurrentContext,
        homeScreenRefreshToggle,
        triggerHomeRefresh,
      }}
    >
      {children}
    </WeatherContext.Provider>
  );
};

export function useWeather() {
  return useContext(WeatherContext);
}
