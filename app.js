import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";

import authRoutes from "./src/routes/auth.route.js";
import eventRoutes from "./src/routes/event.route.js";
import teamRoutes from "./src/routes/teams.routes.js"
import scheduleRoutes from "./src/routes/schedule.route.js"
import userRoutes from "./src/routes/user.routes.js"

dotenv.config();

const app = express();

// Needed on hosted platforms (Render/Railway/Vercel) so secure cookies work reliably.
app.set("trust proxy", 1);

// ✅ CORS FIRST
const defaultOrigins = ["https://eduhub-eta-coral.vercel.app"];
const allowedOrigins = (process.env.CORS_ORIGINS || defaultOrigins.join(","))
    .split(",")
    .map((origin) => origin.trim().replace(/\/$/, ""))
    .filter(Boolean);


app.use((req, res, next) => {
    console.log("INCOMING ORIGIN:", req.headers.origin);
    next();
});

// put this BEFORE your cors() middleware
app.use(cors({
    origin: function (origin, callback) {
        const normalizedOrigin = origin?.replace(/\/$/, "");
        if (!origin || allowedOrigins.includes(normalizedOrigin)) {
            callback(null, true);
        } else {
            callback(new Error("CORS not allowed"));
        }
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
}));

// ✅ Then other middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Test route
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