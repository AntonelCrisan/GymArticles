const jwt = require('jsonwebtoken');
const User = require('./user');
require("dotenv").config();
const jwt_secret = process.env.JWT_SECRET;
const requireAuth = (req, res, next) => {
    const token = req.cookies.jwt;
    if(token){
        jwt.verify(token, jwt_secret, (err, decodedToken) => {
            if(err){
                console.log("Invalid Token", err);
                res.redirect('/login');
            }else{
                next();
            }
        })
    }else{
        res.redirect('/login');
    }
}
let uName;
const setName = (name) => {
    uName = name;
}
const getName = () => {
    return uName;
}
const checkUser = (req, res, next) => {
    const token = req.cookies.jwt;
    if (token) {
        jwt.verify(token, jwt_secret, async (err, decodedToken) => {
            if (err) {
                console.log(err.message);
                res.locals.user = null;
                next();
            } else {
                try {
                    let user = await User.findById(decodedToken.id);
                    res.locals.user = user;
                    setName(user.name);
                    next();
                } catch (error) {
                    console.log(error);
                    res.locals.user = null;
                    next();
                }
            }
        });
    } else {
        res.locals.user = null;
        next();
    }
};
module.exports = {requireAuth, checkUser, getName};