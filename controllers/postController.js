const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const postModel = require('../models/postModel');
const commentModel = require('../models/commentModel');
const userModel = require('../models/userModel');

exports.createPost = catchAsync(async (req,res,next)=>{
    const {caption,img} = req.body;
    const post = await postModel.create({
        caption,
        img,
        createdAt: new Date().toLocaleDateString(),
        user: req.user._id
    });

    res.status(201).json({
        status: 'success',
        data:{
            post
        }
    })
});

exports.deletePost = catchAsync(async (req,res,next)=>{

    const deletedPost=await postModel.deleteOne({
        $and:[
            {
                _id:{ $eq: req.params.postId }
            },
            {
                user:{ $eq: req.user._id }
            }
        ]
    });

    if(deletedPost.deletedCount === 0) return next(new AppError('post not found or you are not aloowrd to delete it.',400));


    res.status(200).json({
        status: 'success',
        message: 'Deleted!'
    });

});

exports.getAllPost = catchAsync(async (req,res,next)=>{
    // 1) Get curr logged in user
    const user = await userModel.findById({_id:req.user._id});
    if(!user) return next(new AppError('No User exist!',404));

    // 2) traverse all the user which curr user follow
    let posts=[];


    const allPostPromise=user.following.map(async (userId) =>{
        return await postModel.find({user:userId}).populate({
                path: 'user',
                select: 'id username photo'
            }).populate({
                path: 'comments.user',
                select: 'id username photo'
            });
    });
    
    const allPosts=await Promise.all(allPostPromise);   
    
    allPosts.forEach(post => posts.push(...post));

    res.status(200).json({
        status: 'success',
        results: posts ? posts.length:0,
        data:{
            posts
        }
    });

});

exports.getMyPost = catchAsync(async (req,res,next)=>{
    const myPosts = await postModel.find({user:req.user._id});

    res.status(200).json({
        status: 'success',
        results: myPosts ? myPosts.length:0,
        data:{
            myPosts
        }
    })
});

exports.commentOnPost = catchAsync(async (req,res,next)=>{
    const post = await postModel.findOne({_id:req.params.postId});

    if(!post) return next(new AppError('No post exist!',404));

    const createdComment = await commentModel.create({
        comment:req.body.comment,
        user:req.user._id
    });

    post.comments.push(createdComment);
    await post.save({runValidator:false});

    res.status(201).json({
        status: 'success',
        data:{
            message: 'Commented succssfully!',
            comment:createdComment
        }
    })
});

exports.likePost= catchAsync(async (req,res,next) => {
    const post = await postModel.findById({_id:req.params.postId});

    if(!post) return next(new AppError('No post exist!',404));

    post.likePost();

    post.save({runValidator:false});

    res.status(200).json({
        status: 'success',
        data:{
            message:'liked the post <3'
        }
    })

});