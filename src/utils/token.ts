import crypto from 'node:crypto';

const REFRESH_TOKEN_BYTES = 40;
export const REFRESH_TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days
export const ACCESS_TOKEN_EXPIRES_IN = "15m";


export function generateRefreshToken():{raw:string, hash:string}{
    const raw = crypto.randomBytes(REFRESH_TOKEN_BYTES).toString("hex");
    const hash = hashToken(raw);
    return {raw, hash};
}

const hashToken(raw:string):string{
    return crypto.createHash("sha256").update(raw).digest("hex");
}

const isProd= process.env.NODE_ENV==='production';

export const accessCookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: "strict" as const,
  maxAge: 15 * 60 * 1000, // 15 min, mirrors ACCESS_TOKEN_EXPIRES_IN
};

export const refreshCookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: "strict" as const,
  maxAge: REFRESH_TOKEN_TTL_MS,
};
