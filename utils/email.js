const catchAsync = require('../utils/catchAsync');
const nodemailer = require('nodemailer');

exports.sendForgetPasswordMail = catchAsync(async (toEmail,url,message)=>{
    // send mail here!
    const from = `sourabhchprojects@gmail.com`;
    const subject='Passowrd Reset Token(valid for 10min).';

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: from,
            pass:  process.env.GMAIL_PASSWORD
        }
    });

    const mailOptions = {
        from,
        to: toEmail,
        subject,
        text:message
    }

    transporter.sendMail(mailOptions,(err,info)=>{
        if(err){
            console.log(err);
        }
    });
});
