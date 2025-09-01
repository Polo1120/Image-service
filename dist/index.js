"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
console.log("--- Serverless function starting ---");
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
const PORT = process.env.PORT || 3000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use("/api", checkApiKey_1.checkApiKey);
app.use("/api/auth", authRoutes_1.default);
app.use("/api/images", imageRoutes_1.default);
app.get("/", (_req, res) => {
    console.log("--- Root handler called ---");
    res.send("🚀 Image processing service is running");
});
app.use(errorHandler_1.errorHandler);
// app.listen(PORT, () => {
//   console.log(`✅ Server listening on port :${PORT}`);
// });
exports.default = app;
