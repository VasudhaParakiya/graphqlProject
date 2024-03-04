const { isAuthenticated } = require("../../middleware/authentication");
const PostComments = require("../../models/commentsSchema");
const PostLikes = require("../../models/postLikeSchema");
const Post = require("../../models/postSchema");
const { combineResolvers } = require("graphql-resolvers");

// create post
const createPost = combineResolvers(
  isAuthenticated,
  async (_, { input }, { user }) => {
    console.log(user);
    try {
      input.createdBy = user._id;
      console.log(input.createdBy);
      const postData = await Post.create(input);
      if (!postData) return "post not created";
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
      // const newPosts = await Post.find({}).populate("likeCount");
      // console.log("🚀 ~ newPosts:", newPosts);

      const options = {
        page: page || 1,
        limit: limit || 34,
        sort: { title: 1 },
        lean: true,
        populate: ["likeCount", "commentCount"],

        // select: 'name email',
        // collation: { locale: 'en' }
      };

      const allPostData = await Post.paginate({}, options);
      // console.log("🚀 ~ allPostData:", allPostData);

      const posts = await Post.populate(allPostData.docs, {
        path: "createdBy",
        select: "firstName",
      });
      // console.log("🚀 ~ posts:", posts);

      const postData = await Promise.all(
        posts.map(async (post, i) => {
          // console.log("🚀 ~ posts.map ~ post:", post);
          //     // post like count
          //     // const likeData = await PostLikes.find({ postId: post._id });
          //     // const likeCount = likeData.length;
          //     // // Adding the count property to the post object
          //     // post.likes = likeCount;
          //post comment count
          // const commentData = await PostComments.find({ postId: post._id });
          // // console.log("🚀 ~ posts.map ~ commentData:", commentData);
          // const commentCount = commentData.length;
          // // Adding the count property to the post object
          // post.comments = commentCount;
          // post.comments = post.commentCount;
          // const commentCount = post.commentCount || 0;
          // const likeCount = post.likeCount;
          // console.log("🚀 ~ posts.map ~ commentCount:", post.commentCount)

          post.comments = post.commentCount;

          //Check if likeCount is populated
          if (post.likeCount) {
            post.likes = post.likeCount;
          } else {
            post.likes = 0; // or any default value you prefer
          }

          return post; // Return the modified post
        })
      );

      // allPostData.docs = populatedPosts;
      return {
        docs: postData,
        // docs: populatedPosts,
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
  // console.log("gjhkjkjkjk");
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
    console.log("🚀 ~ args:", args.id);
    try {
      const deletePost = await Post.findByIdAndDelete({
        createdBy: user._id,
        _id: args.id,
      });

      if (!deletePost) return new Error("user not found");
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
    // getPaginated
    // paginate,
  },
  Mutation: {
    createPost,
    updatePost,
    deletePost,
  },
};

module.exports = postResolver;
