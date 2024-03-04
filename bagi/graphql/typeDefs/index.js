const userTypeDefs = require("./userTypeDefs");
const adminTypeDefs = require("./adminTypeDefs");
const postTypeDefs = require("./postTypeDefs");
const postLikeTypeDefs = require("./postLikeTypeDefs");
const PostComments = require("./postCommentTypeDefs");

const typeDefs = [
  userTypeDefs,
  adminTypeDefs,
  postTypeDefs,
  postLikeTypeDefs,
  PostComments,
];

module.exports = typeDefs;
