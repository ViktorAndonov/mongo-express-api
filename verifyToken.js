const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
    // the header key is "auth-token"
    const token = req.header('auth-token');

    if ( ! token ) return res.status(401).send('Access Denied!');

    try {
        const verified = jwt.verify(token, process.env.TOKEN_SECRET);
        req.user = verified;
        console.log('User verified.');
        next();
    } catch (err) {
        res.status(400).send('Invalid token.');
    }
}