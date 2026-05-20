import express from "express";
const router = express.Router();
import dashboardController from "../app/controllers/dashboard.controller.js";
import Auth from "../middleware/checkToken.js";

router.get("/dashboard/stats", Auth.verifyAdmin, dashboardController.getStats);

export default router;
