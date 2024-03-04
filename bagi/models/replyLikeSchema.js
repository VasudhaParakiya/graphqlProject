const mongoose = require("mongoose");

const replyLikeSchema = new mongoose.Schema(
  {
    // postId: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: "Post",
    // },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    likeCount: {
      type: Number,
    },
    rootCommentId: {
      type: mongoose.Schema.Types.ObjectId, // Assuming parentCommentId is ObjectId
      ref: "PostComments",
    },
    replyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PostComments",
    },
  },
  {
    timestamps: true,
  }
);

const replyComments = new mongoose.model("replyLikes", replyLikeSchema);
module.exports = replyComments;
