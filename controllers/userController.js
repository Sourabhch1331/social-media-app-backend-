const { filter } = require('compression');
const express = require('express');
const userModel = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');

const createFilterObj = (obj,...keep)=>{
    const filteredObj={};
    Object.entries(obj).forEach(el=>{
        if(keep.includes(el[0])) filteredObj[el[0]]=el[1];
    });
    return filteredObj;
};

exports.updateMe = catchAsync(async (req,res,next)=>{

    if(req.body.password || req.body.passwordConfirm){
        return next(Error('This route is not for password update!'));
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


exports.getAllUsers = async (req,res,next) => {
    const users = await userModel.find();

    res.status(200).json({
        status: 'success',
        data: users
    });
}
