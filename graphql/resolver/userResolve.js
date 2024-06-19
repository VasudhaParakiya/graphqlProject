const { isAuthenticated } = require("../../middleware/authentication");
const User = require("../../models/userSchema");
const fs = require("fs");
const { combineResolvers } = require("graphql-resolvers");
const {
  sendWelcomeEmail,
  sendForgotPassword,
} = require("../../utils/sendEmail");
const createJwtToken = require("../../utils/createJwtToken ");
const jwt = require("jsonwebtoken");

const SingleUser = combineResolvers(
  isAuthenticated,
  async (parent, args, { user }) => {
    // const id = args.id;
    try {
      const userData = await User.findById(user._id);
      if (!userData) return new Error("user not found");
      // if (!userData) return new Error("you must be logged in");

      return userData;
    } catch (err) {
      console.log(err.message);
      return new Error(err);
    }
  }
);

// myprofile
const myProfile = combineResolvers(
  isAuthenticated,
  async (_, args, { user }) => {
    try {
      const userData = await User.findById(user._id);
      // console.log("profile", userData);
      if (!userData) return new Error("you must be logged in");
      return userData;
    } catch (err) {
      console.log(err.message);
      return new Error(err);
    }
  }
);

const createUser = async (_, args) => {
  try {
    const newUser = new User(args.input);
    // console.log(newUser);
    const email = args.input.email;
    // newUser.role = "user";
    // Save the new user to the database
    newUser.save();
    if (!newUser) return "user not created";

    const tokenforVerification = createJwtToken(newUser);
    const verificationToken = tokenforVerification.accessToken;
    // console.log("🚀 ~ createUser ~ verificationToken:", verificationToken);

    const url = `userVerify/${verificationToken}`;
    const subject = "verification email";

    sendWelcomeEmail({ email, url, subject });
    return newUser;
    // Your MongoDB operation here
  } catch (error) {
    console.error("MongoDB operation failed:", error);
  }
};

const verifyUser = async (_, { token }, context) => {
  // console.log("🚀 ~ isVerified ~ context:",args.token);
  const verifiedtoken = token;
  try {
    const decodedToken = jwt.verify(verifiedtoken, process.env.JWT_SECRET);

    // console.log(decodedToken);

    const user = await User.updateOne(
      { _id: decodedToken._id },
      { $set: { isVerified: true } }
    );
    console.log("🚀 ~ verifyUser: ~ user:", user);

    return { isVerified: true };
  } catch (error) {
    // Handle token verification errors
    console.log("Token verification error:", error.message);
    return new Error("jwt expired");
    // throw new ApolloError("verify token expired.", "NOTVERIFY");
  }
};

const updateUser = combineResolvers(
  isAuthenticated,
  async (parent, args, { user }) => {
    // const id = args.input.id;
    console.log(user);
    try {
      const userData = await User.findById(user._id);

      if (!userData) return new Error("user not found");
      Object.assign(userData, args.input);

      await userData.save();
      return userData;
    } catch (err) {
      console.log(err.message);
      return new Error(err);
    }
  }
);

const deleteUser = combineResolvers(
  isAuthenticated,
  async (parent, args, { user }) => {
    // const id = args.id;

    try {
      const userData = await User.findByIdAndDelete(user._id);

      if (!userData) return new Error("user not found");
      return { message: "delete" };
    } catch (err) {
      console.log(err.message);
      return new Error(err);
    }
  }
);

const tokenExpireAndSendLink = async (_, args) => {
  console.log("🚀 ~ tokenExpireAndSendLink ~ args:", args);
  const email = args.email;
  try {
    const user = await User.findOne({ email });
    console.log(user);
    if (!user) return new Error("wrong email ");

    const tokenforVerification = createJwtToken(user);
    const verificationToken = tokenforVerification.accessToken;
    console.log("🚀 ~ createUser ~ verificationToken:", verificationToken);

    const url = `signup/${verificationToken}`;
    const subject = "generate new link for verification";

    sendWelcomeEmail({ email, url, subject });
    return user;
  } catch (error) {
    console.log("🚀 ~ tokenExpireAndSendLink ~ error:", error);
  }
};

const loginUser = async (_, { input }) => {
  const { email, password } = input;
  // console.log(email);
  try {
    const user = await User.findOne({ email });
    // console.log(user);
    if (!user) return new Error("wrong email ");

    if (user.isVerified === false) {
      const tokenforVerification = createJwtToken(user);
      const verificationToken = tokenforVerification.accessToken;
      // console.log("🚀 ~ createUser ~ verificationToken:", verificationToken);

      const url = `loginVerify/${verificationToken}`;
      const subject = "please verify";

      sendWelcomeEmail({ email, url, subject });
      return new Error("not verified. please virify in your mail");
    }

    const isMatch = await user.isPasswordCorrect(password);
    if (!isMatch) return new Error("wrong  password");
    // console.log(isMatch);

    const accessToken = await user.generateAccessToken();

    return {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      active: user.active,
      gender: user.gender,
      dateOfBirth: user.dateOfBirth,
      hobby: user.hobby,
      role: user.role,
      isVerified: user.isVerified,
      accessToken: accessToken,
    };
  } catch (err) {
    console.log(err.message);
    return new Error(err);
  }
};

const changePassword = combineResolvers(
  isAuthenticated,
  async (_, { input }, { user }) => {
    const { oldPassword, newPassword } = input;
    console.log("🚀 ~ newPassword:", newPassword);

    if (!oldPassword || !newPassword)
      return new Error("provide proper details!");

    try {
      const userData = await User.findById(user._id);
      if (!userData) throw new Error("user not found!");

      const isMatch = await userData.isPasswordCorrect(input.oldPassword);
      if (!isMatch) throw new Error("wrong old password!");

      Object.assign(userData, { password: input.newPassword });
      await userData.save();

      return userData;
    } catch (err) {
      console.log(err.message);
      return new Error(err);
    }
  }
);

const forgotPassword = async (_, args) => {
  const { email } = args;
  // console.log("🚀 ~ forgotPassword ~ args:", args);
  try {
    const user = await User.findOne({ email }, { _id: 1 });
    // console.log("🚀 ~ forgotPassword ~ user:", user);
    if (!user) return "user not found";

    const tokenforVerification = createJwtToken(user);
    const verificationToken = tokenforVerification.accessToken;
    // console.log("🚀 ~ forgotPassword ~ verificationToken:", verificationToken);

    const url = `forgotPassword/${verificationToken}`;
    const subject = "Forgot Password";

    sendWelcomeEmail({ email, url, subject });

    return user;
  } catch (error) {
    console.log(err.message);
  }
};

const confirmPassword = async (_, args, context) => {
  console.log("🚀 ~ confirmPassword ~ args:", args);
  try {
    const { newPassword, confirmPassword } = args.input;
    const verifiedtoken = args.token;

    if (!verifiedtoken) return "invalid token";
    if (!newPassword && !confirmPassword) {
      return "newPassword and confirmPassword must be provided";
    }
    if (newPassword != confirmPassword) {
      return "newPassword and confirmPassword not match";
    }

    // console.log("🚀 ~ confirmPassword ~ verifiedtoken:", verifiedtoken);
    const decodedToken = jwt.verify(verifiedtoken, process.env.JWT_SECRET);
    // console.log("🚀 ~ confirmPassword ~ decodedToken:", decodedToken);

    const user = await User.findById({ _id: decodedToken._id });

    Object.assign(user, { password: newPassword });
    await user.save();

    // console.log("🚀 ~ confirmPassword ~ user:", user);

    return user;
  } catch (error) {
    // Handle token verification errors
    console.log("Token verification error:", error.message);
  }
};

const uploadProfilePhoto = combineResolvers(
  isAuthenticated,
  async (_, { input }, { user }) => {
    // console.log("🚀 ~ input:", input);
    const { _id } = user;
    let base64String = input.url;
    let base64Image = base64String.split(";base64,").pop();
    // console.log("🚀 ~ base64Image:", base64Image);

    const imgName = `${+new Date()}.png`;
    // console.log("🚀 ~ imgName:", imgName);

    if (!fs.existsSync("./uploads")) {
      fs.mkdirSync("./uploads", { recursive: true });
    }

    fs.writeFileSync(`./uploads/${imgName}`, base64Image, {
      encoding: "base64",
    });

    const userData = await User.findOneAndUpdate(
      { _id },
      { profile: imgName },
      { new: true }
    );
    if (!userData) {
      return new Error("invalid user!");
    } else {
      return imgName;
    }
  }
);

const getProfilePhoto = combineResolvers(
  isAuthenticated,
  async (_, args, { user }) => {
    const { _id } = user;
    try {
      const userData = await User.findById(_id);
      // console.log("🚀 ~ userData:", userData);
      if (!userData || !userData.profile) {
        return null;
      }
      // console.log("profile: ", userData.profile);
      return {
        url: userData.profile,
      };
    } catch (error) {
      // console.log("Error retrieving profile photo:", error);
      return new Error("Failed to retrieve profile photo");
    }
  }
);

const getInfoUpdatedByAdmin = async (_, args) => {
  // console.log("🚀 ~ getInfoUpdatedByAdmin ~ args:", args);
  const verifiedtoken = args.token;
  try {
    const decodedToken = jwt.verify(verifiedtoken, process.env.JWT_SECRET);
    // console.log("🚀 ~ getInfoUpdatedByAdmin ~ decodedToken:", decodedToken);

    const user = await User.findById({ _id: decodedToken._id });
    // console.log("🚀 ~ getInfoUpdatedByAdmin ~ user:", user);
    if (!user) return new Error("user not found");
    return user;
  } catch (error) {
    console.log("🚀 ~ getInfoUpdatedByAdmin ~ error:", error);
  }
};

const userResolver = {
  Query: {
    // allUser,
    SingleUser,
    myProfile,
    getProfilePhoto,
    getInfoUpdatedByAdmin,
  },
  Mutation: {
    createUser,
    updateUser,
    deleteUser,
    loginUser,
    changePassword,
    verifyUser,
    forgotPassword,
    confirmPassword,
    uploadProfilePhoto,
    tokenExpireAndSendLink,
  },
};

module.exports = userResolver;
