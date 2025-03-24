const express = require("express");
const router = express.Router();
const Order = require("../models/Order.js");

// ✅ Place an Order
router.post("/", async (req, res) => {
  try {
    const { user, sweets, totalAmount } = req.body;

    // ✅ Log incoming request data
    console.log("📩 Received Order Request:", req.body);

    // Check if required fields are missing
    if (!user || !user.name || !user.phone || !user.address || !sweets || sweets.length === 0 || !totalAmount) {
      console.error("❌ Missing required fields", req.body);
      return res.status(400).json({ error: "Missing required fields", received: req.body });
    }

    const newOrder = new Order({
      user,
      sweets,
      totalAmount
    });

    await newOrder.save();
    console.log("✅ Order Placed Successfully:", newOrder);
    res.status(201).json(newOrder);
  } catch (err) {
    console.error("❌ Order Creation Error:", err.message);  
    res.status(400).json({ error: "Failed to place order", details: err.message });
  }
});



// ✅ Fetch All Orders (Admin)
router.get("/", async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

// ✅ Update Order Status (Admin)
router.put("/:id", async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: "Failed to update order status" });
  }
});

module.exports = router;
