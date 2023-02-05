const mongoose = require('mongoose');


const commentSchema = new mongoose.Schema({
    comment:{
        type: String,
        required: true
    },
    user:{
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true,'Review must belong to a User.']
    }
});


module.exports = mongoose.model('Comment',commentSchema);

