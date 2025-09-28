import express from "express";
import dotenv from "dotenv";
import cors from "cors"; // 👈 Importa cors

// Rutas
import authRoutes from "./routes/auth.routes.js";
import transactionsRoutes from "./routes/transactions.routes.js";
import userRoutes from "./routes/user.routes.js";
import cardsRoutes from "./routes/cards.routes.js";

dotenv.config();

const app = express();

// 👇 Configuración de CORS
const corsOptions = {
  origin: [
    "http://localhost:5173",           
    "https://frontend-test-ry7v.onrender.com",
  ],
  credentials: true, 
};

app.use(cors(corsOptions)); 

// Parsear JSON
app.use(express.json());

// Rutas
app.use("/api/auth", authRoutes);
app.use("/api/transactions", transactionsRoutes);
app.use("/api/users", userRoutes);
app.use("/api/cards", cardsRoutes);

// Ruta raíz
app.get("/", (req, res) => {
  res.send("API funcionando correctamente");
});

export default app;