import { NextFunction, Request, Response } from "express";
import { OrderRequestBody } from "../types/types.js";
import ErrorHandler from "../utils/utility-class.js";
import { Order } from "../models/order.model.js";
import { invalidateCache, reduceStock } from "../utils/feature.js";
import { client } from "../app.js";

export const addOrder = async (req: Request<{}, {}, OrderRequestBody>, res: Response, next: NextFunction) => {
    const { shippingInfo, user, orderItems, total, tax, subtotal, discount, shippingCharges } = req.body;

    if (!shippingInfo || !orderItems || !user || !subtotal || !tax || !total) return next(new ErrorHandler("Please Enter All Fields", 400));

    const order = await Order.create({
        shippingInfo,
        orderItems,
        user,
        subtotal,
        tax,
        shippingCharges,
        discount,
        total,
    });

    await reduceStock(orderItems);

    invalidateCache({ product: true, orders: true, admin: true, userId: user, productId: order.orderItems.map(i => String(i.productId)) });

    return res.status(201).json({
        success: true,
        message: "Order Created Successfully"
    })


}


export const getAllOrders = async (req: Request, res: Response, next: NextFunction) => {

    let orders;

    let cachedOrders = await client.get('all-orders');
    if (cachedOrders) {
        orders = JSON.parse(cachedOrders);
    } else {
        orders = await Order.find({}).populate("user", "name");
        client.set('all-orders', JSON.stringify(orders));
    }

    return res.status(200).json({
        success: true,
        data: orders
    })

}


export const getMyOrders = async (req: Request, res: Response, next: NextFunction) => {

    let orders;

    const userId = req.params.id;

    let cachedOrders = await client.get(`my-orders${userId}`);
    if (cachedOrders) {
        orders = JSON.parse(cachedOrders);
    } else {
        orders = await Order.find({ user: userId });
        client.set(`my-orders${userId}`, JSON.stringify(orders));
    }

    return res.status(200).json({
        success: true,
        data: orders
    })

}

export const getOrderDetail = async (req: Request, res: Response, next: NextFunction) => {

    let order;

    const orderId = req.params.id;

    let cachedOrders = await client.get(`order-${orderId}`);
    if (cachedOrders) {
        order = JSON.parse(cachedOrders);
    } else {
        order = await Order.findById(orderId).populate("user", "name");
        if (!order) return next(new ErrorHandler("order not found", 404))
        client.set(`order-${orderId}`, JSON.stringify(order));
    }

    return res.status(200).json({
        success: true,
        data: order
    })

}

export const processOrder = async (req: Request, res: Response, next: NextFunction) => {

    const orderId = req.params.id;
    const order = await Order.findById(orderId).populate("user", "name");
    if (!order) return next(new ErrorHandler("order not found", 404));

    switch (order.status) {
        case 'Processing':
            order.status = 'Shipped';
            break;
        case 'Shipped':
            order.status = "Delivered";
            break;
        default:
            order.status = 'Delivered';
            break;
    }

    await order.save();

    invalidateCache({
        product: false,
        admin: true,
        orders: true,
        orderId: `${order._id}`,
        userId: order.user
    })

    return res.status(200).json({
        success: true,
        message: "Order Processed Successfully",
    });

}


export const deleteOrder = async (req: Request, res: Response, next: NextFunction) => {

    const id = req.params.id;

    const order = await Order.findById(id);
    if (!order) return next(new ErrorHandler("order not found", 404));

    await order.deleteOne();
    invalidateCache({
        product: false,
        admin: true,
        orders: true,
        orderId: `${order._id}`,
        userId: order.user
    })


    return res.status(200).json({
        success: true,
        message: "Order Deleted Successfully",
    });

}

