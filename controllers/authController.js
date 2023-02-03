const {promisify} = require('util');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const UserModel = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const Email = require('../utils/email');



const signToken = (id)=>{
    return jwt.sign({id},process.env.JWT_SECRET,{
        expiresIn:process.env.JWT_EXPIRES_IN
    });
};

const createAndSendToken = (user,statusCode,res)=>{
    const token=signToken(user._id);
    const cookieOptions = {
        expires: new Date(Date.now()+process.env.JWT_COOKIE_EXPIRES_IN*24*60*60*1000),
        httpOnly: true
    };
    if(process.env.NODE_ENV === 'production') cookieOptions.secure = true;
    res.cookie('jwt',token,cookieOptions);
    user.password=undefined;
    
    res.status(statusCode).json({
        status: 'success',
        token,
        data: {
            user
        }
    });
};


exports.protect= catchAsync(async (req,res,next)=>{
    let token;
    // 1) Getting the Token and check if it's there
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
        token = req.headers.authorization.split(' ')[1];
    }
    else if(req.cookies && req.cookies.jwt){
        token=req.cookies.jwt;
    }

    if(!token){
        return next(Error('User not logged in!'));
    }

    // 2) Verification of Token
    const decoded= await promisify(jwt.verify)(token,process.env.JWT_SECRET);

    // 3) Check if user still exists
    const userId=decoded.id;
    const currUser= await UserModel.findById(userId);

    if(!currUser){
        return next(Error('User does no longer exist!'));
    }

    if(currUser.changedPasswordsAfter(decoded.iat)){
        return next(Error('Password changed! Please login again!'));
    }

    req.user=currUser;
    next();
});


exports.signUp = catchAsync(async (req,res,next)=>{
    const newUser = await UserModel.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm
    });

    createAndSendToken(newUser,201,res);
});

exports.login = catchAsync(async (req,res,next)=>{
    const {email,password} = req.body;
    // console.log(email);
    if(!email || !password) {
        next(Error('No email or password provided'));
    }

    const user = await UserModel.findOne({ email }).select('+password');

    if(!user || !await user.verifyPassword(password,user.password)) {
        return next(Error('wrong email or password'));
    }

    createAndSendToken(user,200,res);
});

exports.logout= (req,res)=>{
    res.clearCookie('jwt');
    res.status(200).json({status : 'succes'});
};


exports.updatePassword = catchAsync(async(req,res,next)=>{
    const {password,newPassword,newPasswordConfirm} = req.body;

    const user = await UserModel.findById(req.user.id).select('+password');
    
    if(!user){
        return next(Error('No user exist!'));
    }

    if(!user.verifyPassword(password,user.password)){
        return next(Error('Wrong password provided!'));
    }

    user.password=newPassword;
    user.passwordConfirm=newPasswordConfirm
    await user.save();

    createAndSendToken(user,200,res);

});

exports.forgotPassword = catchAsync(async (req,res,next)=>{
    const email = req.body.email;
    const user = await UserModel.findOne({email});
    if(!user) return next(Error('No user exist with provided email!'));

    const passwordResetToken = user.createPasswordResetToken();
    await user.save({validateBeforeSave:false});

    try{
        const resetUrl=`${req.protocol}://${req.get('host')}/api/v1/user/resetPassword/${passwordResetToken}`;
        const message=`To reset your password, click on the below link. You will be redirected to the reset page.Hurry up it expires in 10 minutes! \n ${resetUrl}`;
        await Email.sendForgetPasswordMail(email,resetUrl,message);

        res.status(200).json({
            status: 'success',
            data: `Email sent to ${email}. It expires in 10 mintues!`
        });
    }
    catch(err){
        user.passwordResetToken=undefined;
        user.passwordResetExpires=undefined;
        await user.save({validateBeforeSave:false});
        
        return next(Error('There was some problem sending email! Try again later.'));
    }

});

exports.resetPassword = catchAsync(async (req,res,next) => {
    
    // 1) Get user based on token
    const hashedToken = crypto  
        .createHash('sha256')
        .update(req.params.token)
        .digest('hex');

    const user = await UserModel.findOne({passwordResetToken: hashedToken,passwordResetExpires : {$gt:Date.now()}});
    
    // 2) If token has not expired, and there is user, set new password
    if(!user) return next(Error('Token is invalid or has expired'));
    
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken=undefined;
    user.passwordResetExpires=undefined;
    await user.save();

    // 3) Update changedPasswordAt proprty for the user
    // 4) Log the user in , send JWT
    createAndSendToken(user,200,res);
});

