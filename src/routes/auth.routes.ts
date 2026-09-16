import express from "express"; 
import { Router } from "express";
import { login, logout, refresh, signup } from "../controllers/auth.controllers";
import { authMiddleware } from "../middleware/auth.middleware";

const router= express.Router()

router.post('/signup',signup)
router.post('/login',login)
router.post('/refresh',refresh)
router.post('/logout',logout)
router.get("/me", authMiddleware, (req, res) => {
  res.json({ user: (req as any).user });
});



export default router;