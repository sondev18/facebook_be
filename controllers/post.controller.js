 const { catchAsync, sendResponse, AppError } = require("../helpers/utils");
const Post = require("../models/Post");
const User = require("../models/User");
const Comment = require("../models/Comment");
const Friend = require("../models/Friend");

const postController = {};
const caculatePostCount = async (userId) => {
  const postCount = await Post.countDocuments({
    author: userId,
    isDeleted: false,
  });
  await User.findByIdAndUpdate(userId, { postCount: postCount });
};

postController.createPost = catchAsync(async (req, res, next) => {
  const currentId = req.userId;
  const { content, image } = req.body;

  let post = await Post.create({ content, image, author: currentId });
  await caculatePostCount(currentId);
  post = await post.populate("author");

  return sendResponse(res, 200, true, post, null, "create new post success");
});

postController.getSinglePost = catchAsync(async (req, res, next) => {
  const currentUserId = req.userId;
  const postId = req.params.id;

  let post = await Post.findById(postId);
  if (!post) throw new AppError(400, "Post not Found", "get single post error");
  post = await post.populate("author");
  post = post.toJSON();
  let comment = await Comment.find({ post: post._id }).populate("author");
  post.comments = comment;

  return sendResponse(res, 200, true, post, null, "get single post success");
});

postController.updatePost = catchAsync(async (req, res, next) => {
  const currentUserId = req.userId;
  const postId = req.params.id;

  let post = await Post.findById(postId);
  if (!post) throw new AppError(400, "Post not Found", "update post error");
  if (!post.author.equals(currentUserId)) {
    throw new AppError(400, "only author can edit post", "update post error");
  }

  const allows = ["content", "image"];
  allows.forEach((field) => {
    if (req.body[field] !== undefined) {
      post[field] = req.body[field];
    }
  });
  await Post.create(post);
  post = await post.populate("author");

  return sendResponse(res, 200, true, post, null, "Update user success");
});

postController.getAllPost = catchAsync(async (req, res, next) => {
  const currentUserId = req.userId;
  const userId = req.params.userId;
  let { page, limit, ...filter } = req.body;
  let user = await User.findById(currentUserId);
  if (!user) throw new AppError(400, "User not Found", "Get posts error");

  page = parseInt(page) || 1;
  limit = parseInt(limit) || 3;

  let userFriendIds = await Friend.find({
    $or:[{from:userId}, {to: userId}],
    status: 'accepted'
  })

  if(userFriendIds && userFriendIds.length){
    userFriendIds = userFriendIds.map((friend) => {
        if(friend.from._id.equals(userId)) return friend.to;
        return friend.from
    })
  }else {
    userFriendIds = []
  }
  userFriendIds = [...userFriendIds, userId]
  const filterConditions = [{ isDeleted: false }, { author: {$in: userFriendIds} }];
  const filterCriteria = filterConditions.length
    ? { $and: filterConditions }
    : {};
  const count = await Post.countDocuments(filterCriteria);

  const totalPages = Math.ceil(count / limit);
  const offset = limit * (page - 1);
  let posts = await Post.find(filterCriteria)
    .sort({ createdAt: -1 })
    .skip(offset)
    .limit(limit)
    .populate("author");
  return sendResponse(
    res,
    200,
    true,
    { posts, totalPages, count },
    null,
    "get all post success"
  );
});

postController.deletePost = catchAsync(async (req, res, next) => {
    const currentUserId = req.userId;
    const postId = req.params.id;
    let post = await Post.findById(postId);
    if (!post) throw new AppError(400, "Post not Found", "delete post error");
    if (!post.author.equals(currentUserId)) {
        throw new AppError(400, "only author can edit post", "delete post error");
      }
    post = await Post.findByIdAndUpdate(
        {_id: postId, author: currentUserId},
        {isDeleted: true},
        {new: true}
    )
    if(!post)  throw new AppError(400, "post not found or user not authorized", "delete post error");

    await caculatePostCount(currentUserId);
    return sendResponse(res, 200, true, post, null, 'delete post success')
});

postController.getCommentOfPost = catchAsync(async(req, res, next) => {
    const postId = req.params.id;
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 5

    const post = Post.findById(postId);
    if(!post) {
        throw new AppError(400, 'Post not found', 'get Comment Error');
    };
    const count = await Comment.countDocuments({post: postId});
    const totalPages = Math.ceil(count / limit);
    const offset = limit * (page - 1)

    const comment = await Comment.find({post:postId}).sort({createdAt : -1}).limit(limit).skip(offset).populate('author')

    return sendResponse(res, 200, true, {comment, totalPages, count}, null, 'get comment success');
})
module.exports = postController;
