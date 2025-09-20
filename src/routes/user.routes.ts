import express from "express"; 
import { authMiddleware } from "../middleware/auth.middleware";
import { adminMiddleware } from "../middleware/admin.middleware";
import { addAddress, deleteAddress, getAddresses } from "../controllers/user.controller";

const router= express.Router()

router.post('/address',[authMiddleware,adminMiddleware],addAddress)
router.delete('/address/:id',[authMiddleware,adminMiddleware],deleteAddress)
router.get("/address", [authMiddleware,adminMiddleware],getAddresses)


export default router;