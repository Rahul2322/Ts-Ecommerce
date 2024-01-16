import mongoose, { Schema } from "mongoose";

const CouponSchema = new Schema({
    code:{
        type:String,
        required:true
    },
    amount:{
        type:String,
        required:true
    }
})

export const Coupon = mongoose.model('coupon',CouponSchema)