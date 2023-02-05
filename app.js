const express = require('express');
const compression = require('compression');
const path = require('path');
const morgan = require('morgan');
const cors = require('cors');

const userRoutes = require('./routes/userRoutes');
const postRouter = require('./routes/postRouter');

const globalErrorHandler = require('./controllers/errorController');

const app = express();

// serving files from public
app.use(express.static(path.join(__dirname, 'public')));  


// body parser
app.use(express.json());

// compressing data 
app.use(compression());

// Cors
app.use(cors());
app.options('*',cors());

if(process.env.Node_ENV === 'development'){
    app.use(morgan('dev'));
}

app.use('/api/v1/user',userRoutes);
app.use('/api/v1/post',postRouter);
app.use('/',(req,res)=>{
    res.send('hello from server');
});

app.use(globalErrorHandler);
module.exports=app;