import jwt, { JwtPayload, SignOptions } from "jsonwebtoken";

export function signJwtAccessToken(
  payload: JwtPayload,
  options: { expiresIn?: string | number } = {}
) {
  const secret = process.env.JWT_SECRET || "default-secret";
  const token = jwt.sign(payload, secret, {
    expiresIn: options.expiresIn || "1h",
  } as SignOptions);
  return token;
}

export function verifyJwtToken(token: string) {
  try {
    const secret = process.env.JWT_SECRET || "default-secret";
    const decoded = jwt.verify(token, secret);
    return decoded as JwtPayload;
  } catch (error) {
    console.error("JWT verification error:", error);
    return null;
  }
} 