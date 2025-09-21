import { Request, Response } from "express";
import { AddressSchema } from "../models/user";
import { prismaClient } from "..";
import z from "zod";

 
export const addAddress = async (req: Request, res: Response) => {
  try {
    const parsedData = AddressSchema.parse(req.body);

    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const user = await prismaClient.user.findUniqueOrThrow({
      where: { id: req.user.id },
    });
    // const userId = req.user.id;
    const existingAddress = await prismaClient.address.findFirst({
      where: {
        ...parsedData
      },
    });

    if (existingAddress) {
      return res.status(409).json({ error: "Address already exists" });
    }

    const address = await prismaClient.address.create({
      data: {
        ...req.body,
        userId:user.id,
        },
    });

    return res.status(201).json({
      message: "Address added successfully",
      address,
    });

  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: "Validation failed",
        details: error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      });
    }
    return res.status(500).json({
      error: "Failed to add address",
      details: error instanceof Error ? error.message : String(error),
    });
  }
};


export const deleteAddress = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid address ID" });

    const deleted = await prismaClient.address.delete({
      where: { id },
    });

    return res.status(200).json({ message: "Address deleted successfully", deleted });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to delete address", details: error.message });
  }
};

export const getAddresses = async (req: Request, res: Response) => {
  try {
    const userId = Number(req.params.userId);
    if (isNaN(userId)) return res.status(400).json({ error: "Invalid user ID" });

    const addresses = await prismaClient.address.findMany({
      where: { userId },
      orderBy: { id: "desc" },
    });

    return res.status(200).json({ message: "Addresses fetched successfully", addresses });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to fetch addresses", details: error.message });
  }
};
