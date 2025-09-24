import { Request, Response } from "express";
import z, { ZodError } from "zod";
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



export const changeQuantity = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { productId } = req.params;
    const { quantity } = req.body;

    if (!productId) return res.status(400).json({ error: "Product ID is required" });
    if (quantity === undefined || quantity < 1)
      return res.status(400).json({ error: "Quantity is less than 1" });

    const cart = await prismaClient.cart.findUniqueOrThrow({
      where: { userId },
      include: { items: true },
    });

    const cartItem = cart.items.find((item) => item.productId === Number(productId));
    if (!cartItem)
      return res.status(404).json({ error: "Product not found in cart" });

    const updatedItem = await prismaClient.cartItem.update({
      where: { id: cartItem.id },
      data: { quantity },
    });

    return res.status(200).json({ message: "Quantity updated", updatedItem });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ error: "Failed to update quantity", details: error.message });
  }
};  



export const getCart = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const cart = await prismaClient.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: true, // product details needed
          },
        },
      },
    });

    if (!cart) return res.status(404).json({ error: "Cart not found" });

    //total
    const subtotal = cart.items.reduce((acc, item) => {
      return acc + Number(item.product.price) * item.quantity;
    }, 0);

    return res.status(200).json({
      message: "Cart fetched successfully",
      cart,
      subtotal,
    });
  } catch (error: any) {
    return res
      .status(500)
      .json({ error: "Failed to fetch cart", details: error.message });
  }
};



const DiscountSchema = z.object({
  code: z.string().min(3, "Discount code must be at least 3 characters"),
});

// discount data
const discountRules: Record<string, { type: "percent" | "fixed"; value: number }> = {
  SAVE10: { type: "percent", value: 10 }, 
  FLAT100: { type: "fixed", value: 100 }, 
};

export const applyDiscount = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { code } = DiscountSchema.parse(req.body);

    const cart = await prismaClient.cart.findUnique({
      where: { userId },
      include: { items: { include: { product: true } } },
    });

    if (!cart) return res.status(404).json({ error: "Cart not found" });

    // Calculate subtotal
    const subtotal = cart.items.reduce((acc, item) => {
      return acc + Number(item.product.price) * item.quantity;
    }, 0);

    // Find discount rule
    const discount = discountRules[code.toUpperCase()];
    if (!discount) {
      return res.status(400).json({ error: "Invalid discount code" });
    }

    let discountAmount = 0;
    if (discount.type === "percent") {
      discountAmount = (subtotal * discount.value) / 100;
    } else {
      discountAmount = discount.value;
    }

    const total = Math.max(subtotal - discountAmount, 0); // last point 0

    return res.status(200).json({
      message: "Discount applied",
      code,
      subtotal,
      discount: discountAmount,
      total,
    });
  } catch (error: unknown) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        error: "Validation failed",
        details: error.issues.map((e) => e.message),
      });
    }
    if (error instanceof Error) {
      return res
        .status(500)
        .json({ error: "Failed to apply discount", details: error.message });
    }
    return res.status(500).json({ error: "Unknown error" });
  }
};