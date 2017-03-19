import mongoose from 'mongoose';

var messageSchema = mongoose.Schema({
    body: {type: String, required: true},
    userFrom: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    userTo: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    userFromName: {type: String, required: true},
    userToName: {type: String, required: true},
    createdAt: {type: Date, required: true, default: Date.now}
});

export default mongoose.model('Message', messageSchema);