import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    // No need for useNewUrlParser and useUnifiedTopology options anymore
    await mongoose.connect(process.env.MONGO_URI); 
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

export default connectDB;
