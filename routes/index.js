var express = require('express');
var router = express.Router();
// var users = require('./users');
var passport= require('passport');

var bcrypt= require('bcrypt');
const saltRounds= 10;
const db = require('../db.js');
/* GET home page. */
router.get('/addBook', function (req, res, next) {
  res.render('book');
});

router.post('/addBook', function (req, res, next) {
  var bnum = req.body.bnum;
  var bname = req.body.bname;
  req.checkBody('bnum', 'Number is required').notEmpty();
  req.checkBody('bname', 'Name is required').notEmpty();



  db.query('INSERT INTO books (Book_Number, Book_Name) VALUES (?,?)', [bnum, bname], function (
    errors, results, fields) {

    if (errors) {
      console.log(errors);
      if (errors.errno == 1062) {
        res.render('book', {
          errors: "Something went wrong!"
        });
      }
  
    }

    else
      res.render('book',{success_msg:"Successfully Added!"});
  }
  );

});

// router.use('/users', users);


router.get('/displayAll', function (req, res, next) {
  db.query('SELECT * FROM books', function (
    error, results, fields) {
    if (error) throw error;
    else {
      jsonResult = JSON.parse(JSON.stringify(results));
      console.log(jsonResult);


      res.render('bookList', { results: jsonResult });
    }
  }
  );

});


//Register
router.post('/register', function (req, res) {
  var name = req.body.name;
  var username1 = req.body.username1;
  var email = req.body.email;
  var password1 = req.body.password1;
  var ConPassword1 = req.body.ConPassword1;

  console.log(name);
  //validation  

  req.checkBody('name', 'Name is required').notEmpty();
  req.checkBody('username1', 'Username is required').notEmpty();
  req.checkBody('email', 'EmailID is required').notEmpty();
  req.checkBody('email', 'Email is invalid').isEmail();
  req.checkBody('password1', 'Password is required').notEmpty();
  req.checkBody('ConPassword1', 'Passwords should match').equals(password1);


  var errors = req.validationErrors();
  if (errors) {
    res.render('register', {
      errors: errors
    });
  }
  else {

    bcrypt.hash(password1, saltRounds, function(err,hash){
      db.query('INSERT INTO users (name, username, email, password) VALUES (?,?,?,?)', [name, username1, email, hash], function (
      error, results, fields) {
      if (error) throw error;
 
        res.render('login', {success_msg: "Successfully Registered"});

    
  })

});
   }
   

    });

router.get('/register', function (req, res) {
  res.render('register');
});


router.post('/',  passport.authenticate('local', { successRedirect: '/addBook', failureRedirect: '/'}));

router.get('/logout', function (req, res) {
  req.logout();
  req.session.destroy();
  res.redirect('/');
});

router.get('/', function (req, res) {
  res.render('login');
});



passport.serializeUser(function (id, done) {
    done(null, id);
});

passport.deserializeUser(function (id, done) {
        done(null, id );
    });

module.exports = router;
