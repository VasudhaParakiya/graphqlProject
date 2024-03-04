const mongoose = require("mongoose");

const postCommentsLikeSchema = new mongoose.Schema(
  {
    postId: { type: mongoose.Schema.Types.ObjectId, ref: "Post" },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    commentId: { type: mongoose.Schema.Types.ObjectId, ref: "PostComments" },
  },
  {
    timestamps: true,
  }
);

const PostCommentsLikes = new mongoose.model(
  "PostCommentsLikes",
  postCommentsLikeSchema
);
module.exports = PostCommentsLikes;
