import express from "express"; 
import { authMiddleware } from "../middleware/auth.middleware";
import { adminMiddleware } from "../middleware/admin.middleware";
import { addAddress, changePassword, deleteAddress, getAddresses, updateUserRole } from "../controllers/user.controller";

const router= express.Router()

router.post('/input',authMiddleware,addAddress)
router.delete('/:id',authMiddleware,deleteAddress)
router.get("/address", authMiddleware,getAddresses)
router.patch("/:id/role", [authMiddleware,adminMiddleware],updateUserRole)
router.patch("/update/password", authMiddleware,changePassword)


export default router;