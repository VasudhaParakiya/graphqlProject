const { gql } = require("apollo-server");

const postLikeTypeDefs = gql`
  type Like {
    postId: String
    userId: String
    message: String
  }

  input likeInput {
    postId: String
  }

  type Mutation {
    toggleLikeOnPost(input: likeInput): Like
  }
`;

module.exports = postLikeTypeDefs;
