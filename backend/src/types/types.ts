import { Request,Response,NextFunction } from "express";

export interface UserRequestBody{
    username:string;
    email:string;
    photo:string;
    gender:string;
    role:string;
    dob:Date;
    _id:string;
}

export interface ProductRequestBody{
    name:string;
    photo:string;
    category:string;
    price:number;
    stock:number;
}



export type ControllerType = (req: Request, res: Response, next: NextFunction) => 
Promise<void | Response<any, Record<string, any>>>




export interface BaseQuerySearchProduct {
    search?:string;
    price?:string;
    sort?:string;
    category?:string;
    page?:string
}

export interface SearchQuery {
    name?:{
        $regex:string;
        $options:string;
    },
    price?:{
        $lte:number
    },
    category?:string
}

export type InvalidateCacheProps = {
    product?:boolean;
    orders?:boolean;
    admin?:boolean;
    userId?:string;
    productId?:string | string[];
    orderId?:string;
}


type ShippingInfoProp = {
    address:string;
    city:string;
    state:string;
    country:string;
    pincode:number;
}

export type OrderItemProp = {
    name:string;
    price:number;
    photo:string;
    quantity:number;
    productId:string;
}

export interface OrderRequestBody{
    shippingInfo:ShippingInfoProp;
    subtotal:number;
    tax:number;
    discount:number;
    shippingCharges:number;
    total:number;
    user:string;
    orderItems:OrderItemProp[];
    status:string;

}