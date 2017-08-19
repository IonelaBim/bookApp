/*  =======        app/routes.js   ========== */
var mysql = require('mysql');
var base64 = require('base-64');
var path =require('path');
var config = require('../config/development');
var dbconfig = require('../config/database');
var connection = mysql.createConnection(dbconfig.connection);
connection.query('USE ' + dbconfig.database);
var sendgrid  = require('sendgrid')(config.sendgrid.api_key);
var sendgridService = require('./service');
var moment = require('moment');

// ==========   Rest API    ==========================

module.exports = function(app, passport) {

   // Read more at http://technotif.com/build-progressive-web-app-using-service-workers/#ksS4Zib64pje60lD.99
    // =====================================
    // HOME PAGE (with login links) ========
    // =====================================
    app.get('/', function(req, res) {
        res.sendfile('./public/index.html');
    });

    // =====================================
    // LOGIN ===============================
    // =====================================
    app.post('/user/login', passport.authenticate('local-login', {
            successRedirect : '/secured', // redirect to the secure profile section
            failureRedirect : '/secured' // redirect back to the signup page if there is an error
    }));

    // =====================================
    // LOGOUT ==============================
    // =====================================
    app.get('/user/logout', function(req, res) {
        req.logout();
        res.clearCookie("isLoggedIn");
        res.clearCookie("fNa");
        res.clearCookie("lNa");
        res.redirect('/');
    });

    // =====================================
    // SIGNUP ==============================
    // =====================================
      // process the signup form
    app.post('/user/signup', passport.authenticate('local-signup', {
        successRedirect : '/secured', // redirect to the secure profile section
        failureRedirect : '/secured' // redirect back to the signup page if there is an error
    }));

    // =====================================
    // SECURED SECTION =====================
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
    // DELETE A BOOK =======================
    // =====================================
    app.delete('/secured/book/:id', function(req, res,done) {
        var deleteQuery = "DELETE FROM book where bookId =? ";
        connection.query(deleteQuery,[req.params.id], function(err, response) {
            if (err) {
                console.log('Err', err);
                return done(err);
            } else{
                res.status(200).json({"error" : false, "responseCode": "200","data":response});
                res.end();

            }
        });
    });


    // =====================================
    // SEND EMAIL TO BOOK OWNER ============
    // =====================================
    app.post('/secured/sendEmail',function(req,res){
        var data = req.body;
        var template = './public/templates/contact.jade';
        console.log('goodd')
        var getUserInfoQuery="SELECT firstName,lastName,phone,email from user where id=?";
        connection.query(getUserInfoQuery,[data.from], function(err, user) {
            if (err) {
                console.log('Err', err);
                return res.status(404).json({"error": true, "responseCode": "404", "data": null, 'errMsg': err});

            } else {
                data.user = user[0];
                console.log(user[0].email,data.to,data.subject);
                sendgridService.compileToHtml(template, 'data', data, function (err, html) {
                    if (err) {
                        return res.status(404).json({
                            "error": true,
                            "responseCode": "404",
                            "data": null,
                            'errMsg': 'Compiled email failed'
                        });
                    }
                    var request = sendgrid.emptyRequest({
                        method: 'POST',
                        path: '/v3/mail/send',
                        body: {
                            personalizations: [
                                {
                                    to: [{
                                        email: data.to
                                    }
                                    ],
                                    subject: data.subject
                                }
                            ],
                            from: {
                                email: user[0].email
                            },
                            content: [
                                {
                                    type: "text/html",
                                    value: html
                                }
                            ]
                        }
                    });

                    sendgrid.API(request, function (err, response) {
                        if (err) {
                            console.log('Error response received');
                            return res.status(404).json({
                                "error": true,
                                "responseCode": "404",
                                "data": null,
                                'errMsg': 'error to send email'
                            })
                        }

                        res.status(200).json({"error": false, "responseCode": "200", "data": response});
                        res.end();
                    });
                })
            }
        })
    });


    // =====================================
    // BOOK BOOKING ========================
    // =====================================
    app.post('/secured/book/booking',function(req,res){
        var data = req.body;
        var template = './public/templates/booking.jade';
        var getUserInfoQuery="SELECT firstName,lastName,phone,email from user where id=?";
        var insertQuery = "INSERT INTO Booking (bookId,bookingDate,userId) VALUES (?,?,?)";

        connection.query(getUserInfoQuery,[data.userId], function(err, user) {
            if (err) {
                console.log('Err', err);
                return  res.status(404).json({"error" : true, "responseCode": "404","data":null,'errMsg':err});

            } else{
                data.user=user[0];
                connection.query(insertQuery, [data.body.bookId, moment().format('YYYY-MM-DD HH:mm:ss'), data.userId], function (err, rows) {
                    if (err) {
                        console.log('err', err);
                        return  res.status(404).json({"error" : true, "responseCode": "404","data":null,'errMsg':err });
                    }
                    data.bookingId=rows.insertId;
                    console.log('FFFF',data);
                    sendgridService.compileToHtml(template, 'data',data,function(err, html) {
                        if (err) {
                            return res.status(404).json({
                                "error": true,
                                "responseCode": "404",
                                "data": null,
                                'errMsg': 'Compiled email failed'
                            });
                        }
                        var request = sendgrid.emptyRequest({
                            method: 'POST',
                            path: '/v3/mail/send',
                            body: {
                                personalizations: [
                                    {
                                        to: [{
                                                email: data.to
                                            }
                                        ],
                                        subject: data.subject
                                    }
                                ],
                                from: {
                                    email: data.user.email
                                },
                                content: [
                                    {
                                        type: "text/html",
                                        value: html
                                    }
                                ]
                            }
                        });

                        sendgrid.API(request, function (err, response) {
                            if (err) {
                                console.log('Error response received');
                                return res.status(404).json({
                                    "error": true,
                                    "responseCode": "404",
                                    "data": null,
                                    'errMsg': 'error to send email'
                                })
                            }
                            console.log("SUCCESS booking BOOK", rows);
                            res.status(200).json({"error": false, "responseCode": "200", "data": rows});
                            res.end();

                        })
                });

              })
            }
        })
    });

    // =====================================
    // ADD A BOOK ==========================
    // =====================================
    app.post('/secured/books',function(req,res,done){
        var book = req.body;
        var insertQuery = "INSERT INTO Book (title,description,bookAuthor ,publisher ,publishedYear,ownerId) VALUES (?,?,?,?,?,?)";
        connection.query(insertQuery,[book.title,book.description, book.bAuthor,book.publisher,book.publishedYear,book.ownerId],function(err, rows) {
            if (err){
                console.log('err',err);
                return done(err);
            }
            console.log("SUCCESS INSER BOOK",rows);
            res.status(200).json({"error" : false, "responseCode": "200","data":rows});
            res.end();
        });
    });

    // =====================================
    // BOOK STATUS UPDATE===================
    // =====================================
    app.get('/book/status/:val/:id', function(req, res,done) {
        var status = req.params.val;
        var bookingId = req.params.id;
        var updateQuery = "Update Booking SET status= ? where id= ?";
        status = (status === '1') ? 'approved' : 'rejected';

        connection.query(updateQuery,[status,bookingId], function(err, books) {
            if (err) {
                console.log('Err', err);
                return done(err);
            } else{
                // res.sendFile(path.resolve('./public/views/booking.html'));
                res.writeHead(200, { 'Content-Type': 'text/html' });
                if (status === 'approved'){
                    res.write('<h2>This booking was succesfully accepted!</h2><br /><br /> Thank you! :) ');

                }
                else {
                    res.write('<h1>This booking was rejected!</h1><br /><br /> :(');

                }
                res.end();
            }
         });
    });

};




// route middleware to make sure that user is authenticated
function isLoggedIn(req, res, next) {
    // if user is authenticated in the session, carry on
    if (req.isAuthenticated()){
        res.cookie("isLoggedIn" , base64.encode(req.user.id));
        res.cookie("fNa",base64.encode(req.user.firstName));
        res.cookie("lNa",base64.encode(req.user.lastName));

        return next();
    }

    // if they aren't redirect them to the home page
    res.clearCookie("isLoggedIn");
    res.clearCookie("fNa");
    res.clearCookie("lNa");

    res.status(404).json({"error" : true, "responseCode": "404","data":null,'errMsg':'Credentialle invalide' });
}


