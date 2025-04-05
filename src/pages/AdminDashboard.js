import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaBox, FaCandyCane, FaUsers, FaChartLine, FaSignOutAlt } from 'react-icons/fa';
import "../styles/AdminDashboard.css";
import { toast } from 'react-toastify';
import { orders as ordersApi, sweets as sweetsApi, auth as authApi } from '../services/api';

const AdminDashboard = ({ onLogout, isLoggedIn }) => {
  const [activeSection, setActiveSection] = useState("orders");
  const [sweets, setSweets] = useState([]);
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState({
    orders: true,
    customers: true,
    sweets: true
  });
  const [error, setError] = useState(null);
  const [newSweet, setNewSweet] = useState({
    name: '',
    quantity250g: 0,
    quantity500g: 0,
    quantity1kg: 0,
    price: 0,
    description: '',
    photos: []
  });

  const navigate = useNavigate();

  useEffect(() => {
    if (isLoggedIn) {
      fetchOrders();
      fetchCustomers();
      fetchSweetsData();
    }
  }, [isLoggedIn]);

  const fetchOrders = async () => {
    try {
      const response = await ordersApi.getAll();
      setOrders(response.data);
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Failed to load orders");
    } finally {
      setLoading(prev => ({ ...prev, orders: false }));
    }
  };

  const fetchCustomers = async () => {
    try {
      const { data } = await authApi.getUsers();
      setCustomers(data);
    } catch (error) {
      console.error("Error fetching customers:", error);
      toast.error("Failed to load customers");
    } finally {
      setLoading(prev => ({ ...prev, customers: false }));
    }
  };

  const fetchSweetsData = async () => {
    try {
      const { data } = await sweetsApi.getAll();
      setSweets(data);
    } catch (error) {
      console.error("Error fetching sweets data:", error);
      setError("Failed to load sweets. Try again later.");
      toast.error("Failed to load sweets");
    } finally {
      setLoading(prev => ({ ...prev, sweets: false }));
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await ordersApi.updateStatus(orderId, newStatus);
      setOrders(orders.map(order => 
        order._id === orderId ? { ...order, status: newStatus } : order
      ));
      toast.success(`Order status updated to ${newStatus}`);
    } catch (error) {
      console.error("Error updating order status:", error);
      toast.error("Failed to update order status");
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setNewSweet(prev => ({
      ...prev,
      photos: files
    }));
  };

  const handleAddSweetSubmit = async (e) => {
    e.preventDefault();
    try {
      await sweetsApi.create(newSweet);
      toast.success("Sweet added successfully");
      fetchSweetsData(); // Refresh sweets list
      setNewSweet({
        name: '',
        quantity250g: 0,
        quantity500g: 0,
        quantity1kg: 0,
        price: 0,
        description: '',
        photos: []
      });
    } catch (error) {
      console.error("Error adding sweet:", error);
      toast.error("Failed to add sweet");
    }
  };

  const handleDeleteSweet = async (sweetId) => {
    if (!window.confirm("Are you sure you want to delete this sweet?")) return;

    try {
      await sweetsApi.delete(sweetId);
      setSweets(sweets.filter(sweet => sweet._id !== sweetId));
      toast.success("Sweet deleted successfully");
    } catch (error) {
      console.error("Error deleting sweet:", error);
      toast.error("Failed to delete sweet");
    }
  };

  const renderOrders = () => (
    <div className="dashboard-section">
      <h2>Order Management</h2>
      {loading.orders ? (
        <div className="loading">Loading orders...</div>
      ) : (
        <div className="orders-list">
          {orders.map(order => (
            <div key={order._id} className="order-card">
              <div className="order-header">
                <h3>Order #{order._id}</h3>
                <select 
                  value={order.status}
                  onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                  className={`status-select ${order.status?.toLowerCase()}`}
                >
                  <option value="Pending">Pending</option>
                  <option value="Processing">Processing</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
              <div className="order-details">
                <p><strong>Customer:</strong> {order.user?.name || 'N/A'}</p>
                <p><strong>Phone:</strong> {order.user?.phone || 'N/A'}</p>
                <p><strong>Address:</strong> {order.user?.address || 'N/A'}</p>
                <div className="order-items">
                  {order.sweets?.map((item, index) => (
                    <div key={index} className="order-item">
                      <span>{item.name} × {item.quantity}</span>
                      <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <p className="order-total"><strong>Total:</strong> ₹{order.totalAmount.toFixed(2)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderCustomers = () => (
    <div className="dashboard-section">
      <h2>Customer Management</h2>
      {loading.customers ? (
        <div className="loading">Loading customers...</div>
      ) : (
        <div className="customers-list">
          {customers.map(customer => (
            <div key={customer._id} className="customer-card">
              <div className="customer-info">
                <h3>{customer.fullName || 'N/A'}</h3>
                <p><strong>Email:</strong> {customer.email}</p>
                <p><strong>Phone:</strong> {customer.phoneNumber || 'N/A'}</p>
                <p><strong>Address:</strong> {customer.address || 'N/A'}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderStats = () => {
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    const totalCustomers = customers.length;

    return (
      <div className="dashboard-section">
        <h2>Business Statistics</h2>
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Total Orders</h3>
            <p className="stat-value">{totalOrders}</p>
          </div>
          <div className="stat-card">
            <h3>Total Revenue</h3>
            <p className="stat-value">₹{totalRevenue.toFixed(2)}</p>
          </div>
          <div className="stat-card">
            <h3>Total Customers</h3>
            <p className="stat-value">{totalCustomers}</p>
          </div>
        </div>
      </div>
    );
  };

  const renderSweets = () => (
    <div className="dashboard-section">
      <h2>Manage Sweets</h2>
      <form onSubmit={handleAddSweetSubmit} className="add-sweet-form">
        <input
          type="text"
          placeholder="Sweet Name"
          value={newSweet.name}
          onChange={(e) => setNewSweet({ ...newSweet, name: e.target.value })}
          required
        />
        <div className="quantity-input-group">
          <div className="quantity-input">
            <span>250g Quantity</span>
            <input
              type="number"
              value={newSweet.quantity250g}
              onChange={(e) => setNewSweet({ ...newSweet, quantity250g: parseInt(e.target.value) })}
              min="0"
              required
            />
          </div>
          <div className="quantity-input">
            <span>500g Quantity</span>
            <input
              type="number"
              value={newSweet.quantity500g}
              onChange={(e) => setNewSweet({ ...newSweet, quantity500g: parseInt(e.target.value) })}
              min="0"
              required
            />
          </div>
          <div className="quantity-input">
            <span>1kg Quantity</span>
            <input
              type="number"
              value={newSweet.quantity1kg}
              onChange={(e) => setNewSweet({ ...newSweet, quantity1kg: parseInt(e.target.value) })}
              min="0"
              required
            />
          </div>
        </div>
        <input
          type="number"
          placeholder="Price per kg"
          value={newSweet.price}
          onChange={(e) => setNewSweet({ ...newSweet, price: parseFloat(e.target.value) })}
          min="0"
          step="0.01"
          required
        />
        <textarea
          placeholder="Description"
          value={newSweet.description}
          onChange={(e) => setNewSweet({ ...newSweet, description: e.target.value })}
          required
        />
        <div className="file-input-group">
          <label>Product Images (Max 3)</label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            max="3"
          />
        </div>
        <button type="submit" className="btn-add">Add Sweet</button>
      </form>

      {loading.sweets ? (
        <div className="loading">Loading sweets...</div>
      ) : error ? (
        <div className="error">{error}</div>
      ) : (
        <div className="sweets-grid">
          {sweets.map((sweet) => (
            <div key={sweet._id} className="sweet-card">
              <div className="sweet-content">
                <h3>{sweet.name}</h3>
                <div className="quantity-display">
                  <div>250g: {sweet.quantity250g}</div>
                  <div>500g: {sweet.quantity500g}</div>
                  <div>1kg: {sweet.quantity1kg}</div>
                </div>
                <p className="price">₹{sweet.price.toFixed(2)} per kg</p>
                <p>{sweet.description}</p>
                {sweet.photos?.length > 0 && (
                  <img 
                    src={`http://localhost:5000/api/sweets/image/${sweet._id}`} 
                    alt={sweet.name}
                    onError={(e) => e.target.style.display = 'none'}
                  />
                )}
                <button 
                  onClick={() => handleDeleteSweet(sweet._id)} 
                  className="delete-btn"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="admin-dashboard">
      <div className="sidebar">
        {isLoggedIn && (
          <>
            <button 
              className={`sidebar-btn ${activeSection === 'orders' ? 'active' : ''}`}
              onClick={() => setActiveSection("orders")}
            >
              <FaBox /> Orders
            </button>
            <button 
              className={`sidebar-btn ${activeSection === 'customers' ? 'active' : ''}`}
              onClick={() => setActiveSection("customers")}
            >
              <FaUsers /> Customers
            </button>
            <button 
              className={`sidebar-btn ${activeSection === 'stats' ? 'active' : ''}`}
              onClick={() => setActiveSection("stats")}
            >
              <FaChartLine /> Statistics
            </button>
            <button 
              className={`sidebar-btn ${activeSection === 'sweets' ? 'active' : ''}`}
              onClick={() => setActiveSection("sweets")}
            >
              <FaCandyCane /> Sweets
            </button>
            <button className="sidebar-btn logout" onClick={onLogout}>
              <FaSignOutAlt /> Logout
            </button>
          </>
        )}
      </div>
      <div className="dashboard-content">
        {activeSection === 'orders' && renderOrders()}
        {activeSection === 'customers' && renderCustomers()}
        {activeSection === 'stats' && renderStats()}
        {activeSection === 'sweets' && renderSweets()}
      </div>
    </div>
  );
};

export default AdminDashboard;
