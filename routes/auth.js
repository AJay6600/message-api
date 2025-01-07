const express = require("express");
const { body } = require("express-validator");
const User = require("../models/user");
const { signup, login } = require("../controllers/auth");

const router = express.Router();

router.put(
  "/signup",
  [
    body("email")
      .isEmail()
      .withMessage("Please enter valid email")
      .custom((value, { req }) => {
        return User.findOne({ email: value }).then((userDoc) => {
          if (userDoc) {
            return Promise.reject("E-mail address already exits");
          }
        });
      })
      .normalizeEmail(),
    body("password").trim().isLength({ min: 5 }),
    body("name").trim().not().isEmpty(),
  ],
  signup
);

router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Please enter valid email"),
    body("password").trim().not().isEmpty(),
  ],
  login
);

module.exports = router;
