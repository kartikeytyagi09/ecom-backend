// controllers/order.controller.ts
import { Request, Response } from "express";
import { prismaClient } from "../index"; // adjust import to your prismaClient

export const createOrder = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    // Optional: allow client to send addressId
    const { addressId } = req.body;

    const user = await prismaClient.user.findUnique({
      where: { id: userId },
      include: { cart: { include: { items: { include: { product: true } } } } },
    });

    if (!user || !user.cart) {
      return res.status(400).json({ error: "Cart not found" });
    }

    if (user.cart.items.length === 0) {
      return res.status(400).json({ error: "Cart is empty" });
    }


    const finalAddressId = addressId || user.defaultAddress;
    if (!finalAddressId) {
      return res.status(400).json({ error: "No default address found, provide addressId" });
    }

    const totalAmount = user.cart.items.reduce((acc, item) => {
      return acc + Number(item.product.price) * item.quantity;
    }, 0);

    // Create order
    const order = await prismaClient.order.create({
      data: {
        userId,
        addressId: finalAddressId,
        totalAmount,
        items: {
          create: user.cart.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.product.price, 
          })),
        },
      },
      include: { items: true },
    });

    // Clear cart
    await prismaClient.cartItem.deleteMany({
      where: { cartId: user.cart.id },
    });

    return res.status(201).json({
      message: "Order created successfully",
      order,
    });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({
      error: "Failed to create order",
      details: error.message,
    });
  }
};
