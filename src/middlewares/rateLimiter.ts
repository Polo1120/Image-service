import rateLimit from "express-rate-limit";


export const imageUploadLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, 
  max: 5, 
  message: {
    message: "Have exceeded the upload limit. Please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
