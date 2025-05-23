const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const auth = require("../middleware/auth");
const { createNotification } = require("./notificationRoutes");
const mongoose = require('mongoose');

// Place an Order
router.post("/", auth, async (req, res) => {
  try {
    console.log("Order creation request body:", JSON.stringify(req.body, null, 2));
    // Validate required fields
    if (!req.body.user || !req.body.items || !Array.isArray(req.body.items) || req.body.items.length === 0) {
      return res.status(400).json({ error: "Missing user or items in order" });
    }
    // Accept both string and ObjectId for sweet
    const orderItems = req.body.items.map(item => {
      if (!item.sweet || !item.quantity) {
        throw new Error("Each item must have a sweet and quantity");
      }
      return {
        sweet: (typeof item.sweet === 'string' && /^[a-fA-F0-9]{24}$/.test(item.sweet))
          ? new mongoose.Types.ObjectId(item.sweet)
          : item.sweet,
        quantity: item.quantity,
        price: item.price,
        selectedSize: item.selectedSize
      };
    });
    const newOrder = new Order({
      user: req.body.user,
      items: orderItems,
      totalAmount: req.body.totalAmount || 0,
      shippingAddress: req.body.shippingAddress || '',
      paymentMethod: req.body.paymentMethod || 'cash',
      notes: req.body.notes || '',
      status: 'Pending',
      paymentStatus: 'Pending'
    });
    const savedOrder = await newOrder.save();
    console.log("✅ Order saved to database:", savedOrder._id);
    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order: savedOrder
    });
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

    const orders = await Order.find().sort({ createdAt: -1 }).populate('items.sweet');
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

// Get Order by ID
router.get("/order/:id", auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }
    
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch order" });
  }
});

// Fetch User's Orders
router.get("/user/:userId", auth, async (req, res) => {
  try {
    // Verify user is requesting their own orders or is admin
    if (req.params.userId !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({ error: "Access denied" });
    }

    // Build a flexible query to match orders with this user
    const userId = req.params.userId;
    const orders = await Order.find({
      $or: [
        { "user._id": userId },
        { user: userId }
      ]
    }).sort({ createdAt: -1 });
    
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

// Update Order Status (Admin)
router.put("/:id", auth, async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ error: "Access denied" });
    }
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('items.sweet');
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }
    console.log("Order status update:", order._id, "to", status);
    if (status === 'Shipped' || status === 'Delivered') {
      const Sweet = require("../models/Sweet");
      for (const item of order.items) {
        const sweetId = item.sweet?._id || item.sweet;
        console.log("Decrementing stock for sweet:", sweetId, "size:", item.selectedSize, "qty:", item.quantity);
        if (sweetId) {
          let updateField = {};
          if (item.selectedSize === "250g") updateField = { $inc: { quantity250g: -item.quantity } };
          else if (item.selectedSize === "500g") updateField = { $inc: { quantity500g: -item.quantity } };
          else if (item.selectedSize === "1kg") updateField = { $inc: { quantity1kg: -item.quantity } };
          console.log("Update field:", updateField);
          await Sweet.findByIdAndUpdate(sweetId, updateField);
        }
      }
    }
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: "Failed to update order status", details: err.message });
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

    // Restock sweets
    const Sweet = require("../models/Sweet");
    for (const item of order.items) {
      if (item.sweet && item.sweet._id) {
        let updateField = {};
        if (item.selectedSize === "250g") updateField = { $inc: { quantity250g: item.quantity } };
        else if (item.selectedSize === "500g") updateField = { $inc: { quantity500g: item.quantity } };
        else if (item.selectedSize === "1kg") updateField = { $inc: { quantity1kg: item.quantity } };
        await Sweet.findByIdAndUpdate(item.sweet._id, updateField);
      }
    }

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

// Update Payment Status (Admin)
router.put("/:id/payment-status", auth, async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user.isAdmin) {
      return res.status(403).json({ error: "Access denied" });
    }

    console.log(`Updating payment status for order ${req.params.id} to ${req.body.paymentStatus}`);
    const { paymentStatus } = req.body;
    
    // Validate payment status
    if (!paymentStatus || !['Pending', 'Collected', 'Failed'].includes(paymentStatus)) {
      return res.status(400).json({ error: "Invalid payment status" });
    }
    
    const order = await Order.findByIdAndUpdate(
      req.params.id, 
      { paymentStatus }, 
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    console.log(`Order payment status updated: ${order._id}, new status: ${order.paymentStatus}`);

    // Create notification for payment status update
    try {
      // Extract user ID safely from various possible formats
      let userId = null;
      if (order.user) {
        if (typeof order.user === 'object' && order.user._id) {
          userId = order.user._id;
        } else if (typeof order.user === 'string') {
          userId = order.user;
        }
      }

      if (userId) {
        await createNotification(
          userId,
          `Payment for your order #${order._id} has been marked as ${paymentStatus}`,
          'ORDER_STATUS',
          order._id
        );
      } else {
        console.warn(`Could not determine user ID for notification on order ${order._id}`);
      }
    } catch (notifError) {
      console.error("Failed to create notification for payment status update:", notifError);
      // Continue with payment status update even if notification fails
    }

    res.json(order);
  } catch (err) {
    console.error("Error updating payment status:", err);
    res.status(500).json({ error: "Failed to update payment status" });
  }
});

module.exports = { router };
