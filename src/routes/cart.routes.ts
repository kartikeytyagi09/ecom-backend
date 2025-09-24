import express from "express"; 
import { authMiddleware } from "../middleware/auth.middleware";
import { addItemsInCart, applyDiscount, changeQuantity, deleteItemsFromCart, getCart } from "../controllers/cart.controller";

const router= express.Router()

router.post('/add',authMiddleware,addItemsInCart)

router.delete('/item/:productId',authMiddleware, deleteItemsFromCart)

router.patch('/item/:productId',authMiddleware,changeQuantity)

router.get("/acccess", authMiddleware,getCart)

router.patch("/discout", authMiddleware,applyDiscount)


export default router;