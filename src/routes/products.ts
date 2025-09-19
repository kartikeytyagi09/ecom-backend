import { Router } from "express";
import { createProduct, deleteProduct, getProductById, listProduct, updateProduct } from "../controllers/products";
import { authMiddleware } from "../middleware/auth.middleware";
import { adminMiddleware } from "../middleware/admin.middleware";

const router = Router();

router.post("/create",[ authMiddleware, adminMiddleware],createProduct);
router.put("/:id",[ authMiddleware, adminMiddleware],updateProduct);
router.delete("/:id",[ authMiddleware, adminMiddleware],deleteProduct);
router.get("/",[ authMiddleware, adminMiddleware],listProduct);
router.get("/:id",[ authMiddleware, adminMiddleware],getProductById);

export default router;
