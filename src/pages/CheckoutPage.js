import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { orders } from '../services/api';
import { toast } from 'react-toastify';
import '../styles/CheckoutPage.css';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const CheckoutPage = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const { cartItems, total, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    shippingAddress: user?.address || '',
    paymentMethod: 'cash',
    notes: '',
    phoneNumber: user?.phoneNumber || ''
  });

  // If no user or empty cart, redirect to home
  if (!user) {
    navigate('/');
    return null;
  }

  if (cartItems.length === 0) {
    navigate('/cart');
    return null;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create order items array from cart items
      const orderItems = cartItems.map(item => ({
        sweet: item._id,
        quantity: item.quantity,
        price: item.price,
        selectedSize: item.selectedSize || "1kg" // Add selected size
      }));

      // Create order object
      const orderData = {
        user: {
          _id: user.id,
          fullName: user.fullName || "Unknown",
          email: user.email || "Unknown",
          phoneNumber: formData.phoneNumber || user.phoneNumber || "Not provided"
        },
        items: orderItems,
        totalAmount: total,
        shippingAddress: formData.shippingAddress,
        paymentMethod: formData.paymentMethod,
        notes: formData.notes || ""
      };

      // Send order to server
      const response = await orders.create(orderData);
      
      // Extract the order ID
      const orderId = response.data.order._id;
      
      if (!orderId) {
        throw new Error("Order was created but no ID was returned");
      }
      
      // Clear the cart
      clearCart();
      
      // Show success message
      toast.success('Order placed successfully!');
      
      // Redirect to confirmation page with order ID
      navigate(`/order-confirmation/${orderId}`);
    } catch (error) {
      console.error('Error placing order:', error);
      
      // Get more specific error message if available
      const errorMessage = error.response?.data?.error || 
                           error.response?.data?.details || 
                           'Failed to place order. Please try again.';
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Format price with commas and 2 decimal places
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(price);
  };

  return (
    <>
      <Navbar user={user} onLogout={onLogout} />
      <div className="checkout-container">
        <h1>Checkout</h1>
        
        <div className="checkout-grid">
          <div className="checkout-form-container">
            <h2>Shipping Information</h2>
            <form onSubmit={handleSubmit} className="checkout-form">
              <div className="form-group">
                <label htmlFor="shippingAddress">Shipping Address</label>
                <textarea
                  id="shippingAddress"
                  name="shippingAddress"
                  value={formData.shippingAddress}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="paymentMethod">Payment Method</label>
                <select
                  id="paymentMethod"
                  name="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={handleChange}
                  disabled={loading}
                >
                  <option value="cash">Cash on Delivery</option>
                  <option value="upi" disabled>UPI (Coming Soon)</option>
                  <option value="card" disabled>Credit/Debit Card (Coming Soon)</option>
                </select>
                
                {formData.paymentMethod === 'cash' && (
                  <div className="payment-method-info">
                    <p>
                      <strong>Cash on Delivery:</strong> Pay when your order arrives. Our delivery person will collect the payment.
                    </p>
                    <ul>
                      <li>Please keep exact change ready</li>
                      <li>You'll receive updates about your order status</li>
                      <li>You can track your order on the order confirmation page</li>
                    </ul>
                  </div>
                )}
              </div>
              
              <div className="form-group">
                <label htmlFor="notes">Order Notes (Optional)</label>
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="Any special instructions for your order"
                  disabled={loading}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="phoneNumber">Phone Number</label>
                <input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>
              
              <button 
                type="submit" 
                className="place-order-btn"
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Place Order'}
              </button>
            </form>
          </div>
          
          <div className="order-summary">
            <h2>Order Summary</h2>
            <div className="order-items">
              {cartItems.map((item) => (
                <div key={item._id} className="order-item">
                  <div className="item-info">
                    <span className="item-name">{item.name}</span>
                    <span className="item-quantity">x{item.quantity}</span>
                  </div>
                  <span className="item-price">{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
            
            <div className="order-total">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default CheckoutPage; 