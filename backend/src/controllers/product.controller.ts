import { NextFunction, Request, Response } from "express";
import { BaseQuerySearchProduct, ProductRequestBody, SearchQuery } from "../types/types.js";
import { Product } from "../models/product.model.js";
import ErrorHandler from "../utils/utility-class.js";
import { rm } from "fs";
import { client } from "../app.js";
import { invalidateCache } from "../utils/feature.js";

export const addProduct = async (req: Request<{}, {}, ProductRequestBody>, res: Response, next: NextFunction) => {
    const { name, price, stock, category } = req.body
    const photo = req.file

    if (!photo) return next(new ErrorHandler("Photo is required", 400));

    if (!name || !price || !stock || !category) {
        rm(photo.path, () => console.log('photo deleted'))
        return next(new ErrorHandler("Please enter all fields", 400));
    }
    await Product.create({
        name,
        price,  
        stock,
        category: category.toLowerCase(),
        photo: photo.path
    })

    invalidateCache({product:true,admin:true})

    return res.status(201).json({
        success: true,
        message: 'Product created Successfully'
    })
}

export const getAllLatestProducts = async (req: Request, res: Response, next: NextFunction) => {
    let products;
    const cachedProduct = await client.get("latest-products")
    if (cachedProduct) {
        products = JSON.parse(cachedProduct)
    } else {
        products = await Product.find({}).sort({ createdAt: -1 }).limit(10);
        client.set('latest-products', JSON.stringify(products))
    }
    return res.status(200).json({
        products,
        success: true
    })

}

export const getAllProducts = async (req: Request, res: Response, next: NextFunction) => {
    let products;
    const cachedProduct = await client.get('allProducts');
    if (cachedProduct) {
        products = JSON.parse(cachedProduct);
    } else {
        products = await Product.find({});
        client.set('allProducts', JSON.stringify(cachedProduct))
    }
    return res.status(200).json({
        products,
        success: true
    })

}

export const getSingleProduct = async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    let product;
    const cachedProduct = await client.get(`${id}product`)
    if (cachedProduct) {
        product = JSON.parse(cachedProduct);
    } else {
        product = await Product.findById(id);
        if (!product) return next(new ErrorHandler("Product not found", 404));
        client.set(`${id}product`, JSON.stringify(product));
    }

    return res.status(200).json({
        success: true,
        product
    })

}

export const getAllCategories = async (req: Request, res: Response, next: NextFunction) => {
   let categories;

   const cachedCategories = await client.get('categories');
   if(cachedCategories){
    categories = JSON.parse(cachedCategories);
   }else{
    categories = await Product.distinct("category");
    client.set('categories',JSON.stringify(categories));
   }

    
    return res.status(200).json({
        categories,
        success: true
    })

}

export const updateProduct = async (req: Request, res: Response, next: NextFunction) => {
    const { name, price, stock, category } = req.body
    const photo = req.file;
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product) return next(new ErrorHandler("Product not found", 404))

    if (photo) {
        rm(product.photo, (err) =>{
            if(err){
                return next(new ErrorHandler('Error deleting photo',500))
            }else{
                console.log('Photo deleted')
            }
        });
        product.photo = photo.path
    }

    if (name) product.name = name;
    if (stock) product.stock = stock;
    if (price) product.price = price;
    if (category) product.category = category;

    
    const updatedProduct = await product.save();
   
    invalidateCache({product:true,productId:`${product._id}`,admin:true})

    return res.status(200).json({
        success: true,
        product:updatedProduct
    })

}


export const deleteProduct = async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    const product = await Product.findById(id);
    if (!product) return next(new ErrorHandler("Product not found", 404));

    rm(product.photo, (err) =>{
        if(err){
            return next(new ErrorHandler('Error deleting photo',500))
        }else{
            console.log('Photo deleted')
        }
    });

    await product.deleteOne();
    invalidateCache({product:true,productId:`${product._id}`,admin:true})

    return res.status(200).json({
        success: true,
        message: 'Product Deleted Successfully'
    })

}

export const getSearchProducts = async (req: Request<{}, {}, {}, BaseQuerySearchProduct>, res: Response, next: NextFunction) => {
    const { search, sort, price, category } = req.query;
    const page = Number(req.query.page) || 1;
    const limit = Number(process.env.PRODUCT_PER_PAGE) || 8;
    const skip = (page - 1) * limit;
    const searchQuery: SearchQuery = {};

    if (search) {
        searchQuery.name = {
            $regex: search,
            $options: 'i'
        }
    }

    if (price) {
        searchQuery.price = {
            $lte: Number(price)
        }
    }

    if (category) {
        searchQuery.category = category
    }
    const [products, filteredOnlyProducts] = await Promise.all([
        Product.find(searchQuery).sort(sort && { price: sort === 'asc' ? 1 : -1 }).limit(limit).skip(skip),
        Product.find(searchQuery)
    ])

    const totalPage = Math.ceil(filteredOnlyProducts.length / limit)
    return res.status(200).json({
        success: true,
        products,
        totalPage
    })

}


