import { registerUserService, loginUserService } from "../services/auth.service.js";

export const registerUser = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await registerUserService(username, password);
    res.status(201).json({ message: "Usuario creado", user });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;
    const result = await loginUserService(username, password);
    res.status(200).json(result);
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
};

