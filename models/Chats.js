const mongoose = require('mongoose')
const Schema = mongoose.Schema;


const chatSchema = Schema(
    {
        from: { type: Schema.ObjectId, required: true, ref: "User" },
        to: { type: Schema.ObjectId, required: true, ref: "User" },
        status: {
          type: String,
          enum: ["pending", "accepted", "declined"],
        },
      },
      {
        timestamps: true,
      }
)

const Chat = mongoose.model("Chat", chatSchema);
module.exports = Chat;