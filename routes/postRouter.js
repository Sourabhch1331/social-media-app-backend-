const express = require('express');
const authController = require('../controllers/authController');
const postController = require('../controllers/postController'); 
const uploadSingle = require('../utils/multerConfig');
const postRouter = express.Router();


postRouter.get('/getSamplePost',postController.getSamplePost);

postRouter.use(authController.protect);

// Create and Delete post routes
postRouter.post('/createPost',
    uploadSingle('photo'),
    postController.createPost
);

postRouter.delete('/deletePost/:postId',postController.deletePost);

// Like and comment routes
postRouter.post('/likePost/:postId',postController.likePost);
postRouter.post('/comment/:postId',postController.commentOnPost)

// Get post routes
postRouter.get('/getAllPost',postController.getAllPost);
postRouter.get('/getAllMyPost',postController.getMyPost);




module.exports=postRouter;