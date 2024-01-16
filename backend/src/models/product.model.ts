import mongoose, { Schema } from "mongoose";


const ProductSchema = new Schema({
   name:{
        type:String,
        required:[true,"Please Enter name"]
    },
    photo:{
        type:String,
        required:[true,"Please add photo"]
    },
    price:{
        type:Number,
        required:[true,"Please enter price"]
        
    },
    stock:{
        type:Number,
        required:[true,"Please enter stock"]
    },
    category:{
        type:String,
        required:[true,"Please Enter Category"],
        trim:true
    }
},{
    timestamps:true
})



export const Product = mongoose.model("product",ProductSchema)