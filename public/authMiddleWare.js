const jwt = require('jsonwebtoken');
const User = require('./user');
require("dotenv").config();
const jwt_secret = process.env.JWT_SECRET;
const requireAuth = (req, res, next) => {
    const token = req.cookies.user_token;
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
};
const requirePasswordValidation = (req, res, next) => {
    const token = req.cookies.validate_pass;
    if(token){
        jwt.verify(token, jwt_secret, (err, decodedToken) => {
            if(err){
                req.session.intendedUrl = req.originalUrl;
                console.log("Invalid Token", err);
                 res.redirect(`/validate-password?next=${encodeURIComponent(req.originalUrl)}`);
            }else{
                next();
            }
        })
    }else{
        req.session.intendedUrl = req.originalUrl;
        res.redirect(`/validate-password?next=${encodeURIComponent(req.originalUrl)}`);
    }
};
const state = {
    id: null
};
const getId = () => {
    return state.id
};
const setId = (id) => {
    state.id = id;
};
const checkUser = (req, res, next) => {
    const token = req.cookies.user_token;
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
const countFavoriteProduct = async(req, res, next) => {
    try {
        const id = getId(); // Ensure this returns the correct user ID
        const user = await User.findById(id); // Use findById for simplicity
        if (user) {
            req.nrFavorites = user.favorites.length;
        } else {
            req.nrFavorites = 0; // Default value if user is not found
        }
    } catch (error) {
        console.log(error);
        req.nrFavorites = 0; // Default value in case of error
    }
    next();
};
const countCartProduct = async(req, res, next) => {
    try {
        const id = getId(); // Ensure this returns the correct user ID
        const user = await User.findById(id); // Use findById for simplicity
        if (user) {
            req.nrCart = user.cart.reduce((total, item) => total + item.quantity, 0);
        } else {
            req.nrCart = 0; // Default value if user is not found
        }
    } catch (error) {
        console.log(error);
        req.nrCart = 0; // Default value in case of error
    }
    next();
};
module.exports = {requireAuth, requirePasswordValidation, checkUser, getId, countFavoriteProduct, countCartProduct};