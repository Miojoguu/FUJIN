import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useCallback,
  useEffect,
} from "react";
import api from "../services/api";
import { useAuth } from "./AuthContext";

interface CurrentLocationCoords {
  latitude: number;
  longitude: number;
}

export type HourFormat = "h12" | "h24";

interface WeatherContextData {
  currentLocationId: string | null;
  currentLocationCoords: CurrentLocationCoords | null;
  setCurrentContext: (
    id: string | null,
    coords: CurrentLocationCoords | null
  ) => void;

  homeScreenRefreshToggle: boolean;
  triggerHomeRefresh: () => void;

  isSimplifiedMode: boolean;
  setSimplifiedMode: (value: boolean) => void;

  hourFormat: HourFormat;
  setHourFormat: (value: HourFormat) => void;
}

const WeatherContext = createContext<WeatherContextData>(
  {} as WeatherContextData
);

export const WeatherProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { user } = useAuth();

  const [currentLocationId, setCurrentLocationId] = useState<string | null>(
    null
  );
  const [currentLocationCoords, setCurrentLocationCoords] =
    useState<CurrentLocationCoords | null>(null);

  const [homeScreenRefreshToggle, setHomeScreenRefreshToggle] = useState(false);

  const [isSimplifiedMode, setIsSimplifiedModeState] = useState(false);
  const [hourFormat, setHourFormatState] = useState<HourFormat>("h24");

  useEffect(() => {
    if (user) {
      api
        .get(`/users/${user.id}/preferences`)
        .then((response) => {
          if (response.data.simplifiedMode) {
            setIsSimplifiedModeState(true);
          }

          if (response.data.hourFormat) {
            setHourFormatState(response.data.hourFormat);
          }
        })
        .catch((err) => {
          console.log(
            "Info: Preferências não encontradas ou erro ao carregar.",
            err.message
          );
        });
    }
  }, [user]);

  const setCurrentContext = useCallback(
    (id: string | null, coords: CurrentLocationCoords | null) => {
      setCurrentLocationId(id);
      setCurrentLocationCoords(coords);
    },
    []
  );

  const triggerHomeRefresh = useCallback(() => {
    setHomeScreenRefreshToggle((prev) => !prev);
  }, []);

  const setSimplifiedMode = useCallback((value: boolean) => {
    setIsSimplifiedModeState(value);
  }, []);

  const setHourFormat = useCallback((value: HourFormat) => {
    setHourFormatState(value);
  }, []);

  return (
    <WeatherContext.Provider
      value={{
        currentLocationId,
        currentLocationCoords,
        setCurrentContext,
        homeScreenRefreshToggle,
        triggerHomeRefresh,
        isSimplifiedMode,
        setSimplifiedMode,
        hourFormat,
        setHourFormat,
      }}
    >
      {children}
    </WeatherContext.Provider>
  );
};

export function useWeather() {
  return useContext(WeatherContext);
}
