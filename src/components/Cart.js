import React from 'react';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';
import '../styles/Cart.css';
import { toast } from 'react-toastify';

const Cart = ({ user }) => {
  const { cartItems, total, removeFromCart, updateQuantity } = useCart();

  const handleUpdateQuantity = (itemId, newQuantity) => {
    try {
      if (newQuantity <= 0) {
        removeFromCart(itemId);
        return;
      }
      updateQuantity(itemId, newQuantity);
    } catch (error) {
      console.error('Error updating quantity:', error);
      toast.error('Failed to update quantity');
    }
  };

  const handleRemoveItem = (itemId) => {
    try {
      removeFromCart(itemId);
      toast.success('Item removed from cart');
    } catch (error) {
      console.error('Error removing item:', error);
      toast.error('Failed to remove item');
    }
  };

  // Format price with 2 decimal places
  const formatPrice = (price) => {
    return typeof price === 'number' ? price.toFixed(2) : '0.00';
  };

  if (!user) {
    return (
      <div className="empty-cart">
        <h2>Please log in to view your cart</h2>
        <Link to="/login" className="login-btn">
          Login
        </Link>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="empty-cart">
        <h2>Your cart is empty</h2>
        <p>Add some delicious sweets to your cart!</p>
        <Link to="/" className="continue-shopping">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="cart-container">
      <h2>Your Cart</h2>
      <div className="cart-items">
        {cartItems.map((item) => (
          <div key={item._id} className="cart-item">
            <div className="cart-item-image">
              {item.photos && item.photos.length > 0 ? (
                <img src={item.photos[0]} alt={item.name} onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/placeholder-image.jpg';
                }} />
              ) : (
                <div className="placeholder-image">No Image</div>
              )}
            </div>
            <div className="cart-item-details">
              <h3>{item.name}</h3>
              <p className="price">₹{formatPrice(item.price)} per kg</p>
              <div className="quantity-controls">
                <button
                  onClick={() => handleUpdateQuantity(item._id, item.quantity - 1)}
                  className="quantity-btn"
                  aria-label="Decrease quantity"
                >
                  -
                </button>
                <span className="quantity">{item.quantity}</span>
                <button
                  onClick={() => handleUpdateQuantity(item._id, item.quantity + 1)}
                  className="quantity-btn"
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
              <button
                onClick={() => handleRemoveItem(item._id)}
                className="remove-btn"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="cart-summary">
        <h3>Cart Summary</h3>
        <div className="summary-item">
          <span>Total:</span>
          <span>₹{formatPrice(total)}</span>
        </div>
        {user ? (
          <Link to="/checkout" className="checkout-btn">
            Proceed to Checkout
          </Link>
        ) : (
          <div className="login-prompt">
            <p>Please log in to checkout</p>
            <Link to="/login" className="login-btn">
              Login to Continue
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart; 