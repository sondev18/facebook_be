const express = require("express");
const authentication = require("../middlewares/authentication");
const chatController = require("../controllers/chat.controller");
const validators = require("../middlewares/validators");
const { body, param } = require("express-validator");
const router = express.Router();

router.post(
  "/request",
  authentication.loginRequired,
  validators.validate([
    body("toUserId").exists().isString().custom(validators.checkObjectId),
  ]),
  chatController.createChatsRequest
);

router.get(
  "/:userId",
  authentication.loginRequired,
  validators.validate([
    param("userId").exists().isString().custom(validators.checkObjectId),
  ]),
  chatController.findUserChats
);

module.exports = router;
