import express from "express";
import { createUserController, getSingleUserController, getUserController, softDeleteUser, toggleUserStatus, updateUserController, uploadProfileImageController } from "../controllers/user.controller.js";
import { requireSignIn } from "../middleware/requireSignIn.js";
import { upload } from "../middleware/upload.js";

const router = express.Router();

router.route("/create-user").post( requireSignIn,createUserController);
router.route("/get-all-users").get(requireSignIn,getUserController);
router.route("/get-single-user/:id").get(requireSignIn,getSingleUserController);
router.route("/update-user/:id").put(requireSignIn,updateUserController);

router.route("/delete-user/:id").delete(requireSignIn,softDeleteUser);
router.route("/upload-profile").put(requireSignIn,upload.single("profileImage"),uploadProfileImageController);
router.route("/toggle-status/:id").put(requireSignIn,toggleUserStatus);


export default router;