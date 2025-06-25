import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    res.sendStatus(401);
    return;
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (!decoded) {
      if (err?.name === "TokenExpiredError") {
        res.status(401).json({ message: "Token expirado" });
      } else {
        res.status(403).json({ message: "Token inválido" });
      }
      return;
    }

    (req as any).user = decoded;
    next();
  });
};
