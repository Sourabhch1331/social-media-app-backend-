const express = require('express');
const authController = require('../controllers/authController');
const postController = require('../controllers/postController');

const postRouter = express.Router();


postRouter.use(authController.protect);


postRouter.post('/likePost/:postId',postController.likePost);
postRouter.post('/createPost',postController.createPost);
postRouter.post('/comment/:postId',postController.commentOnPost)

postRouter.get('/getAllPost',postController.getAllPost);
postRouter.get('/getAllMyPost',postController.getMyPost);

postRouter.delete('/deletePost/:postId',postController.deletePost);



module.exports=postRouter;