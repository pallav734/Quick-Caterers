import "./config/env.js"
import express from "express";
import cors from "cors";
import connectDB from "./config/dbConnection.js";
import authRoutes from "./routes/auth.route.js";
import userRoutes from "./routes/user.route.js";
import comapnyRoutes from "./routes/company.route.js";
import serviceRoute from "./routes/service.route.js";
import dashboardRoutes from "./routes/dashboard.route.js"
import categoryRoutes from "./routes/category.route.js";
import subCategoryRoutes from "./routes/subCategory.route.js"
const app = express();
app.use(cors({
    origin:process.env.CLIENT_URL,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
}));
app.use(express.json());
app.use("/api/auth/",authRoutes);
app.use("/api/user",userRoutes);
app.use("/api/company",comapnyRoutes);
app.use("/api/service",serviceRoute);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/category",categoryRoutes);
app.use("/api/sub-category" , subCategoryRoutes);
connectDB();

app.get("/" , (req,res)=>{
    console.log("Quick caterers API is running");
    
})



export default app;