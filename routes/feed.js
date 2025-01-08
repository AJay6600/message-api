const express = require("express");
const { body } = require("express-validator");
const {
  getPosts,
  createPost,
  getPost,
  updatePost,
  deletePost,
} = require("../controllers/feed");
const isAuth = require("../middleware/is_auth");

/** express router */
const router = express.Router();

/** get all the post */
router.get("/posts", isAuth, getPosts);

/** create new post */
router.post(
  "/create",
  isAuth,
  /** server side validation for input data */
  [
    body("title").trim().isLength({ min: 5 }),
    body("content").trim().isLength({ min: 5 }),
  ],
  createPost
);

/** get single post */
router.get("/post/:postId", isAuth, getPost);

/** update the post */
router.put(
  "/post/:postId" /** server side validation for input data */,
  isAuth,
  [
    body("title").trim().isLength({ min: 5 }),
    body("content").trim().isLength({ min: 5 }),
  ],
  updatePost
);

/** delete the post */
router.delete("/post/:postId", isAuth, deletePost);

module.exports = router;
