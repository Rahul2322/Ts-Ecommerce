import multer from "multer";

const storage = multer.diskStorage({
    destination:(req,file,cb)=> cb(null,"uploads"),
    filename:(req,file,cb)=>{
        const extName = file.originalname.split('.').pop();
        cb(null,`${Date.now()}.${extName}`)
    }
})

export const singleUpload = multer({storage}).single('photo')