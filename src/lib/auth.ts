import crypto from "crypto";

const JWT_SECRET = process.env.JWT_SECRET || crypto.randomBytes(64).toString("hex");
const ALGORITHM = "aes-256-gcm";
const KEY = crypto.scryptSync(JWT_SECRET, "auth-salt", 32);

interface TokenPayload {
  userId: string;
  isAdmin: boolean;
}

export async function hash(password: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const salt = crypto.randomBytes(16).toString("hex");
    crypto.scrypt(password, salt, 64, (err, derivedKey) => {
      if (err) reject(err);
      resolve(salt + ":" + derivedKey.toString("hex"));
    });
  });
}

export async function compare(password: string, hashed: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const [salt, key] = hashed.split(":");
    crypto.scrypt(password, salt, 64, (err, derivedKey) => {
      if (err) reject(err);
      resolve(key === derivedKey.toString("hex"));
    });
  });
}

function encrypt(text: string): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return iv.toString("hex") + ":" + encrypted + ":" + cipher.getAuthTag().toString("hex");
}

function decrypt(encoded: string): string | null {
  try {
    const parts = encoded.split(":");
    if (parts.length !== 3) return null;
    const iv = Buffer.from(parts[0], "hex");
    const encrypted = parts[1];
    const authTag = Buffer.from(parts[2], "hex");
    const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);
    decipher.setAuthTag(authTag);
    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  } catch {
    return null;
  }
}

export function createToken(payload: TokenPayload): string {
  const data = JSON.stringify({ ...payload, iat: Date.now(), exp: Date.now() + 7 * 24 * 60 * 60 * 1000 });
  return encrypt(data);
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    const decoded = decrypt(token);
    if (!decoded) return null;
    const payload = JSON.parse(decoded);
    if (Date.now() > payload.exp) return null;
    return { userId: payload.userId, isAdmin: payload.isAdmin };
  } catch {
    return null;
  }
}
