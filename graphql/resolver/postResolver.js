const { isAuthenticated } = require("../../middleware/authentication");
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
      const query = { createdBy: user._id };
      const options = {
        page: page || 1,
        limit: limit || 5,
        sort: { title: 1 },
        // select: 'name email',
        // collation: { locale: 'en' }
      };

      const allPostData = await Post.paginate(query, options);
      // console.log("🚀 ~ allPostData:", allPostData);

      // Extract documents from pagination result
      // const posts = allPostData.docs;

      const populatedPosts = await Post.populate(allPostData.docs, {
        path: "createdBy",
        select: "firstName",
      });

      if (!populatedPosts || allPostData.length === 0) {
        return new Error("Post not available");
      }

      allPostData.docs = populatedPosts;
      return allPostData;
      // docs: populatedPosts,
      // totalDocs: allPostData.totalDocs,
      // limit: allPostData.limit,
      // totalPages: allPostData.totalPages,
      // page: allPostData.page,
      // nextPage: allPostData.nextPage,
      // prevPage: allPostData.prevPage,
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

// const getPaginated = async (_, args, { user }) => {
//   console.log("🚀 ~ paginate ~ args:", args);

// const page = Number(args.page) || 1;
// const limit = Number(args.limit) || 5;

// let skip = (page - 1) * limit;

//   Post.paginate({}, { page: 1, limit: 10 }, function(err, result) {
//     // `result` will contain paginated documents
// });

// let data = await Post.findAll({ createdBy: user._id },args).populate({
//   path: "createdBy",
//   select: "firstName",
// });

//   data = data.skip(skip).limit(limit);
//   const myData = await data;
//   res.status(200).json({ myData, result: myData.length });
// };

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
