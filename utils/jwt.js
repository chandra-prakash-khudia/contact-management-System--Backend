// createAcessToken.js
import jwt from "jsonwebtoken";


export const createAccessToken = (user) => {
  if (!process.env.ACCESS_TOKEN_SECRET) {
    throw new Error("ACCESS_TOKEN_SECRET not set");
  }
 
  const id = user._id ?? user.id ?? user.userId ?? null;
  if (!id) throw new Error("createAccessToken: missing user id");

  const payload = {
    user: {
      id: id.toString(),
      email: user.email ?? null,
      role: user.role ?? null,
    },
  };

  return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRY || "15m",
  });
};