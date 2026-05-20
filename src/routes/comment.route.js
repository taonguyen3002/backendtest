import express from "express";
const router = express.Router();
import Auth from "../middleware/checkToken.js";
import CommentController from "../app/controllers/comment.controller.js";

router.get("/comment/:postid", CommentController.getComment);
router.post(
  "/comment/:postid",
  Auth.verifyUser,
  CommentController.createComment
);
router.put("/comment/:id", Auth.verifyUser, CommentController.changeComment);
router.delete("/comment/:id", Auth.verifyUser, CommentController.deleteComment);
export default router;
