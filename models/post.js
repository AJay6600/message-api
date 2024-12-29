const mongoose = require("mongoose");

/** mongoDB schema object */
const Schema = mongoose.Schema;

/** schema definition for post document */
const postSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    imageUrl: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    creator: {
      type: Object,
      required: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Post", postSchema);
