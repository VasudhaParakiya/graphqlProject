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

    parentCommentId: {
      type: mongoose.Schema.Types.ObjectId, // Assuming parentCommentId is ObjectId
      ref: "PostComments",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

postCommentSchema.virtual("likeCount", {
  ref: "PostCommentsLikes",
  localField: "_id",
  foreignField: "commentId",
  justOne: false,
  count: true,
});

const PostComments = new mongoose.model("PostComments", postCommentSchema);
module.exports = PostComments;
