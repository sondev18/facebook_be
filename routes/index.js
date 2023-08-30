var express = require('express');
var router = express.Router();

// authApi
const authApi = require('./auth.api')
router.use('/auth', authApi)

// userApi
const userApi = require('./user.api')
router.use('/users', userApi)

// postApi
const postApi = require('./post.api')
router.use('/posts', postApi)

// commentApi
const commentApi = require('./comment.api')
router.use('/comments', commentApi)

// reactionApi 
const reactionApi = require('./reaction.api')
router.use('/reactions', reactionApi)

// friendApi
const friendApi = require('./friend.api')
router.use('/friends', friendApi)

// chatApi
const chatApi = require('./chat.api')
router.use('/chat', chatApi)

// messageApi
const messageApi = require('./message.api')
router.use('/message', messageApi)


module.exports = router;
