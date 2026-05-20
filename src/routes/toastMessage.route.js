// filepath: /D:/workplace/taxiwebproject/backend/src/routes/toastMessage.route.js
import express from "express";
import {
  createToastMessage,
  getToastMessage,
  updateToastMessage,
  deleteToastMessage,
} from "../app/controllers/toastMessage.controller.js";
import authUser from "../middleware/checkToken.js";
const router = express.Router();

router.post("/toast-setting/", authUser.verifyAdmin, createToastMessage);
router.get("/toast-setting/", getToastMessage);
router.put("/toast-setting/:id", authUser.verifyAdmin, updateToastMessage);
router.delete("/toast-setting/:id", authUser.verifyAdmin, deleteToastMessage);
export default router;
