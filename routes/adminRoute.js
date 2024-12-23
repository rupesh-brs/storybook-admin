import express from "express";
import { adminLogin, adminDashboard, userList, deleteUser, storiesList, deleteStory } from "../controllers/adminController.js";

// Authentication middleware
const isAuthenticated = (req, res, next) => {
  // Check if user is logged in (session exists)
  if (req.session && req.session.user) {
    return next(); // Proceed to the next route
  } else {
    return res.redirect("/api/admin/login"); // Redirect to login page if not logged in
  }
};

const router = express.Router();

// Login route (redirects if already logged in)
router.get("/login", (req, res) => {
  if (req.session && req.session.user) {
    return res.redirect("/api/admin/dashboard"); // Redirect to dashboard if already logged in
  }
  res.render("login", { message: null }); // Initial load of the login page
});

// Logout route
router.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).send("Failed to destroy session.");
    }
    res.redirect("/api/admin/login"); // Redirect to login page after logout
  });
});

// Login POST route
router.post("/login", adminLogin);

// Protected routes (use isAuthenticated to check login status)
router.get("/dashboard", isAuthenticated, adminDashboard);
router.get("/users", isAuthenticated, userList);
router.post("/delete_user/:user_id", isAuthenticated, deleteUser);
router.get("/stories", isAuthenticated, storiesList);
router.post("/delete_story/:id", isAuthenticated, deleteStory);

export default router;