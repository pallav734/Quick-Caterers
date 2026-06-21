import mongoose from "mongoose";

const connectDB = async ()=>{
    try {
        await mongoose.connect(process.env.MONGO_URL)
        console.log("Db is connected");
    } catch (error) {
        console.log("MongoDB Error", error);
        process.exit(1);
    }
}

export default connectDB;