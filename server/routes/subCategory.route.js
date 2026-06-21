import express from "express"
import { requireSignIn } from "../middleware/requireSignIn.js";
import { upload } from "../middleware/upload.js";
import { createSubCategoryController, getSingleSubCategoryController, getSubCategoryController, softDeleteSubCategory, updateSubCategoryController } from "../controllers/subCategory.controller.js";

const router = express.Router();


router.route("/create-sub-category").post(requireSignIn , upload.fields([{ name: "images", maxCount: 10 }]),createSubCategoryController);
router.route("/get-all-sub-category").get(requireSignIn,getSubCategoryController);
router.route("/get-single-sub-category/:id").get(requireSignIn , getSingleSubCategoryController);
router.route("/update-sub-category/:id").put(requireSignIn,upload.fields([{ name: "images", maxCount: 10 }]),updateSubCategoryController);
router.route("/delete-sub-category/:id").delete(requireSignIn,softDeleteSubCategory);

export default router;  