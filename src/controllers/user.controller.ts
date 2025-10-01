import { Request, Response } from "express";
import { AddressSchema } from "../models/user.schema";
import { updateUserSchema } from "../models/user.schema"; 
import { prismaClient } from "..";
import z from "zod";

 
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


// export const updateUser = async (req: Request, res: Response) => {
//   try {
//     // 1. Validate input
//     const validatedData = updateUserSchema.parse(req.body);

//     // 2. If defaultAddress is being updated
//     if (validatedData.defaultAddress) {
//       const address = await prismaClient.address.findFirst({
//         where: { id: validatedData.defaultAddress },
//       });

//       if (!address) {
//         throw new error(
//           "Address not found.");
//       }

//       if (address.userId !== req.user.id) {
//         throw new error(
//           "This address does not belong to the current user.");
//       }
//     }

//     //Update user
//     const updatedUser = await prismaClient.user.update({
//       where: { id: req.user.id },
//       data: validatedData,
//       include: { addresses: true }, 
//     });

//     return res.json(updatedUser);
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({
//       error: "Failed to update user",
//       details: error instanceof Error ? error.message : String(error),
//     });
//   }
// };



// export const createOrder = async (req: Request, res: Response) => {
//   try {
//     const { addressId, totalAmount } = req.body;

//     // If no address is passed, fallback to default
//     let finalAddressId = addressId;
//     if (!finalAddressId) {
//       const user = await prismaClient.user.findUnique({
//         where: { id: req.user.id },
//       });
//       if (!user?.defaultAddress) {
//         return res.status(400).json({ error: "No address provided and no default set." });
//       }
//       finalAddressId = user.defaultAddress;
//     }

//     // Check if address belongs to this user
//     const address = await prismaClient.address.findFirst({
//       where: { id: finalAddressId, userId: req.user.id },
//     });
//     if (!address) {
//       return res.status(400).json({ error: "Invalid address." });
//     }

//     const order = await prismaClient.order.create({
//       data: {
//         userId: req.user.id,
//         addressId: finalAddressId,
//         totalAmount,
//       },
//       include: { address: true },
//     });

//     return res.status(201).json({ message: "Order created successfully", order });
//   } catch (err) {
//     console.error(err);
//     return res.status(500).json({ error: "Failed to create order" });
//   }
// };
