const { skip } = require("graphql-resolvers");
const User = require("../models/userSchema");

const isAuthenticated = async (_, args, { user }) => {
  // console.log("authenticated", user);
  try {
    if (!user) {
      return new Error("Not authenticated");
    }
    skip;
  } catch (error) {
    console.error(error);
    return new Error("Not authenticated");
  }
};

const isAuthenticatedAdmin = async (_, args, { user }) => {
  try {
    // console.log("isAuthenticatedAdmin : ", user);
    const userData = await User.findById(user._id, { password: 0 });
    // console.log(userData);

    if (!userData) {
      return new Error("Not authenticated");
    }
    // console.log(userData.role);
    if (userData.role === "admin") {
      skip;
    } else {
      return new Error("Not authenticated Admin");
    }
  } catch (error) {
    console.error(error);
    return new Error(error.message);
  }
};

module.exports = {
  isAuthenticated,
  isAuthenticatedAdmin,
};
