const { catchAsync, sendResponse } = require("../helpers/utils")
const Chat = require("../models/Chats")
const Message = require("../models/Message")
const User = require("../models/User")

const mesgaeController = {}

mesgaeController.sendMessage = catchAsync(async (req, res, next) => {
    const {receiverId, chatId , text } = req.body

    const chat = await Chat.findById(chatId);
    if (!chat)
    throw new AppError(400, "chat not found", "send message error");

    let message = await Message.create({
        chatId: chatId,
        receiverId: receiverId,
        text: text
    })

    return sendResponse(res, 200, true, message, null, "send message success");
})

mesgaeController.getMessage = catchAsync(async (req, res, next) => {
    const {chatId} = req.params
    const message = await Message.find({chatId})

    return sendResponse(res, 200, true, message, null, "get message success");
})

module.exports = mesgaeController