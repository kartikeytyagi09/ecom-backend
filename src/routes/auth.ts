import express from "express"; 
import { Router } from "express";
import { login, signup } from "../controllers/auth";
import { authMiddleware } from "../middleware/auth.middleware";

const router= express.Router()

router.post('/signup',signup)
router.post('/login',login)
router.get("/me", authMiddleware, (req, res) => {
  res.json({ user: (req as any).user });
});



export default router;