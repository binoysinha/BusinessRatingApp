import express from 'express';
import passport from 'passport';
import nodemailer from 'nodemailer';
import smtpTransport from 'nodemailer-smtp-transport';
import async from 'async';
import crypto from 'crypto';
import User from '../models/user';
import secret from '../secret/secret';

const router = express.Router();

router.get('/signup', (req, res, next) => {
    var errors = req.flash('error');
    res.render('user/signup', {
        title: 'Sign Up || RateMe',
        messages: errors,
        hasErrors: errors.length > 0
    });
});

router.post('/signup', validate, passport.authenticate('local.signup', {
    successRedirect: '/',
    failureRedirect: '/user/signup',
    failureFlash: true
}));

router.get('/login', (req, res) => {
    var errors = req.flash('error');
    res.render('user/login', {
        title: 'Login || RateMe',
        messages: errors,
        hasErrors: errors.length > 0
    });
});

router.post('/login', loginValidation, passport.authenticate('local.login', {
   // successRedirect: '/home',
    failureRedirect: '/user/login',
    failureFlash: true
}), (req, res) => {
    debugger;
    if (req.body.rememberme) {
        req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days
    } else {
        req.session.cookie.expires = null;
    }
    res.redirect('/home');
});



router.get('/forgot', (req, res) => {
    var errors = req.flash('error');
    var info = req.flash('info');
    res.render('user/forgot', {
        title: 'Request Password Reset',
        messages: errors,
        hasErrors: errors.length > 0,
        info: info,
        noErrors: info.length > 0
    });
});

router.post('/forgot', (req, res, next) => {
    async.waterfall([
        function (callback) {
            crypto.randomBytes(20, (err, buf) => {
                var rand = buf.toString('hex');
                callback(err, rand);
            });
        },

        function (rand, callback) {
            User.findOne({
                'email': req.body.email
            }, (err, user) => {
                if (!user) {
                    req.flash('error', 'No Account With That Email Exist Or Email is Invalid');
                    return res.redirect('/user/forgot');
                }

                user.passwordResetToken = rand;
                user.passwordResetExpires = Date.now() + 60 * 60 * 1000;

                user.save((err) => {
                    callback(err, rand, user);
                });
            })
        },

        function (rand, user, callback) {
            var smtpTransport = nodemailer.createTransport({
                service: 'Gmail',
                auth: {
                    user: secret.auth.user,
                    pass: secret.auth.pass
                }
            });

            var mailOptions = {
                to: user.email,
                from: 'RateMe ' + '<' + secret.auth.user + '>',
                subject: 'RateMe Application Password Reset Token',
                text: 'You have requested for password reset token. \n\n' +
                    'Please click on the link to complete the process: \n\n' +
                    'http://localhost:3000/user/reset/' + rand + '\n\n'
            };

            smtpTransport.sendMail(mailOptions, (err, response) => {
                req.flash('info', 'A password reset token has been sent to ' + user.email);
                return callback(err, user);
            });
        }
    ], (err) => {
        if (err) {
            return next(err);
        }
        res.redirect('/user/forgot');
    })
});

router.get('/reset/:token', (req, res) => {
    debugger;
    User.findOne({
        passwordResetToken: req.params.token,
        passwordResetExpires: {
            $gt: Date.now()
        }
    }, (err, user) => {
        if (!user) {
            req.flash('error', 'Password reset token has expired or is invalid. Enter your email to get a new token.');
            return res.redirect('/user/forgot');
        }
        var errors = req.flash('error');
        var success = req.flash('success');

        res.render('user/reset', {
            title: 'Reset Your Password',
            messages: errors,
            hasErrors: errors.length > 0,
            success: success,
            noErrors: success.length > 0
        });
    });
});

router.post('/reset/:token', (req, res) => {
    async.waterfall([
        function (callback) {
            User.findOne({
                passwordResetToken: req.params.token,
                passwordResetExpires: {
                    $gt: Date.now()
                }
            }, (err, user) => {
                if (!user) {
                    req.flash('error', 'Password reset token has expired or is invalid. Enter your email to get a new token.');
                    return res.redirect('/user/forgot');
                }

                req.checkBody('password', 'Password is Required').notEmpty();
                req.checkBody('password', 'Password Must Not Be Less Than 5').isLength({
                    min: 5
                });
                req.check("password", "Password Must Contain at least 1 Number.").matches(/^(?=.*\d)(?=.*[a-z])[0-9a-z]{5,}$/, "i");
                var errors = req.validationErrors();
                if (req.body.password == req.body.cpassword) {
                    debugger;
                    if (errors) {
                        var messages = [];
                        errors.forEach((error) => {
                            messages.push(error.msg)
                        })

                        var errors = req.flash('error');
                        res.redirect('/user/reset/' + req.params.token);
                    } else {
                        user.password = user.encryptPassword(req.body.password);
                        user.passwordResetToken = undefined;
                        user.passwordResetExpires = undefined;

                        user.save((err) => {
                            req.flash('success', 'Your password has been successfully updated.');
                            callback(err, user);
                        })
                    }
                } else {
                    req.flash('error', 'Password and confirm password are not equal.');
                    res.redirect('/user/reset/' + req.params.token);
                }

                //                    
            });
        },

        function (user, callback) {
            var smtpTransport = nodemailer.createTransport({
                service: 'Gmail',
                auth: {
                    user: secret.auth.user,
                    pass: secret.auth.pass
                }
            });

            var mailOptions = {
                to: user.email,
                from: 'RateMe ' + '<' + secret.auth.user + '>',
                subject: 'Your password Has Been Updated.',
                text: 'This is a confirmation that you updated the password for ' + user.email
            };

            smtpTransport.sendMail(mailOptions, (err, response) => {
                debugger;
                callback(err, user);

                var error = req.flash('error');
                var success = req.flash('success');
                debugger;
                res.render('user/reset', {
                    title: 'Reset Your Password',
                    messages: error,
                    hasErrors: error.length > 0,
                    success: success,
                    noErrors: success.length > 0
                });
            });
        }
    ]);
});

function validate(req, res, next) {
    req.checkBody('fullname', 'Fullname is Required').notEmpty();
    req.checkBody('fullname', 'Fullname Must Not Be Less Than 5').isLength({
        min: 5
    });
    req.checkBody('email', 'Email is Required').notEmpty();
    req.checkBody('email', 'Email is Invalid').isEmail();
    req.checkBody('password', 'Password is Required').notEmpty();
    req.checkBody('password', 'Password Must Not Be Less Than 5').isLength({
        min: 5
    });
    req.check("password", "Password Must Contain at least 1 alphaNumeric .").matches(/^(?=.*\d)(?=.*[a-z])[0-9a-z]{5,}$/, "i");

    var errors = req.validationErrors();

    if (errors) {
        var messages = [];
        errors.forEach((error) => {
            messages.push(error.msg);
        });

        req.flash('error', messages);
        res.redirect('/user/signup');
    } else {
        return next();
    }
}

function loginValidation(req, res, next) {
    req.checkBody('email', 'Email is Required').notEmpty();
    req.checkBody('email', 'Email is Invalid').isEmail();
    req.checkBody('password', 'Password is Required').notEmpty();
    /*  req.checkBody('password', 'Password Must Not Be Less Than 5 Characters').isLength({
    min: 5
});*/
    req.check("password", "Password Must Contain at least 1 Number.").matches(/^(?=.*\d)(?=.*[a-z])[0-9a-z]{5,}$/, "i");

    var loginErrors = req.validationErrors();

    if (loginErrors) {
        var messages = [];
        loginErrors.forEach((error) => {
            messages.push(error.msg);
        });

        req.flash('error', messages);
        res.redirect('/user/login');
    } else {
        return next();
    }
}
export default router;