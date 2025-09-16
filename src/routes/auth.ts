import express from "express"; 
import { Router } from "express";
import { login } from "../controllers/auth";

const router= express.Router()

router.get('/login',login)


export default router;