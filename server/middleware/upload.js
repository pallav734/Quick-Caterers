import multer from "multer";

const storage = multer.memoryStorage();

const fileFilter = (req,file,cb)=>{
    const allowedFormats = ["image/jpeg", "image/png", "image/webp" ,"application/pdf", "application/msword","application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
    if(allowedFormats.includes(file.mimetype)){
        cb(null, true);
    }else{
        cb(new Error("Only images and documents are allowed"), false);
    }
}

export const upload = multer({
    storage,
    fileFilter,
    limits:{ fileSize: 10 * 1024 * 1024 }, // 5MB limit
})  
