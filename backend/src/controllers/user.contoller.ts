import { Request, Response, NextFunction } from 'express'
import { UserRequestBody } from '../types/types.js'
import { User } from '../models/user.model.js';
import ErrorHandler from '../utils/utility-class.js';


export const addUser = async (req: Request<{}, {}, UserRequestBody>, res: Response, next: NextFunction) => {

    const { username, photo, email, dob, gender, role, _id } = req.body;

    if (!username || !photo || !email || !dob || !gender) {
        return next(new ErrorHandler("All fields are required", 400))
    }


    let user = await User.findById(_id);
    if (user) {
        return res.status(200).json({
            success: false,
            message: `${user.username} already exist`
        })
    }
    user = await User.create({
        username, photo, email, dob, gender, role, _id
    })
    
    return res.status(201).json({
        success: true,
        message: `Welcome ${user.username}`
    })

}

export const getAllUser = async (req: Request, res: Response, next: NextFunction) => {
    const users = await User.find({});
    return res.status(200).json({
        users,
        success: true
    })
}

export const getUser = async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id
    const user = await User.findById(id);
    if(!user) return next(new ErrorHandler(`${id} does not exists`,404))
    return res.status(200).json({
        user,
        success: true
    })
}


export const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id
    const user = await User.findById(id);
    if(!user) return next(new ErrorHandler(`${id} does not exists`,404))
    await user.deleteOne();
    return res.status(200).json({
        user,
        success: true
    })
}