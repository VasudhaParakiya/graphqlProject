const { gql } = require("apollo-server");

const postLikeTypeDefs = gql`
  type Like {
    postId: String
    # commentId: String
    userId: String
    message: String
  }

  input likeInput {
    # isLike: Boolean
    postId: String

    # commentId: String
  }

  type Mutation {
    toggleLikeOnPost(input: likeInput): Like
  }
`;

module.exports = postLikeTypeDefs;
