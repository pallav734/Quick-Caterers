import mongoose from "mongoose"

const ServiceSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    description: {
        type: String,
        required: true
    },
    isActive: {
        type: Boolean,
        default: true,
    },
},{
    timestamps:true
});

export default mongoose.model("Service" , ServiceSchema);