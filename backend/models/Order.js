const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  user: {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true }
  },
  sweets: [
    {
      sweetId: { type: mongoose.Schema.Types.ObjectId, ref: "Sweet", required: true },
      name: { type: String, required: true },
      quantity: { type: Number, required: true },
      weight: { type: String, required: true },
      price: { type: Number, required: true }
    }
  ],
  totalAmount: { type: Number, required: true },
  status: {
    type: String,
    enum: ["Pending", "Processing", "Completed", "Cancelled"],
    default: "Pending"
  },
  createdAt: { type: Date, default: Date.now }
});

const Order = mongoose.model("Order", orderSchema);
module.exports = Order;
  