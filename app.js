const express = require('express');
const compression = require('compression');
const path = require('path');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const cookieParser = require('cookie-parser');

const AppError = require('./utils/appError');
const userRoutes = require('./routes/userRoutes');
const postRouter = require('./routes/postRouter');

const globalErrorHandler = require('./controllers/errorController');

const app = express();

// serving files from public
app.use(express.static(path.join(__dirname, 'public')));  

// Set Security http headers
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'", 'http://127.0.0.1:3000/*'],
      baseUri: ["'self'"],
      fontSrc: ["'self'", 'https:', 'data:'],
      scriptSrc: ["'self'", 'https://*.cloudflare.com' ],
      scriptSrc: ["'self'", 'https://*.stripe.com', 'https://cdnjs.cloudflare.com/ajax/libs/axios/0.18.0/axios.min.js'],
      frameSrc: ["'self'", 'https://*.stripe.com'],
      objectSrc: ["'none'"],
      styleSrc: ["'self'", 'https:', 'unsafe-inline'],
      upgradeInsecureRequests: [],
    },
  })
); 


// body parser
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({extended: true}));

// Data Sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data Sanitization against XSS
app.use(xss());

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


app.all('*',(req,res,next)=>{
    next(new AppError(`Can't find ${req.originalUrl} on this server!`,404));
});

app.use(globalErrorHandler);
module.exports=app;
