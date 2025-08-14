import { Request } from "express";

export interface AuthenticatedUser {
  userId: string;
}

export interface AuthenticatedMulterRequest extends Request {
  user?: AuthenticatedUser;
  file?: Express.Multer.File & {
    path: string;
    filename: string;
  };
}
