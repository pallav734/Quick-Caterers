import mongoose from "mongoose";

const subCategory = new mongoose.Schema({
    name:{
        required:true,
        type:String,
    },
    description: {
        type: String,
        required: true
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        required: true,
    },
    images: [String],
    isActive: {
        type: Boolean,
        default: true
    },
    isDeleted: {
        type: Boolean,
        default: false,
    },
    deletedAt: {
        type: Date,
        default: null
    },
},{
    timestamps:true
});

subCategory.index(
    { name: 1 },
    {
        unique: true,
        partialFilterExpression: {
            isDeleted: false,
        },
    }
);
export default mongoose.model("SubCategory" , subCategory);