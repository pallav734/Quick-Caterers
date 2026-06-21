import cloudinary from "../config/cloudinary.js";
import { ROLES } from "../config/role.js";
import Company from "../models/Company.js";
import streamifier from "streamifier"; // Converts a Buffer/String into a readable stream
import { hashPassword } from "../utils/hasPassword.js";
import Users from "../models/Users.js";
import transporter from "../config/mail.js";
import crypto from "crypto";
import Subcategory from "../models/Subcategory.js";


export const createCompanyController = async(req,res)=>{
    try {
        //only admin and sub-admin allows
        if(![ROLES.SUPER_ADMIN, ROLES.SUB_ADMIN].includes(req.user.role)){
            return res.status(403).json({
                success: false,
                message: "You are not allowed to create comapny",
            });
        }
        const {name,description, email,phone,website,address, city, state,country,pincode,services } = req.body;
        if (
            !name || !description || !email || !phone  ||
            !website || !address || !city || !state || !country ||
            !pincode || !services
        ) {
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
        // Upload LOGO (single)
        let logoUrl = null;
        if (req.files?.logo) {
            const result = await streamUpload(
                req.files.logo[0],
                "Quick-cateres/logo"
            );
            logoUrl = result.secure_url;
        }

        // Upload IMAGES (multiple)
        let imageUrls = [];
        if (req.files?.images) {
            imageUrls = await Promise.all(
                req.files.images.map(file =>
                    streamUpload(file, "Quick-cateres/images")
                )
            );
            imageUrls = imageUrls.map(img => img.secure_url);
        }

        // Upload DOCUMENTS (multiple)
        let documentUrls = [];
        if (req.files?.documents) {
            documentUrls = await Promise.all(
                req.files.documents.map(file =>
                    streamUpload(file, "Quick-cateres/documents")
                )
            );
            documentUrls = documentUrls.map(doc => doc.secure_url);
        }
        //Genrate Slug here
         const slug = name.toLowerCase().replace(/\s+/g, "-");
         const loginEmail = email.replace("@", "admin@");

        const existingUser = await Users.findOne({ email: loginEmail });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                errors: {
                    email: "User with this email already exists"
                }
            });
        }
        let parsedCategories = [];

        if (req.body.categories) {
            parsedCategories = JSON.parse(req.body.categories);
        }
         //Create Company
         const company = await Company.create({
            ...req.body,
            categories: parsedCategories,
            logo: logoUrl,
            images: imageUrls,
            documents: documentUrls,
            slug,
            subAdminId: req.user._id
        });
        
        // Create company admin user
        const password = crypto.randomBytes(6).toString("hex");
        const companyUser = await Users.create({
            name:company.name,
            email: loginEmail,
            password:await hashPassword(password),
            mobile: company.phone,
            address:company.address,
            role: "COMPANY_ADMIN",
            companyId: company._id,

        });
        await transporter.sendMail({
            from: process.env.MAIL_USER,
            // to: process.env.MAIL_USER,
            to:companyUser.email,
            subject:"Login Credentials",
            html:`
            <h2>Welcome to Quick Caterers</h2>
            <p>Your account has been created.</p>
            <p><b>Email:</b> ${companyUser.email}</p>
            <p><b>Password:</b> ${password}</p>
            <p>Please login and change your password.</p>`
        })
        res.status(201).json({
            message: "Company created successfully",
            data: company
         });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

/* Get all Company */

export const getCompanyController = async(req,res)=>{
    try {
        const{search , page=1 , limit = 5 , status} = req.query;
        const skip = (page-1)*limit;
        let searchQuery = {};
        if(search && search.trim()!==""){
            searchQuery={
                $or:[
                    {name:{$regex:search , $options:'i'}},
                    {email:{$regex:search , $options:'i'}},
                    {mobile:{$regex:search , $options:'i'}},
                ]
            };
        }
        const filter = {
            role: { $ne: "SUPER_ADMIN" },
            isDeleted: false,
            ...(status ? { status } : {}),
            ...searchQuery
        };
        const company = await Company.find(filter).select("name email description phone address website city services capacity status documents rejectionReason createdAt")
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });
        const total = await Company.countDocuments(filter);
        res.json({
            success: true,
            total,
            page:parseInt(page),
            totalPages:Math.ceil(total/limit),
            company,
        });  
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
}

/* Get Single Company */

export const getSingleCompanyController = async (req, res) => {
  try {
    const company = await Company.findById(req.params.id)
      .populate("services")
      .populate({
        path: "categories.category",
        model: "Category",
      })
      .populate({
        path: "categories.subCategories",
        model: "SubCategory",
      });

    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company not found",
      });
    }

    res.json({
      success: true,
      company,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* Update Company */
export const updateCompanyController = async (req, res) => {
  try {
    const { id } = req.params;

    const company = await Company.findById(id);

    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company not found",
      });
    }

    if (!["SUPER_ADMIN", "SUB_ADMIN"].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
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

    // LOGO
    if (req.files?.logo) {
      const result = await streamUpload(
        req.files.logo[0],
        "Quick-cateres/logo"
      );

      company.logo = result.secure_url;
    }

    // IMAGES
    if (req.files?.images) {
      const uploadedImages = await Promise.all(
        req.files.images.map((file) =>
          streamUpload(file, "Quick-cateres/images")
        )
      );

      company.images = uploadedImages.map(
        (img) => img.secure_url
      );
    }

    // DOCUMENTS
    if (req.files?.documents) {
      const uploadedDocs = await Promise.all(
        req.files.documents.map((file) =>
          streamUpload(file, "Quick-cateres/documents")
        )
      );

      company.documents = uploadedDocs.map(
        (doc) => doc.secure_url
      );
    }

    const {
      name,
      description,
      email,
      phone,
      website,
      address,
      city,
      state,
      country,
      pincode,
      services,
      categories,
    } = req.body;

    // ✅ Parse category/subcategory groups
    if (categories) {
      const parsedCategories = JSON.parse(categories);

      company.categories = parsedCategories.map(
        (item) => item.category
      );

      company.subCategories = parsedCategories.flatMap(
        (item) => item.subCategories || []
      );
    }

    // Update normal fields
    Object.assign(company, {
      name,
      description,
      email,
      phone,
      website,
      address,
      city,
      state,
      country,
      pincode,
      services,
    });

    // Update slug if name changes
    if (name) {
      company.slug = name
        .toLowerCase()
        .replace(/\s+/g, "-");
    }

    await company.save();

    res.json({
      success: true,
      message: "Company updated",
      company,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
/*Delete Comapany */
// export const deleteCompanyController = async(req,res)=>{
//     try {
//         let { id } = req.params;
//         const targetUser = await Company.findById(id);
//         if(!targetUser){
//             return res.status(404).json({ success: false, message: "Company not found" });
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
//          //SOFT DELETE (mark inactive)
//         targetUser.isActive = false;
//         await targetUser.save();

//         //Deactivate all users of this company

//         await Users.updateMany(
//             { companyId: id },   
//             { $set: { isActive: false } }
//         );
//         res.json({ success: true, message: "Company deactivated successfully" });
//     } catch (error) {
//         res.status(500).json({ success: false, message: error.message });
//     }
// };

/*Soft Delete Company */
export const softDeleteCompany = async (req, res) => {
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
    const targetUser = await Company.findById(id);
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: "Company not found",
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
        message: "Company already deleted",
      });
    }

    //  Soft delete
    targetUser.isDeleted = true;
    targetUser.deletedAt = new Date();

    await targetUser.save();

    res.json({
      success: true,
      message: "Company deleted successfully",
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/*Update company status */

export const updateCompanyStatusController = async(req,res)=>{
    try {
        console.log(req.body);
        const { status , rejectionReason  } = req.body;
        if (!["approved", "pending", "rejected"].includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid status"
            });
        }
        const company = await Company.findById(req.params.id);
        if (!company) {
            return res.status(404).json({ success: false, message: "Not found" });
        }
        company.status = status;
        if (status === "rejected") {
            company.rejectionReason = rejectionReason || "No reason provided";
            await transporter.sendMail({
            from: `"Quick Caterers" <${process.env.MAIL_USER}>`,
            // to: process.env.MAIL_USER,
            to:company.email,
            subject:"Company Rejection Notice",
            html:`
            <h3>Your company has been rejected</h3>
            <p><strong>Reason:</strong> ${rejectionReason}</p>
            <p>Please fix the issue and reapply.</p>`
        })
        } else {
            company.rejectionReason = null; // clear if approved
            await transporter.sendMail({
            from: `"Quick Caterers" <${process.env.MAIL_USER}>`,
            // to: process.env.MAIL_USER,
            to:company.email,
            subject:"Company Approved Notice",
            html:`
            <h3>Your company has been approved</h3>
            <p>Now you can use your account.</p>`
        })
        }
        await company.save();
        res.json({
            success: true,
            message: "Status updated",
            company
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

/*Get SubCategories By Category */

export const getSubCategoriesByCategory = async(req,res)=>{
    try {
        const { categoryId } = req.params;
        const subCategories = await Subcategory.find({
            category:categoryId,
            isDeleted:false
        });
        res.json({
        success: true,
        subCategories,
      });
    } catch (error) {
        res.status(500).json({
        message: error.message,
      });
    }
}