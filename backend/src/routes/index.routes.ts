import { Router } from "express";
import user from './user.route.js';
import product from './product.route.js';
import order from './order.routes.js';
import payment from './payment.routes.ts';
import stats from  './stats.route.ts';

const route = Router();


route.use('/user',user);
route.use('/product',product);
route.use('/order',order);
route.use('/payment',payment);
route.use('/stats',stats);

export default route;