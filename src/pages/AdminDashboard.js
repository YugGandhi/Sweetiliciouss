import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaBox, FaCandyCane, FaUsers, FaChartLine, FaSignOutAlt, FaRupeeSign, FaShoppingCart, FaUserFriends, FaDownload } from 'react-icons/fa';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import "../styles/AdminDashboard.css";
import { toast } from 'react-toastify';
import { orders as ordersApi, sweets as sweetsApi, auth as authApi } from '../services/api';
import { getSocket } from '../services/socketService';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { generateInvoicePDF } from '../utils/pdfGenerator';

const AdminDashboard = ({ onLogout, isLoggedIn }) => {
  const [activeSection, setActiveSection] = useState("orders");
  const [sweets, setSweets] = useState([]);
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [stockItem, setStockItem] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    if (isLoggedIn) {
      // Use Promise.allSettled to handle all requests without stopping on errors
      Promise.allSettled([
        fetchOrders().catch(err => console.error("Orders fetch error:", err)),
        fetchCustomers().catch(err => console.error("Customers fetch error:", err)),
        fetchSweetsData().catch(err => console.error("Sweets fetch error:", err))
      ]);
      
      // Set up socket listeners for real-time updates
      const socket = getSocket();
      
      socket.on("sweetAdded", (newSweet) => {
        setSweets(prevSweets => [...prevSweets, newSweet]);
      });
      
      socket.on("sweetUpdated", (updatedSweet) => {
        setSweets(prevSweets => 
          prevSweets.map(sweet => sweet._id === updatedSweet._id ? updatedSweet : sweet)
        );
      });
      
      socket.on("sweetDeleted", (deletedSweetId) => {
        setSweets(prevSweets => prevSweets.filter(sweet => sweet._id !== deletedSweetId));
      });
      
      return () => {
        if (socket) {
          socket.off("sweetAdded");
          socket.off("sweetUpdated");
          socket.off("sweetDeleted");
        }
      };
    }
  }, [isLoggedIn]);

  const fetchOrders = async () => {
    setLoading(prev => ({ ...prev, orders: true }));
    try {
      const response = await ordersApi.getAll();
      setOrders(response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching orders:", error);
      // Only show error toast if this is not an auth error (which would be handled by auth interceptor)
      if (error.response?.status !== 401) {
        toast.error("Failed to load orders");
      }
      return [];
    } finally {
      setLoading(prev => ({ ...prev, orders: false }));
    }
  };

  const fetchCustomers = async () => {
    setLoading(prev => ({ ...prev, customers: true }));
    setError(null);
    try {
      const response = await authApi.getUsers();
      
      if (response && response.data) {
        // Ensure we have valid user data
        const validCustomers = response.data.filter(customer => 
          customer && customer._id && customer.email
        );
        
        if (validCustomers.length === 0) {
          setError("No customers found in the database");
          setCustomers([]);
        } else {
          setCustomers(validCustomers);
        }
        return validCustomers;
      } else {
        throw new Error('Invalid response format from server');
      }
    } catch (error) {
      console.error("Error fetching customers:", error);
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          "Failed to load customers. Please try again later.";
      setError(errorMessage);
      toast.error(errorMessage);
      setCustomers([]);
      return [];
    } finally {
      setLoading(prev => ({ ...prev, customers: false }));
    }
  };

  const fetchSweetsData = async () => {
    setLoading(prev => ({ ...prev, sweets: true }));
    try {
      const { data } = await sweetsApi.getAll();
      setSweets(data);
      return data;
    } catch (error) {
      console.error("Error fetching sweets data:", error);
      setError("Failed to load sweets. Try again later.");
      // Only show error toast if this is not an auth error
      if (error.response?.status !== 401) {
        toast.error("Failed to load sweets");
      }
      return [];
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
    // Limit to maximum 3 images
    const selectedFiles = files.slice(0, 3);
    
    // Show feedback about selected files
    if (selectedFiles.length > 0) {
      toast.info(`Selected ${selectedFiles.length} image${selectedFiles.length > 1 ? 's' : ''}`);
    }
    
    setNewSweet(prev => ({
      ...prev,
      photos: selectedFiles
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

  const openStockModal = (item) => {
    console.log('DEBUG: Opening StockModal for', item);
    setStockItem(item);
    setIsModalOpen(true);
  };

  const handleStockModalSubmit = async (updatedSweet) => {
    try {
      const { data } = await sweetsApi.updateStock(updatedSweet._id, {
        quantity250g: Number(updatedSweet.quantity250g),
        quantity500g: Number(updatedSweet.quantity500g),
        quantity1kg: Number(updatedSweet.quantity1kg)
      });
      toast.success("Stock updated successfully");
      setIsModalOpen(false);
      setStockItem(null);
      setSweets(prevSweets => prevSweets.map(sweet => sweet._id === data._id ? data : sweet));
    } catch (error) {
      toast.error("Failed to update stock");
      setIsModalOpen(false);
      setStockItem(null);
      console.error("Update stock error:", error, error?.response?.data);
    }
  };

  const downloadOrdersPDF = () => {
    const doc = new jsPDF();
    doc.text('Order History', 14, 16);
    const tableColumn = ['User Name', 'Mobile Number', 'Sweet', 'Quantity', 'Price'];
    const tableRows = [];
    orders.forEach(order => {
      const userName = order.user?.fullName || 'N/A';
      const userPhone = order.user?.phoneNumber || 'N/A';
      order.items.forEach(item => {
        tableRows.push([
          userName,
          userPhone,
          item.sweet?.name || item.sweet || 'Sweet',
          item.quantity,
          item.price
        ]);
      });
    });
    autoTable(doc, { head: [tableColumn], body: tableRows, startY: 22 });
    doc.save('orders-history.pdf');
  };

  const renderOrders = () => {
    // Sort orders by date (newest first)
    const sortedOrders = [...orders].sort((a, b) => 
      new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
    );
    
    // Filter orders based on search and status
    const filteredOrders = sortedOrders.filter(order => {
      const matchesSearch = order._id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            (order.user?.fullName || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'All' || order.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
    
    return (
      <div className="dashboard-section">
        <h2>Order Management</h2>
        <button onClick={downloadOrdersPDF} style={{marginBottom: '1rem'}}>Download Orders PDF</button>
        
        <div className="order-filters">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search by Order ID or Customer Name"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="status-filter">
            <label>Filter by Status:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Orders</option>
              <option value="Pending">Pending</option>
              <option value="Processing">Processing</option>
              <option value="Shipped">Shipped</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>
        
        {loading.orders ? (
          <div className="loading">Loading orders...</div>
        ) : filteredOrders.length === 0 ? (
          <div className="no-results">No orders found matching your filters</div>
        ) : (
          <div className="orders-list">
            {filteredOrders.map(order => (
              <div key={order._id} className="order-card">
                <div className="order-header">
                  <div className="order-header-left">
                    <h3>Order #{order._id}</h3>
                    <p className="order-date">
                      {new Date(order.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="order-header-right">
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
                </div>
                
                <div className="order-details">
                  <div className="order-customer-info">
                    <h4>Customer Information</h4>
                    <p><strong>Name:</strong> {order.user?.fullName || 'N/A'}</p>
                    <p><strong>Email:</strong> {order.user?.email || 'N/A'}</p>
                    <p><strong>Phone:</strong> {order.user?.phoneNumber || 'N/A'}</p>
                    <p><strong>Shipping Address:</strong> {order.shippingAddress || 'N/A'}</p>
                    <p><strong>Payment Method:</strong> {
                      order.paymentMethod === 'cash' ? 'Cash on Delivery' :
                      order.paymentMethod === 'upi' ? 'UPI' : 
                      order.paymentMethod === 'card' ? 'Credit/Debit Card' : 'N/A'
                    }</p>
                    
                    {order.paymentMethod === 'cash' && (
                      <div className="payment-status">
                        <p><strong>Payment Status:</strong>
                          <select 
                            value={order.paymentStatus || 'Pending'}
                            onChange={async (e) => {
                              try {
                                const newPaymentStatus = e.target.value;
                                await ordersApi.updatePaymentStatus(order._id, newPaymentStatus);
                                
                                // Update the order in the local state
                                setOrders(prevOrders => 
                                  prevOrders.map(o => 
                                    o._id === order._id 
                                      ? { ...o, paymentStatus: newPaymentStatus }
                                      : o
                                  )
                                );
                                
                                toast.success(`Payment status updated to ${newPaymentStatus}`);
                              } catch (error) {
                                console.error("Error updating payment status:", error);
                                toast.error("Failed to update payment status");
                              }
                            }}
                            className={`payment-status-select ${order.paymentStatus?.toLowerCase() || 'pending'}`}
                          >
                            <option value="Pending">Pending</option>
                            <option value="Collected">Collected</option>
                            <option value="Failed">Failed</option>
                          </select>
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <div className="order-items-section">
                    <h4>Order Items</h4>
                    <div className="order-items">
                      {order.items?.map((item, index) => (
                        <div key={index} className="order-item">
                          <div className="item-info">
                            <span className="item-name">{item.sweet?.name || item.sweet || 'Sweet'}</span>
                            <span className="item-weight">{item.selectedSize || 'N/A'}</span>
                            <span className="item-quantity">× {item.quantity}</span>
                          </div>
                          <span className="item-price">₹{(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                    <div className="order-total">
                      <strong>Total Amount:</strong> 
                      <span>₹{order.totalAmount?.toFixed(2) || '0.00'}</span>
                    </div>
                  </div>
                  
                  {order.notes && (
                    <div className="order-notes">
                      <h4>Customer Notes</h4>
                      <p>{order.notes}</p>
                    </div>
                  )}
                </div>
                
                <div className="order-actions">
                  <button
                    onClick={() => {
                      // Copy order details to clipboard
                      const orderDetails = `
                        Order #${order._id}
                        Status: ${order.status}
                        Customer: ${order.user?.fullName || 'N/A'}
                        Email: ${order.user?.email || 'N/A'}
                        Phone: ${order.user?.phoneNumber || 'N/A'}
                        Address: ${order.shippingAddress || 'N/A'}
                        Payment Method: ${order.paymentMethod || 'N/A'}
                        Total: ₹${order.totalAmount?.toFixed(2) || '0.00'}
                      `;
                      navigator.clipboard.writeText(orderDetails);
                      toast.success("Order details copied to clipboard");
                    }}
                    className="copy-order-btn"
                  >
                    Copy Order Details
                  </button>
                  <button
                    onClick={() => {
                      try {
                        const doc = generateInvoicePDF(order);
                        doc.save(`invoice-${order._id}.pdf`);
                        toast.success("Invoice downloaded successfully");
                      } catch (error) {
                        console.error("Error generating invoice:", error);
                        toast.error("Failed to generate invoice");
                      }
                    }}
                    className="download-invoice-btn"
                  >
                    <FaDownload /> Download Invoice
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderCustomers = () => (
    <div className="dashboard-section">
      <h2>Customer Management</h2>
      {loading.customers ? (
        <div className="loading">Loading customers...</div>
      ) : error ? (
        <div className="error-container">
          <p className="error-message">{error}</p>
          <button onClick={fetchCustomers} className="retry-btn">
            Try Again
          </button>
        </div>
      ) : customers.length === 0 ? (
        <div className="no-results">No customers found</div>
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
    try {
      // Calculate basic statistics with error handling
      const totalOrders = orders?.length || 0;
      const totalRevenue = orders?.reduce((sum, order) => {
        try {
          return sum + (parseFloat(order.totalAmount) || 0);
        } catch (error) {
          console.error('Error calculating order amount:', error);
          return sum;
        }
      }, 0) || 0;
      
      const totalCustomers = customers?.length || 0;
      const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

      // Calculate order status distribution with error handling
      const statusDistribution = orders?.reduce((acc, order) => {
        try {
          const status = order.status || 'Unknown';
          acc[status] = (acc[status] || 0) + 1;
          return acc;
        } catch (error) {
          console.error('Error calculating status distribution:', error);
          return acc;
        }
      }, {}) || {};

      const statusData = Object.entries(statusDistribution).map(([name, value]) => ({
        name,
        value,
        percentage: ((value / totalOrders) * 100).toFixed(1)
      }));

      // Calculate monthly revenue with error handling
      const monthlyRevenue = orders?.reduce((acc, order) => {
        try {
          const date = new Date(order.createdAt);
          if (isNaN(date.getTime())) {
            console.warn('Invalid date:', order.createdAt);
            return acc;
          }
          const month = date.toLocaleString('default', { month: 'short' });
          acc[month] = (acc[month] || 0) + (parseFloat(order.totalAmount) || 0);
          return acc;
        } catch (error) {
          console.error('Error calculating monthly revenue:', error);
          return acc;
        }
      }, {}) || {};

      const revenueData = Object.entries(monthlyRevenue)
        .sort(([monthA], [monthB]) => {
          const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
          return months.indexOf(monthA) - months.indexOf(monthB);
        })
        .map(([month, revenue]) => ({
          month,
          revenue: parseFloat(revenue.toFixed(2))
        }));

      // Colors for charts
      const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

      return (
        <div className="dashboard-section">
          <h2>Business Statistics</h2>
          
          {/* Stats Cards */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">
                <FaShoppingCart />
              </div>
              <div className="stat-content">
                <h3>Total Orders</h3>
                <p className="stat-value">{totalOrders}</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">
                <FaRupeeSign />
              </div>
              <div className="stat-content">
                <h3>Total Revenue</h3>
                <p className="stat-value">₹{totalRevenue.toFixed(2)}</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">
                <FaUserFriends />
              </div>
              <div className="stat-content">
                <h3>Total Customers</h3>
                <p className="stat-value">{totalCustomers}</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">
                <FaChartLine />
              </div>
              <div className="stat-content">
                <h3>Average Order Value</h3>
                <p className="stat-value">₹{averageOrderValue.toFixed(2)}</p>
              </div>
            </div>
          </div>

          {/* Charts Grid */}
          <div className="charts-grid">
            {/* Order Status Distribution */}
            <div className="chart-card">
              <h3>Order Status Distribution</h3>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percentage }) => `${name}: ${percentage}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Monthly Revenue */}
            <div className="chart-card">
              <h3>Monthly Revenue</h3>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => `₹${value.toFixed(2)}`} />
                    <Legend />
                    <Line type="monotone" dataKey="revenue" stroke="#8884d8" name="Revenue" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      );
    } catch (error) {
      console.error('Error rendering statistics:', error);
      return (
        <div className="dashboard-section">
          <h2>Business Statistics</h2>
          <div className="error-message">
            <p>Error loading statistics. Please try refreshing the page.</p>
            <button onClick={() => window.location.reload()} className="retry-btn">
              Refresh Page
            </button>
          </div>
        </div>
      );
    }
  };

  const renderSweets = () => {
    // Get low stock items (less than 10 units)
    const lowStockItems = sweets.filter(sweet => {
      const totalStock = (sweet.quantity250g || 0) + (sweet.quantity500g || 0) + (sweet.quantity1kg || 0);
      return totalStock < 10 && totalStock > 0;
    });
    
    // Get out of stock items (0 units)
    const outOfStockItems = sweets.filter(sweet => {
      const totalStock = (sweet.quantity250g || 0) + (sweet.quantity500g || 0) + (sweet.quantity1kg || 0);
      return totalStock === 0;
    });
    
    // Check if sweet is low in stock
    const isLowStock = (sweet) => {
      const totalStock = (sweet.quantity250g || 0) + (sweet.quantity500g || 0) + (sweet.quantity1kg || 0);
      return totalStock < 10 && totalStock > 0;
    };
    
    // Check if sweet is out of stock
    const isOutOfStock = (sweet) => {
      const totalStock = (sweet.quantity250g || 0) + (sweet.quantity500g || 0) + (sweet.quantity1kg || 0);
      return totalStock === 0;
    };
    
    // Calculate total inventory value
    const totalInventoryValue = sweets.reduce((total, sweet) => {
      const value = sweet.price * ((sweet.quantity250g || 0) * 0.25 + (sweet.quantity500g || 0) * 0.5 + (sweet.quantity1kg || 0));
      return total + value;
    }, 0);
    
    return (
      <div className="dashboard-section">
        <h2>Inventory Management</h2>
        
        {lowStockItems.length > 0 && (
          <div className="inventory-alert low-stock">
            <h3>Low Stock Items</h3>
            <p>The following items are running low on inventory (less than 10 units):</p>
            <ul>
              {lowStockItems.map(item => (
                <li key={item._id}>
                  <strong>{item.name}</strong> - Total: {(item.quantity250g || 0) + (item.quantity500g || 0) + (item.quantity1kg || 0)} units
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {outOfStockItems.length > 0 && (
          <div className="inventory-alert out-of-stock">
            <h3>Out of Stock Items</h3>
            <p>The following items are currently out of stock:</p>
            <ul>
              {outOfStockItems.map(item => (
                <li key={item._id}><strong>{item.name}</strong></li>
              ))}
            </ul>
          </div>
        )}
        
        <div className="inventory-summary">
          <div className="inventory-card">
            <h3>Total Inventory Value</h3>
            <p className="inventory-value">₹{totalInventoryValue.toFixed(2)}</p>
          </div>
          <div className="inventory-card">
            <h3>Total Products</h3>
            <p className="inventory-value">{sweets.length}</p>
          </div>
          <div className="inventory-card">
            <h3>Low Stock Products</h3>
            <p className="inventory-value">{lowStockItems.length}</p>
          </div>
        </div>
        
        <form onSubmit={handleAddSweetSubmit} className="add-sweet-form">
          <h3>Add New Product</h3>
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
                onChange={(e) => setNewSweet({ ...newSweet, quantity250g: parseInt(e.target.value) || 0 })}
                min="0"
                required
              />
            </div>
            <div className="quantity-input">
              <span>500g Quantity</span>
              <input
                type="number"
                value={newSweet.quantity500g}
                onChange={(e) => setNewSweet({ ...newSweet, quantity500g: parseInt(e.target.value) || 0 })}
                min="0"
                required
              />
            </div>
            <div className="quantity-input">
              <span>1kg Quantity</span>
              <input
                type="number"
                value={newSweet.quantity1kg}
                onChange={(e) => setNewSweet({ ...newSweet, quantity1kg: parseInt(e.target.value) || 0 })}
                min="0"
                required
              />
            </div>
          </div>
          <input
            type="number"
            placeholder="Price per kg"
            value={newSweet.price}
            onChange={(e) => setNewSweet({ ...newSweet, price: parseFloat(e.target.value) || 0 })}
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
            <label>Product Images (select up to 3 images at once)</label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileChange}
            />
            {newSweet.photos.length > 0 && (
              <div className="selected-files">
                <p>{newSweet.photos.length} image{newSweet.photos.length !== 1 ? 's' : ''} selected</p>
                <ul>
                  {newSweet.photos.map((file, index) => (
                    <li key={index}>{file.name}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          <button type="submit" className="btn-add">Add Sweet</button>
        </form>
        
        <div className="inventory-management-section">
          <h3>Current Inventory</h3>
          
          {loading.sweets ? (
            <div className="loading">Loading sweets...</div>
          ) : error ? (
            <div className="error">{error}</div>
          ) : (
            <div className="sweets-grid">
              {sweets.map((sweet) => (
                <div 
                  key={sweet._id} 
                  className={`sweet-card ${isLowStock(sweet) ? 'low-stock' : ''} ${isOutOfStock(sweet) ? 'out-of-stock' : ''}`}
                >
                  <div className="sweet-content">
                    <h3>{sweet.name}</h3>
                    <div className="quantity-display">
                      <div className={sweet.quantity250g < 5 ? 'low-quantity' : ''}>
                        250g: {sweet.quantity250g || 0}
                      </div>
                      <div className={sweet.quantity500g < 5 ? 'low-quantity' : ''}>
                        500g: {sweet.quantity500g || 0}
                      </div>
                      <div className={sweet.quantity1kg < 5 ? 'low-quantity' : ''}>
                        1kg: {sweet.quantity1kg || 0}
                      </div>
                    </div>
                    <p className="total-stock">
                      Total Stock: {(sweet.quantity250g || 0) + (sweet.quantity500g || 0) + (sweet.quantity1kg || 0)} units
                    </p>
                    <p className="price">₹{sweet.price?.toFixed(2) || '0.00'} per kg</p>
                    <p className="inventory-value">
                      Value: ₹{(sweet.price * ((sweet.quantity250g || 0) * 0.25 + (sweet.quantity500g || 0) * 0.5 + (sweet.quantity1kg || 0))).toFixed(2)}
                    </p>
                    <p>{sweet.description}</p>
                    {sweet.photos?.length > 0 && (
                      <img 
                        src={`http://localhost:5000/api/sweets/image/${sweet._id}`} 
                        alt={sweet.name}
                        onError={(e) => e.target.style.display = 'none'}
                      />
                    )}
                    
                    <div className="sweet-actions">
                      <button 
                        onClick={() => openStockModal(sweet)} 
                        className="update-stock-btn"
                      >
                        Update Stock
                      </button>
                      <button 
                        onClick={() => handleDeleteSweet(sweet._id)} 
                        className="delete-btn"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="user-module">
      <div className="sidebar">
        <div className="sidebar-header">
          <h2>Admin Dashboard</h2>
        </div>
        <button
          className={`sidebar-btn ${activeSection === "orders" ? "active" : ""}`}
          onClick={() => setActiveSection("orders")}
        >
          <FaBox />
          Orders
        </button>
        <button
          className={`sidebar-btn ${activeSection === "sweets" ? "active" : ""}`}
          onClick={() => setActiveSection("sweets")}
        >
          <FaCandyCane />
          Sweets
        </button>
        <button
          className={`sidebar-btn ${activeSection === "customers" ? "active" : ""}`}
          onClick={() => setActiveSection("customers")}
        >
          <FaUsers />
          Customers
        </button>
        <button
          className={`sidebar-btn ${activeSection === "stats" ? "active" : ""}`}
          onClick={() => setActiveSection("stats")}
        >
          <FaChartLine />
          Statistics
        </button>
        <button
          className="sidebar-btn logout"
          onClick={onLogout}
        >
          <FaSignOutAlt />
          Logout
        </button>
      </div>

      <div className="content">
        {activeSection === "orders" && renderOrders()}
        {activeSection === "sweets" && renderSweets()}
        {activeSection === "customers" && renderCustomers()}
        {activeSection === "stats" && renderStats()}
      </div>

      {isModalOpen && stockItem && (
        <div style={{ position: 'fixed', zIndex: 99999, top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', padding: 40, borderRadius: 8, minWidth: 300, minHeight: 200 }}>
            <h3>Update Stock for {stockItem.name}</h3>
            <form onSubmit={e => {
              e.preventDefault();
              handleStockModalSubmit({
                _id: stockItem._id,
                quantity250g: Number(e.target.quantity250g.value),
                quantity500g: Number(e.target.quantity500g.value),
                quantity1kg: Number(e.target.quantity1kg.value)
              });
            }}>
              <div>
                <label>250g: </label>
                <input name="quantity250g" type="number" defaultValue={stockItem.quantity250g} min="0" />
              </div>
              <div>
                <label>500g: </label>
                <input name="quantity500g" type="number" defaultValue={stockItem.quantity500g} min="0" />
              </div>
              <div>
                <label>1kg: </label>
                <input name="quantity1kg" type="number" defaultValue={stockItem.quantity1kg} min="0" />
              </div>
              <button type="submit">Update</button>
              <button type="button" onClick={() => { setIsModalOpen(false); setStockItem(null); }}>Cancel</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
