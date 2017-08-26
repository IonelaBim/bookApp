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

const webPush = require('web-push');
webPush.setVapidDetails(
    'mailto:ionela92@gmail.com',
    config.vapid.publicKey, // process.env.VAPID_PUBLIC_KEY,
    config.vapid.privateKey // process.env.VAPID_PRIVATE_KEY
);
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
        " FROM Book book inner join `User`  appUser  on book.ownerId = appUser.id;", function(err, books) {
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
            " FROM Book book inner join `User`  appUser  on book.ownerId = appUser.id;", function(err, books) {
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
        var getUserInfoQuery="SELECT firstName,lastName,phone,email from User where id=?";
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
        var getUserInfoQuery="SELECT firstName,lastName,phone,email from User where id=?";
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
            sendUsersNotification(req,res);
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



    app.post('/push/subscribe', function (req, res) {
        return saveSubscriptionToDatabase(req.body)
            .then(function(subscriptionId) {
                res.setHeader('Content-Type', 'application/json');
                res.send(JSON.stringify({ data: { success: true } }));
            })
            .catch(function(err) {
                res.status(500);
                res.setHeader('Content-Type', 'application/json');
                res.send(JSON.stringify({
                    error: {
                        id: 'unable-to-save-subscription',
                        message: 'The subscription was received but we were unable to save it to our database.'
                    }
                }));
            });

        const subscription = {
            endpoint: req.body.endpoint,
            keys: {
                p256dh: req.body.keys.p256dh,
                auth: req.body.keys.auth
            }
        };

    });



    app.post('/push/unsubscribe', function (req, res) {
        var endpoint = req.body.endpoint;
        var deletesubscription = 'delete from Subscription where  endpoint=?'
        // remove from database
        connection.query (deletesubscription,[endpoint], function (err,data){
            if(err) {
                console.error('error with unsubscribe', err);
                res.status(500).send('unsubscription not possible');
            }
            console.log('unsubscribed');
            res.status(200).send('unsubscribe');
        });

    })



    app.post('/send/subscription', function (req, res) {
        return getSubscriptionsFromDatabase()
            .then(function (subscriptions) {
                var promiseChain = Promise.resolve();
               console.log(111,subscriptions)
                for (var i = 0; i < subscriptions.length; i++) {
                    const subscription = {
                        endpoint: subscriptions[i].endpoint,
                        expirationTime: null,
                        keys: {
                            p256dh: subscriptions[i].p256dh,
                            auth: subscriptions[i].auth
                        },
                        api_key: '725081843590'
                    };
                    const payload = JSON.stringify({
                        title: 'Share a book',
                        body: 'Share a book have new a new book!',
                        icon: 'images/icons/icon-128x128.png'
                    });

                    const options = {
                        TTL: 3600 // 1sec * 60 * 60 = 1h
                    };
                    promiseChain = promiseChain.then(function () {
                        return triggerPushMsg(subscription, payload,options);
                    });
                }

                return promiseChain;
            })
            .then(function () {
                res.setHeader('Content-Type', 'application/json');
                res.send(JSON.stringify({data: {success: true}}));
            })
            .catch(function (err) {
                res.status(500);
                res.setHeader('Content-Type', 'application/json');
                res.send(JSON.stringify({
                    error: {
                        id: 'unable-to-send-messages',
                        message: 'We were unable to send messages to all subscriptions : ' + err.message
                    }
                }));
            });

    });
};

function sendUsersNotification(req,res){
return getSubscriptionsFromDatabase()
    .then(function (subscriptions) {
        var promiseChain = Promise.resolve();
        console.log(111,subscriptions)
        for (var i = 0; i < subscriptions.length; i++) {
            const subscription = {
                endpoint: subscriptions[i].endpoint,
                expirationTime: null,
                keys: {
                    p256dh: subscriptions[i].p256dh,
                    auth: subscriptions[i].auth
                }
            };
            const payload = JSON.stringify({
                title: 'Welcome',
                body: 'Thank you for enabling push notifications',
                // icon: '/android-chrome-192x192.png'
            });

            const options = {
                TTL: 3600 // 1sec * 60 * 60 = 1h
            };
            console.log('sunn', subscription);
            promiseChain = promiseChain.then(function () {
                return triggerPushMsg(subscription, payload,options);
            });
        }

        return promiseChain;
    })
    .then(function () {
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify({data: {success: true}}));
    })
    .catch(function (err) {
        res.status(500);
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify({
            error: {
                id: 'unable-to-send-messages',
                message: 'We were unable to send messages to all subscriptions : ' + err.message
            }
        }));
    });

}

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


function saveSubscriptionToDatabase(subscription) {
    console.log('aa',subscription);

    var savesubscription = 'Insert into Subscription (endpoint,auth,p256dh) values (?,?,?)'
    return new Promise(function(resolve, reject) {
        connection.query(savesubscription,[subscription.endpoint,subscription.keys.auth,subscription.keys.p256dh], function(err, newDoc) {
            if (err) {
                reject(err);
                return;
            } else {
                resolve(newDoc._id);
            }
        })
    });
};


const triggerPushMsg = function(subscription, payload,options) {
    webPush.setGCMAPIKey('AIzaSyBgEUpD9Wsyga6KCPj6K70t0K05c32qCSE');
    return webPush.sendNotification(subscription, payload,options)
            .catch(function(err){
            if (err.statusCode === 410) {
                console.log('eerr',err);
                // return deleteSubscriptionFromDatabase(subscription._id);
            } else {
                console.log('Subscription is no longer valid: ', err);
            }
    });
};


function getSubscriptionsFromDatabase() {
    var sql = "SELECT * FROM Subscription";
    return new Promise(function(resolve, reject){
        connection.query(sql, function(err, result) {
            if (err) return reject(err);
            resolve(result);
        })
    })
}