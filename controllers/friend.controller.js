const { catchAsync, sendResponse, AppError } = require("../helpers/utils");
const Friend = require("../models/Friend");
const User = require("../models/User");

const friendController = {};

const caculateFriendCount = async (userId) => {
  const friendCount = await Friend.countDocuments({
    $or: [{ from: userId }, { to: userId }],
    status: "accepted",
  });
  await User.findByIdAndUpdate(userId, { friendCount: friendCount });
};

friendController.sendFriendRequest = catchAsync(async (req, res, next) => {
  const currentUserId = req.userId;
  const toUserId = req.body.to;

  const user = await User.findById(toUserId);
  if (!user)
    throw new AppError(400, "user not found", "send firend user error");

  let friend = await Friend.findOne({
    $or: [
      { from: currentUserId, to: toUserId },
      { from: toUserId, to: currentUserId },
    ],
  });

  if (!friend) {
    friend = await Friend.create({
      from: currentUserId,
      to: toUserId,
      status: "pending",
    });
  } else {
    switch (friend.status) {
      case "pending":
        if (friend.from.equals(currentUserId)) {
          throw new AppError(
            400,
            "You have already sent a requests to this user",
            "Add friend error"
          );
        } else {
          throw new AppError(400, "You have receiced a from this user", "");
        }
      case "accepted":
        throw new AppError(400, "User are already friend", "add friend error");
      case "declined":
        friend.from = currentUserId;
        friend.to = toUserId;
        friend.status = "pending";
        await friend.save();
        return sendResponse(res, 200, true, friend, null, "add friend success");
      default:
        throw new AppError(400, "friend status undefined", "add friend error");
    }
  }

  return sendResponse(res, 200, true, friend, null, "add friend success");
});

friendController.getReceiveFriendRequestList = catchAsync(
  async (req, res, next) => {}
);

friendController.getSentFriendRequestList = catchAsync(
  async (req, res, next) => {}
);

friendController.getFriendList = catchAsync(async (req, res, next) => {
  let { page, limit, ...filter } = { ...req.query };
  const currentUserId = req.userId;
  let friendList = await Friend.find({
    $or: [{ from: currentUserId }, { to: currentUserId }],
    status: "accepted",
  });
  const friendIDs = friendList.map((friend) => {
    if (friend.from._id.equals(currentUserId)) return friend.to;
    return friend.from;
  });
  console.log(friendIDs);
  const filterConditions = [{ _id: { $in: friendIDs } }];
  console.log(filterConditions);
  if (filter.name) {
    filterConditions.push({
      ["name"]: { $regex: filter.name, $options: "i" },
    });
  }
  const filterCriteria = filterConditions.length
    ? { $and: filterConditions }
    : {};
  console.log(filterCriteria);
  page = parseInt(page) || 1;
  limit = parseInt(limit) || 10;
  const count = await User.countDocuments(filterCriteria);
  const totalPages = Math.ceil(count / limit);
  const offset = limit * (page - 1);
  const users = await User.find(filterCriteria)
    .sort({ createdAt: -1 })
    .skip(offset)
    .limit(limit);
  const userWithFriendship = users.map((user) => {
    let temp = user.toJSON();
    temp.friendShip = friendList.find((friendship) => {
      if (friendship.from.equals(user._id) || friendship.to.equals(user._id)) {
        return { status: friendship.status };
      }
      return false;
    });
    return temp;
  });
  return sendResponse(
    res,
    200,
    true,
    { totalPages, count, users: userWithFriendship },
    null,
    "get list friend success"
  );
});

friendController.reactFriendRequest = catchAsync(async (req, res, next) => {
  const currentUserId = req.userId; // to
  const fromUserId = req.params.userId; // from
  const { status } = req.body;

  let friend = await Friend.findOne({
    from: fromUserId,
    to: currentUserId,
    status: "pending",
  });
  if (!friend) {
    throw new AppError(400, "friend request not found", "friend request error");
  }
  friend.status = status;
  await friend.save();
  if (status === "accepted") {
    await caculateFriendCount(currentUserId);
    await caculateFriendCount(fromUserId);
  }
  return sendResponse(
    res,
    200,
    true,
    friend,
    null,
    "React friend request success"
  );
});

friendController.cancelFriendRequest = catchAsync(async (req, res, next) => {
  const currentUserId = req.userId;
  const toUserId = req.params.userId;

  let friend = await Friend.findOne({
    from: currentUserId,
    to: toUserId,
    status: "pending",
  });
  if (!friend) {
    throw new AppError(400, "friend request not found", "cancel request error");
  }

  friend = await Friend.findByIdAndDelete(friend._id);
  return sendResponse(
    res,
    200,
    true,
    friend,
    null,
    "Friend request has been cancelled"
  );
});

friendController.removeFriendRequest = catchAsync(async (req, res, next) => {
  const currentUserId = req.userId;
  const friendId = req.params.userId;
  console.log(currentUserId, friendId);
  let friend = await Friend.findOne({
    $or: [
      { from: currentUserId, to: friendId },
      { from: friendId, to: currentUserId },
    ],
    status: "accepted",
  });
  if (!friend) {
    throw new AppError(400, "friend not found", "remove friend error");
  }

  friend = await Friend.findByIdAndDelete(friend._id);

  return sendResponse(res, 200, true, friend, null, "remove friend success");
});

module.exports = friendController;
