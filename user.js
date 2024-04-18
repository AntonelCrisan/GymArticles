const mongoose = require('mongoose');

// Definirea schemei pentru utilizatori
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true // Asigură că fiecare email este unic
  },
  password: {
    type: String,
    required: true
  },
  confPassword: {
    type: String,
    required: true
  }
});

// Definirea modelului utilizatorului
const User = mongoose.model('User', userSchema);

module.exports = User;
