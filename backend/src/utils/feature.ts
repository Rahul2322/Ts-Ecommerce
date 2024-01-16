import { Document } from "mongoose";
import { client } from "../app.js";
import { Product } from "../models/product.model.js";
import { InvalidateCacheProps, OrderItemProp } from "../types/types.js";


export const invalidateCache =  ({
    product,
    orders,
    admin,
    userId,
    productId,
    orderId
}: InvalidateCacheProps) => {

    if (product) {
        const productCacheKeys: string[] = ["latest-products", "allProducts", "categories"];

        if (typeof productId === 'string') productCacheKeys.push(`${productId}product`);

        if (typeof productId === 'object') {
            productId.forEach(product => productCacheKeys.push(`${product}product`))
        }

        client.del(productCacheKeys)
    }

    if (orders) {
        const orderCacheKeys: string[] = ['all-orders', `order-${orderId}`, `my-orders-${userId}`];
        client.del(orderCacheKeys);
    }

    if(admin){
        client.del([
            'admin-stats',
            'admin-pie-charts',
            'admin-bar-charts',
            'admin-line-charts'
        ])
    }

}

export const reduceStock = async (orderItems: OrderItemProp[]) => {

    for (let i = 0; i < orderItems.length; i++) {
        const id = orderItems[i].productId;
        const product = await Product.findById(id);
        if (!product) throw new Error("Product not found");
        product.stock -= orderItems[i].quantity;
        await product.save();
    }


}


export const calculatePercentage = async (lastMonth: number, thisMonth: number): Promise<number> => {
    const percent = (thisMonth  / lastMonth) * 100;
    return percent
}

export const getInventories = async ({ categories, productsCount }:
    { categories: string[], productsCount: number }):Promise<Record<string, number>[]> => {

    const categoriesCountPromise = categories.map(category => Product.countDocuments({ category }))
    const categoriesCount = await Promise.all(categoriesCountPromise);

    const categoryCount: Record<string, number>[] = [];

    categories.forEach((category, i) => {
        categoryCount.push({
            [category] : Math.round((categoriesCount[i] / productsCount) * 100)
        })
    })

    return categoryCount;
}

interface MyDocument extends Document {
    createdAt:Date,
    discount?:number,
    total?:number
}

type funcProps = {
    length:number,
    dataArr:MyDocument[],
    today:Date,
    property?: "discount" | "total";
}

export const getChartData = async({
    length,
    dataArr,
    today,
    property
}:funcProps)=>{
    const data:number[] = new Array(length).fill(0);
    dataArr.forEach(i => {
            const creationDate = i.createdAt;
            const monthDiff = (today.getMonth() - creationDate.getMonth() + 12) % 12;

            if (monthDiff < length) {
                if(property){
                    data[length - monthDiff - 1] += i[property]!;
                }else{
                    data[length - monthDiff - 1] += 1;
                }
               
              
            }
        })

        return data;
}