import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { orders } from '../services/api';
import { toast } from 'react-toastify';
import '../styles/OrderConfirmationPage.css';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const OrderConfirmationPage = ({ user, onLogout }) => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await orders.getAll();
        const foundOrder = response.data.find(o => o._id === orderId);
        
        if (foundOrder) {
          setOrder(foundOrder);
        } else {
          setError('Order not found');
          toast.error('Order not found');
        }
      } catch (error) {
        console.error('Error fetching order:', error);
        setError('Failed to fetch order details');
        toast.error('Failed to fetch order details');
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  // Format price with commas and 2 decimal places
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(price);
  };

  // Format date
  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('en-IN', options);
  };

  if (loading) {
    return (
      <>
        <Navbar user={user} onLogout={onLogout} />
        <div className="confirmation-container loading">
          <div className="loader"></div>
          <p>Loading order details...</p>
        </div>
        <Footer />
      </>
    );
  }

  if (error || !order) {
    return (
      <>
        <Navbar user={user} onLogout={onLogout} />
        <div className="confirmation-container error">
          <h1>Order Not Found</h1>
          <p>{error || 'Unable to find the order details.'}</p>
          <Link to="/" className="back-home-btn">Back to Home</Link>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar user={user} onLogout={onLogout} />
      <div className="confirmation-container">
        <div className="confirmation-header">
          <h1>Order Confirmed!</h1>
          <p className="confirmation-message">
            Thank you for your order. We've received your order and will begin processing it right away.
          </p>
        </div>

        <div className="order-details-card">
          <div className="order-info">
            <h2>Order Information</h2>
            <div className="info-row">
              <span>Order ID:</span>
              <span>{order._id}</span>
            </div>
            <div className="info-row">
              <span>Order Date:</span>
              <span>{formatDate(order.createdAt)}</span>
            </div>
            <div className="info-row">
              <span>Status:</span>
              <span className={`order-status ${order.status.toLowerCase()}`}>
                {order.status}
              </span>
            </div>
            <div className="info-row">
              <span>Payment Method:</span>
              <span>{order.paymentMethod === 'cash' ? 'Cash on Delivery' : 
                    order.paymentMethod === 'upi' ? 'UPI' : 'Credit/Debit Card'}</span>
            </div>
          </div>

          <div className="shipping-info">
            <h2>Shipping Information</h2>
            <p>{order.shippingAddress}</p>
          </div>

          <div className="order-items-summary">
            <h2>Order Summary</h2>
            <div className="order-items-list">
              {order.items.map((item, index) => (
                <div key={index} className="order-item">
                  <div className="item-details">
                    <span className="item-name">{item.sweet?.name || 'Sweet'}</span>
                    <span className="item-quantity">x{item.quantity}</span>
                  </div>
                  <span className="item-price">{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="order-total">
              <span>Total</span>
              <span>{formatPrice(order.totalAmount)}</span>
            </div>
          </div>
        </div>

        <div className="confirmation-actions">
          <Link to="/" className="back-home-btn">Continue Shopping</Link>
          <Link to={`/order-tracking/${order._id}`} className="track-order-btn">Track Order</Link>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default OrderConfirmationPage; 