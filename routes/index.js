import express from 'express';
import passport from 'passport';

const router = express.Router();

router.get('/', (req, res, next) => {
    debugger;
    if (req.session.cookie.originalMaxAge !== null) {
        debugger;
        res.redirect('/home');
    } else {
        res.render('index', {
            title: 'Index || Rate Me'
        });
    }
});

router.get('/home', (req, res) => {
    res.render('home', {
        title: 'Home || RateMe',
        user: req.user
    });
});

router.get('/auth/facebook', passport.authenticate('facebook', {
    scope: 'email'
}));

router.get('/auth/facebook/callback', passport.authenticate('facebook', {
    successRedirect: '/home',
    failureRedirect: '/user/login',
    failureFlash: true
}));

router.get('/logout', (req, res) => {
    req.logout();
    req.session.destroy((err) => {
        res.redirect('/');
    });
});

export default router;