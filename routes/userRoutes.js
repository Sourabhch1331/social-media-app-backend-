const express = require('express');
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');
const multer = require('multer');
const uploadSingle = require('../utils/multerConfig');

const userRouter = express.Router();

userRouter.post('/signUp',
    uploadSingle('photo'),
    authController.signUp
);

userRouter.post('/login',authController.login);
userRouter.get('/logout',authController.logout);


userRouter.post('/forgotPassword',authController.forgotPassword);
userRouter.patch('/resetPassword/:token',authController.resetPassword);

// All the below routes are protected
userRouter.get('/',userController.getAllUsers);
userRouter.use(authController.protect);

userRouter.patch('/updateMyPassword',authController.updatePassword);    // add photo upload functionalities

userRouter.route('/me') 
    .patch(uploadSingle('photo'),userController.updateMe)
    .delete(userController.deleteMe);

// following functionalities

userRouter.patch('/follow/:userId',userController.follow);
userRouter.patch('/unfollow/:userId',userController.unfollow);


module.exports= userRouter;