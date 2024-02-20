const { isAuthenticatedAdmin } = require("../../middleware/authentication");
const Post = require("../../models/postSchema");
const User = require("../../models/userSchema");
const { combineResolvers } = require("graphql-resolvers");
const createJwtToken = require("../../utils/createJwtToken ");
const { sendWelcomeEmail, sendUpdateEmail } = require("../../utils/sendEmail");

//get all user allUser
const getUsersByAdmin = combineResolvers(
  isAuthenticatedAdmin,
  async (_, { input }, { user }) => {
    try {
      const { page, limit, column, order, search } = input;
      let query = { role: "user" };
      // console.log("🚀 ~ search:", search);

      if (search) {
        query.lastName = { $regex: search, $options: "i" };
      }

      const options = {
        page: page || 1,
        limit: limit || 5,
        sort: { [column]: order === "asc" ? 1 : -1 },
      };

      const allUserData = await User.paginate(query, options);

      if (!search && !allUserData.docs) {
        throw new Error("No matching users found");
      }

      return {
        docs: allUserData.docs,
        totalDocs: allUserData.totalDocs,
        limit: allUserData.limit,
        totalPages: allUserData.totalPages,
        page: allUserData.page,
        nextPage: allUserData.nextPage,
        prevPage: allUserData.prevPage,
      };
    } catch (err) {
      throw new Error(err.message);
    }
  }
);

// get single user
const getSingleUserByAdmin = combineResolvers(
  isAuthenticatedAdmin,
  async (_, args, { user }) => {
    try {
      const user = await User.findById(args.id);
      console.log(user);
      if (!user) return new Error("user not found");
      return user;
    } catch (err) {
      return new Error(err);
    }
  }
);

// get all post by admin
const getAllPostByAdmin = combineResolvers(
  isAuthenticatedAdmin,
  async (_, { input }, { user }) => {
    const { page, limit } = input;
    try {
      const options = {
        page: page || 1,
        limit: limit || 5,
        sort: { title: 1 },
      };

      const allPostData = await Post.paginate({}, options);
      // console.log("🚀 ~ allPostData:", allPostData);

      // Extract documents from pagination result
      // const posts = allPostData.docs;

      const populatedPosts = await Post.populate(allPostData.docs, {
        path: "createdBy",
        select: "firstName",
      });

      if (!populatedPosts || !allPostData.docs) {
        return new Error("Post not available");
      }

      return {
        docs: populatedPosts,
        totalDocs: allPostData.totalDocs,
        limit: allPostData.limit,
        totalPages: allPostData.totalPages,
        page: allPostData.page,
        nextPage: allPostData.nextPage,
        prevPage: allPostData.prevPage,
      };
    } catch (err) {
      return new Error(err);
    }
  }
);

// object convertinto normal string
function objectToString(obj) {
  return Object.entries(obj)
    .map(([key, value]) => `${key}: ${value}`)
    .join(", ");
}
// update user by admin
const updateUserByAdmin = combineResolvers(
  isAuthenticatedAdmin,
  async (_, args, { user }) => {
    // console.log("🚀 ~ args:", args);
    // const updateObject = args.input;

    try {
      const userData = await User.findByIdAndUpdate(
        { _id: args.id },
        { $set: args.input },
        { new: true }
      );

      const email = userData.email;
      const newObject = objectToString(args.input);
      // console.log("🚀 ~ newObject:", newObject);

      sendUpdateEmail({ email, newObject });

      await userData.save();
      return userData;
    } catch (err) {
      console.log(err.message);
      return new Error(err);
    }
  }
);

// delete user by admin
const deleteUserByAdmin = combineResolvers(
  isAuthenticatedAdmin,
  async (_, args, { user }) => {
    try {
      const userData = await User.findByIdAndDelete(args.id);
      // console.log("delete", userData);
      if (!userData) return new Error("user not found");

      return { message: "delete" };
    } catch (err) {
      console.log(err.message);
      return new Error(err);
    }
  }
);

// all post of single user view by admin
const getAllPostOneUserByAdmin = combineResolvers(
  isAuthenticatedAdmin,
  async (_, args, { user }) => {
    // console.log("🚀 ~ args:", args);
    try {
      const { page, limit } = args.input;
      const query = { createdBy: args.id };
      const options = {
        page: page || 1,
        limit: limit || 5,
        sort: { title: 1 },
      };

      const allPostData = await Post.paginate(query, options);

      const populatedPosts = await Post.populate(allPostData.docs, {
        path: "createdBy",
        select: "firstName",
      });

      if (!populatedPosts || allPostData.length === 0) {
        return new Error("Post not available");
      }

      return {
        docs: populatedPosts,
        totalDocs: allPostData.totalDocs,
        limit: allPostData.limit,
        totalPages: allPostData.totalPages,
        page: allPostData.page,
        nextPage: allPostData.nextPage,
        prevPage: allPostData.prevPage,
      };
      // const postData = await Post.find({ createdBy: args.id }).populate({
      //   path: "createdBy",
      //   select: "firstName",
      // });
      // console.log("🚀 ~ postData:", postData);
    } catch (error) {
      console.log("🚀 ~ error:", error);
    }
  }
);

const adminResolver = {
  Query: {
    getUsersByAdmin,
    getSingleUserByAdmin,
    getAllPostByAdmin,
    getAllPostOneUserByAdmin,
  },
  Mutation: {
    updateUserByAdmin,
    deleteUserByAdmin,
  },
};

module.exports = adminResolver;
