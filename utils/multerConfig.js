const multer = require('multer');
const AppError = require('./appError');

const storage = multer.memoryStorage();

const upload = multer({ 
    storage,
    //accepting only jpg jpeg png files
    fileFilter: function (req, file, cb) {
        const fileRegex = new RegExp('\.(jpg|jpeg|png|JPG)$');
        const fileName = file.originalname;

        if (!fileName.match(fileRegex)) {
            //throw exception
            return cb(new AppError('Invalid file type',404));
        }
        //pass the file
        cb(null, true);
    }
});

module.exports = (name) => upload.single(name);