import express from "express"
import { requireSignIn } from "../middleware/requireSignIn.js";
import { getDashboardStateController } from "../controllers/dashboard.controller.js";

const router = express.Router();

router.route("/state").get(requireSignIn,getDashboardStateController);

export default router;
