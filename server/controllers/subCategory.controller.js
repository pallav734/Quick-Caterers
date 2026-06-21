import cloudinary from "../config/cloudinary.js";
import streamifier from "streamifier"; // Converts a Buffer/String into a readable stream
import Subcategory from "../models/Subcategory.js";

/* Create Sub-Category */
export const createSubCategoryController = async(req,res)=>{
    try {
        const {name , description} = req.body
        if(!name || !description || !req.files?.images?.length){
             return res.status(400).json({
                success: false,
                message: "All required fields must be filled"
            });
        }
        // Helper function for upload
            const streamUpload = (file, folder) => {
                return new Promise((resolve, reject) => {
                    const stream = cloudinary.uploader.upload_stream(
                        { folder },
                        (error, result) => {
                            if (result) resolve(result);
                            else reject(error);
                        }
                    );
                    streamifier.createReadStream(file.buffer).pipe(stream);
                });
            };
              let imageUrls = [];
                if (req.files?.images) {
                    imageUrls = await Promise.all(
                        req.files.images.map(file =>
                            streamUpload(file, "Quick-cateres/Sub-categoryImage")
                        )
                    );
                    imageUrls = imageUrls.map(img => img.secure_url);
                }
            const subCategory = await Subcategory.create({...req.body,images: imageUrls});
            res.status(201).json({
                message: "Sub-Category created successfully",
                data: subCategory
            });
    } catch (error) {
            res.status(500).json({ error: error.message });
    }
}
/* Get all Category */
export const getSubCategoryController = async(req,res)=>{
    try {
        const{search , page=1 , limit = 5} = req.query;
        const skip = (page-1)*limit;
        let searchQuery = {};
        if(search && search.trim()!==""){
            searchQuery={
                $or:[
                    {name:{$regex:search , $options:'i'}},
                ]
            };
        }
        const filter = {
            //role: { $ne: "SUPER_ADMIN" },
            isDeleted: false,
            ...searchQuery
        };
        const subCategory = await Subcategory.find(filter).populate("category").skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });
        const total = await Subcategory.countDocuments(filter);     
        res.json({
            success: true,
            total,
            page:parseInt(page),
            totalPages:Math.ceil(total/limit),
            subCategory,
        });        
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
}

/* Get Single Category */

export const getSingleSubCategoryController = async(req,res)=>{
    try {
        
        // Role check 
        // if (!["SUPER_ADMIN", "SUB_ADMIN"].includes(req.user.role)) {
        //   return res.status(403).json({
        //     success: false,
        //     message: "Access denied",
        //   });
        // }
        const subCategory = await Subcategory.findById( req.params.id);
        if (!subCategory) {
            return res.status(404).json({
                success: false,
                message: "Sub-category not found",
            });
        }
        res.json({
            success: true,
            subCategory,
        });
    } catch (error) {
         res.status(500).json({
            success: false,
            message: error.message,
        });
    }
}

/* Update Category */

export const updateSubCategoryController = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Role check 
        // if (!["SUPER_ADMIN", "SUB_ADMIN"].includes(req.user.role)) {
        //   return res.status(403).json({
        //     success: false,
        //     message: "Access denied",
        //   });
        // }
        const subCategory = await Subcategory.findById(id);

        if (!subCategory) {
            return res.status(404).json({
                success: false,
                message: "Sub-Category not found",
            });
        }

        const streamUpload = (file, folder) => {
            return new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    { folder },
                    (error, result) => {
                        if (result) resolve(result);
                        else reject(error);
                    }
                );

                streamifier.createReadStream(file.buffer).pipe(stream);
            });
        };

        // Existing images user kept
        let existingImages = [];

        if (req.body.existingImages) {
            existingImages = JSON.parse(req.body.existingImages);
        }

        // Newly uploaded images
        let newImageUrls = [];

        if (req.files?.images?.length) {
            const uploadedImages = await Promise.all(
                req.files.images.map((file) =>
                    streamUpload(file, "Quick-cateres/Sub-categoryImage")
                )
            );

            newImageUrls = uploadedImages.map(
                (img) => img.secure_url
            );
        }

        // Merge kept old images + new uploads
        subCategory.images = [
            ...existingImages,
            ...newImageUrls,
        ];

        const { name, description, isActive } = req.body;

        subCategory.name = name;
        subCategory.description = description;
        subCategory.isActive = isActive;

        await subCategory.save();

        res.json({
            success: true,
            message: "Sub-Category updated",
            subCategory,
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

/*Soft Delete Category */
export const softDeleteSubCategory = async (req, res) => {
  try {
    const { id } = req.params;

    // Role check 
    // if (!["SUPER_ADMIN", "SUB_ADMIN"].includes(req.user.role)) {
    //   return res.status(403).json({
    //     success: false,
    //     message: "Access denied",
    //   });
    // }

    //  Get target Category first
    const targetSubCategory = await Subcategory.findById(id);
    if (!targetSubCategory) {
      return res.status(404).json({
        success: false,
        message: "Sub-Category not found",
      });
    }

    //  Prevent double delete
    if (targetSubCategory.isDeleted) {
      return res.status(400).json({
        success: false,
        message: "Sub-Category already deleted",
      });
    }

    //  Soft delete
    targetSubCategory.isDeleted = true;
    targetSubCategory.deletedAt = new Date();

    await targetSubCategory.save();

    res.json({
      success: true,
      message: "Sub-Category deleted successfully",
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};