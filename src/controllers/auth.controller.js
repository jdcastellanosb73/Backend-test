import { registerUserService, loginUserService } from "../services/auth.service.js";

export const registerUser = async (req, res) => {
  try {
    const { username, email, full_name, password } = req.body;

    if (!username || !email || !full_name || !password) {
      return res.status(400).json({
        message: "Faltan campos obligatorios: username, email, full_name, password"
      });
    }

    const user = await registerUserService(username, email, full_name, password);
    res.status(201).json({ message: "Usuario creado", user });
  } catch (error) {
    console.error("Error en registerUser:", error);
    res.status(400).json({ message: error.message });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        message: "Faltan campos obligatorios: username y password"
      });
    }

    const result = await loginUserService(username, password);
    res.status(200).json(result);
  } catch (error) {
    console.error("Error en loginUser:", error);
    res.status(401).json({ message: error.message });
  }
};

