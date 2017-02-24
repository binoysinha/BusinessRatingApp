import express from 'express';
import passport from 'passport';

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
    successRedirect: '/home',
    failureRedirect: '/user/login',
    failureFlash: true
}));
/*, (req, res) => {
    if (req.body.rememberme) {
        req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days
    } else {
        req.session.cookie.expires = null;
    }
    res.redirect('/home');
});*/

router.get('/auth/facebook', passport.authenticate('facebook', {
    scope: 'email'
}));

router.get('/auth/facebook/callback', passport.authenticate('facebook', {
    successRedirect: '/home',
    failureRedirect: '/login',
    failureFlash: true
}));

router.get('/forgot', (req, res) => {
    var errors = req.flash('error');
  //  var info = req.flash('info');
    res.render('user/forgot', {
        title: 'Request Password Reset',
    });
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