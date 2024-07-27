const express = require('express');
const passport = require('passport');
const session = require('express-session');
const mongoose = require('mongoose');
const User = require('./public/user');
const flash = require('connect-flash');
const cookieParser = require('cookie-parser');
const bodyParser = require("body-parser");   
const {requireAuth, checkUser, getId, setId} = require('./public/authMiddleWare');
require("dotenv").config();
const jwt = require('jsonwebtoken');
const app = express();
const port = process.env.PORT || 3012;
const Article = require('./public/article');
const Cart = require('./public/cart');
const path = require('path');
const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs');
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

//Set the view directory
app.set('views', path.join(__dirname, 'views'));
//static files from a 'public' directory
app.use(express.static(path.join(__dirname, 'public')));
//Get current path
app.use((req, res, next) => {
  res.locals.currentPath = req.path;
  next();
});
// Connecting to DataBase
let dbURL = process.env.DB_URL;
mongoose.connect(dbURL, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Conectat la baza de date MongoDB!'))
    .catch(err => console.error('Eroare la conectarea la MongoDB:', err));
//Handle errors
const handleErros = (err) => {
  console.log(err.message, err.code);
  let errors = {name: '',email: '', password: ''};
  if(err.code === 11000){ //if error code is 11000 from user.js return the error bellow
    errors.email = 'This email is already used!';
    return errors;
  }
  if(err.message === 'Incorect email!'){ //'Incorect email from user.js -> checkEmail function
    errors.email = 'This email is not registered!';
    return errors;
  }
  if(err.message === 'Incorect password!'){ //Incorect password from user.js -> login function
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
//Sign Up post method
app.post('/signup', async (req, res) => {
    const { name, email, password } = req.body;
    try {
      if(name === '' || email === '' || password === ''){ //Checking if all fileds are empty
        res.status(400).json({warning: 'All fields must be filled!'});
      }else{
        const user = await User.create({name, email, password}); //Create new user
        const token = createToken(user._id); //Creat token for user
        res.cookie('jwt', token, {httpOnly: true, maxAge: maxAge * 1000}) //Set age and httpOnly for token
        res.status(201).json({user: user._id}); //Send user's ID for frontend
      }
      } catch (error) {
        const errors = handleErros(error);
        res.status(400).json({errors});
    }
});
//Log in post method
app.post('/login', async(req, res) => {
  const {email, password} = req.body;
    try{
      if(email === '' || password === ''){ //Checking if all fields are empty
        return res.status(400).json({warning: 'All fields must be filled!'});
      }else{
        const user = await User.login(email, password);//Checking if email and password are valids using login function from user.js file
        const token = createToken(user._id);//Create token when the user is login
        res.cookie('jwt', token, {httpOnly: true, maxAge: maxAge * 1000})//Set age and httpOnly for token
        console.log(user);
        return res.status(201).json({user: user._id, user: user.role});//Send user's ID and user's role to frontend
      }
    }catch(error){
      const errors = handleErros(error);
      console.log(errors)
      return res.status(400).json({errors});
    }
    
});
//Forgot password post method
app.post('/forgot-password', async(req, res) => {
  const {email} = req.body;
  try{
    if(email === ''){//Checking if the email field is empty or not
      return res.status(400).json({warning: 'Plase enter your email!'});
    }else{
      await User.checkEmail(email); //Checking email from database
      const token = jwt.sign({email}, process.env.JWT_SECRET, { //Create token for email wich expires in 1 hour
        expiresIn: "1h",
      });
      const transporter = nodemailer.createTransport({
        service: "gmail",
        secure:true,
        auth:{
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_PASS,
        },
      });
      const reciver = {
        from:"gymarticles9@gmail.com",
        to:email,
        subject:"Password Reset Request",
        html: `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                .container {
                    width: 100%;
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                    font-family: Arial, sans-serif;
                    background-color: #f4f4f4;
                }
                .header {
                    text-align: center;
                    padding: 10px 0;
                }
                .content {
                    background-color: #ffffff;
                    padding: 20px;
                    border-radius: 10px;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                }
                .button {
                    display: block;
                    width: 200px;
                    margin: 20px auto;
                    padding: 10px 15px;
                    text-align: center;
                    color: #ffffff;
                    background-color: #06b6d4;
                    border-radius: 15px;
                    text-decoration: none;
                    font-size: 16px;
                }
                .footer {
                    text-align: center;
                    margin-top: 20px;
                    font-size: 12px;
                    color: #666666;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h2>Password Reset Request</h2>
                </div>
                <div class="content">
                    <p>Hello,</p>
                    <p>We received a request to reset your password. Click the button below to reset your password:</p>
                    <a href="${process.env.CLIENT_URL}/reset-password/${token}" class="button">Reset Password</a>
                    <p>If you did not request a password reset, please ignore this email.</p>
                    <p>Thank you,<br>The Gym Articles Team</p>
                </div>
                <div class="footer">
                    <p>If you're having trouble clicking the "Reset Password" button, copy and paste the URL below into your web browser:</p>
                    <p><a href="${process.env.CLIENT_URL}/reset-password/${token}">RESET_LINK</a></p>
                </div>
            </div>
        </body>
        </html>
    `
      };
      await transporter.sendMail(reciver); //Sending email
      await User.findOneAndUpdate({ email }, {passwordResetTokenUsed: false}); //Changes "passwordResetTokenUsed" to false to letting the user resets his password again
      return res.status(200).json({message: "Success"}); //Sending success message to frontend

    }

  }catch(err){
    const error = handleErros(err);
    return res.status(500).json({error});
  }
})
//Reset password post method
app.post('/reset-password/:token', async (req, res) => {
  const {password, confPassword} = req.body;
  const {token} = req.params;
  try{
    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => { //Created an arrow function for decode token
      if(err){
        return res.status(400).json({warning: 'This URL is expired!'});//If token reach over 1 hour shows the warning to user
      }
      if(password === '' || confPassword === ''){ //Checking if password and confirm password fields are empty or not
        return res.status(400).json({warning: 'All fields must be filled!'});
      }
      if(password !== confPassword){//Checking if password and confirm password are identically
        return res.status(400).json({notEqual: 'Passwords are not equal!'});
      }
      if(password.length < 8){ //Checking the password is smaller then 8 characters
        return res.status(400).json({warning: 'Minimun length for the password is 8 characters!'});
      }
      const email = decoded.email; //Decode email
      const user = await User.findOne({email});//After email's decode search user by email
      if(user.passwordResetTokenUsed){//Check if 'passwordRessetTokenUsed' is true and shows the warning to user
        return res.status(400).json({warning: 'Sorry, looks like the reset password link has expired.'})
      }
      const salt = await bcrypt.genSalt();//Creat a salt
      const hashedPassword = await bcrypt.hash(password, salt);//Hashing password
      await User.findOneAndUpdate({ email }, { password: hashedPassword, passwordResetTokenUsed: true});//Update the new password
      //and update the passwordResetTokenUsed variable with true boolean for blocking the user to reset his password again in
      //the same page and the same token
      return res.status(200).json({ message: 'Success' });//Passing the message to frontend
    })
  }catch(error){
    console.log("Error at reset password post: ", error);
    return res.status(500).json({warning: 'Something went wrong, please try again later!'});
  }
});
//Manage information post method from user account
app.post('/manage-information', async (req, res) => {
  const {name, phone, year, day} = req.body;
  let {month} = req.body;
  const months = ["Ianuary", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  for(let i = 0; i < 12; i++){
    if(months[i] === month){
      month = i + 1;
      break;
    }
  }
  let dateOfBirth = `${year}-${month}-${day}`;
  try{
    if(name === '' || phone === '' || year === 'Year' || month === 'Month' || day === 'Day'){
      return res.send('All fields must be filled!');
    }
    if(phone.length < 10 || phone.length > 10){
      return res.send('Minimum length of phone number is 10 characters')
    }
    const userId = getId();
    await User.findByIdAndUpdate(userId, {name:name, phoneNumber: phone, dateOfBirth: dateOfBirth});
    res.redirect("/myAccount");
  }catch(error){
    const errors = handleErros(error);
    res.send(errors);
  }
});

//Add article post method 
app.post('/add-article', async (req, res) => {
  const {image, name, price, category, subcategory, cantity} = req.body;
  try{
      const article = await Article.create({image, name, price, category, subcategory, cantity});//Adding new article in database by admin
      article.save();
      res.status(201).json({msg:'Article added successfully'});//Handle successfully message for admin
  }catch(err){
    console.log("Error adding article: ", err);
    res.status(400).json({error: "Please enter all the required information!"});
  }
})
//Log out get method
app.get('/logout', (req, res) => {
  res.cookie('jwt', '', {maxAge: 1}); //Set token maxmim age with 1
  res.redirect('/'); //Redirect user to home page
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
app.get('*', checkUser); //Apply globally checkUser function from user.js file, for checking user for the entire application
//Home page get method
app.get('/', async (req, res) => {
  try {
    const { subcategory, category } = req.query;
    let articles;
    if (category) {
      articles = await Article.find({ category: category }); //Showing category
    } else if (subcategory) {
      articles = await Article.find({ subcategory: subcategory });//Showing subcategory
    } else {
      articles = await Article.find(); //Showing all products
    }
    res.render('HomePage', {articles});
  } catch (err) {
    return res.status(500).json({error: err.message});
  }
});
//Search get method
app.get('/search', async (req, res) => {
  try {
    let nrArticle = 0; //Number of results found
    const query = req.query.q; 
    const article = await Article.find({ $text: { $search: query } });  //Search by text in database
    nrArticle = article.length; //Passing the number of results to 'nrArticle' variable
    res.render('SearchResults', { article, query, nrArticle }); //Passing the variables to frontend and render the SearchResults page
  } catch (err) {
    console.error('Error for searching the product:', err);
  }
});
//Category results get method
app.get('/category-results', async (req, res) => {
  const {subcategory} = req.query;
  try {
    let results = 0; //Storing the results found
    const articles = await Article.find({subcategory: subcategory});//Finding the articles by subcategory name from database
    results = articles.length;//Counting the results found
    res.render( 'CategoryResults', {articles, subcategory, results}); //Render the 'CategoryResults' page and passing all variables to frontend
  } catch (error) {
    console.error('Error for searching the product:', error);
  }
 
});
//Product get method
app.get('/product', async (req, res) => {
  try {
    const {id} = req.query; //Get product id from query
    const article = await Article.findById(id); //Searching the article from database by product id
    res.render('Product', {article});//Display the product result and render the 'Product' page
  } catch (error) {
    console.error('Error for getting the product:', error);  
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
      return res.status(400).json({error});
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

    return res.status(201).json({ msg: 'Article modified successfully' });
  } catch (err) {
    console.log("Error editing the article:", err);
    return res.status(400).json({ error: "Please enter all the required information!" });
  }
});

app.post('/getArticles', async (req, res) => {
  let playload = req.body.playload.trim();
  let search = await Article.find({name: {$regex: new RegExp('^'+playload+'.*','i')}}).exec();
  search = search.slice(0, 10);
  res.send({playload: search});
});

app.get('/login', (req, res) => res.render('LoginPage'));
app.get('/signup', (req, res) => res.render('SignUpPage'));
app.get('/forgot-password', (req, res) => res.render('ForgotPassword'));
app.get('/myAccount', async (req, res) =>  {
  res.render('MyAccount');
});
app.get('/cart', requireAuth, (req, res) => res.render('Cart'));
app.get('/favorites', requireAuth, (req, res) => res.render('Favorites'));
app.get('/reset-password/:token', (req, res) => {
  res.render('ResetPassword');
});
app.get('/add-article', (req, res) => res.render('AddArticle'));
app.get('/chat', (req, res) => res.render('Chat'));
app.get('/showUsersAdmin', async (req, res) => {
  try {
    const users = await User.find({}, 'name email role');
    res.render('Users', {users});
  } catch (error) {
    res.send("Eroare: ", error);
  }
}
);
app.listen(port, ()=> console.log(`Server is running at http://localhost:${port}`)); 
