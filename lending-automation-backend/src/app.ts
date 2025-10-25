import express from "express";
import orderRoutes from "./routes/orders";
import errorHandler from "./middleware/errorHandler";
import { connectDB } from "./config/database";
// @ts-ignore
import cors from "cors";

const corsConfig = {
  origin: "*", // Allow all origins - adjust as needed for security
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

const app = express();

app.use(express.json());
app.use(cors(corsConfig));

app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
connectDB();

// Routes
app.use("/api", orderRoutes);

// Error handling middleware
app.use(errorHandler);

export default app;
