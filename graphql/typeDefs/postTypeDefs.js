const { gql } = require("apollo-server");

const postTypeDefs = gql`
  type Post {
    id: String
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
    id: String
    title: String
    description: String
    createdBy: User
    likeCount: Int
    commentCount: Int
  }

  input paginateInput {
    page: Int
    limit: Int
  }

  type paginateOutput {
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
    getSinglePost(id: String!): postResult!
    getAllPost(input: paginateInput!): paginateOutput
  }

  type Mutation {
    createPost(input: createPostInput!): Post

    updatePost(id: String!, input: updatePostInput!): Post
    deletePost(id: String!): deleteMsg
  }

  type PostSubscription {
    keyType: String
    data: Post
  }

  type Subscription {
    newPostCreated: PostSubscription
  }
`;

module.exports = postTypeDefs;
