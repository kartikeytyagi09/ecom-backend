import { Request, Response } from "express";
import { prismaClient } from "..";
import { ProductSchema } from "../models/products";


export const createProduct = async (req: Request, res: Response) => {
  try {

    const parsedData = ProductSchema.parse(req.body);
    const { name, description, price,stock, tags } = parsedData;


    const product = await prismaClient.product.create({
      data: {
        name,
        description,
        price,
        stock,
        tags:  Array.isArray(tags) ? tags.join(".") : tags || "",
      },
    });

    return res.status(201).json({ message: "Product created successfully", product });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return res.status(400).json({error: "Validation failed",
              details: error.issues.map(issue => issue.message)});
    }
    console.log(error);
    return res.status(500).json({error: "failed to create product"});
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    let data = { ...req.body };

    if (Array.isArray(data.tags)) {
      data.tags = data.tags.join(".");
    }

    const updatedProduct = await prismaClient.product.update({
      where: { id: Number(id) },
      data,
    });

    return res.status(200).json(updatedProduct);
  } catch (err: any) {
    if (err.code === "P2025") {
      return res.status(404).json({ error: "Product not found" });
    }
    console.error(err);
    return res.status(500).json({ error: "Failed to update product" });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const id = +req.params.id; // convert string to number
    const existingProduct = await prismaClient.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      return res.status(404).json({ error: "Product not found" });
    }

    await prismaClient.product.delete({
      where: { id },
    });

    return res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Failed to delete product", details: error });
  }
};

export const listProduct = async (req: Request, res: Response) => {
  try {
    const { page = "1", limit = "20", minPrice, maxPrice, tags, search } = req.query;

    //pagination 
    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.min(100, Math.max(1, Number(limit) || 20));

    // building filters

    const where: any = {};

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = Number(minPrice);
      if (maxPrice) where.price.lte = Number(maxPrice);
    }

    // tag filters

    if (tags) {
      const tagList = (tags as string)
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      if (tagList.length > 0) {
        where.AND = [...(where.AND || []),
          {
            OR: tagList.map((tag) => ({
              tags: {
                contains: tag,
              },
            })),
          },
        ];
      }
    }
    
    //search filter

    if (search) {
      const searchConditions = [
        { name: { contains: search as string } },
        { description: { contains: search as string } },
      ];
      where.OR = where.OR ? [...where.OR, ...searchConditions] : searchConditions;
    }

    //Databse query
    const [products, total] = await Promise.all([
      prismaClient.product.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
      }),
      prismaClient.product.count({ where }),
    ]);
    
    //output
    return res.status(200).json({
      message: "Products fetched successfully",
      products,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({
      error: "Failed to fetch products",
      details: error.message,
    });
  }
};

export const getProductById = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid product ID" });

    const product = await prismaClient.product.findUnique({ where: { id } });

    if (!product) return res.status(404).json({ error: "Product not found" });

    return res.status(200).json(product);
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ error: "Failed to fetch product", details: error.message });
  }
}; 
