const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const {isEmail} = require('validator');
// Definirea schemei pentru utilizatori
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please enter a name']
  },
  email: {
    type: String,
    required: [true, 'Please enter a email'],
    unique: true,
    validate: [isEmail, "Please enter a valid email"]
  },
  password: {
    type: String,
    required: [true, 'Please enter a password'],
    minLength: [8, 'Minimun length for the password is 8 characters']
  },
  role: {
    type: String,
    default: "user"
  }
});
userSchema.pre('save', async function(next) {
  const salt = await bcrypt.genSalt();
  this.password = await bcrypt.hash(this.password, salt);
  next();
})

userSchema.statics.login = async function(email, password){
  const user = await this.findOne({email});
  if(user){
    const auth = await bcrypt.compare(password, user.password);
    if(auth){
      return user;
    }
    throw Error('Incorect password!');
  }
  throw Error('Incorect email!');
}

userSchema.statics.checkEmail = async function(email){
  const checkEmail = await this.findOne({email});
  if(checkEmail){
    return checkEmail;
  }else{
    throw Error("Incorect email!");
  }
}

// Definirea modelului utilizatorului
const User = mongoose.model('User', userSchema);

module.exports = User;
