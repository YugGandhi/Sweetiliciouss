const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Admin = require("../models/Admin");

const router = express.Router();


router.post("/register", async (req, res) => {
  try {
    const { email, password, fullName, phoneNumber, address } = req.body;

    // Check if any required field is missing
    if (!email || !password || !fullName || !phoneNumber || !address) {
      return res.status(400).json({ message: "All fields are required!" });
    }

    // Check if user already exists by email
    const existingUser = await User.findOne({ $or: [{ email }, { phoneNumber }] });
    if (existingUser) {
      return res.status(400).json({ message: "Email or Phone Number already in use" });
    }


    // Hash password
    //const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = new User({
      email,
      password,
      fullName,
      phoneNumber,
      address,
    });

    await newUser.save(); // Save the new user

    // Generate JWT Token
    const token = jwt.sign({ id: newUser._id, email: newUser.email }, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.status(201).json({ token, message: "User registered successfully!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error!" });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  console.log("📩 Login Request Received:", email, password); // ✅ Debugging
  
  try {
    let user = await User.findOne({ email });
    let isAdmin = false;

    if (!user) {
      user = await Admin.findOne({ email });
      isAdmin = !!user;
    }

    if (!user) {
      console.log("❌ User Not Found:", email);
      return res.status(400).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log("❌ Password Mismatch for:", email);
      return res.status(400).json({ message: "Invalid credentials" });
    }

    console.log("✅ Login Successful for:", email, "isAdmin:", isAdmin);

    const token = jwt.sign({ id: user._id, email: user.email, isAdmin }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.json({ token, email: user.email, fullName: user.fullName || "Admin", isAdmin });
  } catch (error) {
    console.error("❌ Login Error:", error);
    res.status(500).json({ message: "Server error" });
  }
});


module.exports = router;
