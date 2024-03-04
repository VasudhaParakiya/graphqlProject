const { gql } = require("apollo-server");

const postTypeDefs = gql`
  type Post {
    id: String
    title: String
    description: String
    createdBy: String
    # likes: Number
    # publishDate: String
    # likes: [Like!]
    # comments: [Comment!]
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
    id: String
    title: String
    description: String
    createdBy: User
    likes: Int
    comments: Int
  }

  input paginateInput {
    page: Int
    limit: Int
  }

  type paginateOutput {
    # comments: Int
    # likes: Int
    docs: [postResult!]
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
    getSinglePost(id: String!): postResult!
    getAllPost(input: paginateInput!): paginateOutput
  }

  type Mutation {
    createPost(input: createPostInput!): Post
    # updatePost(input: updatePostInput!): Post
    updatePost(id: String!, input: updatePostInput!): Post
    deletePost(id: String!): deleteMsg
  }
`;

module.exports = postTypeDefs;
