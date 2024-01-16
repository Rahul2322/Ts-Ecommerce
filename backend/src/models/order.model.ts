import mongoose, { Schema } from "mongoose";


const OrderSchema = new Schema({
    shippingInfo:{
        address:{
            type:String,
            required:true
        },
        city:{
            type:String,
            required:true
        },
        state:{
            type:String,
            required:true
        },
        country:{
            type:String,
            required:true
        },
        pincode:{
            type:Number,
            required:true
        },
    },
    subtotal:{
        type:Number,
        required:true
    },
    tax:{
        type:Number,
        required:true
    },
    discount:{
        type:Number,
        required:true
    },
    shippingCharges:{
        type:Number,
        required:true
    },
    total:{
        type:Number,
        required:true
    },
    status: {
        type: String,
        enum: ["Processing", "Shipped", "Delivered"],
        default: "Processing",
      },
    user:{
        type:String,
        ref:"user",
        required:true
    },
    orderItems:[{
       name:{type:String,required:true},
       price:{type:Number,required:true},
       photo:{type:String,required:true},
       quantity:{type:Number,required:true},
       productId:{
        type:mongoose.Types.ObjectId,
        ref:"product"
       }
    }]
  
},{
    timestamps:true
})



export const Order = mongoose.model("order",OrderSchema)