const User = require("../models/user");
const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

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

const login = (req, res, next) => {
  /** server side validation error */
  const error = validationResult(req);

  if (!error.isEmpty()) {
    const err = new Error("Validation failed");
    err.statusCode = 422;
    err.data = error.array();
    throw err;
  }

  const email = req.body.email;

  const password = req.body.password;

  let loadedUser;

  User.findOne({ email: email })
    .then((user) => {
      if (!user) {
        const error = new Error("A user with email could not found");
        error.statusCode = 401;
        throw error;
      }

      loadedUser = user;

      return bcrypt.compare(password, user.password);
    })
    .then((isEqual) => {
      if (!isEqual) {
        const error = new Error("Wrong password");
        error.statusCode = 401;
        throw error;
      }

      const token = jwt.sign(
        {
          email: loadedUser.email,
          id: loadedUser._id.toString(),
        },
        "wesrcfgvbhnomk,pl[.;,[lmonibhuvgyfctdxrzse",
        { expiresIn: "1h" }
      );

      res.status(200).json({ token: token, id: loadedUser._id.toString() });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

module.exports = { signup, login };
