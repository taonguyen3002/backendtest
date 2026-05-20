import express from "express";
const router = express.Router();
import Auth from "../middleware/checkToken.js";
import PostCtl from "../app/controllers/post.controller.js";

// [GET] /api/post/page (phân trang hoặc lấy tất cả, xử lý trong controller)
router.get("/posts/get-all/page", PostCtl.getPostsWithPagination); // get posts with pagination (xử lý limit, page trong controller)
// [GET] /api/posts
router.post("/posts/filter/tags", PostCtl.filterPost); // filter posts
router.get("/posts/find/query", PostCtl.getPostByQuery); // get posts by query and limit
router.get("/posts/get-all", PostCtl.getAllPostAndLimit); // get all posts and filter by limit
router.get("/posts/by-id/:id", PostCtl.getPostById); // get post by id
//[GET] /api/posts/sitemap
router.get("/posts/sitemap", PostCtl.getPostRenderSiteMap);
// [POST] /api/posts
router.post("/posts", Auth.verifyAdmin, PostCtl.createPosts); //crete new post
router.put(
  "/posts/put/find-and-replace",

  PostCtl.findAndReplaceData
);
// [PUT] /api/posts/:id
router.put("/posts/:id", Auth.verifyAdmin, PostCtl.updatePost); // update post
// [DELETE] /api/posts/:id
router.delete("/posts/:id", Auth.verifyAdmin, PostCtl.deletePost); // delete post
// [GET] /api/posts/:slug
router.get("/posts/:slug(*)", PostCtl.getPostBySlug); // get post by slug
//[PATCH]
router.patch(
  "/posts/patch/update-like",
  Auth.verifyUser,
  PostCtl.patchLikePostById
);

export default router;
