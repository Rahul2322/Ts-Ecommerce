import { NextFunction, Request, Response } from "express";
import ErrorHandler from "../utils/utility-class.js";
import { User } from "../models/user.model.js";

export const isAdmin = async(req:Request,res:Response,next:NextFunction)=>{
    const {id }= req.query;
    console.log(id)
    if(!id) return next(new ErrorHandler('Id is required',400));

    const user = await User.findById(id);
    if(!user) return next(new ErrorHandler('Unauthenticated',401));
    console.log(user)
    if(user.role !== 'admin') return next(new ErrorHandler("Unauthorized",403));
     
    next();

} 