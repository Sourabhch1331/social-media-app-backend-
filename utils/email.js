const catchAsync = require('../utils/catchAsync');
const nodemailer = require('nodemailer');

module.exports = class Email{
    constructor(toEmail,subject,message){
        this.toEmail = toEmail;
        this.subject = subject;
        this.message = message;
        this.from = process.env.FROM_EMAIL;
    }

    send(){
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: this.from,
                pass:  process.env.GMAIL_PASSWORD
            }
        });
    
        const mailOptions = {
            from:this.from,
            to: this.toEmail,
            subject:this.subject,
            text:this.message
        }
    
        transporter.sendMail(mailOptions,(err,info)=>{
            if(err){
                console.log(err);
            }
        });
    }

}

