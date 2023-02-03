const mongoose = require('mongoose');
const dotenv = require('dotenv');

process.on('uncaughtException', err => {
    console.log('UNHANDLED EXCEPTION!💥 Shutting down....')
    console.log(err.name,err.message);
    process.exit(1);
});

dotenv.config({path: './config.env'});

mongoose.set('strictQuery', true);

const DB=process.env.DATABASE;

mongoose.connect (DB,)
.then(con => console.log('Database connection successful'));

const app = require('./app.js');

const port = process.env.PORT || 3000;

const server = app.listen(port,()=>{
    console.log(`App running on the port ${port}`);
});
