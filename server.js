const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const app = express();
const port = 3012;
app.use(bodyParser.urlencoded({ extended: true }));
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'HomePage.html', 'HomePage.css'));
});
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'LoginPage.html')); 
})
app.get('/signup', (req, res) => {
  res.sendFile(path.join(__dirname, 'SignUpPage.html'))
})
app.get('/reset', (req, res) => {
  res.sendFile(path.join(__dirname, "ResetPassword.html"))
})
app.listen(port, ()=> console.log(`Server is running at http://localhost:${port}`)); 