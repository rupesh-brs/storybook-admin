import express from 'express';
import cors from "cors";
import dotenv from 'dotenv';
import adminRoute from './routes/adminRoute.js';
import connectDB from './config/db.js';
import bodyParser from 'body-parser';
import { notFound, errorHandler } from './middleware/errMiddleware.js';
import session from "express-session";

const app = express();
dotenv.config();

app.use(session({
  secret: process.env.SESSION_SECRET || "mysecret",
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false, maxAge: 3600000 },
}));

app.use(bodyParser.json());
app.use(cors());
app.use(express.json());

// Static files & view setup
app.use(express.static("public"));
app.set("view engine", "ejs");
app.set("views", "./views"); // Corrected path
app.use(express.urlencoded({ extended: true }));

app.use("/api/admin", adminRoute);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log("StoryBook-Admin Backend Server");
  console.log(`Server is running on port ${PORT}`);
  connectDB();
});