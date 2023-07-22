const express = require('express');
const authController = require('../controllers/authController');
const postController = require('../controllers/postController'); 
const uploadSingle = require('../utils/multerConfig');


const postRouter = express.Router();


postRouter.get('/getSamplePost',postController.getSamplePost);

postRouter.use(authController.protect);


// getAllPost
postRouter.get('/',postController.getAllPost);



// Create and Delete post routes
postRouter.post('/',
    uploadSingle('photo'),
    postController.createPost
);

postRouter.delete('/:postId',postController.deletePost);

// Like and comment routes
postRouter.post('/likePost/:postId',postController.likePost);
postRouter.post('/comment/:postId',postController.commentOnPost)

// Get post routes
postRouter.get('/getAllMyPost',postController.getMyPost);




module.exports=postRouter;