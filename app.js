var express = require('express');
var cookieParser = require('cookie-parser');
var expressValidator = require('express-validator');
var session = require('express-session');
var flash = require('connect-flash');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var path = require('path');
var bodyParser = require('body-parser');
var index = require('./routes/index');
var bcrypt= require('bcrypt');
var exphbs = require('express-handlebars');
var db= require('./db')
var app = express();

app.set('views', path.join(__dirname, 'views'));
app.engine('handlebars', exphbs({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static(path.join(__dirname, 'public')));

app.use(cookieParser());
app.use(session({
    secret: "dsdsadsads",
    saveUninitialized: false,
    resave: false
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(expressValidator({
    errorFormatter: function (param, msg, value) {
        var namespace = param.split('.')
            , root = namespace.shift()
            , formParam = root;

        while (namespace.length) {
            formParam += '[' + namespace.shift() + ']';
        }
        return {
            param: formParam,
            msg: msg,
            value: value
        };
    }
}));

app.use(flash());
app.use(function (req, res, next) {

    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    res.locals.admin = req.admin || null;
    next();
});

app.use(function(req, res,next){
    res.locals.isAuthenticated = req.isAuthenticated();
    next();
})

app.use('/', index);

passport.use(new LocalStrategy(
    function (username, password, done) {
        // console.log(username);
        // console.log(password);
        db.query('SELECT password from users WHERE username=?',[username], function(error,results,fields){
            if (error) {
                done(error);

            }
            if(results.length === 0){
                done(null, false);   
            }

            else{
            const hash= results[0].password.toString();
                bcrypt.compare(password, hash, function(error, response){
                    if(response===true)
                        {
                            return done(null,{id: 22});
                        }
                        else
                            return done(null,false);
                
                
        });
            }
    })
    }
));


app.set('port', (process.env.PORT || 3000));

app.listen(app.get('port'), function () {
    console.log("Server has started on PORT" + app.get('port'));
});

