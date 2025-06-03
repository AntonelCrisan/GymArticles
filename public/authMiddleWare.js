const jwt = require('jsonwebtoken');
const User = require('./user');
require('dotenv').config();

const jwt_secret = process.env.JWT_SECRET;

// Middleware: asigură că utilizatorul este autentificat
const requireAuth = (req, res, next) => {
    const token = req.cookies.user_token;
    if (token) {
        jwt.verify(token, jwt_secret, (err, decodedToken) => {
            if (err) {
                console.log('Invalid Token:', err);
                return res.redirect('/login');
            } else {
                req.userId = decodedToken.id;
                next();
            }
        });
    } else {
        res.redirect('/login');
    }
};

// Middleware: validare parolă (ex: pentru acțiuni sensibile)
const requirePasswordValidation = (req, res, next) => {
    const token = req.cookies.validate_pass;
    if (token) {
        jwt.verify(token, jwt_secret, (err, decodedToken) => {
            if (err) {
                req.session.intendedUrl = req.originalUrl;
                console.log('Invalid password validation token:', err);
                return res.redirect(`/validate-password?next=${encodeURIComponent(req.originalUrl)}`);
            } else {
                next();
            }
        });
    } else {
        req.session.intendedUrl = req.originalUrl;
        res.redirect(`/validate-password?next=${encodeURIComponent(req.originalUrl)}`);
    }
};

// Middleware: verifică dacă utilizatorul este logat și atașează datele
const checkUser = (req, res, next) => {
    const token = req.cookies.user_token;
    if (token) {
        jwt.verify(token, jwt_secret, async (err, decodedToken) => {
            if (err) {
                console.log('JWT error:', err.message);
                res.locals.user = null;
                req.userId = null;
                next();
            } else {
                try {
                    const user = await User.findById(decodedToken.id);
                    res.locals.user = user;
                    req.userId = decodedToken.id;
                    next();
                } catch (error) {
                    console.log('Error fetching user:', error);
                    res.locals.user = null;
                    req.userId = null;
                    next();
                }
            }
        });
    } else {
        res.locals.user = null;
        req.userId = null;
        next();
    }
};

// Middleware: contor favorite
const countFavoriteProduct = async (req, res, next) => {
    try {
        const user = await User.findById(req.userId);
        req.nrFavorites = user ? user.favorites.length : 0;
    } catch (error) {
        console.log('Error counting favorites:', error);
        req.nrFavorites = 0;
    }
    next();
};

// Middleware: contor produse în coș
const countCartProduct = async (req, res, next) => {
    try {
        const user = await User.findById(req.userId);
        req.nrCart = user ? user.cart.reduce((total, item) => total + item.quantity, 0) : 0;
    } catch (error) {
        console.log('Error counting cart items:', error);
        req.nrCart = 0;
    }
    next();
};

module.exports = {
    requireAuth,
    requirePasswordValidation,
    checkUser,
    countFavoriteProduct,
    countCartProduct
};
