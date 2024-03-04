const { merge } = require("lodash");

const adminResolver = require("./adminResolver");

const userResolver = require("./userResolve");

const postResolver = require("./postResolver");
const postLikeResolver = require("./postLikeResolver");
const postCommentResolver = require("./postCommentResolver");

const resolvers = merge(
  adminResolver,
  userResolver,
  postResolver,
  postLikeResolver,
  postCommentResolver
);

module.exports = resolvers;
