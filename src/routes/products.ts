import { Router } from "express";
import { createProduct } from "../controllers/products";
import { authMiddleware } from "../middleware/auth.middleware";
import { adminMiddleware } from "../middleware/admin.middleware";

const router = Router();

router.post("/create",[ authMiddleware, adminMiddleware],createProduct);

export default router;
