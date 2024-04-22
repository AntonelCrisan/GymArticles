const jwt = require('jsonwebtoken');
const requireAuth = (req, res, next) => {
    const token = req.cookies.jwt;
    if(token){
        jwt.verify(token, 'net ninja secret', (err, decodedToken) => {
            if(err){
                console.log("Invalid Token", err);
                res.redirect('/login');
            }else{
                console.log(decodedToken);
                next();
            }
        })
    }else{
        res.redirect('/login');
    }
}

const checkUser = (res, req, next) => {
    const token = req.cookies.jwt;
    if(token){
        jwt.verify(token, 'net ninja secret', async (err, decodedToken) => {
            if(err){
                next();
                res.local.user = null;
            }else{
                let user = await User.findById(decodedToken.id);
                res.local.user = user;
                next();
            }
        })
        }else{
            res.local.user = null;
            next();
    }
}
module.exports = {requireAuth, checkUser};