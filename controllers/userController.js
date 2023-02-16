const { filter } = require('compression');
const express = require('express');
const userModel = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const cloudinary = require('cloudinary').v2;
const AppError = require('../utils/appError');


cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET
});

const createFilterObj = (obj,...keep)=>{
    const filteredObj={};
    Object.entries(obj).forEach(el=>{
        if(keep.includes(el[0])) filteredObj[el[0]]=el[1];
    });
    return filteredObj;
};

exports.updateMe = catchAsync(async (req,res,next)=>{

    if(req.body.password || req.body.passwordConfirm){
        return next(new AppError('This route is not for password update!',400));
    }
    const filterObj = createFilterObj(req.body,'name','email');

    const updatedUser = await userModel.findByIdAndUpdate(req.user.id,filterObj,{
        new:true,runValidators:true
    });
    
    res.status(200).json({
        status: 'success',
        data: updatedUser
    })

});


const deleteImage = (imageName)=>{
    return new Promise((resolve,reject)=>{
        cloudinary.uploader.destroy(imageName, function(error,result) {
            if(error) reject(error);
            else resolve(result);
        });
    });
}

exports.deleteMe = catchAsync(async (req,res,next)=>{
    const deletedUser=await userModel.findByIdAndDelete(req.user._id);
    console.log(deletedUser);

    await deleteImage(req.user.imageName);
    
    res.status(200).json({
        status: 'success',
        message: 'User deleted successfully!'
    });
});


exports.getAllUsers = async (req,res,next) => {
    const users = await userModel.find();
    res.status(200).json({
        status: 'success',
        data: users
    });
}


exports.follow = catchAsync(async (req,res,next)=> {
    const currUser = await userModel.findById(req.user._id);

    if(!currUser) return next(new AppError('user do not exist',400));

    currUser.following.push(req.params.userId);
    await currUser.save({runValidators: false});

    res.status(200).json({
        status: 'success',
        message: 'Followed succesfully!'
    })
})
exports.unfollow = catchAsync(async (req,res,next)=> {
    const currUser = await userModel.findById(req.user._id);

    if(!currUser) return next(new AppError('user do not exist',400));
    
    currUser.following = currUser.following.filter( id => (id!=req.params.userId));

    await currUser.save({runValidators: false});

    res.status(200).json({
        status: 'success',
        message: 'removed from following'
    })
})