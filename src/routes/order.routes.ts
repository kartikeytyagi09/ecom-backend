import express from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { adminListOrders, cancelOrder, createOrder, listOrders, updateOrderStatus } from '../controllers/order.controllers';
import { adminMiddleware } from '../middleware/admin.middleware';

const router= express();

router.post("/create", authMiddleware, createOrder);
router.get("/list", authMiddleware, listOrders);
router.patch("/:id/cancel", authMiddleware, cancelOrder);

router.patch("/:id/status", [authMiddleware, adminMiddleware], updateOrderStatus);

router.get("/admin", [authMiddleware, adminMiddleware], adminListOrders);

export default router;