import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (!decoded) {
      if (err && err.name === "TokenExpiredError") {
        return res.status(401).json({ message: "Token expirado" });
      } else if (err) {
        return res.status(403).json({ message: "Token inválido" });
      }
    } else {
      (req as any).user = decoded;
      next();
    }
  });
};
