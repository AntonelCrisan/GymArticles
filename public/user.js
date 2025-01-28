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
    required: [true, 'Please enter an email'],
    unique: true,
    validate: [isEmail, "Please enter a valid email"]
  },
  password: {
    type: String,
    required: [true, 'Please enter a password'],
    minLength: [8, 'Minimum length for the password is 8 characters']
  },
  role: {
    type: String,
    default: "user"
  },
  passwordResetTokenUsed: { type: Boolean, default: false },
  dateOfBirth: {
    type: Date,
    default: new Date()
  },
  phoneNumber: {
    type: String,
    minLength: [10, 'Minimum length for the phone number is 10 characters']
  },
  favorites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Article'
  }],
  cart: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Article' },
    quantity: { type: Number, default: 1 }
  }],
  orders: [{
    orderDate: { type: Date, default: Date.now },
    products: [{
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Article' },
      name: { type: String },
      image: { type: String },
      quantity: { type: Number, default: 1 }
    }],
    totalPrice: { type: String },
    deliveryCostAndProcessingCost: { type: String },
    status: {
      type: String,
      default: 'pending', // other statuses: 'shipped', 'delivered', etc.
      enum: ['pending', 'shipped', 'delivered', 'cancelled']
    },
    deliveryAddress: {
      name: { type: String },
      phoneNumber: { type: String },
      street: { type: String },
      city: { type: String },
      country: { type: String }
    },
    deliveryBillingData: {
      name: { type: String },
      phoneNumber: { type: String },
      street: { type: String },
      city: { type: String },
      country: { type: String }
    },
    paymentMethod: { type: String}
  }]
});
userSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified or is new
  if (this.isModified('password')) {
    const salt = await bcrypt.genSalt();
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});

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

userSchema.statics.validate = async function(id, password){
  const user = await this.findById(id);
  if(user){
    const validate = await bcrypt.compare(password, user.password);
    if(validate){
      return user;
    }
    throw Error('Incorect password!');
  }
  throw Error('User not found!');
};
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
