import express from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { createOrder } from '../controllers/order.controllers';

const router= express();

router.post("/", authMiddleware, createOrder);
router.post("/", authMiddleware, createOrder);
router.post("/", authMiddleware, createOrder);
router.post("/", authMiddleware, createOrder);

export default router;