import { Request, Response } from "express";
import { prismaClient } from "..";
import { ProductSchema } from "../models/products";


export const createProduct = async (req: Request, res: Response) => {
  try {

    const parsedData = ProductSchema.parse(req.body);
    const { name, description, price, tags } = parsedData;


    const product = await prismaClient.product.create({
      data: {
        name,
        description,
        price,
        tags: tags || "",
      },
    });

    return res.status(201).json({ message: "Product created successfully", product });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return res.status(400).json({
        error: "Validation failed",
        details: error.errors.map((err: any) => err.message),
      });
    }
    return res.status(500).json({ error: "Failed to create product", details: error });
  }
};
