import express from "express"
import { requireSignIn } from "../middleware/requireSignIn.js";
import { upload } from "../middleware/upload.js";
import { categoryController, getCategoryController, getSingleCategoryController, softDeleteCategory, updateCategoryController } from "../controllers/category.controller.js";
const router = express.Router();


router.route("/create-category").post(requireSignIn , upload.fields([{ name: "images", maxCount: 10 }]),categoryController);
router.route("/get-all-category").get(requireSignIn,getCategoryController);
router.route("/get-single-category/:id").get(requireSignIn , getSingleCategoryController);
router.route("/update-category/:id").put(requireSignIn,upload.fields([{ name: "images", maxCount: 10 }]),updateCategoryController);
router.route("/delete-category/:id").delete(requireSignIn,softDeleteCategory);

export default router;  