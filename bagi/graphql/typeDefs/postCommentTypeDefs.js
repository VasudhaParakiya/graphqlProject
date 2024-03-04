const { gql } = require("apollo-server");

const postCommentTypeDefs = gql`
  type Comments {
    id: String
    postId: String
    userId: String
    description: String
    message: String
    parentCommentId: String

    # likesCount: Int
  }

  input addCommentInput {
    postId: String
    description: String
    parentCommentId: String
  }

  type CommentsLike {
    # totalLike: Int
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
    # commentId: String
    description: String
    parentCommentId: String
    likeCount: Int
    totalLike:Int
  }

  input getAllReplyComment {
    commentId: String
    parentCommentId: String
  }

  input updateSubCommentInput {
    parentCommentId: String
    reply: String
    replyId: String
  }

  input dleleteRepliesTnput {
    parentCommentId: String
    replyId: String
  }

  type deleteMsg {
    message: String
  }

  input likeCountOnCommentInput {
    _id: ID
    postId:ID
    # userId:ID
    # commentId: ID
    # parentCommentId: String
    # replyId: String
    # userId: String
  }

  input getCommentAllReplyInput {
    commentId: String
    userId: String
    postId: String
  }

  type Query {
    getAllCommentsOnPost(postId: String): [CommentResult]
    getAllReplyComment(input: getAllReplyComment): [CommentResult]

    # getCommentAllReply(input: getCommentAllReplyInput): repliesToCommentsOutput
  }

  type Mutation {
    addComment(input: addCommentInput): Comments
    toggleLikeOnPostComment(input: commentslikeInput): CommentsLike
    updateSubComment(input: updateSubCommentInput): CommentResult
    deleteReplies(input: dleleteRepliesTnput): deleteMsg
    likeCountOnComment(input: likeCountOnCommentInput): CommentResult
  }
`;

module.exports = postCommentTypeDefs;
