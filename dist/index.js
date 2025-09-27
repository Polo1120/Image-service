"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const db_1 = require("./config/db");
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const imageRoutes_1 = __importDefault(require("./routes/imageRoutes"));
const errorHandler_1 = require("./middlewares/errorHandler");
const checkApiKey_1 = require("./middlewares/checkApiKey");
dotenv_1.default.config();
(0, db_1.connectDB)();
const app = (0, express_1.default)();
const TRUST_PROXY = process.env.TRUST_PROXY;
if (TRUST_PROXY) {
    const numeric = Number(TRUST_PROXY);
    if (!Number.isNaN(numeric)) {
        app.set("trust proxy", numeric);
    }
    else if (["loopback", "uniquelocal", "linklocal"].includes(TRUST_PROXY)) {
        app.set("trust proxy", TRUST_PROXY);
    }
    else {
        app.set("trust proxy", TRUST_PROXY.split(",").map((s) => s.trim()));
    }
}
const allowedOrigins = (process.env.CORS_ORIGINS || "")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);
const corsOptions = {
    origin: (origin, callback) => {
        if (!origin)
            return callback(null, true);
        if (allowedOrigins.length === 0) {
            return callback(new Error("CORS not configured"), false);
        }
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        return callback(new Error("Not allowed by CORS"), false);
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "x-api-key"],
    maxAge: 600, // cache de preflight
};
app.use((0, cors_1.default)(corsOptions));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use("/api", checkApiKey_1.checkApiKey);
app.use("/api/auth", authRoutes_1.default);
app.use("/api/images", imageRoutes_1.default);
app.get("/", (_req, res) => {
    res.send("🚀 Image processing service is running");
});
app.use(errorHandler_1.errorHandler);
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
exports.default = app;
