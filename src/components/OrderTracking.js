import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import '../styles/OrderTracking.css';
import { orders as ordersApi } from '../services/api';

const OrderTracking = ({ userId }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (userId) {
      fetchUserOrders();
    } else {
      setLoading(false);
    }
  }, [userId]);

  const fetchUserOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await ordersApi.getUserOrders(userId);
      setOrders(data);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError('Failed to load your orders. Please try again later.');
      toast.error('Failed to load your orders');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'Pending': '#ffc107',
      'Processing': '#17a2b8',
      'Shipped': '#007bff',
      'Delivered': '#28a745',
      'Cancelled': '#dc3545'
    };
    return colors[status] || '#6c757d';
  };

  const getStatusStep = (status) => {
    const steps = {
      'Pending': 1,
      'Processing': 2,
      'Shipped': 3,
      'Delivered': 4,
      'Cancelled': 0
    };
    return steps[status] || 0;
  };

  // Safe calculation functions
  const calculateItemTotal = (price, quantity) => {
    if (typeof price !== 'number' || typeof quantity !== 'number') {
      return 0;
    }
    return (price * quantity).toFixed(2);
  };

  const formatAmount = (amount) => {
    if (typeof amount !== 'number') {
      return '0.00';
    }
    return amount.toFixed(2);
  };

  if (loading) {
    return <div className="loading">Loading your orders...</div>;
  }

  if (!userId) {
    return <div className="error-container">Please log in to view your orders</div>;
  }

  if (error) {
    return (
      <div className="error-container">
        <p>{error}</p>
        <button onClick={fetchUserOrders} className="retry-btn">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="order-tracking-container">
      <h2>My Orders</h2>
      {orders.length === 0 ? (
        <div className="no-orders">
          <p>You haven't placed any orders yet.</p>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <div key={order._id} className="order-card">
              <div className="order-header">
                <h3>Order #{order._id}</h3>
                <span 
                  className="order-status"
                  style={{ backgroundColor: getStatusColor(order.status) }}
                >
                  {order.status}
                </span>
              </div>

              <div className="order-progress">
                <div className="progress-track">
                  <div 
                    className="progress-fill"
                    style={{ 
                      width: `${(getStatusStep(order.status) / 4) * 100}%`,
                      backgroundColor: getStatusColor(order.status)
                    }}
                  ></div>
                </div>
                <div className="progress-steps">
                  <div className={`step ${getStatusStep(order.status) >= 1 ? 'active' : ''}`}>
                    Pending
                  </div>
                  <div className={`step ${getStatusStep(order.status) >= 2 ? 'active' : ''}`}>
                    Processing
                  </div>
                  <div className={`step ${getStatusStep(order.status) >= 3 ? 'active' : ''}`}>
                    Shipped
                  </div>
                  <div className={`step ${getStatusStep(order.status) >= 4 ? 'active' : ''}`}>
                    Delivered
                  </div>
                </div>
              </div>

              <div className="order-details">
                <div className="order-items">
                  {order.sweets?.map((item, index) => (
                    <div key={index} className="order-item">
                      <span>{item.name} × {item.quantity}</span>
                      <span>₹{calculateItemTotal(item.price, item.quantity)}</span>
                    </div>
                  ))}
                </div>
                <div className="order-summary">
                  <p><strong>Order Date:</strong> {new Date(order.createdAt).toLocaleDateString()}</p>
                  <p><strong>Delivery Address:</strong> {order.deliveryAddress || 'N/A'}</p>
                  <p className="total-amount">
                    <strong>Total Amount:</strong> ₹{formatAmount(order.totalAmount)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderTracking; 