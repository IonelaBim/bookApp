// app/routes.js
var mysql = require('mysql');
var dbconfig = require('../config/database');
var connection = mysql.createConnection(dbconfig.connection);
connection.query('USE ' + dbconfig.database);

module.exports = function(app, passport) {

    // =====================================
    // HOME PAGE (with login links) ========
    // =====================================
    app.get('/', function(req, res) {
        res.sendfile('./public/index.html');
       // res.render('index.ejs'); // load the sdada.ejs file
    });

    // =====================================
    // LOGIN ===============================
    // =====================================
    // // show the login form
    // app.get('/login', function(req, res) {
    //
    //     // render the page and pass in any flash data if it exists
    //     res.render('login.ejs', { message: req.flash('loginMessage') });
    // });

    // process the login form
    app.post('/user/login', passport.authenticate('local-login', {
            successRedirect : '/secured', // redirect to the secure profile section
            failureRedirect : '/secured', // redirect back to the signup page if there is an error
        }))


    // =====================================
    // SIGNUP ==============================
    // =====================================
      // process the signup form
    app.post('/user/signup', passport.authenticate('local-signup', {
        successRedirect : '/secured', // redirect to the secure profile section
        failureRedirect : '/secured', // redirect back to the signup page if there is an error
    }));

    // =====================================
    // PROFILE SECTION =========================
    // =====================================
    // we will want this protected so you have to be logged in to visit
    // we will use route middleware to verify this (the isLoggedIn function)
    app.get('/secured', isLoggedIn, function(req, res,done) {
        connection.query("SELECT book.*, appUser.firstName,appUser.lastName,appUser.email,appUser.phone "+
        " FROM book book inner join `user`  appUser  on book.ownerId = appUser.id;", function(err, books) {
            if (err) {
                console.log('Err', err);
                return done(err);
            } else{
                if (req.body.remember) {
                    req.session.cookie.maxAge = 1000 * 60 * 3;
                } else {
                    req.session.cookie.expires = false;
                }
                res.cookie("isLoggedIn" , "true");
                res.status(200).json({"error" : false, "responseCode": "200","data":books});
                res.end();

            }

         });
    });

    app.get('/secured/books', function(req, res,done) {
        connection.query("SELECT book.*, appUser.firstName as ownerFirstName,appUser.lastName as ownerLastName, "+
            " appUser.email as ownerEmail,appUser.phone as ownerPhone "+
            " FROM book book inner join `user`  appUser  on book.ownerId = appUser.id;", function(err, books) {
            if (err) {
                console.log('Err', err);
                return done(err);
            } else{

                res.status(200).json({"error" : false, "responseCode": "200","data":books});
                res.end();

            }

        });
    });

    // =====================================
    // LOGOUT ==============================
    // =====================================
    app.get('/user/logout', function(req, res) {
        req.logout();
        res.clearCookie("isLoggedIn");
        res.redirect('/');
    });

    app.post('/book',function(req,res,done){
        var book = req.body;
        console.log('jjjjj',book);
        var insertQuery = "INSERT INTO Book (title,description,author ,publisher ,publishedYear,ownerId) VALUES (?,?,?,?,?,?)";
        console.log(mysql.format(insertQuery,[book.title,book.description, book.author,book.publisher,book.publishedYear,book.ownerId]));
        connection.query(insertQuery,[book.title,book.description, book.authorB,book.publisher,book.publishedYear,book.ownerId],function(err, rows) {
            if (err){
                console.log('err',err)
                return done(err);
            }
            console.log("SUCCESS INSER BOOK",rows);

            res.redirect('/profile');
        });
    })



};

// route middleware to make sure
function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.cookie("isLoggedIn" , "false");
    res.status(404).json({"error" : true, "responseCode": "404","data":null,'errMsg':'Credentialle invalide' });
    // res.redirect('/');
}


