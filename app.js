var express = require('express');

var logger = require('morgan');

var bodyParser = require('body-parser');
var session = require('express-session');
var passport = require('passport');
require('./config/passport')(passport);


var redis = require('redis');
var redisClient = redis.createClient({ host: 'localhost', port: 6379});
var redisStore = require('connect-redis')(session);
var app = express();


var sessionMiddleware = session({
    name: "custom_session_cookie_name",
    store: new redisStore({client: redisClient}),
    secret: "random-key",
    resave: false,
    saveUninitialized: true
});

app.use(sessionMiddleware);

app.use(passport.initialize());
app.use(passport.session());

function isLoggedIn(req, res, next) {
    //console.log(req)
    if (req.isAuthenticated()) {
        return next();
    }
    return res.status(401).send({status: 401, message: "You must be logged in."})
}

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));


app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Allow-Origin", "http://localhost:3000");
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Authorization, Accept");
    res.header('Cache-Control', 'no-store, no-cache');

    // intercept OPTIONS method
    if ('OPTIONS' == req.method) {
        res.send(200);
    }
    else {
        next();
    }
});

//import route files here
var auth = require('./routes/auth')(passport);
var cars = require('./routes/cars');
//set the routes
app.use('/auth', auth); //routes that are exposed
app.use('/cars', isLoggedIn, cars);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    res.status(404).send({status: 404, message: "Route not found!"});
    //next(err);
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    if(err == "invalid session, please login again") {
        req.logOut()
    }
    res.status(500).send({status: 500, message: "Server Error!", err: err });
    console.log(err);
});

module.exports = app;
