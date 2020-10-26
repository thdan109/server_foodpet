require('dotenv').config()
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const mongoose = require('mongoose')
var multer = require('multer')
var indexRouter = require('./routes/index.route');
var usersRouter = require('./routes/users.route');
var productRouter = require('./routes/product.route');
var cartRouter = require('./routes/cart.route');

var cors = require('cors')
const bodyParser = require('body-parser');
const  PATH_TEST  = process.env.PATH_TEST

var app = express();

//connect database
mongoose.connect(PATH_TEST, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true 
},
(err)=>{
  (err)?
  console.log("fail connect DB",err):console.log("Connected to DB with port: "+ PATH_TEST)
})
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use(cors())
app.use(logger('dev'));
app.use(express.json());

app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.urlencoded({ extended: true}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads',express.static(path.join(__dirname, '/uploads')));
//multer setup

const upload = multer({dest:__dirname+"/uploads/images"});


app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/products', productRouter);
app.use('/carts', cartRouter);

app.use('/test', (res,req)=>{
    req.send({test1:"conga"})
});
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
