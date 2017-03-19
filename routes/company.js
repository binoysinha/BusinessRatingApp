import express from 'express';
import formidable from 'formidable';
import path from 'path';
import fs from 'fs';
import async from 'async';

import Company from '../models/company';
import User from '../models/user';
import Message from '../models/message';

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

    router.post('/create', (req, res) => {
        debugger;
        var newCompany = new Company();
        newCompany.name = req.body.name;
        newCompany.address = req.body.address;
        newCompany.city = req.body.city;
        newCompany.country = req.body.country;
        newCompany.sector = req.body.sector;
        newCompany.website = req.body.website;
        newCompany.image = req.body.upload;
        
        newCompany.save((err) => {
            if(err){
                console.log(err);
            }
            
            console.log(newCompany);
            
            req.flash('success', 'Company data has been added.');
            res.redirect('/company/create');
        })
    });
router.post('/upload', (req, res) => {
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


    
    router.get('/register-employee/:id', (req, res) => {
        Company.findOne({'_id':req.params.id}, (err, data) => {
            res.render('company/register-employee', {title: 'Register Employee', user:req.user, data: data});
        });
    });
    
    router.post('/register-employee/:id', (req, res, next) => {
        async.parallel([
            function(callback){
               Company.update({
                   '_id': req.params.id,
                   'employees.employeeId': {$ne: req.user._id}
               },
               {
                    $push: {employees: {employeeId: req.user._id, employeeFullname:req.user.fullname, employeeRole:req.body.role}}
               }, (err, count) => {
                   if(err){
                       return next(err);
                   }
                   callback(err, count);
               });
            },
            
            function(callback){
                async.waterfall([
                    function(callback){
                        Company.findOne({'_id': req.params.id}, (err, data) => {
                            callback(err, data);
                        })
                    },
                    
                    function(data, callback){
                        User.findOne({'_id': req.user._id}, (err, result) => {
                            result.role = req.body.role;
                            result.company.name = data.name;
                            result.company.image = data.image;
                            
                            result.save((err) => {
                                res.redirect('/home');
                            });
                        })
                    }
                ]);
            }
        ]);
    });
    

    

    
    router.get('/search', (req, res) => {
        res.render('company/search', {title: 'Find a Company', user:req.user});
    });
    
    router.post('/search', (req, res) => {
        var name = req.body.search;
        var regex = new RegExp(name, 'i');
        
        Company.find({'$or': [{'name':regex}]}, (err, data) => {
            if(err){
                console.log(err);
            }
            
            res.redirect('/company-profile/'+data[0]._id);
        });
    });
    router.get('/message/:id', (req, res) => {
    async.parallel([
        function (callback) {
            User.findById({
                '_id': req.params.id
            }, (err, result1) => {
                callback(err, result1);
            })
        },

        function (callback) {
            Message.find({
                '$or': [{
                    'userFrom': req.user._id,
                    'userTo': req.params.id
                }, {
                    'userFrom': req.params.id,
                    'userTo': req.user._id
                }]
            }, (err, result2) => {
                callback(err, result2);
            });
        }
    ], function (err, results) {
        var data = results[0];
        var messages = results[1];
        res.render('messages/message', {
            title: 'Private Message',
            user: req.user,
            data: data,
            chats: messages
        });
    });
});

router.post('/message/:id', (req, res) => {
    User.findOne({
        '_id': req.params.id
    }, (err, data) => {
        var newMessage = new Message();
        newMessage.userFrom = req.user._id;
        newMessage.userTo = req.params.id;
        newMessage.userFromName = req.user.fullname;
        newMessage.userToName = data.fullname;
        newMessage.body = req.body.message;
        newMessage.createdAt = new Date();

        console.log(newMessage);

        newMessage.save((err) => {
            res.redirect('/message/' + req.params.id);
        });
    })

});

export default router;