import express from "express";
import { createCompanyController, getCompanyController, getSingleCompanyController, getSubCategoriesByCategory, softDeleteCompany, updateCompanyController, updateCompanyStatusController } from "../controllers/company.controller.js";
import { upload } from "../middleware/upload.js";
import { requireSignIn } from "../middleware/requireSignIn.js";

const router = express.Router();

router.route("/create-company").post(requireSignIn,upload.fields([
    { name: "logo", maxCount: 1 },
    { name: "images", maxCount: 5 },
    { name: "documents", maxCount: 5 }
]) , createCompanyController);
router.route("/get-all-company").get(requireSignIn,getCompanyController);
router.route("/get-single-company/:id").get(requireSignIn , getSingleCompanyController);
router.route("/update-company/:id").put(
    requireSignIn,
    upload.fields([
        { name: "logo", maxCount: 1 },
        { name: "images", maxCount: 5 },
        { name: "documents", maxCount: 5 }
    ]),
    updateCompanyController
);
router.route("/delete-company/:id").delete(requireSignIn,softDeleteCompany);
router.route("/update-company-status/:id/status").put(requireSignIn,updateCompanyStatusController);
router.route("/by-category/:categoryId").get(requireSignIn,getSubCategoriesByCategory);

export default router;