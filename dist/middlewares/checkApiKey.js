"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkApiKey = void 0;
const checkApiKey = (req, res, next) => {
    const clientApiKey = req.header("x-api-key");
    if (!clientApiKey || clientApiKey !== process.env.API_KEY) {
        res.status(401).json({ message: "Unauthorized access: Invalid or missing API key." });
        return;
    }
    next();
};
exports.checkApiKey = checkApiKey;
