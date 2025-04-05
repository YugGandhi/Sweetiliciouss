const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const auth = require("../middleware/auth");
const { createNotification } = require("./notificationRoutes");

// Place an Order
router.post("/", auth, async (req, res) => {
  try {
    const { user, sweets, totalAmount } = req.body;

    // Log incoming request data
    console.log("📩 Received Order Request:", req.body);

    // Check if required fields are missing
    if (!user || !user.name || !user.phone || !user.address || !sweets || sweets.length === 0 || !totalAmount) {
      console.error("❌ Missing required fields", req.body);
      return res.status(400).json({ error: "Missing required fields", received: req.body });
    }

    const newOrder = new Order({
      user,
      sweets,
      totalAmount,
      status: 'Pending'
    });

    await newOrder.save();

    // Create notification for new order
    await createNotification(
      user._id,
      `Your order #${newOrder._id} has been placed successfully!`,
      'ORDER_STATUS',
      newOrder._id
    );

    console.log("✅ Order Placed Successfully:", newOrder);
    res.status(201).json(newOrder);
  } catch (err) {
    console.error("❌ Order Creation Error:", err.message);  
    res.status(400).json({ error: "Failed to place order", details: err.message });
  }
});

// Fetch All Orders (Admin)
router.get("/", auth, async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user.isAdmin) {
      return res.status(403).json({ error: "Access denied" });
    }

    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

// Fetch User's Orders
router.get("/user/:userId", auth, async (req, res) => {
  try {
    // Verify user is requesting their own orders or is admin
    if (req.params.userId !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({ error: "Access denied" });
    }

    const orders = await Order.find({ "user._id": req.params.userId }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

// Update Order Status (Admin)
router.put("/:id", auth, async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user.isAdmin) {
      return res.status(403).json({ error: "Access denied" });
    }

    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id, 
      { status }, 
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    // Create notification for status update
    await createNotification(
      order.user._id,
      `Your order #${order._id} status has been updated to ${status}`,
      'ORDER_STATUS',
      order._id
    );

    res.json(order);
  } catch (err) {
    res.status(500).json({ error: "Failed to update order status" });
  }
});

// Cancel Order (User)
router.put("/:id/cancel", auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    // Verify user owns this order or is admin
    if (order.user._id.toString() !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({ error: "Access denied" });
    }

    // Only allow cancellation of pending orders
    if (order.status !== 'Pending') {
      return res.status(400).json({ error: "Can only cancel pending orders" });
    }

    order.status = 'Cancelled';
    await order.save();

    // Create notification for cancellation
    await createNotification(
      order.user._id,
      `Your order #${order._id} has been cancelled`,
      'ORDER_STATUS',
      order._id
    );

    res.json(order);
  } catch (err) {
    res.status(500).json({ error: "Failed to cancel order" });
  }
});

// Search Orders (Admin)
router.get("/search", auth, async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user.isAdmin) {
      return res.status(403).json({ error: "Access denied" });
    }

    const { query, status, startDate, endDate } = req.query;
    
    let searchQuery = {};

    // Add filters based on query parameters
    if (query) {
      searchQuery.$or = [
        { "user.name": new RegExp(query, 'i') },
        { "user.phone": new RegExp(query, 'i') },
        { _id: query.match(/^[0-9a-fA-F]{24}$/) ? query : null }
      ];
    }

    if (status) {
      searchQuery.status = status;
    }

    if (startDate || endDate) {
      searchQuery.createdAt = {};
      if (startDate) searchQuery.createdAt.$gte = new Date(startDate);
      if (endDate) searchQuery.createdAt.$lte = new Date(endDate);
    }

    const orders = await Order.find(searchQuery).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: "Failed to search orders" });
  }
});

module.exports = router;
