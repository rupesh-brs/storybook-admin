import jwt from 'jsonwebtoken';

const generateVerificationToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '1h' });
};

export default generateVerificationToken;
