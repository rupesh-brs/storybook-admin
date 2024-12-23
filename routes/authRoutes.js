import express from 'express';
import {
  registerUser,
  verifyEmail,
  loginUser,
  getProfileDetails,
 
} from '../controllers/authController.js';

const router = express.Router();

// Register User
router.post('/register', registerUser);
// Verify Email
router.get('/verifyEmail/:verify_token', verifyEmail);
// Login User
router.post('/login', loginUser);
// Get Profile Details
router.get("/profile",getProfileDetails)



export default router;
