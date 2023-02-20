const cloudinary = require('cloudinary').v2;
const sharp = require('sharp');

const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const postModel = require('../models/postModel');
const commentModel = require('../models/commentModel');
const userModel = require('../models/userModel');


// Cloudinary config
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET
});

const uploadStream = (fileStream, name) => {
    return new Promise((resolve, reject) => {        
        cloudinary.uploader.upload_stream({ public_id: name }, (error, result) => {
            if (error) {
                reject(error);
            } else {
                resolve(result);
            }
        }).end(fileStream)
    });
};

exports.createPost = catchAsync(async (req,res,next)=>{
    // img uploading

    if(!req.file) return next('No file exist or file size too big!',400);

    const imageSream = await sharp(req.file.buffer).resize({height: 1920 , width: 1080 , fit: "contain"}).toBuffer();
    const imageName = `${req.user.email}-${Date.now()}`;

    const uploadResult = await uploadStream(imageSream, imageName);

    const {caption} = req.body;
    const post = await postModel.create({
        caption,
        photo: uploadResult.url,
        imgName:imageName,
        createdAt: new Date().toLocaleDateString(),
        user: req.user._id,
        isSample: (req.body.isSample ? req.body.isSample:false)
    });

    res.status(201).json({
        status: 'success',
        data:{
            post
        }
    })
});

exports.deletePost = catchAsync(async (req,res,next)=>{

    const deletedPost=await postModel.findOneAndDelete({
        $and:[
            {
                _id:{ $eq: req.params.postId }
            },
            {
                user:{ $eq: req.user._id }
            }
        ]
    });

    if(!deletedPost) return next(new AppError('post not found or you are not allowed to delete it.',400));

    await cloudinary.uploader.destroy(deletedPost.imgName, (err,result)=>{
        if(err) next(new AppError('Unable to delte',500));
    });

    res.status(200).json({
        status: 'success',
        message: 'Deleted!'
    });

});

exports.getSamplePost = catchAsync(async (req, res,next) => {
    const post = await postModel.find({isSample: true});

    res.status(200).json({
        status: 'success',
        data: {
            post
        }
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