
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,  
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    required: true,
    enum: ['author', 'reader', 'admin'],
    default: 'reader' 
  },

  verified: {
    type: Boolean,
    default: false, 
  },
  verify_token: { type: String},
  verify_token_expires: Date,
  isAdmin: { type: Boolean, default: false }, // admin

});

const User = mongoose.model('User', userSchema);

export default User;
