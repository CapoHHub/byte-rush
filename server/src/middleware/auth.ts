import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const SECRET = process.env.AUTH_SECRET!;

export type AuthRole = "user" | "company";

export interface AuthPayload {
  userId: number;
  email: string;
  role: AuthRole;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}

export function signToken(payload: AuthPayload): string {
  return jwt.sign(payload, SECRET, { expiresIn: "7d" });
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Token mancante" });
    return;
  }

  try {
    const token = header.slice(7);
    const decoded = jwt.verify(token, SECRET) as AuthPayload;
    if (!decoded.role) decoded.role = "user";
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ error: "Token non valido o scaduto" });
  }
}

export function requireCompanyAuth(req: Request, res: Response, next: NextFunction): void {
  requireAuth(req, res, () => {
    if (req.user?.role !== "company") {
      res.status(403).json({ error: "Accesso riservato alle aziende" });
      return;
    }
    next();
  });
}
