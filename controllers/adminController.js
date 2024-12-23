import User from "../models/adminModel.js";
import Story from "../models/storyModel.js";
import bcrypt from "bcryptjs";

// Admin login controller
const adminLogin = async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.render("login", { message: "Please fill in all fields" });
    }

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.render("login", { message: "User not found" });
        }

        if (user.role !== 'admin') {
            return res.render("login", { message: "You are not an admin" });
        }

        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.render("login", { message: "Invalid password" });
        }

        req.session.user = user; // Save user in session
        return res.redirect("/api/admin/dashboard");
    } catch (error) {
        console.error("Error:", error);
        return res.render("login", { message: "An error occurred. Please try again." });
    }
};

// Admin dashboard controller
const adminDashboard = async (req, res, next) => {
    try {
        const userCount = await User.countDocuments({ role: { $ne: 'admin' } });
        const storyCount = await Story.countDocuments();
        return res.render("dashboard", { userCount, storyCount });
    } catch (error) {
        console.log("Error:", error);
        return res.status(500).json({ message: "Error on fetching the count of users and stories" });
    }
};

// User list controller
const userList = async (req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    const limit = 10; // Number of records per page
    const skip = (page - 1) * limit;

    try {
        const users = await User.find({ role: { $ne: 'admin' } })
            .skip(skip)
            .limit(limit);

        // Create an array to hold user data with story counts
        const usersWithStoryCount = [];

        for (let user of users) {
            let storyCount = 0;
            if (user.role === 'author') {
                storyCount = await Story.countDocuments({ author: user._id });
            }
            usersWithStoryCount.push({
                ...user.toObject(),
                storyCount
            });
        }

        const totalUsers = await User.countDocuments({ role: { $ne: 'admin' } });
        const totalPages = Math.ceil(totalUsers / limit);

        res.render("users", { 
            users: usersWithStoryCount,
            currentPage: page,
            totalPages: totalPages
        });
    } catch (error) {
        console.log("Error", error);
        return res.status(500).json({ message: "Error fetching user list" });
    }
};
// Stories list controller
const storiesList = async (req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    const limit = 10; // Number of records per page
    const skip = (page - 1) * limit;

    try {
        const stories = await Story.find()
            .skip(skip)
            .limit(limit);

        const totalStories = await Story.countDocuments();
        const totalPages = Math.ceil(totalStories / limit);

        res.render("stories", { 
            stories,
            currentPage: page,
            totalPages: totalPages
        });
    } catch (error) {
        console.log("Error", error);
        return res.status(500).json({ message: "Error fetching stories list" });
    }
};

// Delete user controller
const deleteUser = async (req, res) => {
    const user_id = req.params.user_id;

    try {
        const user = await User.deleteOne({
            _id: user_id,
            role: { $ne: 'admin' },
        });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.redirect("/api/admin/users");
    } catch (error) {
        console.log("Error", error);
        return res.status(500).json({ message: "Error deleting user" });
    }
};

// Delete story controller
const deleteStory = async (req, res) => {
    const story_id = req.params.id;
    try {
        const story = await Story.deleteOne({ _id: story_id });
        if (!story) {
            return res.status(404).json({ message: "Story not found" });
        }
        res.redirect("/api/admin/stories");
    } catch (error) {
        console.log("Error", error);
        return res.status(500).json({ message: "Error deleting story" });
    }
};

export {
    adminLogin,
    adminDashboard,
    userList,
    storiesList,
    deleteStory,
    deleteUser,
};