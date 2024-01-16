import {Router} from 'express';

import { TryCatch } from '../middlewares/error.js';
import { isAdmin } from '../middlewares/auth.js';
import { addProduct,getAllProducts,getAllLatestProducts, getAllCategories, getSingleProduct, updateProduct, deleteProduct, getSearchProducts } from '../controllers/product.controller.js';
import { singleUpload } from '../middlewares/multer.js';
const route = Router();


route.post(
  '/add',
  TryCatch(isAdmin),
  singleUpload,
  TryCatch(addProduct)
)

route.get(
  '/all',
  TryCatch(getAllLatestProducts)
)

route.get(
  '/admin-all',
  TryCatch(isAdmin),
  TryCatch(getAllProducts)
)
route.get(
    '/categories',
    TryCatch(getAllCategories)
  )

route.get(
    '/:id',
    TryCatch(getSingleProduct)
  )

route.put(
    '/:id',
    TryCatch(isAdmin),
    TryCatch(updateProduct)
)

route.delete(
    '/:id',
    TryCatch(isAdmin),
    TryCatch(deleteProduct)
)

route.get(
    '/',
    TryCatch(getSearchProducts)
)
  



export default route;