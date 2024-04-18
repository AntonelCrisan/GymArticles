const express = require('express');
const path = require('path');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');
const mongoose = require('mongoose');
const User = require('./user');
const flash = require('connect-flash');
const bcrypt = require('bcrypt');
const app = express();
const port = 3012;
const publicDir = path.join(__dirname, 'public'); // Calea către directorul public

// Conectarea la baza de date MongoDB
mongoose.connect('mongodb://0.0.0.0:27017/GymArticles', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Conectat la baza de date MongoDB!'))
    .catch(err => console.error('Eroare la conectarea la MongoDB:', err));

// Middleware-uri
app.use(express.static(publicDir));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(flash());
app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

app.post('/signup', async (req, res) => {
    const { name, email, password, confPassword } = req.body;
    try {
        const newUser = new User({ name, email, password, confPassword });
        const user = await User.findOne({email : req.body.email});
        if(user){
            res.send("This email is already used!");
        }if(password !== confPassword){
            res.send("The passwords do not match!");
        }if(password.length < 8 || confPassword.length < 8){
            res.send("The password must be at least 8 characters long!");
        }else{
            await newUser.save();
            res.redirect('/login');
        }    
    } catch (error) {
        // Tratează erorile de salvare în baza de date
        console.error('Eroare la salvarea utilizatorului:', error);
        res.status(500).send('Something went wrong!');
    }
});
app.post('/login', async(req, res) => {
    try{
        const check = await User.findOne({email : req.body.email});
    if (!check){
        return res.send("This email doesn't exist!");
    }
    if(check.password === req.body.password){
        res.redirect('/');
        console.log({email : req.body.email});
    }else{
       return res.send("Wrong password!");
    }
    }catch(error){
        console.log(error);
       return res.send("Something went wrong!");
    }
    
})
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'HomePage.html'));
});
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'LoginPage.html')); 
})

app.get('/signup', (req, res) => {
  res.sendFile(path.join(__dirname, 'public','SignUpPage.html'))
})
app.get('/reset', (req, res) => {
  res.sendFile(path.join(__dirname, 'public',"ResetPassword.html"))
})
app.get('/product', (req, res) => {
  res.sendFile(path.join(__dirname, 'public',"Product.html"))
})
app.listen(port, ()=> console.log(`Server is running at http://localhost:${port}`)); 
