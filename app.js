
const express = require('express');
const app = express();
require("dotenv").config()
const cors = require("cors")
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const {sendResponse} = require("./helpers/utils")
const { Server } = require("socket.io");

const io = new Server(5002, { cors: "http://localhost:3001" });

const indexRouter = require('./routes/index');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors())
app.use(express.static(path.join(__dirname, 'public')));

let onlineUsers = []

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
    console.log("meaa", message)
    const user = onlineUsers.find(user => user?.userId === message.recipientId)
    console.log(user,onlineUsers)
    if(user){
        io.to(user.socketId).emit("getMessage", message);
        io.to(user.socketId).emit("getNotification", {
          senderId: message.senderId,
          isRead:false,
          date: new Date()
        })
      }
  })
})

app.use('/api', indexRouter);

const mongoose = require('mongoose')
const mongoURI = process.env.MONGODB_URL;
mongoose
    .connect(mongoURI)
    .then(()=> console.log("DB connected"))
    .catch((err) => console.log(err))

// catch 404 and forard to error handler
app.use((req, res, next) => {
    const err = new Error("Not Found");
    err.statusCode = 404;
    next(err);
});

/* Initialize Error Handling */
app.use((err, req, res, next) => {
    console.log("ERROR", err);
    if(err.isOperational){
        return sendResponse(
            res,
            err.statusCode ? err.statusCode : 500,
            false,
            null,
            {message: err.message},
            err.errorType
        )
    }else {
        return sendResponse(
            res,
            err.statusCode ? err.statusCode : 500,
            false,
            null,
            { message: err.message },
            err.isOperational ? err.errorType : "Internal Server Error"
        );
    }
});  
module.exports = app;
