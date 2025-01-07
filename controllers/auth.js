const User = require("../models/user");
const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");

const signup = (req, res, next) => {
  /** server side validation error */
  const error = validationResult(req);

  if (!error.isEmpty()) {
    const err = new Error("Validation failed");
    err.statusCode = 422;
    err.data = error.array();
    throw err;
  }

  const email = req.body.email;

  const name = req.body.name;

  const password = req.body.password;

  const status = req.status;

  /** hash the users password */
  bcrypt
    .hash(password, 12)
    .then((hashPassword) => {
      const user = new User({
        email: email,
        password: hashPassword,
        name: name,
      });
      return user.save();
    })
    .then((result) => {
      res.status(201).json({ message: "User created", userId: result._id });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

module.exports = { signup };
