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

// ✅ CORS FIRST
const allowedOrigins = [
    "http://localhost:5500",
    "https://eduhub-backend-eight.vercel.app/"
];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error("CORS not allowed"));
        }
    },
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