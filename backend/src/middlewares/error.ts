import  {Request,Response,NextFunction } from 'express';
import ErrorHamdler from '../utils/utility-class.js';
import { ControllerType } from '../types/types.js';

export const errorMiddleware = (error:ErrorHamdler,req:Request,res:Response,next:NextFunction)=>{
    error.message ||= "Internal Server Error"
    error.statusCode ||= 500;
    return res.status(error.statusCode).json({
        success:false,
        message:error.message
    })
}


export const TryCatch =
  (func: ControllerType) =>
  (req: Request, res: Response, next: NextFunction) => {
    return Promise.resolve(func(req, res, next)).catch(next);
  };