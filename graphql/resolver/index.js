const { merge } = require("lodash");

const adminResolver = require("./adminResolver");

const userResolver = require("./userResolve");
const postResolver = require("./postResolver");

const resolvers = merge(adminResolver, userResolver, postResolver);

module.exports = resolvers;
