import mongoose from "mongoose";
import validator from "validator";

const userSchema = new mongoose.Schema({
    name:{
        type : String,
        trim : true,
        required : true
    },
    email:{
        type : String,
        required :true,
        trim : true,
        unique : true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error("Please Enter valid EmailID");
            }
        }
    },
    password:{
        type:String,
        required:true,
    },
    mobile:{
        type:String,
        required:true,
    },
    address:{
       type:String,
       required:true, 
    },
    role: {
        type: String,
        required: true,
        enum: [
            "SUPER_ADMIN",
            "SUB_ADMIN",
            "COMPANY_ADMIN",
        ],
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    isDeleted: {
        type: Boolean,
        default: false,
    },
    deletedAt: {
        type: Date,
        default: null
    },
    companyId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"company"
    },
    profileImage: {
        type: String,
        default: null,
    },
    resetToken: String,
    resetTokenExpire: Date,    
}, {
    timestamps:true
});

export default mongoose.model("user" ,userSchema);