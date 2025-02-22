import express from "express";
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser'
import cors from 'cors';

import authRoutes from './routes/auth.route.js'
import messageRoutes from './routes/message.route.js'
import { connectDb } from "./lib/db.js";
import { app, server} from "./lib/socket.js";
dotenv.config();


const PORT = process.env.PORT;


app.use(express.json({limit: "100mb"}));
app.use(cookieParser());
app.use(cors(
    {
        origin: process.env.FRONTEND_URL,
         methods: ["GET", "POST", "DELETE", "PUT", "PATCH"],
        credentials: true
    }
));


app.use("/api/auth", authRoutes)
app.use("/api/message", messageRoutes)


if (process.env.NODE_ENV === "development") {
    server.listen(PORT, () => {
        console.log("Server is running on port", PORT);
        connectDb();
    })
}
connectDb();
export default app;
