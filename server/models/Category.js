import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        images: [String],
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
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

categorySchema.index(
    { name: 1 },
    {
        unique: true,
        partialFilterExpression: {
            isDeleted: false,
        },
    }
);

export default mongoose.model("Category", categorySchema);