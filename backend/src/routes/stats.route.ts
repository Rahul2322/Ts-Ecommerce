import { Router } from "express";
import { TryCatch } from "../middlewares/error.js";
import { isAdmin } from "../middlewares/auth.js";
import { getDashboardStats, getPieCharts, getBarCharts ,getLineCharts } from "../controllers/stats.js";

const route = Router();

route.get(
    '/dashboard',
    TryCatch(isAdmin),
    TryCatch(getDashboardStats)
)
route.get(
    '/pie',
    TryCatch(isAdmin),
    TryCatch(getPieCharts)
)

route.get(
    '/bar',
    TryCatch(isAdmin),
    TryCatch(getBarCharts)
)
route.get(
    '/line',
    TryCatch(isAdmin),
    TryCatch(getLineCharts)
)


export default route;