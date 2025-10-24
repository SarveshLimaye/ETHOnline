import express from "express";
import orderRoutes from "./routes/orders";
import errorHandler from "./middleware/errorHandler";
import { connectDB } from "./config/database";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
connectDB();

// Routes
app.use("/api", orderRoutes);

// Error handling middleware
app.use(errorHandler);

export default app;
