const express = require('express');
const path = require('path');
const passport = require('passport');
const session = require('express-session');
const mongoose = require('mongoose');
const User = require('./public/user');
const flash = require('connect-flash');
const cookieParser = require('cookie-parser')
const {requireAuth, checkUser} = require('./public/authMiddleWare');
const jwt = require('jsonwebtoken');
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
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(flash());
app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
const handleErros = (err) => {
  console.log(err.message, err.code);
  let errors = {name: '',emails: '', password: '', confPassword: ''};

  if(err.code === 11000){
    errors.emails = 'This email is already used!';
    return errors;
  }
  //validation errors
  if(err.message.includes('user validation faild')){
    Object.values(err.errors).forEach(({properties}) => {
      errors[properties.path] = properties.message;
    })
  }
  return errors;
}
app.post('/signup', async (req, res) => {
    const { name, email, password, confPassword } = req.body;
    try {
        if(confPassword !== password){
          res.send("The passwords don't match!");
        }else{
          const user = await User.create({name, email, password});
          const token = createToken(User._id);
          res.status(201).json(user);
          res.cookie('jwt', token, {httpOnly: true, maxAge: maxAge * 1000})
          res.redirect('/login');
        }
    } catch (error) {
        // Tratează erorile de salvare în baza de date
        const errors = handleErros(error);
        console.error({errors});
    }
});
app.post('/login', async(req, res) => {
  const {email, password} = req.body;
    try{
      const user = await User.login(email, password);
      res.redirect('/');
      console.log(user);
    }catch{
      res.status(500).send('Something went wrong!');

    }
    
})
const maxAge = 3 * 24 * 60 * 60;
const createToken = (id) => {
  return jwt.sign({id}, 'net ninja secret', {
    expiresIn: maxAge
  })
}
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
app.get('/myAccount', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', "MyAccount.html"));
})
app.get('/logout', (req, res) => {
  res.cookie('jwt', '', {maxAge: 1});
  res.redirect('/');
})
app.listen(port, ()=> console.log(`Server is running at http://localhost:${port}`)); 
