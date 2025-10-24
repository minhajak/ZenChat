import { Types } from "mongoose";
import { getEnvVariable } from "./helper.util";
import jwt from "jsonwebtoken";

const ACCESS_TOKEN_SECRET = getEnvVariable("ACCESS_TOKEN_SECRET");
const REFRESH_TOKEN_SECRET = getEnvVariable("REFRESH_TOKEN_SECRET");

export interface TokenPayloadType {
  userId: Types.ObjectId;
  role: string;
}

export const generateTokens = (payload: TokenPayloadType) => {
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);
  
  return { accessToken, refreshToken };
};

export const generateAccessToken = (payload: TokenPayloadType) => {
  return jwt.sign(payload, ACCESS_TOKEN_SECRET, {
    expiresIn: "15m",
  });
};
export const generateRefreshToken = (payload: TokenPayloadType) => {
  return jwt.sign(payload, REFRESH_TOKEN_SECRET, {
    expiresIn: "7d",
  });
};
export const verifyAccessToken = (token: string): TokenPayloadType => {
  try {
    return jwt.verify(token, ACCESS_TOKEN_SECRET) as TokenPayloadType;
  } catch (error) {
    throw new Error("Invalid or expired access token");
  }
};

export const verifyRefreshToken = (token: string): TokenPayloadType => {
  try {
    return jwt.verify(token, REFRESH_TOKEN_SECRET) as TokenPayloadType;
  } catch (error) {
    throw new Error("Invalid or expired refresh token");
  }
};
