const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const auth = require('../middleware/auth');

// Get all notifications for a user
router.get('/user/:userId', auth, async (req, res) => {
  try {
    const notifications = await Notification.find({ 
      userId: req.params.userId 
    })
    .sort({ createdAt: -1 })
    .limit(50);
    
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// Mark notification as read
router.put('/:id', auth, async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { read: true },
      { new: true }
    );
    
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    
    res.json(notification);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update notification' });
  }
});

// Mark all notifications as read for a user
router.put('/user/:userId/read-all', auth, async (req, res) => {
  try {
    await Notification.updateMany(
      { userId: req.params.userId, read: false },
      { read: true }
    );
    
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update notifications' });
  }
});

// Delete a notification
router.delete('/:id', auth, async (req, res) => {
  try {
    const notification = await Notification.findByIdAndDelete(req.params.id);
    
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    
    res.json({ message: 'Notification deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete notification' });
  }
});

// Create a notification (internal use only)
const createNotification = async (userId, message, type = 'SYSTEM', orderId = null) => {
  try {
    // Validate userId exists and is in proper format
    if (!userId) {
      console.error('createNotification: Missing userId parameter');
      return null;
    }
    
    // Handle case where userId might be an object with _id
    const actualUserId = typeof userId === 'object' && userId._id ? userId._id.toString() : userId.toString();
    
    const notification = new Notification({
      userId: actualUserId,
      message,
      type,
      orderId: orderId ? orderId.toString() : null
    });
    
    await notification.save();
    return notification;
  } catch (error) {
    console.error('Failed to create notification:', error);
    return null;
  }
};

module.exports = { router, createNotification }; 