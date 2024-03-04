const { combineResolvers } = require("graphql-resolvers");
const { isAuthenticated } = require("../../middleware/authentication");
const Post = require("../../models/postSchema");
const PostComments = require("../../models/commentsSchema");
const PostCommentsLikes = require("../../models/commentsLikeSchema");
const { comment } = require("postcss");

const addComment = combineResolvers(
  isAuthenticated,
  async (_, args, { user }) => {
    try {
      const { postId, description, parentCommentId } = args.input;

      // Check if the post exists
      const post = await Post.findById(postId);
      if (!post) {
        throw new Error("Post not found");
      }

      // Create the comment
      const newComment = new PostComments({
        postId,
        description,
        userId: user._id,
        parentCommentId,
      });

      // Save the comment
      newComment.message = "success";
      const savedComment = await newComment.save();

      // Increment the comment count in the associated post
      post.commentCount += 1;
      await post.save();

      return savedComment;
    } catch (error) {
      throw new Error(error.message);
    }
  }
);

const toggleLikeOnPostComment = combineResolvers(
  isAuthenticated,
  async (_, args, { user }) => {
    // console.log("🚀 ~ args:", args);
    const { postId, commentId } = args.input;

    try {
      if (!postId) return new Error("Invalid postId");
      if (!commentId) return new Error("Invalid commentId");

      let commentLikeData;

      // If isLike is true, user wants to like the post
      commentLikeData = await PostCommentsLikes.findOne({
        postId,
        commentId,
        userId: user._id,
      });
      // .populate({ path: "postId", select: "title" })
      // .populate({ path: "userId", select: "firstName" });
      if (!commentLikeData) {
        // If like data doesn't exist, create a new like
        const newLike = await PostCommentsLikes({
          postId,
          commentId,
          userId: user._id,
        });
        newLike.message = "success";
        await newLike.save();
        commentLikeData = newLike; // Assigning newLike to likeData
      } else {
        // If isLike is false, user wants to unlike the post
        commentLikeData = await PostCommentsLikes.findOneAndDelete({
          postId,
          commentId,
          userId: user._id,
        });
        commentLikeData.message = "deleted";
      }
      console.log("🚀 ~ commentLikeData:", commentLikeData);

      return commentLikeData;
    } catch (error) {
      console.log("🚀 ~ error:", error);
    }
  }
);

const getAllCommentsOnPost = combineResolvers(async (_, args, { user }) => {
  const { postId } = args;
  try {
    const commentData = await PostComments.find({ postId }).populate(
      "likeCount"
    );
    // console.log("🚀 ~ getAllCommentsOnPost ~ commentData:", commentData);

    const totalCount = commentData.reduce(
      (sum, comment) => sum + comment.likeCount,
      0
    );
    // console.log("🚀 ~ getAllCommentsOnPost ~ totalCount:", totalCount);

    if (!commentData) return new Error("No comment found");

    return { totalLike: totalCount, CommentResult: commentData };
  } catch (error) {
    console.log("🚀 ~ error:", error);
    throw error; // Throw error to handle it at a higher level
  }
});

const getAllReplyComment = async (_, args, { user }) => {
  const { commentId } = args.input;
  try {
    const commentData = await PostComments.find({
      $or: [{ _id: commentId }, { parentCommentId: commentId }],
    }).populate("likeCount");
    // console.log("🚀 ~ getAllReplyComment ~ commentData:", commentData);

    const totalCount = commentData.reduce(
      (sum, comment) => sum + comment.likeCount,
      0
    );

    return { totalLike: totalCount, CommentResult: commentData };
  } catch (error) {
    console.log("🚀 ~ getAllReplyComment ~ error:", error);
  }
};

const updateRootComment = combineResolvers(
  isAuthenticated,
  async (_, args, { user }) => {
    const { reply, commentId } = args.input;
    try {
      if (!commentId) return new Error("invalid commentId");
      // if (!replyId) return new Error("invalid replyId");

      const updatedComment = await PostComments.findByIdAndUpdate(
        { _id: commentId },
        {
          $set: {
            description: reply,
          },
        },
        { new: true }
      );
      console.log("🚀 ~ updatedComment:", updatedComment);
      return updatedComment;
    } catch (error) {
      console.log("🚀 updateSubComment ~ error:", error);
    }
  }
);

const deleteReplies = combineResolvers(
  isAuthenticated,
  async (_, args, { user }) => {
    // console.log("🚀 ~ args:", args)
    const { commentId } = args.input;
    try {
      if (!commentId) return new Error("invalid commentId");

      if (commentId) {
        const newComment = await PostComments.deleteMany({
          $or: [{ _id: commentId }, { parentCommentId: commentId }],
        });
        newComment.message = "deleted";
        return newComment;
      }
    } catch (error) {
      console.log("🚀 deleteReplies ~ error:", error);
    }
  }
);

const postCommentResolver = {
  Query: {
    getAllCommentsOnPost,
    getAllReplyComment,
  },

  Mutation: {
    addComment,
    toggleLikeOnPostComment,
    deleteReplies,
    updateRootComment,
  },
};

module.exports = postCommentResolver;
