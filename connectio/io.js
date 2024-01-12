let onlineUsers = []
module.exports = function connectIO(io){
    io.on("connection", (socket) => {
        socket.on("addNewUser", (userId)=> {
            !onlineUsers.some(user => user.userId === userId) && userId !== null &&
            onlineUsers.push({
                userId,
                socketId: socket.id
            })
            io.emit("getOnlineUsers", onlineUsers)
        })
        // remove user
      socket.on("removeUser", (userId) => {
        onlineUsers = onlineUsers.filter(user => user.userId !== userId)
      })
      
      // add messages 
      socket.on("sendMessage", (message) => {
        const user = onlineUsers.find(user => user?.userId === message.receiverId)
        if(user){
            io.to(user.socketId).emit("getMessage", message);
            io.to(user.socketId).emit("getNotification", {
                recipientId: message.recipientId,
              isRead:false,
              date: new Date()
            })
          }
      })
    })
}