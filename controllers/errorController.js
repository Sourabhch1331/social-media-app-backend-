const AppError = require('../utils/appError');


const handleCasteErrorDB=(err)=>{
    const message=`Invalid ${err.path}: ${err.value}`;
    return new AppError(message,400);
};

const handleDuplicateErrorDB= (err)=>{
    const KeyValue=Object.entries(err.keyValue).join(' ');
    const message=`Duplicate value for field { ${KeyValue.split(',').join(':')} }, Please use another value`;

    return new AppError(message,400);
};

const handleValidationErrorDB = err =>{
    const errors=Object.entries(err.errors).map(el => el[1].properties.message);
   
    
    const message=`Ivalid input Data: ${errors.join('. ')}`;
    return new AppError(message,400);
};

const handleJsonWebTokenError= () => new AppError('Ivalid token, Please log in again',401);

const handleJsonWebTokenExpiredWrror= () => new AppError('Token has expired! Please login again.',401);


const sendErrorDev= (err,res)=>{
    res.status(err.statusCode).json({
        status: err.status,
        error:err,
        message: err.message,
        stack:err.stack
    });
};

const sendErrorProd = (err,res)=>{

    if(err.isOperational){
        return res.status(err.statusCode).json({
            status: err.status,
            message: err.message
        });
    }
    
    // 1) Log the error
    console.error('Error 💥',err);
    
    // 2) send generic error
    res.status(500).json({
        status: 'error',
        message: 'something went wrong!'
    });
}


module.exports=(err,req,res,next)=>{
    err.statusCode= err.statusCode || 500;
    err.status= err.status || 'err';
    


    if(process.env.NODE_ENV === 'production'){

        let error=Object.assign({},err);
        error.message=err.message;
        
        if(err.name === 'CastError') error=handleCasteErrorDB(error)
        if(err.code === 11000) error=handleDuplicateErrorDB(error);
        if(err._message === 'User validation failed') error=handleValidationErrorDB(error);
        if(err.name === 'JsonWebTokenError') error=handleJsonWebTokenError();
        if(err.name === 'TokenExpiredError') error=handleJsonWebTokenExpiredWrror();
        
        // console.log(error);
        sendErrorProd(error,res)
    }
    else{
        sendErrorDev(err,res);
    }
}




