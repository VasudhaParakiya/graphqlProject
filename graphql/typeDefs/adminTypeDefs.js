const { gql } = require("apollo-server");

const adminTypeDefs = gql`
  input updateUserByAdminInput {
    firstName: String
    lastName: String
    gender: Gender
    hobby: [String!]
    role: Role
    dateOfBirth: String
    active: Boolean
  }

  input paginateUserInput {
    page: Int
    limit: Int
    column: String
    order: String
    search: String
  }

  input paginateInput {
    page: Int
    limit: Int
  }
  type paginateUserOutput {
    docs: [User!]!
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
    getUsersByAdmin(input: paginateUserInput!): paginateUserOutput!

    getSingleUserByAdmin(id: ID!): User!
    # getAllPostByAdmin: [postResult!]!
    getAllPostByAdmin(input: paginateInput!): paginateOutput
    # getAllPostOneUserByAdmin(id: ID!): [postResult!]!
    getAllPostOneUserByAdmin(id: ID!, input: paginateInput!): paginateOutput
    # getSearchResult(lastName: String!): [User!]
  }

  type Mutation {
    updateUserByAdmin(id: ID!, input: updateUserByAdminInput!): User!
    deleteUserByAdmin(id: String!): deleteMsg!
  }
`;

module.exports = adminTypeDefs;
