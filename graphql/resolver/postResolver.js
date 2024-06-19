const { isAuthenticated } = require("../../middleware/authentication");
const PostComments = require("../../models/commentsSchema");
const PostLikes = require("../../models/postLikeSchema");
const Post = require("../../models/postSchema");
const { combineResolvers } = require("graphql-resolvers");
const User = require("../../models/userSchema");
const PostCommentsLikes = require("../../models/commentsLikeSchema");

const { PubSub } = require("graphql-subscriptions");

const pubsub = new PubSub();

const EVENTS_POST_CREATE = "EVENTS_POST_CREATE";

// create post
const createPost = combineResolvers(
  isAuthenticated,
  async (_, { input }, { user }) => {
    // console.log(user);
    try {
      input.createdBy = user._id;
      // console.log(input.createdBy);
      const postData = await Post.create(input);
      // console.log("🚀 ~ postData:", postData);
      if (!postData) return "post not created";

      pubsub.publish(
        EVENTS_POST_CREATE,
        {
          newPostCreated: { keyType: "INSERT", data: postData },
        }
        // console.log("calllllllllllllllllllllllllllll subscription", postData)
      );

      return postData;
    } catch (error) {
      console.error(error);
      return {
        error: error.message,
      };
    }
  }
);
// get all post
const getAllPost = combineResolvers(
  isAuthenticated,
  async (_, { input }, { user }) => {
    // console.log("🚀 ~ user:", user);

    const { page, limit } = input;
    try {
      const combinedResult = await PostLikes.aggregate([
        {
          $group: {
            _id: "$postId",
            likeCount: { $sum: 1 },
          },
        },
        {
          $lookup: {
            from: "postcomments",
            localField: "_id",
            foreignField: "postId",
            as: "comments",
          },
        },
        {
          $addFields: {
            commentCount: { $size: "$comments" },
          },
        },
        // {
        //   $addFields: {
        //     totalLikeAndCommentCount: { $add: ["$commentCount", "$likeCount"] }, // Calculate the total comment count and like count
        //   },
        // },
        // {
        //   $sort: { totalLikeAndCommentCount: 1 },
        // },
        // {
        //   $lookup: {
        //     from: "users",
        //     localField: "userId",
        //     foreignField: "_id",
        //     as: "creator",
        //   },
        // },
        // {
        //   $addFields: {
        //     totalCommentCount: { $add: ["$commentCount", "$totalReplyCount"] }, // Calculate the total comment count
        //   },
        // },
        {
          $project: {
            _id: 1,
            likeCount: 1,
            commentCount: 1,
            // createdBy: { $arrayElemAt: ["$creator.firstName", 0] },
          },
        },
      ]);
      // console.log("🚀 ~ combinedResult:", combinedResult);

      const options = {
        page: page || 1,
        limit: limit || 34,
        lean: true,
        populate: [
          {
            path: "createdBy",
            select: "firstName",
          },
        ],
      };

      const allPostData = await Post.paginate({}, options);

      // Map through allPostData.docs and assign the appropriate likeCount
      const newData = allPostData.docs.map((data) => {
        const combinedItem = combinedResult.find(
          (item) => item._id.toString() === data._id.toString()
        );
        data.likeCount = combinedItem ? combinedItem.likeCount : 0;
        data.commentCount = combinedItem ? combinedItem.commentCount : 0;

        // data.createdBy = data.createdBy.firstName; // Assuming createdBy is already populated

        return data;
      });

      //Sort based on the sum of likeCount and commentCount
      newData.sort(
        (a, b) => b.likeCount + b.commentCount - (a.likeCount + a.commentCount)
      );

      // console.log("🚀 ~ newData:", newData);

      return {
        docs: newData,
        totalDocs: allPostData.totalDocs,
        limit: allPostData.limit,
        totalPages: allPostData.totalPages,
        page: allPostData.page,
        nextPage: allPostData.nextPage,
        prevPage: allPostData.prevPage,
      };
    } catch (error) {
      console.log("🚀 ~ error:", error);
    }
  }
);

// get single Post
const getSinglePost = combineResolvers(async (_, args, { user }) => {
  try {
    const postData = await Post.findOne({
      createdBy: user._id,
      _id: args.id,
    }).populate({ path: "createdBy", select: "firstName email" });
    // console.log("postData", postData);
    if (!postData) return "post not available";

    return postData;
  } catch (error) {
    console.error(error);
    return {
      error: error.message,
    };
  }
});

// update post
const updatePost = combineResolvers(
  isAuthenticated,
  async (_, args, { user }) => {
    console.log("🚀 ~ args:", args);

    try {
      const updatePost = await Post.findByIdAndUpdate(
        { _id: args.id },
        args.input
      );
      // Object.assign(updatePost, args.input);
      if (!updatePost) return "post not found and update";
      await updatePost.save();
      return updatePost;
    } catch (error) {
      console.error(error);
      return {
        error: error.message,
      };
    }
  }
);

// delete post
const deletePost = combineResolvers(
  isAuthenticated,
  async (_, args, { user }) => {
    console.log("🚀 ~ args:", args);
    try {
      const deleteComment = await PostComments.deleteMany({ postId: args.id });
      const deletePost = await Post.findByIdAndDelete({
        createdBy: user._id,
        _id: args.id,
      });

      if (!deleteComment) return new Error("comments not found");

      if (!deletePost) return new Error("post not found");
      return { message: "delete" };
    } catch (error) {
      console.error(error);
      return {
        error: error.message,
      };
    }
  }
);

const postResolver = {
  Query: {
    getAllPost,
    getSinglePost,
  },
  Mutation: {
    createPost,
    updatePost,
    deletePost,
  },
  Subscription: {
    newPostCreated: {
      subscribe: () => pubsub.asyncIterator(EVENTS_POST_CREATE),
    },
  },
};

module.exports = postResolver;
