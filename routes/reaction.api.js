const express = require('express');
const authentication = require('../middlewares/authentication');
const validators = require('../middlewares/validators');
const { body } = require('express-validator');
const reactionController = require('../controllers/reaction.controller');
const router = express.Router();

router.post('/', authentication.loginRequired, validators.validate([
    body('targetType', 'Invalid targetType').exists().isIn(["Post","Comment"]),
    body('targetId', "Invalid TargetId").exists().custom(validators.checkObjectId),
    body('emoji', "Invalid emaoji").exists().isIn(["like","dislike"]),
]),reactionController.saveReaction
)

module.exports = router