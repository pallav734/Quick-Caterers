import { populate } from "dotenv";
import cloudinary from "../config/cloudinary.js";
import { ROLES } from "../config/role.js";
import Users from "../models/Users.js";
import { hashPassword } from "../utils/hasPassword.js";
import streamifier from "streamifier"; // Converts a Buffer/String into a readable stream

export const createUserController = async(req,res)=>{
    try {
        const { name , email , password , mobile, address,role} = req.body;
       
        //only admin allows
        if(![ROLES.SUPER_ADMIN].includes(req.user.role)){
            return res.status(403).json({
                success: false,
                message: "You are not allowed to create users",
            });
        }
        if(!name){
           return res.status(400).json({
                success: false,
                message:"name is required"
            });
        }
        if(!email){
            return res.status(400).json({
                success: false,
                message:"email is required"
            });
        }
        if(!password){
            return res.status(400).json({
                success: false,
                message:"password is required"
            });
        }
        if(!mobile){
            return res.status(400).json({
                success: false,
                message:"mobile is required"
            });
        }
        if(!address){
            return res.status(400).json({
                success: false,
                message:"address is required"
            });
        }
        if(!role){
            return res.status(400).json({
                success: false,
                message:"role is required"
            });
        }
        const user  = await Users.create({
            name,
            email,
            mobile,
            password:await hashPassword(password),
            address,
            role,
        });
        res.status(201).json({
            success: true,
            message: "User created successfully",
            user,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

/* get all users*/
export const getUserController = async(req,res)=>{
    try {
        const {search, page=1, limit=10 , status} = req.query;
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        let searchQuery = {};
        if(search && search.trim() !== ""){
            searchQuery = {
                $or:[
                    {name:{$regex:search , $options:'i'}},
                    {email:{$regex:search , $options:'i'}},
                    {mobile:{$regex:search , $options:'i'}},
                ]
            };
        }
        let statusFilter = {};

        if (status === "active") {
            statusFilter = { isActive: true };
        } else if (status === "inactive") {
            statusFilter = { isActive: false };
        }
        const filter = {
            role: { $ne: "SUPER_ADMIN" },
            isDeleted: false,
            ...statusFilter,
            ...searchQuery
        };
        const total = await Users.countDocuments(filter);
        const totalPages = Math.ceil(total / limitNum) || 1;
        const validPage = pageNum > totalPages ? totalPages : pageNum;
        const skip = (validPage - 1) * limitNum;
        const users = await Users.find(filter)
            .select("-password")
            .skip(skip)
            .limit(limitNum)
            .sort({ createdAt: -1 });
        res.json({
            success: true,
            total,
            page:validPage,
            totalPages,
            users,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }

};

/* get Single users*/
export const getSingleUserController = async(req,res)=>{
    try {
        const user = await Users.findById(req.params.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }
        res.json({
            success: true,
            user,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }

};

/* Update Users */

export const updateUserController = async(req,res)=>{
    try {
        const {id} = req.params;
        const{name,email,mobile,password,role,address,isActive} = req.body;

        const user = await Users.findById(id);
        if(!user){
            return res.status(404).json({ success: false, message: "User not found" });
        }

        if(!["SUPER_ADMIN", "SUB_ADMIN"].includes(req.user.role)){
            return res.status(403).json({ success: false, message: "Access denied" });
        }
        
        // update normal fields
        user.name = name;
        user.email = email;
        user.mobile = mobile;
        user.role = role;
        user.address = address;
        user.isActive = isActive;
        //only update the password if provided
        if(password && password.trim() !== ""){
            user.password = await hashPassword(password);
        }
        await user.save();
        res.json({ success: true, message: "User updated", user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

/*Delete User */
// export const deleteUserController = async(req,res)=>{
//     try {
//         let { id } = req.params;
//         const targetUser = await Users.findById(id);
//         if(!targetUser){
//             return res.status(404).json({ success: false, message: "User not found" });
//         }

//         if(!['SUPER_ADMIN' , 'SUB_ADMIN'].includes(req.user.role)){
//             return res.status(403).json({ success: false, message: "Access denied" });
//         }
//         if (targetUser.role === "SUPER_ADMIN") {
//             return res.status(403).json({
//                 success: false,
//                 message: "You cannot delete a Super Admin",
//             });
//         }
//                 targetUser.isDelete = true;
//                 await targetUser.save();
//             res.json({ success: true, message: "User deleted successfully" });
//     } catch (error) {
//         res.status(500).json({ success: false, message: error.message });
//     }
// };


/* toggle status*/
export const toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;

    //  Role check
    if (!["SUPER_ADMIN", "SUB_ADMIN"].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    const user = await Users.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Prevent disabling SUPER_ADMIN
    if (user.role === "SUPER_ADMIN") {
      return res.status(403).json({
        success: false,
        message: "Cannot change SUPER_ADMIN status",
      });
    }

    // Toggle
    user.isActive = !user.isActive;
    await user.save();

    res.json({
      success: true,
      message: `User ${user.isActive ? "activated" : "deactivated"}`,
      user,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};




/*Soft Delete users */
export const softDeleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Role check 
    if (!["SUPER_ADMIN", "SUB_ADMIN"].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    //  Get target user first
    const targetUser = await Users.findById(id);
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    //  Prevent deleting SUPER_ADMIN
    if (targetUser.role === "SUPER_ADMIN") {
      return res.status(403).json({
        success: false,
        message: "You cannot delete a Super Admin",
      });
    }

    //  Prevent double delete
    if (targetUser.isDeleted) {
      return res.status(400).json({
        success: false,
        message: "User already deleted",
      });
    }

    //  Soft delete
    targetUser.isDeleted = true;
    targetUser.deletedAt = new Date();

    await targetUser.save();

    res.json({
      success: true,
      message: "User deleted (soft) successfully",
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/*Image Upload */
export const uploadProfileImageController = async(req,res)=>{
    try {
        const userId = req.user._id;
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "No image uploaded",
            });
        }
        //upload buffer to cloudinory
        const streamUpload = () =>{
            return new Promise((resolve , reject)=>{
                const stream = cloudinary.uploader.upload_stream(
                    {
                        folder: "Quick-cateres/users",
                    },
                    (error, result) => {
                        if (result) resolve(result);
                        else reject(error);
                    }
                );
                streamifier.createReadStream(req.file.buffer).pipe(stream);
            });
        };
        const result = await streamUpload();

        // Save Cloudinary URL in DB
        const user = await Users.findByIdAndUpdate(
            userId,
            {
                profileImage: result.secure_url
            },
            { new: true }
        ).select("-password");
        res.json({
            success: true,
            message: "Profile image updated",
            user,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};