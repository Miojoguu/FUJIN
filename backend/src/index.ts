// src/index.ts (RENOMEADO)

import express from "express";
import bodyParser from "body-parser";
import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

import userRoutes from "./routes/userRoutes";
import apiRoutes from "./routes/apiRoutes";
import loginRoutes from "./routes/loginRoutes";
import userLocationRoutes from "./routes/userLocationRoutes";
import userAlertRoutes from "./routes/userAlertRoutes";
import weatherRoutes from "./routes/weatherRoutes";

// (NÃO importe os serviços de cron aqui)

const app = express();
app.use(bodyParser.json());

// --- Configuração do Swagger ---
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API do App de Clima",
      version: "1.0.0",
      description:
        "Documentação oficial da API para o aplicativo de clima (Sprints 1, 2 e 3)",
    },
    servers: [
      {
        url: "http://localhost:3000",
      },
    ],
  },
  apis: ["./src/routes/*.ts"],
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
// --- Fim da Configuração do Swagger ---

// Suas rotas existentes
app.use("/locations", userLocationRoutes);
app.use("/api", apiRoutes);
app.use("/users", userRoutes);
app.use("/auth", loginRoutes);
app.use("/alerts", userAlertRoutes);
app.use("/weather", weatherRoutes);

// [REMOVIDO DAQUI] startCacheRefreshService();
// [REMOVIDO DAQUI] startAlertService();

export default app;
