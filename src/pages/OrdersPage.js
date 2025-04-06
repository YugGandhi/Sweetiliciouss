import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { orders as ordersApi } from '../services/api';
import { toast } from 'react-toastify';
import '../styles/OrdersPage.css';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const OrdersPage = ({ user, onLogout }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user && user.id) {
      fetchUserOrders();
    } else {
      setLoading(false);
      setError('Please login to view your orders');
    }
  }, [user]);

  const fetchUserOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Try to get user's orders directly
      try {
        const response = await ordersApi.getUserOrders(user.id);
        
        // Sort orders by date (newest first)
        const sortedOrders = response.data.sort((a, b) => 
          new Date(b.createdAt) - new Date(a.createdAt)
        );
        
        setOrders(sortedOrders);
      } catch (error) {
        // If there's an error with the specific endpoint, try the more flexible approach
        const response = await ordersApi.getAll();
        
        // Filter for the current user's orders
        const userOrders = response.data.filter(order => {
          // Check if user is an object
          if (order.user && typeof order.user === 'object' && order.user._id) {
            return order.user._id === user.id;
          }
          
          // Check if user is a string
          if (typeof order.user === 'string') {
            return order.user === user.id;
          }
          
          return false;
        });
        
        // Sort orders by date (newest first)
        userOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        setOrders(userOrders);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError('Failed to load your orders. Please try again later.');
      toast.error('Failed to load your orders');
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

  // Get status color for badges
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

  return (
    <>
      <Navbar user={user} onLogout={onLogout} />
      <div className="orders-page-container">
        <h1>My Orders</h1>

        {loading ? (
          <div className="loading-container">
            <div className="loader"></div>
            <p>Loading your orders...</p>
          </div>
        ) : error ? (
          <div className="error-container">
            <h2>Error</h2>
            <p>{error}</p>
            {user && user.id && (
              <button onClick={fetchUserOrders} className="retry-btn">
                Try Again
              </button>
            )}
            <Link to="/" className="back-home-btn">
              Return to Home
            </Link>
          </div>
        ) : orders.length === 0 ? (
          <div className="no-orders-container">
            <h2>No Orders Found</h2>
            <p>You haven't placed any orders yet.</p>
            <Link to="/" className="shop-now-btn">
              Shop Now
            </Link>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map((order) => (
              <div key={order._id} className="order-card">
                <div className="order-header">
                  <div className="order-title">
                    <h3>Order #{order._id}</h3>
                    <p className="order-date">{formatDate(order.createdAt)}</p>
                  </div>
                  <div 
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(order.status) }}
                  >
                    {order.status}
                  </div>
                </div>
                
                <div className="order-summary-info">
                  <div className="order-items-count">
                    <span>{order.items.length} item{order.items.length !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="order-total-amount">
                    <span>Total: {formatPrice(order.totalAmount)}</span>
                  </div>
                </div>
                
                <div className="order-customer-info">
                  <p>
                    <strong>Customer:</strong> {order.user?.fullName || user?.fullName || 'N/A'}
                  </p>
                  <p>
                    <strong>Email:</strong> {order.user?.email || user?.email || 'N/A'}
                  </p>
                </div>
                
                <div className="order-actions">
                  <Link 
                    to={`/order-tracking/${order._id}`} 
                    className="track-order-btn"
                  >
                    Track Order
                  </Link>
                  {(order.status === 'Pending' || order.status === 'Processing') && (
                    <button 
                      className="cancel-order-btn"
                      onClick={async () => {
                        try {
                          await ordersApi.cancelOrder(order._id);
                          toast.success('Order cancelled successfully');
                          fetchUserOrders();
                        } catch (error) {
                          console.error('Error cancelling order:', error);
                          toast.error('Failed to cancel order');
                        }
                      }}
                    >
                      Cancel Order
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </>
  );
};

export default OrdersPage; 