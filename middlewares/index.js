const jwt = require('jsonwebtoken');

// middleware protect a route from public access
const checkIfAuthenticated = (req, res, next) => {
    if (req.session.user) {
        // next function is provided by Express and we call it when we want Express to move on to the next middleware. 
        // If there is no more middleware left, then the route will be executed
        next()
    } 
    else {
        req.flash("error_messages", "You need to sign in to access this page");
        res.redirect('/users/login');
    }
}

// this is for the one time token that expires in 1h (routes/api/users/js
const checkIfAuthenticatedJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (authHeader) {
        const token = authHeader.split(' ')[1];

        jwt.verify(token, process.env.TOKEN_SECRET, (err, user) => {
            if (err) {
                return res.sendStatus(403);
            }

            req.user = user;
            next();
        });
    } else {
        res.sendStatus(401);
    }
};

module.exports = {
    checkIfAuthenticated,
    checkIfAuthenticatedJWT
}

