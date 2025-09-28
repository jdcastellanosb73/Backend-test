import jwt from "jsonwebtoken";

const SECRET_KEY = process.env.JWT_SECRET;

export const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, username: user.username },
    SECRET_KEY,
    { expiresIn: "8h" }
  );
};

export const verifyToken = (token) => {
  return jwt.verify(token, SECRET_KEY);
};