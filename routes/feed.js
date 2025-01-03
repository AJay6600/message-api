const express = require("express");
const { body } = require("express-validator");
const {
  getPosts,
  createPost,
  getPost,
  updatePost,
  deletePost,
} = require("../controllers/feed");

/** express router */
const router = express.Router();

/** get all the post */
router.get("/posts", getPosts);

/** create new post */
router.post(
  "/create",
  /** server side validation for input data */
  [
    body("title").trim().isLength({ min: 5 }),
    body("content").trim().isLength({ min: 5 }),
  ],
  createPost
);

/** get single post */
router.get("/post/:postId", getPost);

/** update the post */
router.put(
  "/post/:postId" /** server side validation for input data */,
  [
    body("title").trim().isLength({ min: 5 }),
    body("content").trim().isLength({ min: 5 }),
  ],
  updatePost
);

/** delete the post */
router.delete("/post/:postId", deletePost);

module.exports = router;
