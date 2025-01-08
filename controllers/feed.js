const { validationResult } = require("express-validator");
const Post = require("../models/post");
const User = require("../models/user");
const fs = require("fs");
const path = require("path");

/** this function return all the posts in db */
const getPosts = (req, res, next) => {
  const currentPage = req.query.page || 1;
  const perPage = 2;
  let totalItems;
  Post.find()
    .countDocuments()
    .then((count) => {
      totalItems = count;
      return Post.find()
        .skip((currentPage - 1) * perPage)
        .limit(perPage);
    })
    .then((results) => {
      res.status(200).json({
        message: "posts fetched successfully",
        posts: results,
        totalItems: totalItems,
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

/** this  function will create post */
const createPost = (req, res, next) => {
  /** validation error */
  const errors = validationResult(req);

  /** if there is any validation error the send teh response */
  if (!errors.isEmpty()) {
    const error = new Error("Validation failed, entered data is incorrect.");
    error.statusCode = 422;
    throw error;
  }

  if (!req.find) {
    const error = new Error("No image provided.");
    error.statusCode = 422;
    throw error;
  }

  const title = req.body.title;

  const content = req.body.content;

  const imageUrl = req.file.path;

  let creator;

  /** create the post */
  const post = new Post({
    title: title,
    content: content,
    imageUrl: imageUrl,
    creator: req.userId,
  });

  /** save the post */
  post
    .save()
    .then((result) => {
      return User.findById(req.userId);
    })
    .then((user) => {
      user.posts.push(post);
      creator = user;
      return user.save();
    })
    .then((result) => {
      res.status(201).json({
        message: "Post created successfully!",
        post: post,
        creator: { _id: creator._id, name: creator.name },
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

/** this function return single post */
const getPost = (req, res, next) => {
  /** post id  */
  const postId = req.params.postId;

  /** find the post from db by id */
  Post.findById(postId)
    .then((result) => {
      /** if post is not found  */
      if (!result) {
        const error = new Error("Could not fine post");
        error.statusCode = 404;
        throw error;
      }

      res.status(200).json({ message: "post fetched", post: result });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

/** this function will update the existing post */
const updatePost = (req, res, next) => {
  /** validation error */
  const errors = validationResult(req);

  /** if there is any validation error the send teh response */
  if (!errors.isEmpty()) {
    const error = new Error("Validation failed, entered data is incorrect.");
    error.statusCode = 422;
    throw error;
  }

  const postId = req.params.postId;

  const title = req.body.title;

  const content = req.body.content;

  let imageUrl = req.body.imageUrl;

  /** image file is not provided */
  if (req.file) {
    imageUrl = req.file.path;
  }

  if (!imageUrl) {
    const error = new Error("No file picked");
    error.statusCode = 422;
    throw error;
  }

  Post.findById(postId)
    .then((result) => {
      /** if post is not found  */
      if (!result) {
        const error = new Error("Could not fine post");
        error.statusCode = 404;
        throw error;
      }

      if (result.creator.toString() !== req.userId) {
        const error = new Error("Not authorized!");
        error.statusCode = 403;
        throw error;
      }

      /** if updated image is not same as existing then delete the image from db */
      if (imageUrl !== result.imageUrl) {
        clearImage(result.imageUrl);
      }

      result.title = title;
      result.content = content;
      result.imageUrl = imageUrl;

      return result.save();
    })
    .then((updateResult) => {
      res.status(200).json({ message: "post updated", post: updateResult });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

/** this function will clear the image from db */
const clearImage = (filePath) => {
  filePath = path.join(__dirname, "..", filePath);
  fs.unlink(filePath, (err) => console.log(err));
};

/** this function will delete the post */

const deletePost = (req, res, next) => {
  const postId = req.params.postId;

  Post.findById(postId)
    .then((post) => {
      if (!post) {
        const error = new Error("Could not fine post");
        error.statusCode = 404;
        throw error;
      }
      console.log("Cretor", post.creator.toString());
      console.log("request id", req.userId);

      if (post.creator.toString() !== req.userId) {
        const error = new Error("Not authorized!");
        error.statusCode = 403;
        throw error;
      }

      clearImage(post.imageUrl);
      return Post.findByIdAndDelete(postId);
    })
    .then((result) => {
      return User.findById(req.userId);
    })
    .then((user) => {
      user.posts.pull(postId);
      return user.save();
    })
    .then((result) => {
      res.status(200).json({ message: "post deleted" });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

module.exports = { getPosts, createPost, getPost, updatePost, deletePost };
