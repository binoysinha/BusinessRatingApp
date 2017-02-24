import express from 'express';

const router = express.Router();

router.get('/', (req, res, next) => {
    res.render('index', {title: 'Index || Rate Me'});
});

router.get('/home', (req, res) => {
    res.render('home', {
        title: 'Home || RateMe',
    });
});

export default router;
