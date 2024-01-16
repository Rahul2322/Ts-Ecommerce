import mongoose from "mongoose";

export const connectDB = async(uri:string)=>{
    mongoose.connect(uri,{
        dbName:"Ecommerce"
    }).then((c)=>console.log(`Db connected to ${c.connection.host}`))
    .catch(err=>console.log(err))
}