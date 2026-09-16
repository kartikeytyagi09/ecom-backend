import { Request, Response, NextFunction } from "express";

export const adminMiddleware = async(req: Request,res: Response,next: NextFunction ) => {
    const user=req.user
    if(!user){
        return res.status(401).json({error: "unauthorized"});
    }
    if(user.role=='ADMIN'){
        next()
    }else{
        return res.status(403).json({ error: "Forbidden: Admins only" });
    }
};
