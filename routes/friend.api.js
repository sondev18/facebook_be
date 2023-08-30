const express = require('express')
const router = express.Router();
const authentication = require("../middlewares/authentication");
const validators = require("../middlewares/validators");
const { body, param } = require("express-validator");
const friendController = require('../controllers/friend.controller');

router.post('/requests', authentication.loginRequired,
validators.validate([
    body('to').exists().isString().custom(validators.checkObjectId)
]),
friendController.sendFriendRequest
)

router.get('/requests/incoming',
authentication.loginRequired,
friendController.getReceiveFriendRequestList
)

router.get('/requests/outgoing',
authentication.loginRequired,
friendController.getSentFriendRequestList
)

router.get('/friend',
authentication.loginRequired,
friendController.getFriendList
)

router.put('/requests/:userId', 
authentication.loginRequired,
validators.validate([
    param('userId').exists().isString().custom(validators.checkObjectId),
    body('status').exists().isString().isIn(['accepted', 'declined'])
]),
friendController.reactFriendRequest
)

router.delete('/requests/:userId',
authentication.loginRequired,
validators.validate([
    param('userId').exists().isString().custom(validators.checkObjectId)
]),
friendController.cancelFriendRequest
)


router.delete('/:userId',
authentication.loginRequired,
validators.validate([
    param('userId').exists().isString().custom(validators.checkObjectId)
]),
friendController.removeFriendRequest
)
module.exports = router