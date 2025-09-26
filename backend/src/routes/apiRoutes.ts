import { Router } from "express";
import { reciveCity, meteorologicalData } from "../controllers/apiController";

const router = Router();

router.get("/:city", reciveCity);

router.get("/weather/data", meteorologicalData);

export default router;
