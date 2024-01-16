import { NextFunction, Request, Response } from "express";
import ErrorHandler from "../utils/utility-class.js";
import { Coupon } from "../models/coupon.js";
import { stripe } from "../app.ts";

export const createPaymentIntent = async (req:Request,res:Response,next:NextFunction)=>{
    const {amount} = req.body;
    if(!amount){
        return next(new ErrorHandler("All fields are required",400))
    }

    const paymentIntent = await stripe.paymentIntents.create({
        amount:Number(amount) * 1000,
        currency:"inr"
    })

    return res.status(201).json({
        success:true,
        clientSecret:paymentIntent.client_secret
    })
}

export const addCoupon = async (req:Request,res:Response,next:NextFunction)=>{
    const {code,amount} = req.body;

    if(!code || !amount){
        return next(new ErrorHandler("All fields are required",400))
    }

    const coupon = await Coupon.create({
        code,
        amount
    })

    return res.status(201).json({
        success:true,
        message:`coupon code ${coupon.code} created`
    })
}

export const applyDiscount = async(req:Request,res:Response,next:NextFunction)=>{
    const {coupon} = req.query;

    const discount = await Coupon.findOne({code:coupon});

    if(!discount) return next(new ErrorHandler("Invalid Coupon Code",400));

    return res.status(200).json({
        success:true,
        discount:discount.amount
    })

}


export const getAllCoupon =async (req:Request,res:Response,next:NextFunction) => {
    const coupon = await Coupon.find({});
    return res.status(200).json({
        success:true,
        data:coupon
    })
}


export const deleteCoupon =async (req:Request,res:Response,next:NextFunction) => {
    const {id} = req.params;
    const coupon = await Coupon.findByIdAndDelete(id);
    if(!coupon){
        return next(new ErrorHandler("Invalid Coupon Id",400));
    }

    return res.status(200).json({
        success:true,
        message:`Coupon ${coupon.code} deleted successfully`
    })
}