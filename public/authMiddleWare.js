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
const state = {
    id: null
};
const getId = () => {return state.id};
const setId = (id) => {
    state.id = id;
};
const checkUser = (req, res, next) => {
    const token = req.cookies.jwt;
    if (token) {
        jwt.verify(token, jwt_secret, async (err, decodedToken) => {
            if (err) {
                console.log(err.message);
                res.locals.user = null;
                setId(null);
                next();
            } else {
                try {
                    let user = await User.findById(decodedToken.id);
                    res.locals.user = user;
                    setId(decodedToken.id);
                    next();
                } catch (error) {
                    console.log(error);
                    res.locals.user = null;
                    setId(null);
                    next();
                }
            }
        });
    } else {
        res.locals.user = null;
        setId(null);
        next();
    }
};
module.exports = {requireAuth, checkUser, getId};