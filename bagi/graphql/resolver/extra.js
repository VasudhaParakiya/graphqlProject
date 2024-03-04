const likeCountOnComment1 = combineResolvers(async (_, args, { user }) => {
  console.log("🚀 ~ likeCountOnComment ~ args:", args);
  const { _id } = args.input;
  try {
    if (!_id) return new Error("Invalid id");

    let totalLike;
    let likeData;

    likeData = await PostComments.findById({ _id });

    if (!likeData) {
      return new Error("Comment not found");
    }

    if (!likeData.likeCount) {
      console.log("🚀 ~ likeCountOnComment ~ likeData:", likeData.likeCount);
      totalLike = likeData.likeCount + 1;

      const newLikeCount = likeData.likeCount + 1;
      const updateData = await PostComments.findByIdAndUpdate(
        { _id },
        { $set: { likeCount: newLikeCount }, $addToSet: { likedBy: user._id } },
        { new: true }
      );
      console.log("🚀 ~ likeCountOnComment ~ totalLike:", totalLike);
      console.log("🚀 ~ likeCountOnComment ~ updateData:", updateData);
      return updateData;
    } else {
      const userLiked = likeData.likedBy.includes(user._id);
      if (userLiked) {
        totalLike = likeData.likeCount - 1;
        const newLikeCount = likeData.likeCount - 1;
        const updateData = await PostComments.findByIdAndUpdate(
          { _id },
          { $set: { likeCount: newLikeCount }, $pull: { likedBy: user._id } },
          { new: true }
        );
        console.log("🚀 ~ likeCountOnComment ~ updateData:", updateData);
        return updateData;
      } else {
        totalLike = likeData.likeCount + 1;
        const newLikeCount = likeData.likeCount + 1;
        const updateData = await PostComments.findByIdAndUpdate(
          { _id },
          {
            $set: { likeCount: newLikeCount },
            $addToSet: { likedBy: user._id },
          },
          { new: true }
        );
        console.log("🚀 ~ likeCountOnComment ~ updateData:", updateData);
        return updateData;
      }
    }
  } catch (error) {
    console.log("🚀 ~ likeCountOnComment ~ error:", error);
    return error;
  }
});


const likeCountOnComment = combineResolvers(async (_, args, { user }) => {
  console.log("🚀 ~ likeCountOnComment ~ args:", args);
  const { _id } = args.input;
  try {
    if (!_id) return new Error("Invalid id");

    let totalLike;
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
      totalLike = likeData.likeCount + 1;

      const newLikeCount = likeData.likeCount + 1;
      const updateData = await PostComments.findByIdAndUpdate(
        { _id, userId: user._id },
        // { $set: { likeCount: newLikeCount } },
        { $set: { likeCount: newLikeCount }, $addToSet: { likedBy: user._id } },
        { new: true }
      );
      console.log("🚀 ~ likeCountOnComment ~ totalLike:", totalLike);
      console.log("🚀 ~ likeCountOnComment ~ updateData:", updateData);
      return updateData;
    } else {
      totalLike = likeData.likeCount - 1;
      const newLikeCount = likeData.likeCount - 1;
      const updateData = await PostComments.findByIdAndUpdate(
        { _id, userId: user._id },
        { $set: { likeCount: newLikeCount } },
        { new: true }
      );
      console.log("🚀 ~ likeCountOnComment ~ updateData:", updateData);
      return updateData;
    }
  } catch (error) {
    console.log("🚀 ~ likeCountOnComment ~ error:", error);
  }
});