const { gql } = require("apollo-server");

const postCommentTypeDefs = gql`
  type Comments {
    id: String
    postId: String
    userId: String
    description: String
    message: String
    parentCommentId: String
  }

  input addCommentInput {
    postId: String
    description: String
    parentCommentId: String
  }

  type CommentsLike {
    _id: ID
    postId: String
    commentId: String
    userId: String
    message: String
  }

  input commentslikeInput {
    postId: String
    commentId: String
  }

  type CommentResult {
    id: ID
    postId: ID
    userId: String
    description: String
    parentCommentId: String
    likeCount: Int
  }

  input getAllReplyComment {
    commentId: ID
  }

  input updateRootCommentInput {
    reply: String
    commentId: ID
  }

  input updateSubCommentInput {
    parentCommentId: String
    reply: String
    replyId: String
  }

  input dleleteRepliesTnput {
    commentId: String
  }

  type deleteMsg {
    message: String
  }

  input likeCountOnCommentInput {
    _id: ID
    postId: ID
  }

  input getCommentAllReplyInput {
    commentId: String
    userId: String
    postId: String
  }

  type getAllCommentsOnPostOutput {
    totalLike: Int
    CommentResult: [CommentResult]
  }

  type getAllReplyCommentOutput {
    totalLike: Int
    CommentResult: [CommentResult]
  }

  type Query {
    getAllCommentsOnPost(postId: String): getAllCommentsOnPostOutput
    getAllReplyComment(input: getAllReplyComment): getAllReplyCommentOutput
  }

  type Mutation {
    addComment(input: addCommentInput): Comments
    toggleLikeOnPostComment(input: commentslikeInput): CommentsLike
    updateRootComment(input: updateRootCommentInput): CommentResult
    deleteReplies(input: dleleteRepliesTnput): deleteMsg
  }
`;

module.exports = postCommentTypeDefs;
