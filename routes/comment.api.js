const express = require('express');
const commentController = require('../controllers/comment.controller');
const authentication = require('../middlewares/authentication');
const validators = require('../middlewares/validators');
const { body, param } = require('express-validator');
const router = express.Router();

 router.post('/', 
 authentication.loginRequired,
 validators.validate([
    body("content", "missing content").exists().notEmpty(),
    body('postId', 'missing postId').exists().isString().custom(validators.checkObjectId)
]),
 commentController.createComment
 )

 router.put('/:id',
 authentication.loginRequired,
 validators.validate([
    body('content', 'missing content').exists().notEmpty(),
    param('id').exists().isString().custom(validators.checkObjectId)
 ]),
 commentController.updateComment
 )

 router.delete('/:id',
 authentication.loginRequired,
 validators.validate([
    param('id').exists().isString().custom(validators.checkObjectId)
 ]),
 commentController.deleteComment
 )

 router.get('/:id',
    authentication.loginRequired,
    validators.validate([param('id').exists().notEmpty().custom(validators.checkObjectId)]),
    commentController.getSingleComment
 )
module.exports = router