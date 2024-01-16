import { Router } from "express";
import { TryCatch } from "../middlewares/error.js";
import { createPaymentIntent,addCoupon, applyDiscount, deleteCoupon, getAllCoupon } from "../controllers/payment.controller.js";
import { isAdmin } from "../middlewares/auth.js";

const route = Router();

route.post(
    '/create-payment',
    TryCatch(createPaymentIntent)
)

route.post(
    '/',
    TryCatch(addCoupon)
)

route.get(
    '/',
    TryCatch(applyDiscount)
)

route.get(
    '/all',
    TryCatch(isAdmin),
    TryCatch(getAllCoupon)
)

route.delete(
    '/',
    TryCatch(isAdmin),
    TryCatch(deleteCoupon)
)



export default route;