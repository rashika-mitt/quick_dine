import dotenv from "dotenv";
import express, { Request, Response } from "express";
import cors from "cors";
import connectDB from "./config/db.js";

const result = dotenv.config({ path: "./.env" });

console.log("ENV file path:", process.cwd());
console.log("ENV loading error:", result.error?.message ?? "None");
console.log("MONGODB_URI exists:", !!process.env.MONGODB_URI);

const app = express();

console.log("Mongo URI loaded:", !!process.env.MONGODB_URI);

await connectDB();

app.use(cors());
app.use(express.json());

const port = process.env.PORT || 5000;

app.get("/", (req: Request, res: Response) => {
  res.send("Server is Live!");
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});