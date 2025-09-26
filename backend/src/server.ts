import express from "express";
import bodyParser from "body-parser";
import userRoutes from "./routes/userRoutes";
import apiRoutes from "./routes/apiRoutes";
import loginRoutes from "./routes/loginRoutes"

const app = express();

app.use(bodyParser.json());


app.use("/api", apiRoutes);
app.use("/users", userRoutes);
app.use("/auth", loginRoutes);

export default app;
