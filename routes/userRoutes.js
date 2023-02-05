const express = require('express');
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');

const userRouter = express.Router();

userRouter.post('/signUp',authController.signUp);
userRouter.post('/login',authController.login);
userRouter.get('/logout',authController.logout);


userRouter.post('/forgotPassword',authController.forgotPassword);
userRouter.patch('/resetPassword/:token',authController.resetPassword);

// All the below routes are protected
userRouter.get('/',userController.getAllUsers);
userRouter.use(authController.protect);

userRouter.patch('/updateMe',userController.updateMe);
userRouter.patch('/updateMyPassword',authController.updatePassword);    // add photo upload functionalities


// following functionalities

userRouter.get('/follow/:userId',userController.follow);
userRouter.get('/unfollow/:userId',userController.unfollow);



module.exports= userRouter;