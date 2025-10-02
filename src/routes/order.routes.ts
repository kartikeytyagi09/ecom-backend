import express from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { createOrder, listOrders } from '../controllers/order.controllers';

const router= express();

router.post("/create", authMiddleware, createOrder);
router.get("/", authMiddleware, listOrders);
// router.post("/", authMiddleware, createOrder);
// router.post("/", authMiddleware, createOrder);

export default router;