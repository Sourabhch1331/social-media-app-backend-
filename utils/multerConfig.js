const multer = require('multer');

const storage = multer.memoryStorage();

const upload = multer({ 
    storage,
    //accepting only jpg jpeg png files
    fileFilter: function (req, file, cb) {
        console.log('here');
        const fileRegex = new RegExp('\.(jpg|jpeg|png)$');
        const fileName = file.originalname;

        if (!fileName.match(fileRegex)) {
            //throw exception
            return cb(new Error('Invalid file type'));
        }
        //pass the file
        cb(null, true);
    }
});

module.exports = (name) => upload.single(name);