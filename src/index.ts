import express, { Request, Response } from "express";
import authRoutes from './routes/auth'
import dotenv from 'dotenv'
import { PrismaClient } from "@prisma/client"; 
dotenv.config({path: '.env'})

const app = express();
app.use(express.json());


const PORT = process.env.PORT || 5000;

app.get("/", (req: Request, res: Response) => {
  res.send("Hello from TypeScript + Node.js backend!");
});


app.use("/api/auth", authRoutes);

export const prisma = new PrismaClient({
  log:['query']
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
