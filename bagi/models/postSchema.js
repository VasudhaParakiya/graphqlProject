const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    publishDate: {
      type: Date,
      default: new Date(),
    },
    likes: {
      type: Number,
    },
    // likes: [
    //   {
    //     postLike: {
    //       type: mongoose.Schema.Types.ObjectId,
    //       ref: "PostLikes",
    //     },
    //   },
    // ],
    comments: {
      type: Number,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

postSchema.virtual("likeCount", {
  ref: "PostLikes",
  localField: "_id",
  foreignField: "postId",
  count: true,
});

postSchema.virtual("commentCount", {
  ref: "PostComments",
  localField: "_id",
  foreignField: "postId",
  count: true,
});

postSchema.plugin(mongoosePaginate);
const Post = new mongoose.model("Post", postSchema);

module.exports = Post;
