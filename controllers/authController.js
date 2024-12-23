import User from '../models/adminModel.js';
import bcrypt from 'bcrypt';
// import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import sendEmailVerificationLink from '../utils/mailer.js';
import emailRegex from 'email-regex';

// Register user
const registerUser = async (req, res, next) => {
  const { name, email, password, role } = req.body;
  try {
    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "name, email, password, and role are required!" });
    }

    // Check email format using regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid Email format." });
    }

    // Check if the user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(409).json({ message: "User with this email already exists." });
    }

    // Hash the password using bcrypt
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate the verification token (expires in 2 hours)
    const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: "2h" });

    try {
      const verificationEmailResponse = await sendEmailVerificationLink(email, token, name);

      // Check if the email sending failed
      if (verificationEmailResponse.error) {
        return res.status(500).json({ message: "Failed to send verification email, please try again later" });
      }
      const user = new User({
        name,
        email,
        password: hashedPassword,
        role,
        verify_token: token,
        verify_token_expires: Date.now() + 7200000,
      });
      await user.save();

      return res.status(201).json({
        message: "Registered successfully, please check email for the verification link.",
      });
    } catch (emailError) {
      return next(emailError);
    }
  } catch (err) {
    return next(err);
  }
};

// Verify email address
const verifyEmail = async (req, res, next) => {
  try {
    console.log(req.params.verify_token);
    const user = await User.findOne({ verify_token: req.params.verify_token });
    if (!user) {
      return res.status(404).send("User not found so,Invalid token");
    } else if (user.verify_token_expires <= Date.now()) {
      if (!user.verified) {
        await user.deleteOne();
        return res
          .status(409)
          .send("Verification link is expired.Please register again");
      } else {
        return res.status(409).send("Please login to continue");
      }
    } else if (user.verified === true) {
      return res.status(200).json({
        status: "success",
        message: "Email already verified. Please login.",
      });
    } else {
      user.verified = true;
      await user.save();
      return res.status(201).json({
        status: "success",
        message: "Email verified successfully. Please login.",
      });
    }
  } catch (error) {
    return next(error);
  }
};
// Login user

const loginUser = async (req, res, next) => {
  const { email, password } = req.body;
  
  // Check if email and password are provided
  if (!email || !password) {
    const err = new Error("Please enter both email and password");
    err.statusCode = 400;
    return next(err);
  }

  // Check if the email is valid
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    const err = new Error("Invalid email");
    err.statusCode = 400;
    return next(err);
  }

  try {
    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      const err = new Error("User not found");
      err.statusCode = 404;
      return next(err);
    }
    
    // Check if the user is verified
    if (!user.verified) {
      const err = new Error("Email verification is pending. Please verify your email first.");
      err.statusCode = 409;
      return next(err);
    }

    // Check if the password is correct
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      const err = new Error("Invalid password");
      err.statusCode = 401;
      return next(err);
    }

    // Token generation (exclude password from token payload)
    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '30d' } // Token expiration set to 30 days
    );
    
    // Send the token in the response
    res.status(202).json({
      message: "Login Successful!",
      token: token, // Send the token
      yourDetails: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        verified: user.verified,
      }
    });

  } catch (error) {
    return next(error);
  }
};

// Get profile details
const getProfileDetails = async (req, res, next) => {
  try {
    // Get the token from the Authorization header
    const token = req.headers.authorization?.split(' ')[1]; // Assuming 'Bearer token' format

    if (!token) {
      const err = new Error("No token provided. Please log in.");
      err.statusCode = 401;
      return next(err);
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch user details using the userId from the decoded token
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      const err = new Error("User not found");
      err.statusCode = 404;
      return next(err);
    }

    // Return user details
    return res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      verified: user.verified,
    });
  } catch (error) {
    return next(error);
  }
};
export{ registerUser, verifyEmail, loginUser, getProfileDetails };