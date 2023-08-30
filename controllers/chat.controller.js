const { catchAsync, sendResponse, AppError } = require("../helpers/utils");
const Chat = require("../models/Chats");
const Friend = require("../models/Friend");
const User = require("../models/User");

const chatController = {}

chatController.createChatsRequest = catchAsync(async (req, res, next) => {
    const currentUserId = req.userId
    const {toUserId} = req.body;
    const user = await User.findById(toUserId)
    if(!user) {
        throw new AppError(400, "User not found", "create chat user error");
    }
    let friend = await Friend.findOne({
        $or: [
            { from: currentUserId, to: toUserId },
            { from: toUserId, to: currentUserId },
          ]
    })
    if (!friend) {
        throw new AppError(400, "friend not found", "please send to friend")
    }
    let chat = await Chat.findOne({
        $or: [
            { from: currentUserId, to: toUserId },
            { from: toUserId, to: currentUserId },
          ],
    })
    if(!chat){
        chat = await Chat.create({from: currentUserId, to: toUserId})
    }
    
    return sendResponse(res, 200, true, chat, null, "create Chat success");
})

chatController.findUserChats= catchAsync(async (req, res, next) => {
    const userId = req.params.userId
    let chat = await Chat.findOne({ $or: [{from: userId}, {to: userId}]})

    return sendResponse(res, 200, true, chat, null, "get current Chat success");
    console.log(chat)
})

module.exports = chatController