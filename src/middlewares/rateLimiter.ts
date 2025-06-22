import rateLimit from "express-rate-limit";


export const imageUploadLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, 
  max: 5, 
  message: {
    message: "Has excedido el límite de intentos de subida. Intenta más tarde.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
