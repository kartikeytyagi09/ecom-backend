import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { prismaClient } from "..";

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.cookies.token; 

  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number; email: string };
    const user = await prismaClient.user.findFirst({ where: { id: decoded.id } });

    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    req.user = user; // attach user to request
    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};
