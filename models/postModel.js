const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    comment:{
        type: String,
        required: true
    },
    user:{
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true,'comment must belong to a User.']
    }
});

const postSchema = new mongoose.Schema({
    caption:{
        type: String,
        default: ""
    },
    photo:{
        type: String,
        required: [true,'A post must have a img']
    },
    imgName:{
        type: String,
        required: true
    },
    isSample: {
        type: Boolean,
        default: false
    },
    createdAt:Date,
    likes:{
        type: Number,
        default: 0
    },
    comments:[commentSchema],
    user:{
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    }
});



// postSchema.pre(/^find/,function(next){
//     this.populate({
//         path: 'user',
//         select: 'username photo'
//     });
//     next();
// });
// postSchema.pre(/^find/,function(next){
//     this.populate({
//         path: 'comments',
//         select: 'comment'
//     });
//     next();
// });

postSchema.methods.likePost= function(){
    this.likes++;
    return;
}

const PostModel = mongoose.model('Post',postSchema);

module.exports = PostModel;