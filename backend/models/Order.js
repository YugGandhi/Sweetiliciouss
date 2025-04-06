const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.Mixed,
    required: false
  },
  items: {
    type: Array,
    default: []
  },
  totalAmount: { 
    type: Number, 
    required: false,
    default: 0
  },
  shippingAddress: {
    type: String,
    required: false,
    default: ""
  },
  paymentMethod: {
    type: String,
    enum: ["cash", "upi", "card"],
    default: "cash"
  },
  paymentStatus: {
    type: String,
    enum: ["Pending", "Collected", "Failed"],
    default: "Pending"
  },
  notes: {
    type: String,
    default: ""
  },
  status: {
    type: String,
    enum: ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"],
    default: "Pending"
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Pre-save middleware to run validation and data cleanup
orderSchema.pre('save', function(next) {
  try {
    // Ensure user has some value
    if (!this.user) {
      this.user = "Anonymous";
    }
    
    // Ensure items is an array
    if (!Array.isArray(this.items)) {
      this.items = this.items ? [this.items] : [];
    }
    
    // Process each item to ensure it has valid data
    this.items = this.items.map(item => {
      // Handle case where item might be malformed
      if (!item) return { sweet: "Unknown", quantity: 1, price: 0, selectedSize: "1kg" };
      
      // Handle case where sweet ID includes size info
      let sweetId = item.sweet;
      if (typeof sweetId === 'string' && sweetId.includes('-')) {
        sweetId = sweetId.split('-')[0];
      }
      
      return {
        sweet: sweetId || "Unknown",
        quantity: Number(item.quantity) || 1,
        price: Number(item.price) || 0,
        selectedSize: item.selectedSize || '1kg'
      };
    });
    
    // Ensure totalAmount is a number
    this.totalAmount = Number(this.totalAmount) || 0;
    
    // Ensure shippingAddress is a string
    if (!this.shippingAddress) {
      this.shippingAddress = "";
    }
    
    next();
  } catch (error) {
    console.error("Error in Order pre-save hook:", error);
    next(); // Continue anyway to prevent blocking
  }
});

const Order = mongoose.model("Order", orderSchema);
module.exports = Order;
  