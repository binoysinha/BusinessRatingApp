import express from 'express';
import path from 'path';
import open from 'open';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import ejs from 'ejs';
import engine from 'ejs-mate';
import session from 'express-session';
import expressValidator from 'express-validator';
import mongoose from 'mongoose';
import mongoStore from 'connect-mongo';
import passport from 'passport';
import flash from 'connect-flash';
import moment from 'moment';
import routes from './routes/index';
import userRoutes from './routes/user';
import companyRoutes from './routes/company';
import reviewRoutes from './routes/review';
import messageRoutes from './routes/message';

import './config/passport';
import './secret/secret';

const MongoStore = mongoStore(session);
const app = express();
const port = 3000;

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/ratingapp');

app.use(express.static(path.join(__dirname, 'public')));

app.engine('ejs', engine);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(cookieParser());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(expressValidator());
app.use(cookieParser());

app.use(session({
  secret: 'mysecret',
  resave: false,
  saveUninitialized: false,
  store: new MongoStore({
    mongooseConnection: mongoose.connection
  })
}));

app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

//app.use('/message', messageRoutes);
app.use('/user', userRoutes);
app.use('/company', companyRoutes);
app.use('/review', reviewRoutes);
app.use('/', routes);

app.locals.moment = moment;

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

app.listen(port, function (err) {
  if (err) {
    console.log(err);
  } else {
    open('http://localhost:' + port);
  }
});