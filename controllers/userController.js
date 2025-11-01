// register user
import User from "../models/userModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import RefreshToken from "../models/refreshTokenModel.js";
import { createAccessToken } from "../utils/jwt.js";
import {
  generateRefreshTokenString,
  hashToken,
} from "../utils/refreshToken.js";
import dotenv from "dotenv"
dotenv.config(); 
const COOKIE_NAME = process.env.REFRESH_TOKEN_COOKIE_NAME || "jid";
const COOKIE_SECURE = process.env.REFRESH_TOKEN_COOKIE_SECURE === "true";
const REFRESH_DAYS = parseInt(process.env.REFRESH_TOKEN_EXPIRY_DAYS || "7", 10);
const HASH_SECRET = process.env.REFRESH_TOKEN_HASH_SECRET;
const cookieOptions = {
  httpOnly: true,
  secure: COOKIE_SECURE,
  sameSite: "Strict",
  maxAge: REFRESH_DAYS * 24 * 60 * 60 * 1000,
  path: "/", 
};



export const refreshToken = async (req, res, next) => {
  // token can come from cookie or body (we prefer cookie)
  console.log("cookies:", req.cookies);
  const incomingToken = req.cookies?.[COOKIE_NAME] || req.body.refreshToken;
  if (!incomingToken) {
    res.status(401);
    throw new Error("Refresh token missing");
  }
   const incomingHash = hashToken(incomingToken, HASH_SECRET);
     const tokenDoc = await RefreshToken.findOne({ tokenHash: incomingHash }).populate("user");
  if (!tokenDoc) {
    // token not found -> possible reuse or already revoked
    res.status(401);
    throw new Error("Invalid refresh token");
  }
  // check expiry
  if (tokenDoc.expiresAt < new Date()) {
    res.status(401);
     throw new Error("Refresh token expired");
  }

  // check revoked
  if (tokenDoc.revokedAt) {
    res.status(401);
    throw new Error("Refresh token has been revoked");
  }
  // All good: rotate refresh token (recommended)
  const newRefreshTokenString = await generateRefreshTokenString();
  const newHash = hashToken(newRefreshTokenString, HASH_SECRET);
  const newExpiresAt = new Date(Date.now() + REFRESH_DAYS * 24 * 60 * 60 * 1000);

  // mark current token as revoked and set replacedByTokenHash
  tokenDoc.revokedAt = new Date();
  tokenDoc.revokedByIp = req.ip;
  tokenDoc.replacedByTokenHash = newHash;
  await tokenDoc.save();

  // create new token doc
  const newTokenDoc = await RefreshToken.create({
    tokenHash: newHash,
    user: tokenDoc.user._id,
    expiresAt: newExpiresAt,
    createdByIp: req.ip,
    deviceInfo: req.get("user-agent") || null,
  });
  // create new access token
  const user = tokenDoc.user._id;
  
  const newAccessToken = createAccessToken(user);

  // set new cookie
  res.cookie(COOKIE_NAME, newRefreshTokenString, cookieOptions);

  return res.status(200).json({ accessToken: newAccessToken });


}

export const registerUser = async (req, res) => {
  const { userName, email, password } = req.body;
  if (!userName || !email || !password) {
    res.status(400);
    throw new Error("Please Fill all the details");
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    res.status(403);
    throw new Error("User with this Email All ready Exist");
  }
  const Salt = process.env.SALT_COUNT;
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({
    userName: userName,
    email: email,
    password: hashedPassword,
  });
  if (user) {
    res.status(201).json({ _id: user.id, email: user.email });
  } else {
    res.status(400);
    throw new Error("User is not Created");
  }
};
export const loginUser = async (req, res) => {
  
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400);
    throw new Error("Please Fill all the details");
  }
  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    res.status(400);
    throw new Error("User does not Exist");
  }
  // assume bcrypt compare
  const isMatch = await user.comparePassword(password); // implement on user model
  if (!isMatch) {
    res.status(401);
    throw new Error("Invalid credentials");
  }
  
  // create access token
  console.log("login user" , user)
  const accessToken = createAccessToken(user);


  // create refresh token 

  const refreshTokenString = await generateRefreshTokenString();
  
  const tokenHash =  hashToken(refreshTokenString, HASH_SECRET);
  
  const expiresAt = new Date(Date.now() + REFRESH_DAYS * 24 * 60 * 60 * 1000);
  
  // save refresh token record
  const rtDoc = await RefreshToken.create({
    tokenHash,
    user: user._id,
    expiresAt,
    createdByIp: req.ip,
    deviceInfo: req.get("user-agent") || null,
  });

  // send cookie (httpOnly) and return access token
  res.cookie(COOKIE_NAME, refreshTokenString, cookieOptions);
  return res.status(200).json({
    accessToken,
    user: { id: user._id, email: user.email, name: user.name },
  });

 
};

export const logout = async (req, res, next) => {
  const incomingToken = req.cookies?.[COOKIE_NAME] || req.body.refreshToken;
  if (incomingToken) {
    const incomingHash = hashToken(incomingToken, HASH_SECRET);
    // find token and revoke
    const tokenDoc = await RefreshToken.findOne({ tokenHash: incomingHash });
    if (tokenDoc && !tokenDoc.revokedAt) {
      tokenDoc.revokedAt = new Date();
      tokenDoc.revokedByIp = req.ip;
      await tokenDoc.save();
    }
  }

  // clear cookie on client
  res.clearCookie(COOKIE_NAME, cookieOptions);
  return res.status(200).json({ message: "Logged out" });
};



export const getProfile = async (req, res, next) => {
  // req.user is set by Validator
  console.log("getProfile router ",req.user)
  const userId = req.user?.id;
  if (!userId) {
    res.status(401);
    return next(new Error("Not authenticated"));
  }

  const user = await User.findById(userId).select("-password -__v");
  if (!user) {
    res.status(404);
    return next(new Error("User not found"));
  }

  return res.status(200).json(user);
};

