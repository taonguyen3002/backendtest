import express from "express";
const router = express.Router();
import AuthCtl from "../app/controllers/user.controller.js";
import Auth from "../middleware/checkToken.js";

router.post("/user/register/send-otp", AuthCtl.sendOtpRegisterIser);
router.post("/user/reset-password/send-otp", AuthCtl.sendOtpResetPassowrd);
router.post("/user/reset-password/verify-otp", AuthCtl.verifyOtp);
router.post("/user/reset-password/update", AuthCtl.verifyOtp);

router.post("/login", AuthCtl.loginUser);
router.post("/register", AuthCtl.registerUser);
router.post("/refresh", AuthCtl.refreshTokenUser);
router.post("/logout", AuthCtl.logoutUser);
router.put("/user/update/:id", Auth.verifyUser, AuthCtl.updateUser);
router.get("/user/get-all", Auth.verifyAdmin, AuthCtl.getAllUser);
router.delete("/user", Auth.verifyAdmin, AuthCtl.deletedUser);
router.get("/user", AuthCtl.viewUser);

export default router;
