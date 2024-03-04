const { gql } = require("apollo-server");

const userTypeDefs = gql`
  type User {
    id: ID
    firstName: String
    lastName: String
    email: String
    password: String
    active: Boolean
    gender: Gender
    hobby: [String!]
    role: Role
    dateOfBirth: String
    isVerified: Boolean
    profile: String
    createdAt: String
    updatedAt: String
    # post: [Post!]!
  }

  enum Gender {
    male
    female
  }

  enum Role {
    admin
    user
  }

  input createUserInput {
    firstName: String!
    lastName: String!
    email: String!
    password: String!
    gender: Gender!
    hobby: [String!]!
    dateOfBirth: String
  }

  input updateUser {
    firstName: String
    lastName: String
    email: String
    password: String
    active: Boolean
    gender: Gender
    hobby: [String!]
    role: Role
    dateOfBirth: String
  }

  input changePassword {
    oldPassword: String!
    newPassword: String!
  }

  input confirmPasswordInput {
    newPassword: String!
    confirmPassword: String!
  }
  # type postResult {
  #   id: String!
  #   title: String
  #   description: String
  #   createdBy: User
  #   createdAt: String
  #   updatedAt: String
  # }
  type profileResult {
    id: String!
    firstName: String
    lastName: String
    email: String
    password: String
    active: Boolean
    gender: Gender
    hobby: [String!]
    role: Role
    dateOfBirth: String
    isVerified: Boolean
    profile: String
    # posts: Post
  }

  input loginUserInput {
    email: String!
    password: String!
  }

  # type loginResult {
  #   accessToken: String
  #   message: String
  # }

  type loginResult {
    id: String
    firstName: String
    lastName: String
    email: String
    gender: Gender
    hobby: [String!]
    dateOfBirth: String
    role: String
    active: Boolean
    isVerified: Boolean
    accessToken: String
  }

  input uploadProfileInput {
    url: String
  }

  type uploadProfileOutput {
    url: String
  }

  type deleteMsg {
    message: String!
  }

  type status {
    isVerified: Boolean
  }

  type Query {
    SingleUser(id: ID!): User!
    myProfile: User
    getProfilePhoto: uploadProfileOutput
    getInfoUpdatedByAdmin(token: String): User
  }

  type Mutation {
    createUser(input: createUserInput!): User
    updateUser(input: updateUser!): User
    # deleteUser(id: ID!): deleteMsg!
    deleteUser: deleteMsg
    changePassword(input: changePassword!): User
    loginUser(input: loginUserInput!): loginResult
    verifyUser(token: String!): status
    forgotPassword(email: String!): User
    confirmPassword(token: String!, input: confirmPasswordInput!): User
    uploadProfilePhoto(input: uploadProfileInput!): User
    tokenExpireAndSendLink(email: String): User
  }
`;

module.exports = userTypeDefs;
