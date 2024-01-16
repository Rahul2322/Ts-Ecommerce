import {Router} from 'express';
import { addUser, deleteUser, getAllUser, getUser } from '../controllers/user.contoller.js';
import { TryCatch } from '../middlewares/error.js';
import { isAdmin } from '../middlewares/auth.js';
const route = Router();


route.post(
    '/add',
    TryCatch(addUser) 
)

route.get(
    '/',
    TryCatch(isAdmin),
  TryCatch(getAllUser)
)

route.get(
    '/:id',
    TryCatch(getUser)
)

route.delete(
    '/:id',
    TryCatch(isAdmin),
    TryCatch(deleteUser)
)
export default route;