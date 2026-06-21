import cloudinary from "../config/cloudinary.js";
import Category from "../models/Category.js";
import streamifier from "streamifier"; // Converts a Buffer/String into a readable stream
import Subcategory from "../models/Subcategory.js";
import { ROLES } from "../config/role.js";

/* Create Category */
export const categoryController = async(req,res)=>{
    try {
       // Role check 
      if (!["SUPER_ADMIN", "SUB_ADMIN"].includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: "Access denied",
        });
      }
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
                            streamUpload(file, "Quick-cateres/categoryImage")
                        )
                    );
                    imageUrls = imageUrls.map(img => img.secure_url);
                }
            const category = await Category.create({...req.body,images: imageUrls});
            res.status(201).json({
                message: "Category created successfully",
                data: category
            });
    } catch (error) {
            res.status(500).json({ error: error.message });
    }
}
/* Get all Category */
export const getCategoryController = async (req, res) => {
  try {
    const { search = "", page = 1, limit = 10 } = req.query;

    const skip = (page - 1) * limit;

    const searchFilter = search
      ? {
          name: { $regex: search, $options: "i" },
        }
      : {};

    const categories = await Category.find({
      isDeleted: false,
      ...searchFilter,
    });

   

    const subCategories = await Subcategory.aggregate([
  {
    $match: {
      isDeleted: false,
    },
  },
  {
    $lookup: {
      from: "categories",
      localField: "category",
      foreignField: "_id",
      as: "category",
    },
  },
  {
    $unwind: "$category",
  },
  {
    $match: search
      ? {
          $or: [
            {
              name: {
                $regex: search,
                $options: "i",
              },
            },
            {
              "category.name": {
                $regex: search,
                $options: "i",
              },
            },
          ],
        }
      : {},
  },
]);
    const merged = [
      ...categories.map((cat) => ({
        ...cat.toObject(),
        parentCategory: null,
        type: "CATEGORY",
      })),

      ...subCategories.map((sub) => ({
        ...sub,
        parentCategory: sub.category,
        type: "SUBCATEGORY",
      })),
    ];

    const paginated = merged.slice(skip, skip + Number(limit));

    res.json({
      success: true,
      category: paginated,
      total: merged.length,
      page: Number(page),
      totalPages: Math.ceil(merged.length / limit),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
/* Get Single Category */

export const getSingleCategoryController = async(req,res)=>{
    try {
        const category = await Category.findById( req.params.id);
        if (!category) {
            return res.status(404).json({
                success: false,
                message: "category not found",
            });
        }
        res.json({
            success: true,
            category,
        });
    } catch (error) {
         res.status(500).json({
            success: false,
            message: error.message,
        });
    }
}

/* Update Category */

export const updateCategoryController = async (req, res) => {
    try {
        const { id } = req.params;

        const category = await Category.findById(id);

        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Category not found",
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
                    streamUpload(file, "Quick-cateres/categoryImage")
                )
            );

            newImageUrls = uploadedImages.map(
                (img) => img.secure_url
            );
        }

        // Merge kept old images + new uploads
        category.images = [
            ...existingImages,
            ...newImageUrls,
        ];

        const { name, description, isActive } = req.body;

        category.name = name;
        category.description = description;
        category.isActive = isActive;

        await category.save();

        res.json({
            success: true,
            message: "Category updated",
            category,
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

/*Soft Delete Category */
export const softDeleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
   // Role check 
    if (!["SUPER_ADMIN", "SUB_ADMIN"].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    //  Get target Category first
    const targetCategory = await Category.findById(id);
    if (!targetCategory) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    //  Prevent double delete
    if (targetCategory.isDeleted) {
      return res.status(400).json({
        success: false,
        message: "Category already deleted",
      });
    }

    //  Soft delete
    targetCategory.isDeleted = true;
    targetCategory.deletedAt = new Date();

    await targetCategory.save();

    res.json({
      success: true,
      message: "Category deleted successfully",
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};