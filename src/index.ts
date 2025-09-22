import express, { Request, Response } from "express";
import authRoutes from './routes/auth.routes'
import productRoutes from './routes/products'
import addressRoutes from './routes/user.routes'
import cookieParser from "cookie-parser";
import dotenv from 'dotenv'
import { PrismaClient } from "@prisma/client"; 
dotenv.config({path: '.env'})

const app = express();
app.use(express.json());


const PORT = process.env.PORT || 5000;

app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/address",addressRoutes );
app.use("/api/products", productRoutes);

export const prismaClient = new PrismaClient({
  log:['query']
})


async function startServer() {
  try {
    await prismaClient.$connect();
    console.log("Database connected");

    app.listen(PORT, () => {
      console.log("Server running at http://localhost:3000");
    });
  } catch (err) {
    console.error(" Database connection failed:", err);
    process.exit(1); 
  }
}

startServer();