import { Request, Response, NextFunction } from "express";


export const checkApiKey = (req: Request, res: Response, next: NextFunction): void => {
  const clientApiKey = req.header("x-api-key");

  if (!clientApiKey || clientApiKey !== process.env.API_KEY) {
    res.status(401).json({ message: "Unauthorized access: Invalid or missing API key." });
    return;
  }

  next();
};