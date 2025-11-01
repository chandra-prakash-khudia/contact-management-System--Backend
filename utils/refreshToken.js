// utils/refreshToken.js
import crypto from "crypto";
import { promisify } from "util";
const randomBytesAsync = promisify(crypto.randomBytes);

export const generateRefreshTokenString = async (byteSize = 64) => {
  const buf = await randomBytesAsync(byteSize);
  // return base64url string (no +/=)
  return buf.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
};

// HMAC SHA256 hash using an app secret (so DB stores hash, not raw token)
export const hashToken = (token, secret) => {
  return crypto.createHmac("sha256", secret).update(token).digest("hex");
};
