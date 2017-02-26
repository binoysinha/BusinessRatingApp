import express from 'express';

const router = express.Router();

router.get('/create', (req, res) => {
    var success = req.flash('success');
    res.render('company/company', {
        title: 'Company Registration',
        user: req.user,
        success: success,
        noErrors: success.length > 0
    });
});
export default router;