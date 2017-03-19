import express from 'express';
import passport from 'passport';

import arrayAverage from '../myFunctions';
import Company from '../models/company';

const router = express.Router();

router.get('/', (req, res, next) => {
    if (req.session.cookie.originalMaxAge !== null) {
        res.redirect('/home');
    } else {
        Company.find({}, (err, result) => {
            res.render('index', {
                title: 'Index || RateMe',
                data: result
            });
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

router.get('/company', (req, res) => {
    Company.find({}, (err, result) => {
        res.render('company/companies', {
            title: 'All Companies || RateMe',
            user: req.user,
            data: result
        });
    });
});

router.get('/company-profile/:id', (req, res) => {
    Company.findOne({
        '_id': req.params.id
    }, (err, data) => {
        const avg = arrayAverage(data.ratingNumber);
        res.render('company/company-profile', {
            title: 'Company Name',
            user: req.user,
            id: req.params.id,
            data: data,
            average: avg
        });
    });
});

router.get('/:name/employees', (req, res) => {
    Company.findOne({
        'name': req.params.name
    }, (err, data) => {
        res.render('company/employees', {
            title: 'Company EMployees',
            user: req.user,
            data: data
        });
    });
});
router.get('/companies/leaderboard', (req, res) => {
    Company.find({}, (err, result) => {
        res.render('company/leaderboard', {
            title: 'Companies Leadebaord || RateMe',
            user: req.user,
            data: result
        });
    }).sort({
        'ratingSum': -1
    });
});

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