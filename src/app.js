import express from "express";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.routes.js";
import transactionsRoutes from "./routes/transactions.routes.js";
import userRoutes from "./routes/user.routes.js";
import cardsRoutes from "./routes/cards.routes.js";


dotenv.config();

const app = express();
app.use(express.json());


app.use("/api/auth", authRoutes);
app.use("/api/transactions", transactionsRoutes);
app.use("/api/users", userRoutes);
app.use("/api/cards", cardsRoutes);


app.get("/", (req, res) => {
  res.send("API funcionando correctamente");
});

export default app;