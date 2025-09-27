import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined in environment variables.");
}

export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    res.status(401).json({ message: "JWT token is missing" });
    return;
  }

  jwt.verify(
    token,
    JWT_SECRET,
    { algorithms: ["HS256"], clockTolerance: 5 },
    (err, decoded) => {
      if (err) {
        if ((err as any).name === "TokenExpiredError") {
          res.status(401).json({ message: "Token expired" });
        } else {
          res.status(401).json({ message: "Invalid token" });
        }
        return;
      }

      (req as any).user = decoded;
      next();
    }
  );
};
