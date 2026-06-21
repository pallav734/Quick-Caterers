//create service

import { ROLES } from "../config/role.js";
import Services from "../models/Services.js";

export const createServiceController = async (req,res)=>{
    try {
        const {name , description} = req.body;
        if(![ROLES.SUPER_ADMIN].includes(req.user.role)){
            return res.status(403).json({
                success: false,
                message: "You are not allowed to create users",
            });
        }
        const existService = await Services.findOne({name});
        if(existService){
            return res.status(403).json({
                success: false,
                message: "Event is already registerd!",
            });
        }
        const service = await Services.create({name,description});
        res.status(201).json({
            success: true,
            message: "Service created successfully",
            service,
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
}

//Get Services

export const getServiceController = async(req,res)=>{
    try {
        const{search , page=1 , limit = 5} = req.query;
        const skip = (page-1)*limit;
        let searchQuery = {};
        if(search && search.trim()!==""){
            searchQuery={
                name:{$regex:search , $options:'i'},
            }
        }    
        const filter = {
            ...searchQuery
        };
        const services = await Services.find(filter)
                .skip(skip)
                .limit(limit)
                .sort({ createdAt: -1 });
        const total = await Services.countDocuments(filter);
        res.json({
            success: true,
            total,
            page:parseInt(page),
            totalPages:Math.ceil(total/limit),
            services,
        });  
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
}

//Update service

export const updateServiceController = async(req,res)=>{
    try {
        const {id} = req.params;
        const{name,description,isActive} = req.body;
        const service = await Services.findById(id);
        if(!service){
            return res.status(404).json({ success: false, message: "Service not found" });
        }
        if(!["SUPER_ADMIN", "SUB_ADMIN"].includes(req.user.role)){
            return res.status(403).json({ success: false, message: "Access denied" });
        }
        service.name = name;
        service.description = description;
        service.isActive = isActive;
        await service.save();
        res.json({ success: true, message: "Service updated", service });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }

}

/*Delete Service */
export const deleteServiceController = async(req,res)=>{
    try {
        let { id } = req.params;
        const targetService = await Services.findById(id);
        if(!targetService){
            return res.status(404).json({ success: false, message: "Service not found" });
        }

        if(!['SUPER_ADMIN' , 'SUB_ADMIN'].includes(req.user.role)){
            return res.status(403).json({ success: false, message: "Access denied" });
        }
        
        await targetService.deleteOne();
        res.json({ success: true, message: "Service deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};