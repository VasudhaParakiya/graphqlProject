const { gql } = require("apollo-server");

const postTypeDefs = gql`
  type Post {
    id: ID!
    title: String
    description: String
    createdBy: String
  }

  input createPostInput {
    title: String!
    description: String!
  }

  input updatePostInput {
    title: String
    description: String
  }

  type postResult {
    id: ID!
    title: String
    description: String
    createdBy: User
  }

  input paginateInput {
    page: Int
    limit: Int
  }

  type paginateOutput {
    docs: [postResult!]!
    totalDocs: Int
    limit: Int
    totalPages: Int
    page: Int
    nextPage: Int
    prevPage: Int
    hasNextPage: Boolean #default value is true
    hasPrevPage: Boolean #default value is false
  }

  type Query {
    # getAllPost: [postResult!]!
    getSinglePost(id: ID!): postResult!
    getAllPost(input: paginateInput!): paginateOutput
  }

  type Mutation {
    createPost(input: createPostInput!): Post
    # updatePost(input: updatePostInput!): Post
    updatePost(id: ID!, input: updatePostInput!): Post
    deletePost(id: ID!): deleteMsg
  }
`;

module.exports = postTypeDefs;
