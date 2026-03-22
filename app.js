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


//  Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(cors({
    origin: "http://localhost:5500",
    credentials: true
}));


// 🔥 Test route
app.get("/test", (req, res) => {
    res.send("Hii !! welcome to event managing website and server is started");
});


//  Routes (ONLY ONCE per module)
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/events", eventRoutes);
app.use("/api/v1/teams", teamRoutes);
app.use("/api/v1/schedule", scheduleRoutes)
app.use("/api/v1/user",userRoutes)





export default app;