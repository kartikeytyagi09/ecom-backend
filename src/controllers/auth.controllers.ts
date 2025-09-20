import jwt from "jsonwebtoken";
import { Request, Response } from "express";
import { prismaClient } from "..";
import bcrypt from "bcrypt";
import { LoginSchema, SignUpSchema } from "../models/user";
import { ZodError } from "zod";

const JWT_SECRET = process.env.JWT_SECRET || "supersecret"; 

export const signup = async (req: Request, res: Response) => {
  try {
    const parsedData = SignUpSchema.parse(req.body);
    const { email, password, name } = parsedData;

    let existingUser = await prismaClient.user.findFirst({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prismaClient.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });
    return res.status(201).json({ message: "User created successfully", user });

    }catch (error: any) {
        if(error instanceof ZodError){
          res.status(400).json({err:"wrong input"})
        }
        return res.status(500).json({ 
          error: "Signup failed", 
          details: error.message || error 
  });
}


};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = LoginSchema.parse(req.body);

    const user = await prismaClient.user.findFirst({ where: { email } });
    if (!user) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email,role: user.role }, 
      JWT_SECRET,                         
      { expiresIn: "1h" }                 
    );

    return res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    if(error instanceof ZodError){
          res.status(400).json({err:"wrong input"})
    }
    return res.status(500).json({ error: "Login failed", details: error });
  }
};
  