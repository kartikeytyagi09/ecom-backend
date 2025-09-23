import { Request, Response } from "express";
import { ZodError } from "zod";
import { prismaClient } from "..";
import { CreateCartSchema } from "../models/cart.schema";

export const addItemsInCart = async (req: Request, res: Response) => {
  try {
    const validatedData = CreateCartSchema.parse(req.body);

    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    await prismaClient.product.findUniqueOrThrow({
      where: { id: validatedData.productId },
    });

    let cart = await prismaClient.cart.findUnique({
      where: { userId: req.user.id },
    });

    if (!cart) {
      cart = await prismaClient.cart.create({
        data: { userId: req.user.id },
      });
    }

    // Check if the product is already in `that` cart
    const existingCartItem = await prismaClient.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId: validatedData.productId,
      },
    });

    let cartItem;

    if (existingCartItem) {
      // Update quantity
      cartItem = await prismaClient.cartItem.update({
        where: { id: existingCartItem.id },
        data: { quantity: existingCartItem.quantity + validatedData.quantity },
      });
    } else {
      // Create new cart item
      cartItem = await prismaClient.cartItem.create({
        data: {
          cartId: cart.id,
          productId: validatedData.productId,
          quantity: validatedData.quantity,
        },
      });
    }

    return res.status(200).json({ message: "Item added to cart", cartItem });
  } catch (error: any) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        error: "Validation failed",
        details: error.issues.map((issue) => issue.message),
      });
    }
    return res.status(500).json({
      error: "Failed to add item to cart",
      details: error.message,
    });
  }
};


export const deleteItemsFromCart = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { productId } = req.params;
    if (!productId) {
      return res.status(400).json({ error: "Product ID is required" });
    }

    // 1. Find the user's cart
    const cart = await prismaClient.cart.findUniqueOrThrow({
      where: { userId },
    });

    // 2. Find the item in the cart
    const cartItem = await prismaClient.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId: Number(productId),
      },
    });

    if (!cartItem) {
      return res.status(404).json({ error: "Item not found in cart" });
    }

    // 3. Delete that item
    await prismaClient.cartItem.delete({
      where: { id: cartItem.id },
    });

    return res.status(200).json({ message: "Item removed from cart" });
  } catch (error: any) {
    return res.status(500).json({
      error: "Failed to delete item from cart",
      details: error.message,
    });
  }
};



export const changeQuantity=async(req:Request, res:Response)=>{

}
export const getCart=async(req:Request, res:Response)=>{

}
// export const clearCart=async(req:Request, res:Response)=>{

// }
export const applyDiscount=async(req:Request, res:Response)=>{

} 