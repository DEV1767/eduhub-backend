import express from "express";
import "dotenv/config";
import cookieParser from "cookie-parser";
import cors from "cors";

import authRoutes from "./src/routes/auth.route.js";
import eventRoutes from "./src/routes/event.route.js";
import teamRoutes from "./src/routes/teams.routes.js"
import scheduleRoutes from "./src/routes/schedule.route.js"
import userRoutes from "./src/routes/user.routes.js"

const app = express();
const isHostedDeployment =
    process.env.NODE_ENV === "production" ||
    process.env.VERCEL === "1" ||
    process.env.VERCEL === "true";


app.set("trust proxy", 1);


const defaultOrigins = [
    "https://eduhub-eta-coral.vercel.app"
];
const explicitOrigins = (process.env.CORS_ORIGINS || "")
    .split(",")
    .map((origin) => origin.trim().replace(/\/$/, ""))
    .filter(Boolean);
const vercelPreviewOrigins = process.env.ALLOW_VERCEL_PREVIEW_ORIGINS === "false"
    ? []
    : ["https://*.vercel.app"];
const allowedOrigins = Array.from(new Set([
    ...defaultOrigins,
    ...explicitOrigins,
    ...vercelPreviewOrigins,
    ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL.trim().replace(/\/$/, "")] : [])
]));
const allowNullOrigin = !isHostedDeployment || process.env.ALLOW_NULL_ORIGIN === "true";

app.use(cors({
    origin: function (origin, callback) {
        const normalizedOrigin = origin?.replace(/\/$/, "");
        const isNullOrigin = origin === "null";
        const isVercelPreviewOrigin = normalizedOrigin ? /^https:\/\/[^/]+\.vercel\.app$/.test(normalizedOrigin) : false;
        console.log("CORS check:", {
            origin,
            normalizedOrigin,
            isNullOrigin,
            isVercelPreviewOrigin,
            allowed: !origin || allowedOrigins.includes(normalizedOrigin) || (vercelPreviewOrigins.length > 0 && isVercelPreviewOrigin) || (allowNullOrigin && isNullOrigin)
        });
        if (!origin || allowedOrigins.includes(normalizedOrigin) || (vercelPreviewOrigins.length > 0 && isVercelPreviewOrigin) || (allowNullOrigin && isNullOrigin)) {
            callback(null, true);
        } else {
            callback(new Error("CORS not allowed"));
        }
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
}));


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


app.get("/test", (req, res) => {
    res.send("Hii !! welcome to event managing website and server is started");
});

// Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/events", eventRoutes);
app.use("/api/v1/teams", teamRoutes);
app.use("/api/v1/schedule", scheduleRoutes);
app.use("/api/v1/user", userRoutes);

export default app;