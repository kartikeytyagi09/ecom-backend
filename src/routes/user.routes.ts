import express from "express"; 
import { authMiddleware } from "../middleware/auth.middleware";
import { adminMiddleware } from "../middleware/admin.middleware";
import { addAddress, deleteAddress, getAddresses } from "../controllers/user.controller";

const router= express.Router()

router.post('/input',authMiddleware,addAddress)
router.delete('/:id',authMiddleware,deleteAddress)
router.get("/access/:id", authMiddleware,getAddresses)

//update it
router.get("/update", authMiddleware,getAddresses)


export default router;