import {Router} from 'express';
import { TryCatch } from '../middlewares/error.js';
import { addOrder, deleteOrder, getAllOrders, getMyOrders, getOrderDetail, processOrder } from '../controllers/order.controller.js';
import { isAdmin } from '../middlewares/auth.js';
const route = Router();

route.post(
    '/add',
    TryCatch(addOrder)
)

route.get(
    '/',
    TryCatch(isAdmin),
    TryCatch(getAllOrders)
)

route.get(
    '/myOrders',
    TryCatch(getMyOrders)
)

route.get(
    '/:id',
    TryCatch(getOrderDetail)
)

route.put(
    '/:id',
    TryCatch(processOrder)
)

route.delete(
    '/:id',
    TryCatch(deleteOrder)
)


export default route;