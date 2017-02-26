import express from 'express';
import formidable from 'formidable';
import path from 'path';
import fs from 'fs';

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
router.post('/upload', (req, res) => {
    debugger;
    var form = new formidable.IncomingForm();

    form.uploadDir = path.join(__dirname, '../public/uploads');

    form.on('file', (field, file) => {
        fs.rename(file.path, path.join(form.uploadDir, file.name), (err) => {
            if (err) {
                throw err
            }

            console.log('File has been renamed');
        });
    });

    form.on('error', (err) => {
        console.log('An error occured', err);
    });

    form.on('end', () => {
        console.log('File upload was successful');
    });

    form.parse(req);

});

export default router;