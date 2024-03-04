const mongoose = require("mongoose");

const postCommentSchema = new mongoose.Schema(
  {
    description: {
      type: String,
      required: true,
      trim: true,
    },
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    likeCount: {
      type: Number,
      default: 0,
    },
    parentCommentId: {
      type: mongoose.Schema.Types.ObjectId, // Assuming parentCommentId is ObjectId
      ref: "PostComments",
    },
    totalLikes: {
      type: Number,
      default: 0,
    },
    // likeBy: [
    //   {
    //     userId: {
    //       type: mongoose.Schema.Types.ObjectId,
    //       ref: "User",
    //     },
    //     CommentId:{
    //       type: mongoose.Schema.Types.ObjectId, // Assuming parentCommentId is ObjectId
    //       ref: "PostComments",
    //     }
    //   },
    // ],
  },
  {
    timestamps: true,
  }
);

const PostComments = new mongoose.model("PostComments", postCommentSchema);
module.exports = PostComments;
// likeBy: [
//   {
//     userId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//     },
//   },
// ],
