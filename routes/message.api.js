const express = require('express');
const authentication = require('../middlewares/authentication');
const mesgaeController = require('../controllers/message.controller');
const validators = require('../middlewares/validators');
const { body, param } = require('express-validator');
const router = express.Router();


router.post('/send', authentication.loginRequired, validators.validate([
    body("text", "missing text").exists().notEmpty(),
    body("receiverId").exists().isString().custom(validators.checkObjectId),
    body("chatId").exists().isString().custom(validators.checkObjectId)
  ]), mesgaeController.sendMessage)

router.get('/:chatId', authentication.loginRequired, validators.validate([
  param("chatId").exists().isString().custom(validators.checkObjectId),
]), mesgaeController.getMessage)

module.exports = router