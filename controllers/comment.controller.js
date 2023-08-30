const { catchAsync, sendResponse, AppError } = require('../helpers/utils');
const Comment = require('../models/Comment');
const Post = require('../models/Post');

const commentController ={}; 
const caculateCommentCount = async (postId) => {
    const commentCount = await Comment.countDocuments({
      post: postId,
      isDeleted: false,
    });
    await Post.findByIdAndUpdate(postId, {commentCount});
  };

commentController.createComment = catchAsync(async (req, res, next) => {
    const currentUserId = req.userId;
    const {content, postId} = req.body

    const post = await Post.findById(postId);
    if(!post) throw new AppError(400, 'post not found', 'create comment error')

    let comment = await Comment.create({
        content,
        author: currentUserId,
        post: postId
    });

    await caculateCommentCount(postId);

    comment = await comment.populate('author');

    return sendResponse(res, 200, true, comment, null, 'create comment success')
})

commentController.updateComment = catchAsync(async (req, res, next) => {
    const currentUserId = req.userId;
    const {content} = req.body;
    const commentId = req.params.id

    const comment = await Comment.findByIdAndUpdate(
        {_id: commentId, author: currentUserId},
        {content},
        {new: true}
    )
    if(!comment) {
        throw new AppError(400, "comment not found or User not authorized", 'update comment error')
    }

     return sendResponse(res, 200, true, comment, null, "Update comment success")

})

commentController.deleteComment = catchAsync(async(req, res, next) => {
 const currentUserId = req.userId;
    const commentId = req.params.id

    const comment = await Comment.findByIdAndDelete(
        {_id: commentId, author: currentUserId},
    )
    if(!comment) {
        throw new AppError(400, "comment not found or User not authorized",  'delete comment error')
    }
    await caculateCommentCount(comment.post)
     return sendResponse(res, 200, true, comment, null, "Delete comment success")
})

commentController.getSingleComment = catchAsync(async(req, res, next) => {
    const commentId = req.params.id
    const currentUserId = req.userId

    let comment = await Comment.findById(commentId);
    if(!comment) throw new AppError(400, 'comment not found', 'Get single Comment error')

    return sendResponse(res, 200, true, comment, null, 'Get single comment success')
})
module.exports = commentController;