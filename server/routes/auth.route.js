import express from "express"
import { authMe, forgotPasswordController, loginController, registerSuperAdmmin, resetPasswordController } from "../controllers/auth.js";
import { requireSignIn } from "../middleware/requireSignIn.js";
const router = express.Router();



router.route("/register-super-admin").post(registerSuperAdmmin);
router.route("/login").post(loginController);
router.route("/me").get(requireSignIn ,authMe );
router.route("/forgot-password").post(forgotPasswordController);
router.route("/reset-password/:token").post(resetPasswordController);

export default router