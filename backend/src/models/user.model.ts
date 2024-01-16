import mongoose, { Schema } from "mongoose";
import validator from 'validator'

interface IUser extends Document{
    id:string;
    username:string;
    email:string;
    dob:Date;
    photo:string;
    gender:"Male" | 'Female';
    role:"admin" | "user";
    createdAt:Date;
    updatedAt:Date;
    //Virtual Attribute
    age: number;
}


const UserSchema = new Schema({
    _id:{
        type:String,
        required:[true,"Please Enter Id"]
    },
    username:{
        type:String,
        required:[true,"Please Enter username"]
    },
    email:{
        type:String,
        unique:true,
        required:[true,"Please enter email"],
        validate:validator.default.isEmail
    },
    dob:{
        type:Date,
        required:[true,"Please enter dob"]
    },
    gender:{
        type:String,
       enum:["Male",'Female'],
       required:[true,"Please enter gender"]
    },
    photo:{
        type:String,
        required:[true,"Please add photo"]
    },
    role:{
        type:String,
        enum:["admin","user"],
        default:"user"
    }
},{
    timestamps:true
})

UserSchema.virtual("age").get(function(){
    const today = new Date();
    const dob:Date = this.dob;
    let age = today.getFullYear() - dob.getFullYear();
    if(today.getMonth() < dob.getMonth() || (today.getMonth() === dob.getMonth() && today.getDate() < dob.getDate())) {
        age--;
    };
    return age;
})


export const User = mongoose.model<IUser>("users",UserSchema)