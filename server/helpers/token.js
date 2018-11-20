const jwt = require('jsonwebtoken');

var generateToken = (user) => {
    const payload = {
        user: user.name
    };
    const options = {
        issuer: 'team11'
    };
    const secret = 'team11secrets';
    const token = jwt.sign(payload, secret, options);
    return token;
}

module.exports = {
    generateToken
};