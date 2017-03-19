const secretId = {
    auth: {
        user: 'ratemeapp1@gmail.com',
        pass: 'React0079'
    },
    
    facebook: {
        clientID: '389112938126239', //Facebook login app id
        clientSecret: '7912e626afd816e7099dd2724f75cf50', //Facebook login secret key
        profileFields: ['email', 'displayName'],
        callbackURL: 'http://localhost:3000/auth/facebook/callback',
        passReqToCallback: true
    }
}

export default secretId;