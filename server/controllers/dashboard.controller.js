import Company from "../models/Company.js";
import Services from "../models/Services.js";
import Users from "../models/Users.js";
import Category from "../models/Category.js";
import SubCategory from "../models/Subcategory.js"

export const getDashboardStateController = async (req,res)=>{
    try {
        let filter = {};
        //Total User
        const totalUsers = await Users.countDocuments(filter);

        //Total Company
        const totalCompany = await Company.countDocuments(filter);

        //Total Sevices

        const totalEvent = await Services.countDocuments(filter);
        
        //Total Categories
        const totalCategories = await Category.countDocuments(filter);

         //Total SubCategories
        const totalSubCategories = await SubCategory.countDocuments(filter);

         /* RECENT Users */

        const recentUsers = await Users.find(filter)
            .select("name email")
            .sort({ createdAt: -1 })
            .limit(5);

        res.json({
            success: true,
            state: {
                totalUsers,
                totalCompany,   
                totalEvent,
                totalCategories,
                totalSubCategories
            },
            recentUsers
        });    
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}