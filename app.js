import express from "express";
import "dotenv/config";
import cookieParser from "cookie-parser";
import cors from "cors";
import authRoutes from "./src/routes/auth.route.js";
import eventRoutes from "./src/routes/event.route.js";
import teamRoutes from "./src/routes/teams.routes.js"
import scheduleRoutes from "./src/routes/schedule.route.js"
import userRoutes from "./src/routes/user.routes.js"
import { requestLogger } from "./src/middleware/logger.middleware.js";
import { responseFormatterMiddleware } from "./src/middleware/responseFormatter.middleware.js";
import uploadRoutes from "./src/routes/upload.route.js"
import paymentRoutes from "./src/routes/payment.route.js"

const app = express()


//middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
    cors({
        origin: "http://localhost:5500",
        credentials: true
    })
);


//request log(middleware)
app.use(requestLogger);
//response(middleware)
app.use(responseFormatterMiddleware);

app.get("/Ping", (req, res) => {
    res.send("PONG");
});

// Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/events", eventRoutes);
app.use("/api/v1/teams", teamRoutes);
app.use("/api/v1/schedule", scheduleRoutes);
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/upload", uploadRoutes)
app.use("/api/v1/payment", paymentRoutes)

export default app;