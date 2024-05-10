const express = require('express');
const passport = require('passport');
const session = require('express-session');
const mongoose = require('mongoose');
const User = require('./public/user');
const flash = require('connect-flash');
const cookieParser = require('cookie-parser');
const bodyParser = require("body-parser");   
const {requireAuth, checkUser} = require('./public/authMiddleWare');
require("dotenv").config();
const jwt = require('jsonwebtoken');
const app = express();
const port = process.env.PORT;
const Article = require('./public/article');
const Cart = require('./public/cart');
// Middleware-uri
app.use(express.static('public'));
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
app.use(bodyParser.json());
app.set('view engine', 'ejs');
// Connecting to DataBase
let dbURL = process.env.DB_URL;
mongoose.connect(dbURL, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Conectat la baza de date MongoDB!'))
    .catch(err => console.error('Eroare la conectarea la MongoDB:', err));
//Handle errors
const handleErros = (err) => {
  console.log(err.message, err.code);
  let errors = {name: '',email: '', password: ''};

  if(err.code === 11000){
    errors.email = 'This email is already used!';
    return errors;
  }
  if(err.message === 'Incorect email!'){
    errors.email = 'This email is not registered!';
    return errors;
  }
  if(err.message === 'Incorect password!'){
    errors.password = 'Incorect password!';
    return errors;
  }
  //validation errors
  if(err.message.includes('User validation failed')){
    Object.values(err.errors).forEach(({properties}) => {
      errors[properties.path] = properties.message;
    })
  }
  return errors;
}
app.post('/signup', async (req, res) => {
    const { name, email, password } = req.body;
    try {
      if(name === '' || email === '' || password === ''){
        res.status(400).json({warning: 'All fields must be filled!'});
      }else{
        const user = await User.create({name, email, password});
        const token = createToken(user._id);
        res.cookie('jwt', token, {httpOnly: true, maxAge: maxAge * 1000})
        res.status(201).json({user: user._id});
      }
      } catch (error) {
        const errors = handleErros(error);
        res.status(400).json({errors});
    }
});

app.post('/login', async(req, res) => {
  const {email, password} = req.body;
    try{
      if(email === '' || password === ''){
        res.status(400).json({warning: 'All fields must be filled!'});
      }else{
        const user = await User.login(email, password);
        const token = createToken(user._id);
        res.cookie('jwt', token, {httpOnly: true, maxAge: maxAge * 1000})
        console.log(user);
        res.status(201).json({user: user._id, user: user.role});
      }
    }catch(error){
      const errors = handleErros(error);
      console.log(errors)
      res.status(400).json({errors});
    }
    
})

app.post('/forgot-password', async(req, res) => {
  const {email} = req.body;
  try{
    if(email === ''){
      res.status(400).json({warning: 'Plase enter your email!'});
    }else{
      const user = await User.checkEmail(email);
      res.status(201).json({user: user.email});
    }
  }catch(err){
    const error = handleErros(err);
    res.status(400).json({error});
  }
})
app.post('/reset-password', async (req, res) => {
  const {password, confPassword} = req.body;
  try{
    if(password === '' || confPassword === ''){
      res.status(400).json({warning: 'All fields must be filled!'});
    }
    if(password !== confPassword){
      res.status(400).json({notEqual: 'Passwords are not equal!'});
    }
  }catch(error){
     console.log(error);
  }
})
app.post('/add-article', async (req, res) => {
  const {image, name, price, category, subcategory, cantity} = req.body;
  try{
      const article = await Article.create({image, name, price, category, subcategory, cantity});
      article.save();
      res.status(201).json({msg:'Article added successfully'});
  }catch(err){
    console.log("eroare la adaugarea articolului: ", err);
    res.status(400).json({error: "Please enter all the required information!"});
  }
})
app.get('/logout', (req, res) => {
  res.cookie('jwt', '', {maxAge: 1});
  res.redirect('/');
})
//Token age
const maxAge = 3 * 24 * 60 * 60;
//Creating token
const createToken = (id) => {
  const jwt_secret = process.env.JWT_SECRET;
  return jwt.sign({id}, jwt_secret, {
    expiresIn: maxAge
  })
}
app.get('*', checkUser);
app.get('/', async (req, res) => {
  try {
    const { subcategory, category } = req.query;
    let articles;
    if (category) {
      articles = await Article.find({ category: category });
    } else if (subcategory) {
      articles = await Article.find({ subcategory: subcategory });
    } else {
      articles = await Article.find();
    }
    res.render('HomePage', { articles});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/search', async (req, res) => {
  try {
    let nrArticle = 0;
    const query = req.query.q; 
    const article = await Article.find({ $text: { $search: query } }); 
    nrArticle = article.length;
    res.render('SearchResults', { article, query, nrArticle });
  } catch (err) {
    console.error('Eroare la căutarea produselor:', err);
  }
});
app.get('/category-results', async (req, res) => {
  const {subcategory} = req.query;
  try {
    let results = 0;
    const articles = await Article.find({subcategory: subcategory});
    results = articles.length;
    res.render( 'CategoryResults', {articles, subcategory, results})   
  } catch (error) {
    console.error('Eroare la căutarea produselor:', error);
  }
 
});

app.get('/product', async (req, res) => {
  try {
    const {name, id} = req.query;
    const article = await Article.findById(id);
    res.render('Product', {article});
  } catch (error) {
    console.error('Eroare:', error);  
  }
});
  app.post('/product', async (req, res) => {
    try {
        const {name, id} = req.body; // Assuming id and name are in the request body
        const cart = await Cart.create({idProduct: id, name });
        cart.save();
        return res.status(200).json({ message: "Product added successfully!" });
    } catch (error) {
        console.error("Error in adding to cart:", error.message);
        return res.status(500).json({ error: "Internal server error" });
    }
});
app.get('/edit-product',  async (req, res) => {
  try {
    const article = await Article.findById(req.query.id);
    res.render('EditProduct', {article}); 
  } catch (error) {
      console.log(error);
      res.status(400).json({error});
  }
});
app.put('/edit-product/:id', async (req, res) => {
  try {
    const {image, name, price, category, subcategory, cantity } = req.body;
    const {id} = req.params;

    // Find the article by ID
    const article = await Article.findById(id);
    console.log(id);
      // Update the article properties with the new values
    article.image = image;
    article.name = name;
    article.price = price;
    article.category = category;
    article.subcategory = subcategory;
    article.cantity = cantity;

    // Save the updated article to the database
    await article.save();

    res.status(201).json({ msg: 'Article modified successfully' });
  } catch (err) {
    console.log("Error editing the article:", err);
    res.status(400).json({ error: "Please enter all the required information!" });
  }
});

app.get('/login', (req, res) => res.render('LoginPage'));
app.get('/signup', (req, res) => res.render('SignUpPage'));
app.get('/forgot-password', (req, res) => res.render('ForgotPassword'));
app.get('/myAccount', (req, res) => res.render('MyAccount'));
app.get('/basket', requireAuth, (req, res) => res.render('Basket'));
app.get('/favorites', requireAuth, (req, res) => res.render('Favorites'));
app.get('/reset-password', (req, res) => res.render('ResetPassword'));
app.get('/add-article', (req, res) => res.render('AddArticle'));
app.listen(port, ()=> console.log(`Server is running at http://localhost:${port}`)); 
