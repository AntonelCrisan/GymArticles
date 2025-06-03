const express = require('express');
const passport = require('passport');
const session = require('express-session');
const mongoose = require('mongoose');
const User = require('./public/user');
const flash = require('connect-flash');
const cookieParser = require('cookie-parser');
const bodyParser = require("body-parser");   
const {requireAuth,requirePasswordValidation, checkUser, getId, countFavoriteProduct, countCartProduct} = require('./public/authMiddleWare');
const jwt = require('jsonwebtoken');
const app = express();
const port = process.env.PORT || 3012;
const Article = require('./public/article');
const Addresses = require('./public/addresses');
const path = require('path');
const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs');
const axios = require("axios");
const Activity = require('./public/activity');
require("dotenv").config();
const stripe = require('stripe')(process.env.SECRET_STRIPE_KEY);
const apiBaseUrl = process.env.MODEL_API_URL || 'http://127.0.0.1:8000'; 
app.use(express.static('public'));
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(flash());
app.use(session({
  secret: process.env.SEESION_KEY || 'mySuperSecretKey',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Set `secure: true` in production with HTTPS
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
app.get('*', checkUser); //Apply globally checkUser function from user.js file, for checking user for the entire application
app.get('/signup', (req, res) => res.render('SignUpPage'));
//Sign Up post method
app.post('/signup', async (req, res) => {
    const { name, email, password } = req.body;
    try {
      if(name === '' || email === '' || password === ''){ //Checking if all fileds are empty
        res.status(400).json({warning: 'All fields must be filled!'});
      }else{
        const user = await User.create({name, email, password}); //Create new user
        const token = createToken(user._id); //Creat token for user
        res.cookie('user_token', token, {httpOnly: true, maxAge: maxAge * 1000}) //Set age and httpOnly for token
        res.status(201).json({user: user._id}); //Send user's ID for frontend
      }
      } catch (error) {
        const errors = handleErros(error);
        res.status(400).json({errors});
    }
});
app.get('/login', (req, res) => {
  res.render('LoginPage');
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
        res.cookie('user_token', token, {httpOnly: true, maxAge: maxAge * 1000})//Set age and httpOnly for token
        console.log(user);
        return res.status(201).json({user: user._id, user: user.role});//Send user's ID and user's role to frontend
      }
    }catch(error){
      const errors = handleErros(error);
      console.log(errors)
      return res.status(400).json({errors});
    }
    
});
app.get('/forgot-password', (req, res) => res.render('ForgotPassword'));
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
app.get('/reset-password/:token', (req, res) => {
  res.render('ResetPassword');
});
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
app.get('/myAccount',countFavoriteProduct, countCartProduct, (req, res) =>  {
  res.render('MyAccount', {nrFavorites: req.nrFavorites, nrCart:  req.nrCart});
});
//Manage information post method from user account
app.post('/manage-information', async (req, res) => {
 const userId = req.userId; //Useing getter method for geting the id from token
  const {nameUser, phoneNumber, year, day} = req.body;
  //Change the months into number for inserting corectlly in database
  let {month} = req.body;
  const months = ["Ianuary", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  for(let i = 0; i < 12; i++){//I go through the moths vector
    if(months[i] === month){//Checking the right index for right month reqested from frontend
      month = i + 1;//Increments by 1 because vectors starts with 0
      break;
    }
  }
  let dateOfBirth = `${year}-${month}-${day}`;//Merges the year, the mont and the day into a date
  try{
    if(isNaN(phoneNumber)){
      return res.status(400).json({warning: 'Phone number must be a number!'});
    }
    if(!nameUser || !phoneNumber){//Checks if name and phone are not empty
      return res.status(400).json({warning: 'All fields must be filled!'});
    }
    if(phoneNumber.length !== 10){//Checks the lenght of phone number, have to be 10 characters
      return res.status(400).json({warning: 'Minimum length of phone number is 10 characters'});
    }
    await User.findByIdAndUpdate(userId, {name:nameUser, phoneNumber: phoneNumber, dateOfBirth: dateOfBirth});//Updateding the data by userID
    res.status(200).json({message: 'Your personal data was successfully modified!'});//Sending success message to frontend for displaying the message
  }catch(error){//Catchs the error
    console.log(error);
    return res.status(500).json({error: "Something went wrong, try again later!"});
  }
});
//GET method for address page
app.get('/addresses', countFavoriteProduct, countCartProduct, async (req, res) => {
  const userId = req.userId; //Gets id from middleware when user is loged in for displaing his addresses
  const addresses = await Addresses.find({idUser: userId}); //Finds all addresses by idUser
  res.render('Addresses', {addresses, nrFavorites: req.nrFavorites,  nrCart:  req.nrCart});//Pass the addresses to frontend
});
//Add addresses post method
app.post('/add-address', requireAuth, async(req, res) => {
  const {name, phoneNumber, street, city, country} = req.body;//Reqests all inputs
  const idUser = req.userId;//Gets id from middleware for adding addresses
  try{
    if(!idUser){//Checks the user id and display a warning message
      return res.status(400).json({warning: 'Something went wrong, please try again later!'});
    }
    if(isNaN(phoneNumber)){//Checks the input phone number is a number
      return res.status(400).json({warning: 'Phone number must be a number!'});
    }
    if(!name || !phoneNumber || !street || !city || !country){//Checking if all fields are filled up
      return res.status(400).json({warning: 'All fields must be filled!'});
      }
      if(phoneNumber.length !== 10){//Checking the length of phone number
        return res.status(400).json({warning: 'Minimum length of phone number is 10'});
      }
      const address = await Addresses.create({idUser, name, phoneNumber, street, city, country}); //Adds new address
      address.save();//Saves the address
      return res.status(201).json({msg: "Address added succesfully"});
  }catch(error){
    return res.status(500).json({error: 'Internal server error'});
  }
});
//Update address post method
app.post('/update-address/:id', async (req, res) => {
  const {name, phoneNumber, street, city, country} = req.body;//Gets values from inputs
  const id = req.params.id;//Gets id from URL
  try {
    const idAddress = await Addresses.findOne({_id:id});//Finds the id
    if(!idAddress){//Checks the address
      return res.status(400).json({warning: 'Address not found!'});
    }
    if(isNaN(phoneNumber)){//Checks the input phone number is a number
      return res.status(400).json({warning: 'Phone number must be a number!'});
    }
    if(!name || !phoneNumber || !street || !city || !country){//Checking if all fields are filled up
      return res.status(400).json({warning: 'All fields must be filled!'});
    }
    if(phoneNumber.length !== 10){//Checks the phone number has 10 characters
      return res.status(400).json({warning: 'Minimum length of phone number is 10'});
    }
    await Addresses.findByIdAndUpdate(id, req.body, {new:true});//Update the address
    return res.status(200).json({message: 'Address updated succesfully'});
  } catch (error) {
      return res.status(500).json({error: "Internal server error!"});
  }
});

//Delete address post method
app.post('/delete-address/:id', async(req, res) => {
  const id = req.params.id;//Gets id from URL
  try {
    const idAddress = await Addresses.findOne({_id:id});//Finds the address
    if(!idAddress){//Checks the address is exists or not
      return res.status(400).json({warning: 'Address not found!'});
    }
    await Addresses.findByIdAndDelete(id);//Delete the address by id
    return res.status(200).json({message: 'Address deleted succesfully'});
  } catch (error) {
    return res.status(500).json({error: 'Internal server error!'});
  }
});
//GET method for change email page
app.get('/change-email/:id', requirePasswordValidation, (req, res) => {
  res.render('ChangeEmail');
});
app.post('/change-email/:id', async(req, res) => {
  const {email, confEmail} = req.body;//Gets email and confirm email
  const id = req.params.id;//Gets id from URL
  try {
    if(!email || !confEmail){//Checks the email and confirm email inputs are empty
      return res.status(400).json({warning: 'All fields must be filled!'});
    }
    if(email !== confEmail){//Verifies if email and confirm email are matching
      return res.status(400).json({warning: 'Emails do not match!'});
    }
    await User.findByIdAndUpdate(id, req.body, {new:true});//Updates the email
    req.session.message = 'Email updated succesfully!';//Set a session message for desplaying in settings page
    res.cookie('validate_pass', '', {maxAge: 1}); //Set token maxmim age with 1
    return res.status(200).json({success: 'success'});
  } catch (error) {
    const errors = handleErros(error);//Handles the errors
      console.log(errors)
      return res.status(400).json({errors});
  }
});
//GET method for changing the password page
app.get('/change-password', requirePasswordValidation, (req, res) => {
  res.render('ChangePassword');
});
//POST method for change password
app.post('/change-password', requireAuth, async(req, res) => {
  const {password, confPassword} = req.body;//Gets the values of password and confirm password
  const id = req.userId;//Gets id from authMiddleWare
  try {
    if(!password || !confPassword){//Checks the input password and confirm password are empty
      return res.status(400).json({warning: 'All fields must be filled!'});
    }
    if(password !== confPassword){//Checks if password and confirm password are the same
      return res.status(400).json({warning: 'Passwords do not match!'});
    }
    if(password.length < 8){//Checks the length of the password
      return res.status(400).json({warning: 'Minimun length for the password is 8 characters!'});
    }
    const salt = await bcrypt.genSalt();//Creat a salt
    const hashedPassword = await bcrypt.hash(password, salt);//Hashing password
    await User.findByIdAndUpdate(id, {password:hashedPassword}, {new:true});//Update password by id
    req.session.message = 'Password updated succesfully!';//Set a session message for desplaying in settings page
    res.cookie('validate_pass', '', {maxAge: 1}); //Set token maxmim age with 1
    return res.status(200).json({success: 'Success'});
  } catch (error) {
    const errors = handleErros(error);
    console.log(errors);
    return res.status(500).json({errors});
  }
});
app.get('/change-phone', requirePasswordValidation, (req, res) => {
  res.render('ChangePhoneNumber');
})
//GET method for validate password page
app.get('/validate-password', (req, res) => {
  const intendedUrl = req.query.next || req.session.intendedUrl;
  res.render('ValidatePassword', {intendedUrl});
});
//POST method for validate password
app.post('/validate-password', requireAuth, async(req, res) => {
  const {password, intendedUrl} = req.body;//Gets the value of password
  const id = req.userId;//Gets the id for checking the password by user id
  try {
    if(!password){//Checks the input password is empty
      return res.status(400).json({warning: 'Please enter the password!'});
    }else{
      await User.validate(id, password);//From user.js call the validate function and compare the input password with password from database by id
      const token = createToken(id);//Creates token when user navigate to settings to restricted him for changing his phone number and password until he enter his password
      res.cookie('validate_pass', token, {httpOnly: true, maxAge: 1800000})//Set age for 30min and httpOnly for token
      return res.status(200).json({valid:true, intendedUrl});
    }
  } catch (error) {
    const errors = handleErros(error);
    console.log(errors);
    return res.status(500).json({errors});
  }
});
app.get('/reviews', countFavoriteProduct, countCartProduct, (req, res) => {
  res.render('Reviews',{nrFavorites: req.nrFavorites,  nrCart:  req.nrCart});
});
//GET method for settings page
app.get('/settings', countFavoriteProduct,countCartProduct, (req, res) => {
  const message = req.session.message;//Gets the messages from session
  delete req.session.message;//After displaying the message deletes the message from session
  res.render('Settings', {message, nrFavorites: req.nrFavorites,  nrCart:  req.nrCart});
});

//POST method for deleting favorite product
app.post('/deleteFavorite/:id', requireAuth,async(req, res) => {
  const userId = req.userId;
  const id = req.params.id;
  try {
    await User.findByIdAndUpdate(userId, { $pull: { favorites: id } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({error});
  }
});
async function recommendations(user_id){
  try {
    const response = await axios.get(`${apiBaseUrl}/recommendations?user_id=${user_id}`);
    return response.data;
  } catch (error) {
      console.error("Eroare la preluarea datelor:", error);
      return null; // Poți returna o valoare implicită sau să arunci eroarea
  }
}

async function recommendations_cart(user_id, product_id){
  try {
    const response = await axios.get(`${apiBaseUrl}/cart-recommendations?user_id=${user_id}&product_id=${product_id}`);
    return response.data;
  } catch (error) {
      console.error("Eroare la preluarea datelor:", error);
      return null; // Poți returna o valoare implicită sau să arunci eroarea
  }
}

async function recommendations_cart_view(user_id, product_id){
  try {
    const response = await axios.get(`${apiBaseUrl}/cart-view-recommendations?user_id=${user_id}&product_id=${product_id}`);
    return response.data;
  } catch (error) {
      console.error("Eroare la preluarea datelor:", error);
      return null; // Poți returna o valoare implicită sau să arunci eroarea
  }
}
async function recommendations_favorite_view(user_id, product_id){
  try {
    const response = await axios.get(`${apiBaseUrl}/favorite-view-recommendations?user_id=${user_id}&product_id=${product_id}`);
    return response.data;
  } catch (error) {
      console.error("Eroare la preluarea datelor:", error);
      return null; // Poți returna o valoare implicită sau să arunci eroarea
  }
}
async function recommendations_product_view(user_id, product_id){
  try {
    const response = await axios.get(`${apiBaseUrl}/view-product?user_id=${user_id}&product_id=${product_id}`);
    return response.data;
  } catch (error) {
      console.error("Eroare la preluarea datelor:", error);
      return null; // Poți returna o valoare implicită sau să arunci eroarea
  }
}
//POST method for adding favorite product
app.post('/addFavorite', requireAuth, async (req, res) => {
  try {
      const { productId, isAdding } = req.body;
      const userId = req.userId; // Ensure this function returns the correct user ID
      const user = await User.findById(userId);
      const product = await Article.findById(productId);
      if (isAdding) {
          // Add productId to favorites if it's not already present
          if (!user.favorites.includes(productId)) {
              const userInteraction = new Activity({
                userId: userId,
                productId: productId,
                productName: product.name,
                category: product.category,
                subcategory: product.subcategory,
                price: product.price,
                action: "added_to_favorite",
                timestamp : Math.floor(Date.now() / 1000)
              });
              userInteraction.save()
              .then(() => {
                console.log("Activity saved successfully!");
              })
              user.favorites.push(productId);
              await user.save();
          }
      } else {
          // Remove productId from favorites if it's present
          user.favorites = user.favorites.filter(id => !id.equals(productId));
          await user.save();
      }
      const newFavoriteCount = user.favorites.length;
      res.json({ success: true, newFavoriteCount, user });
  } catch (error) {
      console.error('Error in /addFavorite:', error);
      res.status(500).json({ success: false, message: 'Server error' });
  }
});

//POST method for adding products to cart
app.post('/addToCartFromDetail', requireAuth, async (req, res) => {
  try {
    const userId = req.userId; // obținut din middleware
    if (!userId) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }
    const user = await User.findById(userId).populate('cart.productId');
    const { productId, quantity } = req.body;
    const qtyToAdd = quantity;
    // Find if the product is already in the cart
    const cartItem = user.cart.find(item => item.productId.equals(productId));
    const stockProduct = await Article.findById(productId);
    let products;
    if(stockProduct.cantity !== 0){
      if (cartItem) {
        // If product already in cart, increase the quantity
        cartItem.quantity += qtyToAdd;
      } else {
        user.cart.push({ productId, quantity: qtyToAdd });
        const recommendedProducts = await recommendations_cart(userId, productId);
        if(recommendedProducts){
          const recomendationsArray = recommendedProducts.recommended_products;
          products = await Article.find({ _id: { $in: recomendationsArray } });
        }
      const userInteraction =  new Activity({
        userId: userId,
        productId: productId,
        productName: stockProduct.name,
        category: stockProduct.category,
        subcategory: stockProduct.subcategory,
        price: stockProduct.price,
        action: "added_to_cart",
        timestamp : Math.floor(Date.now() / 1000)
      });
      userInteraction.save()
      .then(() => {
        console.log("Activity saved successfully!");
      })
      }
      await user.save();
      const newCartCount = user.cart.reduce((total, item) => total + item.quantity, 0);
      return res.json({ success: true, newCartCount, user, products});
    }else{
      return res.json({success: false, message: 'Product is out of stock'});
    }
  } catch (error) {
    console.error('Error in :', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

//POST method for adding products to cart
app.post('/addToCart', requireAuth, async (req, res) => {
  try {
    const userId = req.userId; // obținut din middleware
    if (!userId) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    const { productId } = req.body;

    const user = await User.findById(userId).populate('cart.productId');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const stockProduct = await Article.findById(productId);
    if (!stockProduct) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    if (stockProduct.cantity === 0) {
      return res.json({ success: false, message: 'Product is out of stock' });
    }

    // Verificăm dacă produsul e deja în coș
    const cartItem = user.cart.find(item => item.productId.equals(productId));

    if (cartItem) {
      cartItem.quantity += 1;
    } else {
      user.cart.push({ productId, quantity: 1 });

      const userInteraction = new Activity({
        userId,
        productId,
        productName: stockProduct.name,
        category: stockProduct.category,
        subcategory: stockProduct.subcategory,
        price: stockProduct.price,
        action: "added_to_cart",
        timestamp: Math.floor(Date.now() / 1000)
      });

      await userInteraction.save();
    }

    await user.save();

    const newCartCount = user.cart.reduce((total, item) => total + item.quantity, 0);
    return res.json({ success: true, newCartCount });

  } catch (error) {
    console.error('Error in :', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});


//POST method for deleting products from cart
app.post('/deleteFromCart/:id', requireAuth,async(req, res) => {
  const userId = req.userId;
  const id = req.params.id;
  try {
    await User.updateOne(
      { _id: userId, 'cart.productId': id },
      { $pull: { cart: { productId: id } } }
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({error});
    console.log(error);
  }
});
//POST method for increasing products in cart
app.post('/updateCantity/:id', requireAuth, async (req, res) => {
  const userId = req.userId;
  const productId = req.params.id;
  const { quantity } = req.body; // The new quantity from the request body
  // Validate the quantity
  if (typeof quantity !== 'number' || quantity <= 0) {
    return res.status(400).json({ error: 'Invalid quantity' });
  }
  try {
    const user = await User.findById(userId);
    const cartItemIndex = user.cart.findIndex(item => item.productId.toString() === productId);

    if (cartItemIndex === -1) {
      return res.status(404).json({ error: 'Product not found in cart' });
    }
    // Update the quantity of the item in the cart
    user.cart[cartItemIndex].quantity = quantity;
    // Save the updated user document
    res.json({ success: true, newQuantity: quantity });
    await user.save();
  } catch (error) {
    console.log(error);
  }
});
app.get('/add-article', (req, res) => res.render('AddArticle'));
//Add article post method 
app.post('/add-article', async (req, res) => {
  const {image, name, price, category, subcategory, cantity, description} = req.body;
  try{
      const article = await Article.create({image, name, price, category, subcategory, cantity, description});//Adding new article in database by admin
      article.save();
      res.status(201).json({msg:'Article added successfully'});//Handle successfully message for admin
  }catch(err){
    console.log("Error adding article: ", err);
    res.status(400).json({error: "Please enter all the required information!"});
  }
})
//Log out get method
app.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).json({ error: 'Logout failed' });
    }
    res.cookie('user_token', '', {maxAge: 1}); //Set token maxmim age with 1
    res.cookie('validate_pass', '', {maxAge: 1}); //Set token maxmim age with 1
    res.redirect('/'); //Redirect user to home page
  });
});
//Token age
const maxAge = 3 * 24 * 60 * 60;
//Creating token
const createToken = (id) => {
  const jwt_secret = process.env.JWT_SECRET;
  return jwt.sign({id}, jwt_secret, {
    expiresIn: maxAge
  })
}
async function showTop15Products() {
  try {
      const response = await axios.get(`${apiBaseUrl}/top15`);
      return response.data;
  } catch (error) {
      console.error("Eroare la preluarea datelor:", error);
      return null; // Poți returna o valoare implicită sau să arunci eroarea
  }
}
//Home page get method
app.get('/', countFavoriteProduct, countCartProduct, async (req, res) => {
  try {
    const { subcategory, category } = req.query;
    let articles;
    let topProducts;
    let top15ProductsRecomendations;
    const articlesFilter = await Article.find();
    const grouped = {};
    for (const article of articlesFilter) {
      const category = article.category;
      const subcategory = article.subcategory;

      if (!grouped[category]) {
        grouped[category] = new Set();
      }

      grouped[category].add(subcategory);
    }

    const categories = Object.entries(grouped).map(([category, subcats]) => ({
      category,
      subcategories: Array.from(subcats)
    }));
    const userId = req.userId;
    const user = await User.findById(userId);
    const favoriteProductsID = user ? user.favorites : [];
    if (category) {
      articles = await Article.find({ category: category }); //Showing category
    } else if (subcategory) {
      articles = await Article.find({ subcategory: subcategory });//Showing subcategory
    } else {
      articles = await Article.find(); //Showing all products
    }
    const top15Products = await showTop15Products();
    const product_recomendations = await recommendations(userId);
    if (top15Products && product_recomendations) {
      const productIds = top15Products.map(product => product.productId);
      const recomendationsArray = product_recomendations.recommendations;
      topProducts = await Article.find({ _id: { $in: productIds } });
      top15ProductsRecomendations = await Article.find({ _id: { $in: recomendationsArray } });
    }

    res.render('HomePage', {articles, categories, topProducts,top15ProductsRecomendations, nrFavorites: req.nrFavorites, nrCart:  req.nrCart, favoriteProductsID});
  } catch (err) {
    return res.status(500).json({error: err.message});
  }
});

//Search get method
app.get('/search', countFavoriteProduct, countCartProduct, async (req, res) => {
  try {
    let nrArticle = 0; //Number of results found
    const query = req.query.q; 
    const article = await Article.find({ $text: { $search: query } });  //Search by text in database
    nrArticle = article.length; //Passing the number of results to 'nrArticle' variable
    res.render('SearchResults', { article, query, nrArticle, nrFavorites: req.nrFavorites,  nrCart:  req.nrCart }); //Passing the variables to frontend and render the SearchResults page
  } catch (err) {
    console.error('Error for searching the product:', err);
  }
});

//Category results get method
app.get('/category-results', countFavoriteProduct, countCartProduct, async (req, res) => {
  const { category, subcategory } = req.query;

  try {
    let filter = {};
    if (subcategory) filter.subcategory = subcategory;
    if (category) filter.category = category;

    const articles = await Article.find(filter);
    const results = articles.length;

    res.render('CategoryResults', {
      articles,
      subcategory,
      category,
      results,
      nrFavorites: req.nrFavorites,
      nrCart: req.nrCart
    });
  } catch (error) {
    console.error('Error searching the product:', error);
    res.status(500).send('Server error');
  }
});

//Product get method
app.get('/product', checkUser, countFavoriteProduct, countCartProduct, async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.query;
    const article = await Article.findById(id).lean();
    article.cantity = 1;

    let user = null;
    let favoriteProductsID = [];
    let products = [];

    if (userId) {
      user = await User.findById(userId);
      favoriteProductsID = user.favorites;

      const viewProductRecommendations = await recommendations_product_view(userId, id);
      if (viewProductRecommendations) {
        const recomendationsArray = viewProductRecommendations.recommended_products;
        products = await Article.find({ _id: { $in: recomendationsArray } });
      }

      const userInteraction = new Activity({
        userId,
        productId: article._id,
        productName: article.name,
        category: article.category,
        subcategory: article.subcategory,
        price: parseFloat(article.price).toFixed(2),
        action: "viewed",
        timestamp: Math.floor(Date.now() / 1000)
      });

      await userInteraction.save();
      console.log("Activity saved successfully!");
    }

    res.render('Product', {
      article,
      nrFavorites: req.nrFavorites || 0,
      nrCart: req.nrCart || 0,
      favoriteProductsID,
      products
    });
  } catch (error) {
    console.error('Error for getting the product:', error);
    res.status(500).send('Server error');
  }
});

app.get('/edit-product/:id', async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    res.render('EditProduct', { article });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ error });
  }
});
app.post('/edit-product/:id', async (req, res) => {
  try {
    const { image, name, price, category, subcategory, cantity, description } = req.body;
    const id = req.params.id;

    const article = await Article.findById(id);
    if (!article) {
      return res.status(404).json({ error: "Product not found" });
    }

    await Article.findByIdAndUpdate(id, {
      image,
      name,
      price,
      category,
      subcategory,
      cantity,
      description
    });

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
app.get('/cart', requireAuth, countFavoriteProduct, countCartProduct, async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId).populate('cart.productId');
    const favoriteProductsID = user ? user.favorites : [];
    let products;
    const cart = user.cart.map(item => ({
      ...item.productId.toObject(),
      quantity: item.quantity
    }));
    const productId = cart.map(productID => (
      productID._id.toString()
    ));
    const totalProducts = productId.length - 1;
    const lastProductAddedToCart = productId[totalProducts];
    if(cart.length !== 0){
      const recommendedProducts = await recommendations_cart_view(userId, lastProductAddedToCart);
      if(recommendedProducts){
        const recomendationsArray = recommendedProducts.recommended_products;
        products = await Article.find({ _id: { $in: recomendationsArray } });
      }
    }
    // Calculate total cost
    const productCost = cart.reduce((total, item) => {
      const price = parseFloat(item.price);
      const quantity = item.quantity || 1;
      return total + (isNaN(price) ? 0 : price * quantity);
    }, 0);
    const deliveryCost = 5;
    req.session.productCost = productCost;
    res.render('Cart', { nrFavorites: req.nrFavorites, nrCart: req.nrCart, cart, productCost, deliveryCost, products, favoriteProductsID});
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
    console.log(error);
  }
});

app.get('/favorites', requireAuth, countFavoriteProduct, countCartProduct, async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId).populate('favorites');
    const favoriteProductsID = user ? user.favorites : [];
    const favoriteProductIds = user.favorites;
    const favorites = await Article.find({ _id: { $in: favoriteProductIds } });
    let products;
    const productId = favorites.map(productID => (
      productID._id.toString()
    ))
    const totalProducts = favoriteProductIds.length - 1;
    const lastProductAddedToCart = productId[totalProducts];
    if(favorites.length !== 0){
    const recommendedProducts = await recommendations_favorite_view(userId, lastProductAddedToCart);
      if(recommendedProducts){
        const recomendationsArray = recommendedProducts.recommended_products;
        products = await Article.find({ _id: { $in: recomendationsArray } });
      }
    }
    res.render('Favorites', {nrFavorites: req.nrFavorites, nrCart:  req.nrCart, favorites, products, favoriteProductsID})
  } catch (error) {
    res.status(500).json({error: 'Server error'});
  }
});
app.get('/checkout', countCartProduct, async (req, res) => {
  const userId = req.userId; //Gets id from middleware when user is loged in for displaing his addresses
  const addresses = await Addresses.find({idUser: userId}); //Finds all addresses by idUser
  const user = await User.findById(userId).populate('cart.productId');
  const cart = user.cart.map(item => ({
    ...item.productId.toObject(),
    quantity: item.quantity
  }));
  const productCost = req.session.productCost;
  const deliveryCost = 5;
  res.render('Checkout', {cart, addresses, nrCart: req.nrCart, productCost, deliveryCost });
});

app.get('/summary',countCartProduct, async (req, res) => {
  const userId = req.userId;
  const user = await User.findById(userId).populate('cart.productId');
  const cart = user.cart.map(item => ({
    ...item.productId.toObject(),
    quantity: item.quantity
  }));
  const deliveryCost = 5;
  const productCost = req.session.productCost;
  res.render('OrderSummary', { nrCart: req.nrCart, cart,  productCost, deliveryCost});
});

app.post('/pay-courier', requireAuth, async (req, res) => {
  try {
      const userId = req.userId; // Retrieve user ID
      const { deliveryAddress, billingAddress, paymentMethod, orderTotal, deliveryCostAndProcessingCost } = req.body;
      const user = await User.findById(userId).populate('cart.productId');
      if (!user) {
        console.error(`User with ID ${userId} not found.`);
        return res.status(404).json({ error: 'User not found' });
    }
      const cart = user.cart.map(item => ({
        productId: item.productId._id,
        name: item.productId.name,
        image: item.productId.image,
        price: item.productId.price,
        quantity: item.quantity,
    }));
    // Construirea unui nou obiect pentru comanda
    const newOrder = {
      orderDate: new Date(),
      products: cart.map(product => ({
        productId: product.productId,
        name: product.name,
        image: product.image,
        quantity: product.quantity,
      })),
      totalPrice: orderTotal,
      deliveryCostAndProcessingCost: deliveryCostAndProcessingCost,
      status: 'pending',
      deliveryAddress: deliveryAddress,
      deliveryBillingData: billingAddress, // Folosim direct billingAddress dacă structura e compatibilă
      paymentMethod: paymentMethod,
    };
    await User.findOneAndUpdate(
      { _id: userId },
      {
          $push: { orders: newOrder },
          $set: { cart: [] } // Golește coșul
      },
      { new: true, useFindAndModify: false }
  );
  // Obține detaliile suplimentare ale produselor
const cartWithDetails = await Promise.all(
  cart.map(async (item) => {
      const productDetails = await Article.findById(item.productId); // Caută produsul în baza de date
      return {
          ...item,
          category: productDetails?.category || 'Unknown', // Folosește "Unknown" dacă nu există categoria
          subcategory: productDetails?.subcategory || 'Unknown',
      };
  })
);
const userInteractions = cartWithDetails.map(item => ({
  userId: userId,
  productId: item.productId,
  productName: item.name,
  category: item.category,
  subcategory: item.subcategory,
  price: item.price,
  action: "purchased",
  timestamp: Math.floor(Date.now() / 1000)
}));
Activity.insertMany(userInteractions)
  .then(() => {
    console.log("All interactions saved successfully!");
  })
  .catch(err => console.error("Error saving interactions:", err));
  res.status(200).json({success: true});
  } catch (error) {
      console.error('Eroare la procesarea comenzii:', error);
      return res.status(500).json({ error: 'Internal server error' });
  }
});
app.get('/order-placed',countCartProduct, async (req, res) => {
  res.render('OrderPlaced', { nrCart: req.nrCart});
});
  app.post('/pay', requireAuth, async (req, res) => {
    const userId = req.userId; // Retrieve user ID
    const user = await User.findById(userId).populate('cart.productId');
    const { deliveryAddress, billingAddress, paymentMethod, orderTotal, deliveryCostAndProcessingCost } = req.body;
    const cart = user.cart.map(item => ({
      productId: item.productId._id,
      name: item.productId.name,
      image: item.productId.image,
      price: item.productId.price,
      quantity: item.quantity,
    }));
    const newOrder = {
      orderDate: new Date(),
      products: cart.map(product => ({
        productId: product.productId,
        name: product.name,
        image: product.image,
        quantity: product.quantity,
      })),
      totalPrice: orderTotal,
      deliveryCostAndProcessingCost: deliveryCostAndProcessingCost,
      status: 'pending',
      deliveryAddress: deliveryAddress,
      deliveryBillingData: billingAddress, // Folosim direct billingAddress dacă structura e compatibilă
      paymentMethod: paymentMethod,
    };
    try {
      // Create Stripe checkout session
      const session = await stripe.checkout.sessions.create({
        line_items: cart.map(product => ({
          price_data: {
            currency: 'usd',
            product_data: {
              name: product.name,
            },
            unit_amount: Math.round(product.price * 100), // Convert price to cents
          },
          quantity: product.quantity,
        })),
        mode: 'payment',
        success_url: `${process.env.CLIENT_URL}/success-payment?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.CLIENT_URL}/summary`,
      });
    user.orders.push(newOrder);
    await user.save();
    res.status(200).json({ url: session.url });
    } catch (error) {
      console.error('Error creating Stripe session:', error);
      res.status(500).send({ error: 'Internal Server Error' });
    }
  });
  app.get('/success-payment', async (req, res) => {
      // Retrieve the session details from Stripe
        await stripe.checkout.sessions.retrieve(req.query.session_id);
        const userId = req.userId; // Get the user ID from session metadata
        // Retrieve the user and cart details
        const user = await User.findById(userId).populate('cart.productId');
        const cartItems = user.cart.map(item => ({
          productId: item.productId._id,
          name: item.productId.name,
          price: item.productId.price,
          quantity: item.quantity,
        }));
      // Obține detaliile suplimentare ale produselor
      const cartWithDetails = await Promise.all(
        cartItems.map(async (item) => {
            const productDetails = await Article.findById(item.productId); // Caută produsul în baza de date
            return {
                ...item,
                category: productDetails?.category || 'Unknown', // Folosește "Unknown" dacă nu există categoria
                subcategory: productDetails?.subcategory || 'Unknown',
            };
        })
    );
      const userInteractions = cartWithDetails.map(item => ({
          userId: userId,
          productId: item.productId,
          productName: item.name,
          category: item.category,
          subcategory: item.subcategory,
          price: item.price,
          action: "purchased",
          timestamp: Math.floor(Date.now() / 1000)
      }));
      Activity.insertMany(userInteractions)
      .then(() => {
        console.log("All interactions saved successfully!");
      })
      .catch(err => console.error("Error saving interactions:", err));
      // Clear the cart
      user.cart = [];
      // Save the updated user data
      await user.save();
        // Render the success page
        res.render('SuccessPayOnlineCard');
  });
  app.get('/order-history', countFavoriteProduct, countCartProduct, async (req, res) => {
    try {
      const userId = req.userId;
      const user = await User.findById(userId).select('orders').lean();
      const orders = user.orders;
      // Renderizează pagina HTML pentru utilizatori
      res.render('OrderHistory', {
        nrFavorites: req.nrFavorites,
        nrCart: req.nrCart,
        orders: orders, // toate comenzile (pentru cazul fără paginare în HTML)
      });
    } catch (error) {
      console.error(error);
      res.status(500).send('Server error');
    }
  });
  
  
app.get('/showUsersAdmin', async (req, res) => {
  try {
    const users = await User.find({}, 'name email role');
    res.render('Users', {users});
  } catch (error) {
    res.send("Eroare: ", error);
  }
}
);
//API for showing all activities in json format
app.get('/activities', async (req, res) => {
    try {
        const activities = await Activity.find();
        res.json(activities);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});
app.delete('/deleteActivities/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const result = await Activity.deleteMany({ userId });

    if (result.deletedCount === 0) {
      return res.status(404).json({ success: false, message: 'No activities found for this userId.' });
    }

    return res.json({ success: true, message: `Deleted ${result.deletedCount} activities for userId: ${userId}` });
  } catch (error) {
    console.error('Error deleting activities:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.listen(port, ()=> console.log(`Server is running at http://localhost:${port}`)); 
