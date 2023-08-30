const express = require("express");
const authentication = require("../middlewares/authentication");
const postController = require("../controllers/post.controller");
const validators = require("../middlewares/validators");
const { body, param } = require("express-validator");
const router = express.Router();

router.post(
  "/",
  authentication.loginRequired,
  validators.validate([body("content", "missing content").exists().notEmpty()]),
  postController.createPost
);

router.put('/:id', 
authentication.loginRequired,
validators.validate([param('id').exists().isString().custom(validators.checkObjectId)]),
postController.updatePost
)

router.get('/:id',
authentication.loginRequired,
validators.validate([param('id').exists().isString().custom(validators.checkObjectId)]),
postController.getSinglePost
)

router.get('/user/:userId',
authentication.loginRequired,
validators.validate([param('userId').exists().isString().custom(validators.checkObjectId)]),
postController.getAllPost
)

router.delete('/:id',
authentication.loginRequired,
validators.validate([param('id').exists().isString().custom(validators.checkObjectId)]),
postController.deletePost
)

router.get('/:id/comments',
authentication.loginRequired,
validators.validate([param('id').exists().isString().custom(validators.checkObjectId)]),
postController.getCommentOfPost
)
module.exports = router;
