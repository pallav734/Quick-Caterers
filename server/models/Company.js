import mongoose from "mongoose";
import validator from "validator";

const companySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    slug: {
        type: String,
        required: true,
        lowercase: true,
        unique: true
    },
    description: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error("Please enter a valid Email ID");
            }
        }
    },
    phone: {
        type: String,
        required: true
    },
    website: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    state: {
        type: String,
        required: true
    },
    country: {
        type: String,
        required: true
    },
    pincode: {
        type: String,
        required: true
    },
    location: {
        lat: Number,
        lng: Number
    },
    subAdminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    services: [{
        type: String,
        required: true
    }],
    capacity: Number,
    logo: String,
    images: [String],
    documents: [String],
    isActive: {
        type: Boolean,
        default: true
    },
    isDeleted: {
        type: Boolean,
        default: false,
    },
    categories: [
        {
            category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
            required: true,
            },
            subCategories: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Subcategory",
            }
            ]
        }
    ],
    deletedAt: {
        type: Date,
        default: null
    },
    status: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending"
    },
    rejectionReason: {
        type: String,
        default: null
    }
}, { timestamps: true });

export default mongoose.model("company", companySchema);