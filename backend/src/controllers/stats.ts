import { Request, Response, NextFunction } from "express";
import { client } from "../app.js";
import { Product } from "../models/product.model.js";
import { User } from "../models/user.model.js";
import { Order } from "../models/order.model.js";
import { calculatePercentage, getChartData, getInventories } from "../utils/feature.js";

export const getDashboardStats = async (req: Request, res: Response, next: NextFunction) => {
    let stats = {};
    const cachedData = await client.get("admnin-stats")
    if (cachedData) {
        stats = JSON.parse(cachedData);
    } else {
        const today = new Date();
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const thisMonth = {
            start: new Date(today.getFullYear(), today.getMonth(), 1),
            end: today
        }

        const lastMonth = {
            start: new Date(today.getFullYear(), today.getMonth() - 1, 1),
            end: new Date(today.getFullYear(), today.getMonth(), 0)
        }




        const thisMonthProductPromise = Product.find({
            createdAt: {
                $gte: thisMonth.start,
                $lte: thisMonth.end
            }
        })
        const thisMonthOrderPromise = Order.find({
            createdAt: {
                $gte: thisMonth.start,
                $lte: thisMonth.end
            }
        })
        const thisMonthUserPromise = User.find({
            createdAt: {
                $gte: thisMonth.start,
                $lte: thisMonth.end
            }
        })
        const lastMonthProductPromise = Product.find({
            createdAt: {
                $gte: lastMonth.start,
                $lte: lastMonth.end
            }
        })
        const lastMonthOrderPromise = Order.find({
            createdAt: {
                $gte: lastMonth.start,
                $lte: lastMonth.end
            }
        })
        const lastMonthUserPromise = User.find({
            createdAt: {
                $gte: lastMonth.start,
                $lte: lastMonth.end
            }
        })

        const lastSixMonthOrdersPromise = Order.find({
            createdAt: {
                $gte: sixMonthsAgo,
                $lte: today
            }
        })

        const latestTransactionPromise = Order.find({}).select(["discount", "total", "status", "orderItems"]).limit(4);

        const [
            thisMonthProducts,
            thisMonthOrders,
            thisMonthUsers,
            lastMonthProducts,
            lastMonthOrders,
            lastMonthUsers,
            productsCount,
            usersCount,
            allOrders,
            lastSixMonthOrders,
            categories,
            totalFemaleCount,
            latestTransaction
        ] = await Promise.all([
            thisMonthProductPromise,
            thisMonthOrderPromise,
            thisMonthUserPromise,
            lastMonthProductPromise,
            lastMonthOrderPromise,
            lastMonthUserPromise,
            Product.countDocuments(),
            User.countDocuments(),
            Order.find({}).select("total"),
            lastSixMonthOrdersPromise,
            Product.distinct("category"),
            User.countDocuments({ gender: 'Female' }),
            latestTransactionPromise
        ])

        const lastMonthRevenue = lastMonthOrders.reduce((total, order) => {
            return total += order.total || 0
        }, 0)

        const thisMonthRevenue = thisMonthOrders.reduce((total, order) => {
            return total += order.total || 0
        }, 0)



        const changePercent = {
            revenue: calculatePercentage(lastMonthRevenue, thisMonthRevenue),
            product: calculatePercentage(
                lastMonthProducts.length,
                thisMonthProducts.length
            ),
            order: calculatePercentage(
                lastMonthOrders.length,
                thisMonthOrders.length
            ),
            user: calculatePercentage(
                lastMonthUsers.length,
                thisMonthUsers.length
            )
        }
        const revenue = allOrders.reduce((total, order) => (
            total + (order.total || 0)
        ), 0)

        let count = {
            revenue,
            productsCount,
            usersCount,
            ordersCount: allOrders.length
        }

        const orderMonthCounts = new Array(6).fill(0);
        const orderMonthlyRevenue = new Array(6).fill(0);

        lastSixMonthOrders.forEach(order => {
            const creationDate = order.createdAt;
            //creatinDdate = 2023-12-1 ,today = 2024-1-1 => diff = 1 - 12 + 12 = 1 % 12 = 1
            //creatinDdate = 2023-8-1 ,today = 2024-12-1 => diff = 12 - 8 + 12 = 16 %12 = 4
            const monthDiff = (today.getMonth() - creationDate.getMonth() + 12) % 12;

            if (monthDiff < 6) {
                orderMonthCounts[6 - monthDiff - 1] += 1;
                orderMonthlyRevenue[6 - monthDiff - 1] += order.total
            }
        })

        const categoriesCount = await getInventories({
            categories,
            productsCount
        })

        const userRatio = {
            female: totalFemaleCount,
            male: usersCount - totalFemaleCount
        }

        const modifiedLatestTransaction = latestTransaction.map((i) => ({
            id: i._id,
            discount: i.discount,
            total: i.total,
            status: i.status,
            quantity: i.orderItems.length
        }))

        stats = {
            changePercent,
            count,
            chart: {
                order: orderMonthlyRevenue,
                revenue: orderMonthlyRevenue
            },
            categoriesCount,
            userRatio,
            latestTransaction: modifiedLatestTransaction
        },

            client.set('admin-stats', JSON.stringify(stats))

    }

    return res.status(200).json({
        success: true,
        stats
    })
}


export const getPieCharts = async (req: Request, res: Response, next: NextFunction) => {
    let charts;

    let cachedData = await client.get("admin-pie-charts");
    if (cachedData) {
        charts = JSON.parse(cachedData)
    } else {

        const allOrdersPromise = Order.find({}).select([
            "total",
            "subtotal",
            "discount",
            "shippingCharges",
            "tax"
        ])
        const [
            processingOrders,
            shippedOrders,
            deliveredOrders,
            categories,
            productsCount,
            outOfStock,
            allOrders,
            allUsers,
            adminUsers,
            customerUsers
        ] =
            await Promise.all([
                Order.countDocuments({ status: "Processing" }),
                Order.countDocuments({ status: "Shipped" }),
                Order.countDocuments({ status: "Delivered" }),
                Product.distinct("category"),
                Product.countDocuments(),
                Order.countDocuments({ stock: 0 }),
                allOrdersPromise,
                User.find({}).select(["dob"]),
                User.countDocuments({ role: "admin" }),
                User.countDocuments({ role: "user" }),
            ])

        const orderFullfillment = {
            processingOrders,
            shippedOrders,
            deliveredOrders
        }

        const productCategories = await getInventories({
            categories,
            productsCount

        })

        const stockAvailability = {
            outOfStock,
            inStock: allOrders.length - outOfStock
        }

        const grossIncome = allOrders.reduce((total, order) => total + (order.total || 0), 0);
        const discount = allOrders.reduce((total, order) => total + (order.discount || 0), 0);
        const productionCost = allOrders.reduce((total, order) => total + (order.shippingCharges || 0), 0);
        const marketingCost = grossIncome * (30 / 100);
        const burnt = allOrders.reduce((total, order) => total + (order.tax || 0), 0);

        const netMargin = grossIncome - discount - productionCost - marketingCost - burnt;

        const revenueDistribution = {
            netMargin,
            discount,
            productionCost,
            burnt,
            marketingCost,
        };

        const usersAgeGroup = {
            teen: allUsers.filter((i) => i.age < 20).length,
            adult: allUsers.filter((i) => i.age >= 20 && i.age < 50).length,
            old: allUsers.filter((i) => i.age >= 50).length,
        }

        const adminCustomer = {
            admin: adminUsers,
            customer: customerUsers,
        };

        charts = {
            orderFullfillment,
            productCategories,
            stockAvailability,
            revenueDistribution,
            usersAgeGroup,
            adminCustomer
        }

        client.set("admin-pie-stats", JSON.stringify(charts))

    }

    return res.status(200).json({
        success: true,
        charts,
    });
}

export const getBarCharts = async (req: Request, res: Response, next: NextFunction) => {
    let barCharts;

    const cachedData = await client.get("admin-bar-charts");
    if (cachedData) {
        barCharts = JSON.parse(cachedData)
    } else {
        const today = new Date();
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(today.getMonth() - 6)

        const twelveMonthsAgo = new Date();
        twelveMonthsAgo.setMonth(today.getMonth() - 12);

        const sixMonthsProductPromise = Product.find({
            createdAt: {
                $gte: sixMonthsAgo,
                $lte: today
            }
        }).select("createdAt");
        const sixMonthsUserPromise = User.find({
            createdAt: {
                $gte: sixMonthsAgo,
                $lte: today
            }
        }).select("createdAt");
        const sixMonthsOrderPromise = Order.find({
            createdAt: {
                $gte: twelveMonthsAgo,
                $lte: today
            }
        }).select("createdAt");


        const [products, users, orders] =
            await Promise.all([
                sixMonthsProductPromise,
                sixMonthsUserPromise,
                sixMonthsOrderPromise
            ])

        const productCounts = getChartData({ length: 6, dataArr: products, today });
        const usersCounts = getChartData({ length: 6, dataArr: users, today });
        const ordersCounts = getChartData({ length: 12, dataArr: orders, today });

        barCharts = {
            users: usersCounts,
            products: productCounts,
            orders: ordersCounts,
        }

        client.set("admin-bar-charts", JSON.stringify(barCharts))
    }

    return res.status(200).json({
        success: true,
        barCharts
    })
}

export const getLineCharts = async (req: Request, res: Response, next: NextFunction) => {

    let charts;

    let cachedData = await client.get("admin-line-charts");
    if (cachedData) {
        charts = JSON.parse(cachedData)
    } else {
        const today = new Date();
        const twelveMonthsAgo = new Date();
        twelveMonthsAgo.setMonth(today.getMonth() - 12);

        const twelveMonthsProductPromise = Product.find({
            createdAt: {
                $gte: twelveMonthsAgo,
                $lte: today
            }
        }).select("createdAt");
        const twelveMonthsUserPromise = User.find({
            createdAt: {
                $gte: twelveMonthsAgo,
                $lte: today
            }
        }).select("createdAt");
        const twelveMonthsOrderPromise = Order.find({
            createdAt: {
                $gte: twelveMonthsAgo,
                $lte: today
            }
        }).select(["createdAt", "discount","total"]);

        const [products, users, orders] =
            await Promise.all([
                twelveMonthsProductPromise,
                twelveMonthsUserPromise,
                twelveMonthsOrderPromise
            ])



        const productCounts = getChartData({ length: 12, dataArr: products, today });
        const usersCounts = getChartData({ length: 12, dataArr: users, today });
        const discount = getChartData({
            length: 12,
            today,
            dataArr: orders,
            property: "discount",
        });

        const revenue = getChartData({
            length: 12,
            today,
            dataArr: orders,
            property: "total",
        });

        charts = {
            products:productCounts,
            users:usersCounts,
            discount,
            revenue
        }

        client.set("admin-line-charts", JSON.stringify(charts))
    }

    return res.status(200).json({
        success: true,
        charts
    })
}