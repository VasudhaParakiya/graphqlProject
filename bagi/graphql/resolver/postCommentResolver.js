const { combineResolvers } = require("graphql-resolvers");
const { isAuthenticated } = require("../../middleware/authentication");
const Post = require("../../models/postSchema");
const PostComments = require("../../models/commentsSchema");
const PostCommentsLikes = require("../../models/commentsLikeSchema");
const { comment } = require("postcss");

const addComment = combineResolvers(
  isAuthenticated,
  async (_, args, { user }) => {
    try {
      const { postId, description, parentCommentId } = args.input;

      // Check if the post exists
      const post = await Post.findById(postId);
      if (!post) {
        throw new Error("Post not found");
      }

      // Create the comment
      const newComment = new PostComments({
        postId,
        description,
        userId: user._id,
        parentCommentId,
      });

      // Save the comment
      newComment.message = "success";
      const savedComment = await newComment.save();

      // Increment the comment count in the associated post
      post.commentCount += 1;
      await post.save();

      return savedComment;
    } catch (error) {
      throw new Error(error.message);
    }
  }
);

const toggleLikeOnPostComment = combineResolvers(
  isAuthenticated,
  async (_, args, { user }) => {
    // console.log("🚀 ~ args:", args);
    const { postId, commentId } = args.input;

    try {
      if (!postId) return new Error("Invalid postId");
      if (!commentId) return new Error("Invalid commentId");

      let commentLikeData;

      // If isLike is true, user wants to like the post
      commentLikeData = await PostCommentsLikes.findOne({
        postId,
        commentId,
        userId: user._id,
      });
      if (!commentLikeData) {
        // If like data doesn't exist, create a new like
        const newLike = await PostCommentsLikes({
          postId,
          commentId,
          userId: user._id,
        });
        newLike.message = "success";
        await newLike.save();
        commentLikeData = newLike; // Assigning newLike to likeData
      } else {
        // If isLike is false, user wants to unlike the post
        commentLikeData = await PostCommentsLikes.findOneAndDelete({
          postId,
          commentId,
          userId: user._id,
        });
        commentLikeData.message = "deleted";
      }

      return commentLikeData;
    } catch (error) {
      console.log("🚀 ~ error:", error);
    }
  }
);

const getAllCommentsOnPost = async (_, args, { user }) => {
  const { postId } = args;
  try {
    const commentData = await PostComments.find({ postId });
    console.log("🚀 ~ getAllCommentsOnPost ~ commentData:", commentData);

    // const replyComment=await
    // console.log("🚀 ~ commentData:", commentData);

    // let replies = commentData?.map((comment) => {
    //   return comment?.replies.length > 0 ? comment.replies.reverse() : [];
    // });
    // console.log("🚀 ~ replies ~ replies:", replies);

    // let newComment = [...commentData, replies];
    // console.log("🚀 ~ getAllCommentsOnPost ~ newComment:", newComment);

    // // sort comment and replies

    // const comments = await Promise.all(
    //   commentData.map(async (comment) => {
    //     // console.log("🚀 ~ commentData.map ~ comment:", comment);
    //     const commentLikes = await PostCommentsLikes.find({
    //       commentId: comment._id, // Use comment._id instead of commentData._id
    //       postId: postId,
    //     });
    //     // console.log("🚀 ~ commentData.map ~ commentLikes:", commentLikes);

    //     comment.likeCount = commentLikes.length;
    //     // console.log("🚀 ~ commentData.map ~ likeCount:", comment);

    //     comment.commentId = comment._id;
    //     return comment;
    //   })
    // );

    return commentData;
  } catch (error) {
    console.log("🚀 ~ error:", error);
    throw error; // Throw error to handle it at a higher level
  }
};

const getAllReplyComment = async (_, args, { user }) => {
  const { commentId, parentCommentId } = args.input;
  try {
    const commentData = await PostComments.find({
      parentCommentId: parentCommentId,
    });
    // console.log("🚀 ~ getAllReplyComment ~ commentData:", commentData);
    return commentData;
  } catch (error) {
    console.log("🚀 ~ getAllReplyComment ~ error:", error);
  }
  // try {
  //   const commentData = await PostComments.aggregate([
  //     {
  //       $addFields: {
  //         parentCommentId: {
  //           $cond: {
  //             if: {
  //               $eq: ["$parentCommentId", ""],
  //             },
  //             then: "$parentCommentId",
  //             else: {
  //               $toObjectId: "$parentCommentId",
  //             },
  //           },
  //         },
  //       },
  //     },
  //     {
  //       $lookup: {
  //         from: "PostComments",
  //         let: {
  //           pid: "$parentCommentId",
  //         },
  //         as: "parentComment",
  //         pipeline: [
  //           {
  //             $match: {
  //               $expr: {
  //                 $eq: ["$$pid", "$_id"],
  //               },
  //             },
  //           },
  //         ],
  //       },
  //     },
  //     {
  //       $unwind: {
  //         path: "$parentComment",
  //         preserveNullAndEmptyArrays: true,
  //       },
  //     },
  //   ]);
  //   console.log("🚀 ~ getAllReplyComment ~ commentData:", commentData)
  // } catch (error) {
  //   console.log("🚀 ~ getAllReplyComment ~ error:", error);
  // }
};

const updateSubComment = combineResolvers(
  isAuthenticated,
  async (_, args, { user }) => {
    const { parentCommentId, reply, replyId } = args.input;
    try {
      if (!parentCommentId) return new Error("invalid parentCommentId");
      if (!replyId) return new Error("invalid replyId");

      const updatedComment = await PostComments.findByIdAndUpdate(
        { _id: replyId, parentCommentId: parentCommentId },
        {
          $set: {
            description: reply,
          },
        },
        { new: true }
      );
      // console.log("🚀 ~ updatedComment:", updatedComment);
      return updatedComment;
    } catch (error) {
      console.log("🚀 updateSubComment ~ error:", error);
    }
  }
);

const deleteReplies = combineResolvers(
  isAuthenticated,
  async (_, args, { user }) => {
    // console.log("🚀 ~ args:", args)
    const { parentCommentId, replyId } = args.input;
    try {
      if (!parentCommentId) return new Error("invalid parentCommentId");
      if (!replyId) return new Error("invalid replyId");

      if (parentCommentId && replyId) {
        // const newComment = await PostComments.findByIdAndUpdate(
        //   { _id: replyId, parentCommentId: parentCommentId },
        //   { $pull: { _id: replyId } },
        //   { new: true }
        // );
        const newComment = await PostComments.findOneAndDelete({
          _id: replyId,
          parentCommentId: parentCommentId,
        });
        newComment.message = "deleted";
        return newComment;
      }
    } catch (error) {
      console.log("🚀 deleteReplies ~ error:", error);
    }
  }
);

const likeCountOnComment = combineResolvers(async (_, args, { user }) => {
  console.log("🚀 ~ likeCountOnComment ~ args:", args);
  const { _id, postId } = args.input;
  try {
    if (!_id) return new Error("Invalid id");

    let totalLike = 0;
    let likeData;

    likeData = await PostComments.findById({ _id });
    // console.log("🚀 ~ likeCountOnComment ~ likeData:", likeData);

    //  totalLike = likeData.likeCount || 0; // Initialize totalLike to existing likeCount or 0

    // if (!likeData.likeCount) {
    //   totalLike++; // Increment totalLike
    // } else {
    //   totalLike--; // Decrement totalLike
    // }

    // const newLikeCount = !likeData.likeCount ? totalLike : totalLike - 1;
    // const updateData = await PostComments.findByIdAndUpdate(
    //   { _id },
    //   { $set: { likeCount: newLikeCount } },
    //   { new: true }
    // );
    // console.log("🚀 ~ likeCountOnComment ~ updateData:", updateData);
    // return updateData;

    if (!likeData.likeCount) {
      console.log("🚀 ~ likeCountOnComment ~ likeData:", likeData.likeCount);
      // totalLike = likeData.likeCount + 1;

      const newLikeCount = likeData.likeCount + 1;
      const updateData = await PostComments.findByIdAndUpdate(
        { _id, userId: user._id },
        { $set: { likeCount: newLikeCount } },
        // { $set: { likeCount: newLikeCount }, $addToSet: { likedBy: user._id } },
        { new: true }
      );

      const total = await PostComments.aggregate([
        {
          $group: {
            _id: postId, // Group by null to get a single result for the entire collection
            totalLikes: { $sum: "$likeCount" }, // Sum up the likeCount field
          },
        },
      ]);
      // .then(result => {
      //   if (result.length > 0) {
      //     console.log('Total likes across all documents:', result[0].totalLikes);
      //   } else {
      //     console.log('No documents found');
      //   }
      // })
      // .catch(error => {
      //   console.error('Error occurred:', error);
      // });
      updateData.totalLike = total[0].totalLikes;
      // console.log("🚀 ~ likeCountOnComment ~ totalLike:", total);
      // console.log("🚀 ~ likeCountOnComment ~ updateData:", updateData);

      return updateData;
    } else {
      // totalLike = likeData.likeCount - 1;
      const newLikeCount = likeData.likeCount - 1;
      const updateData = await PostComments.findByIdAndUpdate(
        { _id, userId: user._id },
        { $set: { likeCount: newLikeCount } },
        { new: true }
      );
      // console.log("🚀 ~ likeCountOnComment ~ updateData:", updateData);
      const total = await PostComments.aggregate([
        {
          $group: {
            _id: postId, 
            totalLikes: { $sum: "$likeCount" }, // Sum up the likeCount field
          },
        },
      ]);
      updateData.totalLike = total[0].totalLikes;
      // console.log("🚀 ~ likeCountOnComment ~ totalLike:", total);
      return updateData;
    }
  } catch (error) {
    console.log("🚀 ~ likeCountOnComment ~ error:", error);
  }
});

const getCommentAllReply = async (_, args, { user }) => {
  console.log("🚀 ~ getCommentAllReply ~ args:", args);
};

const postCommentResolver = {
  Query: {
    getAllCommentsOnPost,
    // getCommentAllReply,
    getAllReplyComment,
  },

  Mutation: {
    addComment,
    toggleLikeOnPostComment,
    updateSubComment,
    deleteReplies,
    likeCountOnComment,
  },
};

module.exports = postCommentResolver;
