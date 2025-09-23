import express from "express"; 
import { authMiddleware } from "../middleware/auth.middleware";
import { addItemsInCart, applyDiscount, changeQuantity, deleteItemsFromCart, getCart } from "../controllers/cart.controller";

const router= express.Router()

router.post('/a',authMiddleware,addItemsInCart)
router.delete('/:id',authMiddleware, deleteItemsFromCart)
router.post('/prodtuct/:id',authMiddleware,changeQuantity)
router.get("/acccess", authMiddleware,getCart)
// router.post("/cart", authMiddleware,clearCart)
router.patch("/discout", authMiddleware,applyDiscount)


export default router;