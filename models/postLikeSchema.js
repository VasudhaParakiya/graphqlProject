const mongoose = require("mongoose");

const postLikeSchema = new mongoose.Schema(
  {
    postId: { type: mongoose.Schema.Types.ObjectId, ref: "Post" },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  {
    timestamps: true,
  }
);

const PostLikes = new mongoose.model("PostLikes", postLikeSchema);
module.exports = PostLikes;
