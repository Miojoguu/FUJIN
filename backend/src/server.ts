// src/server.ts

import app from "./index"; // [MUDANÇA] Importe de './index' (não './index.tsx')

// [NOVO] Importe os serviços de cron aqui
import { startCacheRefreshService } from "./services/cacheRefreshService";
import { startAlertService } from "./services/alertService";

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
  console.log(
    `Documentação Swagger disponível em http://localhost:${PORT}/api-docs`
  );
  startCacheRefreshService();
  startAlertService();
});
