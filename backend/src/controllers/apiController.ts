import { Request, Response } from "express";
import { autoComplete, meteorologicalInfos } from "../services/apiReciveCity";
import {
  LocationSearchResult,
  WeatherData,
} from "../interfaces/interface_apiReciveCity";
import { log } from "console";

export const reciveCity = async (req: Request, res: Response) => {
  try {
    const city = req.params.city;
    const array: LocationSearchResult[] = await autoComplete(city);
    console.log("array:");
    console.log(array);


    const mappedArray = array
      .slice(0, 8) 
      .map((item, index) => ({
        id: item.id.toString(), 
        name: `${item.name}, ${item.country}`, 
      }));
    console.log("mappedArray");

    console.log(mappedArray);

    res.status(200).json(mappedArray);
  } catch (error) {
    console.error("Erro ao receber cidades:", error);
    return [];
  }
};

export const meteorologicalData = async (req: Request, res: Response) => {
  try {

    const id = req.query.id as string;
    const tempUnit = ((req.query.temp as string) || "c").toLowerCase(); 
    const speedUnit = ((req.query.speed as string) || "kph").toLowerCase(); 


    const data: WeatherData = await meteorologicalInfos(id);


    const responseData = {
      temp: tempUnit === "c" ? data.current.temp_c : data.current.temp_f,
      feelslike:
        tempUnit === "c" ? data.current.feelslike_c : data.current.feelslike_f,
      wind: speedUnit === "kph" ? data.current.wind_kph : data.current.wind_mph,
      humidity: data.current.humidity,
      condition: data.current.condition,
      speedUnit: speedUnit,
      tempUnit: tempUnit,
    };

    res.status(200).json(responseData);
  } catch (error) {
    console.error("Erro ao buscar dados meteorológicos:", error);
    res.status(500).json({ error: "Erro ao buscar dados meteorológicos" });
  }
};
