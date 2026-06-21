import User from "../models/Users.js";
import {ROLES} from "../config/role.js";
import jwt from "jsonwebtoken"
import { comparePassword, hashPassword } from "../utils/hasPassword.js";
import crypto from "crypto";
import transporter from "../config/mail.js";
/**
 * SUPER ADMIN REGISTER (ONE TIME)
 */
export const registerSuperAdmmin = async(req, res)=>{
    try {
        const exists = await User.findOne({role:ROLES.SUPER_ADMIN});
        if(exists){
            return res.status(400).json({
                success: false,
                message:"Super admin alredy exists"
            })
        }
        let{name , email, password,mobile,address} = req.body;
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
        let emailExists = await User.findOne({email});
        if(emailExists){
                return res.status(400).json({
                success: false,
                message:"Email alerday exists"
            });
        }
        const user = await User.create({
            name,
            email,
            mobile,
            address,
            password: await hashPassword(password),
            role:ROLES.SUPER_ADMIN
        });
        res.status(201).json({
            success: true,
            message: "Super Admin created",
            user,
        });
    } catch (error) {
         res.status(500).json({
            success: false,
            message: error.message,
        });
    }
}

/**
 * All user login
 */
export const loginController = async(req, res)=>{
    try {
        const {email, password} = req.body;
        const existUser = await User.findOne({email});
        if(!existUser){
            return res.status(400).json({
                    success: false,
                    message:"User Not found"
                });
        }
        const matchPassword = await comparePassword(password , existUser.password);
        if(!matchPassword){
            return res.status(401).json({ message: "Invalid credentials" });
        }
        let token = jwt.sign({
            _id:existUser._id , role:existUser.role
        } , process.env.JWT_SECRET , {expiresIn:"1d"});
        res.json({
            success:true,
            token,
            user:{
                _id:existUser._id,
                name:existUser.name,
                email:existUser.email,
                mobile:existUser.mobile,
                address:existUser.address,
                role:existUser.role
            }
        })
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

/**
 * Forgot Password
 */
export const forgotPasswordController = async(req,res)=>{
    try {
        let{email} = req.body;
        const user = await User.findOne({email});
        if(!user){
            return res.status(400).json({success: false,message:"User Not found"});
        }

        const resetToken = crypto.randomBytes(32).toString("hex");
        user.resetToken = resetToken;
        user.resetTokenExpire = Date.now() + 10*60*1000; //10min
        await user.save();

        const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
        await transporter.sendMail({
            from: process.env.MAIL_USER,
            to: process.env.MAIL_USER,
            // to:user.email,
            subject:"Password Reset",
            html:`
            <h2>Password Reset</h2>
            <p>Click below link to reset password (valid 10 min)</p>
            <a href="${resetUrl}">${resetUrl}</a>`
        });
        res.json({ success: true, message: "Reset link sent to email" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

/* Reset Password*/

export const resetPasswordController = async(req,res)=>{
    try {
        const {token} = req.params;
        const {password} = req.body;
        const user = await User.findOne({
            resetToken: token,
            resetTokenExpire: { $gt: Date.now() },
        });
        if (!user) {
            return res.status(400).json({ message: "Invalid or expired token" });
        }
        user.password = await hashPassword(password);
        user.resetToken = undefined;
        user.resetTokenExpire = undefined;
        await user.save();
        res.json({ success: true, message: "Password reset successful" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export const authMe = async(req,res)=>{
    try {
        const user = await User.findById(req.user._id).select("-password");
        res.json({
            success: true,
            user,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}