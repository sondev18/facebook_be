const mongoose  = require("mongoose");
const { catchAsync, sendResponse, AppError } = require("../helpers/utils");
const Reaction = require("../models/Reaction")

const reactionController ={};
const calculateReactions = async (targetId, targetType) => {
    const stats = await Reaction.aggregate([
        {
            $match:{targetId: new mongoose.Types.ObjectId(targetId)}
        },
        {
            $group:{
                _id:'$targetId',
                like: {
                    $sum:{
                        $cond:[{$eq: ["$emoji", "like"]}, 1, 0]
                    }
                },
                dislike: {
                    $sum:{
                        $cond:[{$eq: ["$emoji", "dislike"]}, 1 , 0]
                    },
                },
            },
        },
    ]);

    const reactions = {
        like: stats[0] && stats[0].like || 0,
        dislike: stats[0] && stats[0].dislike || 0
    }
    await mongoose.model(targetType).findByIdAndUpdate(targetId, {reactions: reactions})
    return stats;
} 

reactionController.saveReaction = catchAsync(async(req, res, next) => {
    const  {targetId, targetType, emoji} = req.body;
    const currentUserId = req.userId;

    const targetObj = await mongoose.model(targetType).findById(targetId);
    if(!targetObj){
        throw new AppError(400, `${targetType} not found`, 'create action error')
    }

    let reaction = await Reaction.findOne({
        targetId, 
        targetType, 
        author: currentUserId,
    });
    
    if(!reaction) {
      reaction =  await Reaction.create({
            targetType, targetId, author: currentUserId, emoji
        })
    }else {
        if(reaction.emoji === emoji) {
          reaction = await Reaction.findByIdAndDelete(reaction._id)
        }else{
            reaction.emoji = emoji;
           reaction = await Reaction.findByIdAndUpdate(reaction._id, {emoji: emoji})
        }
    }

    const reactions = await calculateReactions(targetId, targetType)

    return sendResponse(res, 200, true, reactions, null, 'save reaction success')
})

module.exports = reactionController