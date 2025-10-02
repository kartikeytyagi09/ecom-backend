import { Request, Response } from "express";
import { AddressSchema, changePasswordSchema, UpdateUserRoleSchema } from "../models/user.schema";
import { prismaClient } from "..";
import z from "zod";
import bcrypt from 'bcrypt';

 
export const addAddress = async (req: Request, res: Response) => {
  try {
    const parsedData = AddressSchema.parse(req.body);

    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Optional: check if user still exists
    const user =await prismaClient.user.findUniqueOrThrow({
      where: { id: req.user.id },
    });

    // Check for duplicate address for the same user
    const existingAddress = await prismaClient.address.findFirst({
      where: {
        lineOne: parsedData.lineOne,
        lineTwo: parsedData.lineTwo,
        city: parsedData.city,
        country: parsedData.country,
        pincode: parsedData.pincode,
        userId: req.user.id,
      },
    });

    if (existingAddress) {
      return res.status(409).json({ error: "Address already exists" });
    }

    const address = await prismaClient.address.create({
      data: {
        ...req.body,
        userId: req.user.id,
      },
    });

    if (!user?.defaultAddress) {
      await prismaClient.user.update({
      where: { id: req.user.id },
      data: { defaultAddress: address.id },
    });
  }

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
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const addresses = await prismaClient.address.findMany({
      where: { userId: req.user.id },
      orderBy: { id: "desc" },
    });

    return res.status(200).json({ message: "Addresses fetched successfully", addresses });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to fetch addresses", details: error.message });
  }
};

export const updateUserRole = async (req: Request, res: Response) => {
  try {
    const userId = Number(req.params.id);
    if (isNaN(userId)) return res.status(400).json({ error: "Invalid user ID" });

    const { role } = UpdateUserRoleSchema.parse(req.body);

    // Update user role
    const updatedUser = await prismaClient.user.update({
      where: { id: userId },
      data: { role },
    });

    return res.status(200).json({
      message: `User role updated to ${role}`,
      user: updatedUser,
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
      error: "Failed to update user role",
      details: error instanceof Error ? error.message : String(error),
    });
  }
};

export const changePassword = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });

    const { oldPassword, newPassword } = changePasswordSchema.parse(req.body);

    // Fetch user
    const user = await prismaClient.user.findUniqueOrThrow({
      where: { id: req.user.id },
    });

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Old password is incorrect" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prismaClient.user.update({
      where: { id: req.user.id },
      data: { password: hashedPassword },
    });

    return res.status(200).json({ message: "Password changed successfully" });
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
      error: "Failed to change password",
      details: error instanceof Error ? error.message : String(error),
    });
  }
};
