import express from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { cancelOrder, createOrder, listOrders } from '../controllers/order.controllers';

const router= express();

router.post("/create", authMiddleware, createOrder);
router.get("/list", authMiddleware, listOrders);
router.patch("/:id/cancel", authMiddleware, cancelOrder);
// router.post("/", authMiddleware, createOrder);

export default router;