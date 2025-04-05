const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Admin = require("../models/Admin");
const auth = require("../middleware/auth");

const router = express.Router();

// Register new user
router.post("/register", async (req, res) => {
  try {
    const { email, password, fullName, phoneNumber, address } = req.body;

    // Check if any required field is missing
    if (!email || !password || !fullName || !phoneNumber || !address) {
      return res.status(400).json({ message: "All fields are required!" });
    }

    // Check if user already exists by email or phone
    const existingUser = await User.findOne({ $or: [{ email }, { phoneNumber }] });
    if (existingUser) {
      return res.status(400).json({ message: "Email or Phone Number already in use" });
    }

    // Create new user - no need to hash the password here, the model will do it
    const newUser = new User({
      email,
      password, // Model's pre-save hook will hash this
      fullName,
      phoneNumber,
      address,
    });

    await newUser.save();

    // Generate JWT Token
    const token = jwt.sign(
      { id: newUser._id, email: newUser.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(201).json({
      token,
      user: {
        id: newUser._id,
        email: newUser.email,
        fullName: newUser.fullName,
        isAdmin: false
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error!" });
  }
});

// Login user
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  console.log("📩 Login Request Received:", email);
  
  try {
    let user = await User.findOne({ email });
    let isAdmin = false;

    if (!user) {
      user = await Admin.findOne({ email });
      isAdmin = !!user;
    }

    if (!user) {
      console.log("❌ User Not Found:", email);
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log("❌ Password Mismatch for:", email);
      return res.status(400).json({ message: "Invalid credentials" });
    }

    console.log("✅ Login Successful for:", email, "isAdmin:", isAdmin);

    const token = jwt.sign(
      { id: user._id, email: user.email, isAdmin },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        fullName: user.fullName || "Admin",
        isAdmin
      }
    });
  } catch (error) {
    console.error("❌ Login Error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Refresh token
router.post("/refresh-token", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, isAdmin: req.user.isAdmin },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: "Error refreshing token" });
  }
});

// Get current user
router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Update user profile
router.put("/profile", auth, async (req, res) => {
  try {
    const { fullName, phoneNumber, address } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (fullName) user.fullName = fullName;
    if (phoneNumber) user.phoneNumber = phoneNumber;
    if (address) user.address = address;

    await user.save();
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Error updating profile" });
  }
});

module.exports = router;
