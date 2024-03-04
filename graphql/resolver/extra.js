const getAllPost = combineResolvers(
  isAuthenticated,
  async (_, { input }, { user }) => {
    // console.log("🚀 ~ user:", user);

    const { page, limit } = input;
    try {
      // const userResult = await User.aggregate([
      //   {
      //     $group: {
      //       _id: "$userId",
      //       firstName: "$firstName",
      //     },
      //   },
      //   {
      //     $project: {
      //       _id: 1,
      //       firstName: 1,
      //     },
      //   },
      // ]);
      // console.log("🚀 ~ userResult:", userResult);

      const postResult = await PostLikes.aggregate([
        // {
        //   page: page || 1,
        // },
        // {
        //   limit: limit || 34,
        // },
        {
          $group: {
            _id: "$postId",
            likeCount: { $sum: 1 },
          },
        },
        // {
        //   $lookup: {
        //     from: "Post",
        //     localField: "postId",
        //     foreignField: "_id",
        //     as: "postLike",
        //   },
        // },
        // {

        // }
        // {
        //   $addFields: {
        //     likeCount: { $size: "$postLike" },
        //   },
        // },
        // {
        //   $sort: { createdAt: -1 },
        // },
        {
          $project: {
            _id: 1,
            likeCount: 1,
          },
        },
      ]);
      // console.log("🚀 ~ result:", result);
      // const aggregateQuery = [
      //   {
      //     $lookup: {
      //       from: "PostLikes",
      //       localField: "_id",
      //       foreignField: "postId",
      //       as: "postLike",
      //     },
      //   },
      //   {
      //     $project: {
      //       likeCount: { $size: "$postLike" },
      //     },
      //   },
      // ];

      const commentResult = await PostComments.aggregate([
        {
          $group: {
            _id: "$postId",
            commentCount: { $sum: 1 },
          },
        },
        {
          $project: {
            _id: 1,
            commentCount: 1,
          },
        },
      ]);

      const postByUser = await Post.aggregate([
        {
          $lookup: {
            from: "users",
            localField: "createdBy",
            foreignField: "_id",
            as: "name",
          },
        },
        {
          $unwind: "$name",
        },
        {
          $project: {
            name: "$name.firstName",
          },
        },
      ]);
      // console.log("🚀 ~ postByUser:", postByUser);

      const options = {
        page: page || 1,
        limit: limit || 34,
        lean: true,
        populate: [
          {
            path: "createdBy",
            select: "firstName",
          },
        ],
      };

      const allPostData = await Post.paginate({}, options);

      // Map through allPostData.docs and assign the appropriate likeCount
      const newData = allPostData.docs.map((data) => {
        // Find the corresponding likeCount from the result array based on postId (_id)
        const postLikes = postResult.find(
          (item) => item._id.toString() === data._id.toString()
        );

        // Assign likeCount to data
        if (postLikes) {
          data.likeCount = postLikes.likeCount;
        } else {
          data.likeCount = 0; // If there are no likes, set it to 0 or any other default value
        }

        const commentscount = commentResult.find(
          (item) => item._id.toString() === data._id.toString()
        );

        if (commentscount) {
          data.commentCount = commentscount.commentCount;
        } else {
          data.commentCount = 0; // If there are no likes, set it to 0 or any other default value
        }

        // const userName = postByUser.find(
        //   (item) => item._id.toString() === data._id.toString()
        // );
        // console.log("🚀 ~ newData ~ userName:", userName);
        // if (userName) {
        //   data.createdBy = userName.name;
        // }

        return data;
      });

      // Sort based on the sum of likeCount and commentCount
      newData.sort(
        (a, b) => b.likeCount + b.commentCount - (a.likeCount + a.commentCount)
      );

      // console.log("🚀 ~ newData:", newData);

      return {
        docs: newData,
        totalDocs: allPostData.totalDocs,
        limit: allPostData.limit,
        totalPages: allPostData.totalPages,
        page: allPostData.page,
        nextPage: allPostData.nextPage,
        prevPage: allPostData.prevPage,
      };

      // const options = {
      //   page: page || 1,
      //   limit: limit || 34,
      //   sort: { title: 1 },
      //   lean: true,
      //   populate: [
      //      {
      //        path: "likeCount",
      //      },
      //     {
      //       path: "commentCount",
      //     },
      //     {
      //       path: "createdBy",
      //       select: "firstName",
      //     },
      //   ],
      // };
      // const allPostData = await Post.paginate({}, options);
      // console.log("🚀 ~ allPostData:", allPostData);

      // return {
      //   docs: allPostData.docs,
      //   totalDocs: allPostData.totalDocs,
      //   limit: allPostData.limit,
      //   totalPages: allPostData.totalPages,
      //   page: allPostData.page,
      //   nextPage: allPostData.nextPage,
      //   prevPage: allPostData.prevPage,
      // };
    } catch (error) {
      console.log("🚀 ~ error:", error);
    }
  }
);

// use populate
// const options = {
//   page: page || 1,
//   limit: limit || 34,
//   sort: { title: 1 },
//   lean: true,
//   populate: [
//      {
//        path: "likeCount",
//      },
//     {
//       path: "commentCount",
//     },
//     {
//       path: "createdBy",
//       select: "firstName",
//     },
//   ],
// };
// const allPostData = await Post.paginate({}, options);
// console.log("🚀 ~ allPostData:", allPostData);

// return {
//   docs: allPostData.docs,
//   totalDocs: allPostData.totalDocs,
//   limit: allPostData.limit,
//   totalPages: allPostData.totalPages,
//   page: allPostData.page,
//   nextPage: allPostData.nextPage,
//   prevPage: allPostData.prevPage,
// };

const postResult = await Post.aggregate([
  {
    $lookup: {
      from: "PostLikes",
      localField: "_id",
      foreignField: "postId",
      as: "postLike",
    },
  },
  {
    $lookup: {
      from: "PostComments",
      localField: "_id",
      foreignField: "postId",
      as: "comments",
    },
  },
  {
    $lookup: {
      from: "PostCommentsLikes",
      localField: "comments._id",
      foreignField: "commentId",
      as: "commentLikes",
    },
  },
  {
    $project: {
      _id: 1,
      title: 1,
      description: 1,
      createdBy: 1,
      totalLikes: {
        $sum: {
          $sum: "postLike._id",
          $sum: "commentLikes._id",
        },
      },
    },
  },
  {
    $sort: { totalLikes: 1 },
  },

  //   {
  //     $group: {
  //       _id: "$postId",
  //       likeCount: { $sum: 1 },
  //     },
  //   },
  //   {
  //     $project: {
  //       _id: 1,
  //       likeCount: 1,
  //     },
  //   },
]);

// Map through allPostData.docs and assign the appropriate likeCount
const newData = allPostData.docs.map((data) => {
  const combinedItem = combinedResult.find(
    (item) => item._id.toString() === data._id.toString()
  );
  data.likeCount = combinedItem ? combinedItem.likeCount : 0;
  data.commentCount = combinedItem ? combinedItem.commentCount : 0;
  data.createdBy = data.createdBy.firstName; // Assuming createdBy is already populated
  return data;
  // Find the corresponding likeCount from the result array based on postId (_id)
  // const postLikes = postResult.find(
  //   (item) => item._id.toString() === data._id.toString()
  // );

  // // Assign likeCount to data
  // if (postLikes) {
  //   data.likeCount = postLikes.likeCount;
  // } else {
  //   data.likeCount = 0; // If there are no likes, set it to 0 or any other default value
  // }

  // const commentscount = commentResult.find(
  //   (item) => item._id.toString() === data._id.toString()
  // );

  // if (commentscount) {
  //   data.commentCount = commentscount.commentCount;
  // } else {
  //   data.commentCount = 0; // If there are no likes, set it to 0 or any other default value
  // }
  // return data;
});

// Sort based on the sum of likeCount and commentCount
newData.sort(
  (a, b) => b.likeCount + b.commentCount - (a.likeCount + a.commentCount)
);

// console.log("🚀 ~ newData:", newData);

return {
  docs: newData,
  totalDocs: allPostData.totalDocs,
  limit: allPostData.limit,
  totalPages: allPostData.totalPages,
  page: allPostData.page,
  nextPage: allPostData.nextPage,
  prevPage: allPostData.prevPage,
};

//sort---------------------1
const combinedResult = await PostLikes.aggregate([
  {
    $group: {
      _id: "$postId",
      likeCount: { $sum: 1 },
    },
  },
  {
    $lookup: {
      from: "postcomments",
      localField: "_id",
      foreignField: "postId",
      as: "comments",
    },
  },
  {
    $addFields: {
      commentCount: { $size: "$comments" },
    },
  },
  {
    $sort: { likeCount: -1, commentCount: -1 }, // Sort by likeCount and commentCount in descending order
  },
  // Rest of your pipeline...
]);

//sort--------------------2
const combinedResult2 = await PostLikes.aggregate([
  {
    $group: {
      _id: "$postId",
      likeCount: { $sum: 1 },
    },
  },
  {
    $lookup: {
      from: "postcomments",
      localField: "_id",
      foreignField: "postId",
      as: "comments",
    },
  },
  {
    $addFields: {
      commentCount: { $size: "$comments" },
      totalReplyCount: { $sum: "$comments.replyCount" }, // Calculate the total reply count
    },
  },
  {
    $addFields: {
      totalCommentCount: { $add: ["$commentCount", "$totalReplyCount"] }, // Calculate the total comment count
    },
  },
  {
    $sort: {
      $sum: ["$likeCount", "$totalCommentCount"], // Sort by the sum of likeCount and totalCommentCount
    },
  },
  // Rest of your pipeline...
]);
