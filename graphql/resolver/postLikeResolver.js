const { combineResolvers } = require("graphql-resolvers");
const PostLikes = require("../../models/postLikeSchema");
const Post = require("../../models/postSchema");
const { isAuthenticated } = require("../../middleware/authentication");

const toggleLikeOnPost = combineResolvers(
  isAuthenticated,
  async (_, args, { user }) => {
    const { postId } = args.input;
    // console.log("🚀 ~ postId:", postId);

    try {
      if (!postId) return new Error("Invalid postId");

      const post = await Post.findById(postId); // Find the post by its ID
      if (!post) return new Error("Post not found");

      let likeData;

      likeData = await PostLikes.findOne({ postId, userId: user._id });

      if (!likeData) {
        // If like data doesn't exist, create a new like
        const newLike = PostLikes({ postId, userId: user._id });

        newLike.message = "success";
        // console.log("🚀 ~ newLike:", newLike);

        await newLike.save();
        likeData = newLike;
        // Assigning newLike to likeData
      } else {
        // If isLike is false, user wants to unlike the post
        likeData = await PostLikes.findOneAndDelete({
          postId,
          userId: user._id,
        });
        likeData.message = "deleted";
      }
      // console.log("🚀 ~ likeData🚀 ~  deleted :", likeData);
      // console.log("🚀 ~ likeData:", likeData);

      return likeData;
    } catch (error) {
      console.log("Error toggling like:", error);
      throw error; // Throw the error for proper error handling
    }
  }
);

const postLikeResolver = {
  Mutation: {
    toggleLikeOnPost,
  },
};

module.exports = postLikeResolver;
