// middleaware
// validateTokenHandler
import jwt from "jsonwebtoken";


export const Validator = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401);
      return next(new Error("Token missing or malformed"));
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      res.status(401);
      return next(new Error("Token missing"));
    }
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    console.log(decoded)

    const payloadUser = decoded.user ?? decoded;
    
    // normalize id field to string
    payloadUser.id = payloadUser.id ?? payloadUser._id ?? payloadUser.userId ?? null;
    if (!payloadUser.id) {
      res.status(401);
      return next(new Error("Token payload missing user id"));
    }

    // attach minimal user info
    req.user = {
      id: payloadUser.id.toString(),
      email: payloadUser.email ?? null,
      role: payloadUser.role ?? null,
    };

    return next();
  } catch (err) {
    // jwt.verify throws for expired/invalid tokens
    res.status(401);
    return next(new Error("User not authorized"));
  }
};
