const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const messageSchema = Schema(
  {
    chatId: { type: Schema.ObjectId, require: true, ref: "User" },
    receiverId: { type: Schema.ObjectId, require: true, ref: "User" },
    text: {type:String, require:true}
  },
  { timestamps: true }
);

const Message = mongoose.model("Message", messageSchema);
module.exports = Message;
