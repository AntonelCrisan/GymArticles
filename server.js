const express = require('express');
const path = require('path');
const app = express();
const port = 3012;
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'HomePage.html'));
});
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'LoginPage.html'));
})
app.listen(port, ()=> console.log(`Server is running at http://localhost:${port}`)); 