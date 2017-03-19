import express from 'express';
import async from 'async';
import User from '../models/user';
import Message from '../models/message';

const router = express.Router();
let count = 0;
router.get('/:id', (req, res) => {
    console.log(count++);
    debugger;
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
        console.log(results);
        debugger;
        res.render('messages/message', {
            title: 'Private Message',
            user: req.user,
            data: data,
            chats: messages
        });
    });
});

router.post('/:id', (req, res) => {
    debugger;
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