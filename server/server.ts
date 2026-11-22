import dotenv from "dotenv";
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import authRouter from "./routes/authRoutes.js";
import restaurantRouter from "./routes/restaurantRoutes.js";
import bookingRouter from "./routes/bookingRoutes.js";

// Load environment variables
const result = dotenv.config();

if (result.error) {
  console.error("Error loading .env file:", result.error.message);
} else {
  console.log("Environment variables loaded successfully");
}

console.log("MongoDB URI loaded:", !!process.env.MONGODB_URI);

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Port
const port = process.env.PORT || 5000;

// Root route
app.get("/", (req: Request, res: Response) => {
  res.send("Server is Live!");
});

// Auth routes
app.use("/api/auth", authRouter);
app.use("/api/restaurants", restaurantRouter);
app.use("/api/bookings", bookingRouter);

// Global error handler
app.use(
  (
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    console.error("Server error:", err.message);

    res.status(500).json({
      message: err.message || "Internal Server Error",
      stack:
        process.env.NODE_ENV === "production"
          ? undefined
          : err.stack,
    });
  }
);

// Connect DB, then start server
const startServer = async (): Promise<void> => {
  try {
    await connectDB();

    app.listen(port, () => {
      console.log(`Server is running at http://localhost:${port}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();