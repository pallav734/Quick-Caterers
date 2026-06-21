import express from "express";
import { requireSignIn } from "../middleware/requireSignIn.js";
import { createServiceController, deleteServiceController, getServiceController, updateServiceController } from "../controllers/service.controller.js";

const router = express.Router();

router.route("/create-service").post(requireSignIn,createServiceController);
router.route("/get-all-service").get(requireSignIn,getServiceController);
router.route("/update-service/:id").put(requireSignIn,updateServiceController);
router.route("/delete-service/:id").delete(requireSignIn,deleteServiceController);


export default router;