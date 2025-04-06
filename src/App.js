import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import ProductPage from "./pages/ProductPage"; // ✅ Single dynamic product page
import AdminDashboard from "./pages/AdminDashboard";
import CartPage from "./pages/CartPage";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; 
import { CartProvider } from "./context/CartContext";
import CheckoutPage from "./pages/CheckoutPage";
import OrderConfirmationPage from "./pages/OrderConfirmationPage";
import OrderTrackingPage from "./pages/OrderTrackingPage";
import OrdersPage from "./pages/OrdersPage";
import UserProfilePage from "./pages/UserProfilePage";
import { getSocket, disconnectSocket } from "./services/socketService";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = () => {
      try {
        const storedUser = localStorage.getItem("user");
        if (!storedUser) {
          setLoading(false);
          return;
        }
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Error parsing user data:", error);
        localStorage.removeItem("user");
        toast.error("Session data was corrupted. Please log in again.");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
    window.addEventListener("userUpdated", fetchUser);

    // Initialize socket when app starts
    const socket = getSocket();

    return () => {
      window.removeEventListener("userUpdated", fetchUser);
      disconnectSocket();
    };
  }, []);

  const handleLogout = () => {
    try {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      setUser(null);
      window.dispatchEvent(new Event("userUpdated"));
      toast.success("Logged out successfully");
    } catch (error) {
      console.error("Error during logout:", error);
      toast.error("Error during logout");
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <CartProvider>
      <Router>
        <ToastContainer 
          position="top-right" 
          autoClose={2000} 
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />

        <Routes>
          <Route path="/" element={<Home user={user} onLogout={handleLogout} />} />
          
          <Route path="/product/:id" element={<ProductPage user={user} />} />
          
          <Route 
            path="/cart" 
            element={<CartPage user={user} onLogout={handleLogout} />}
          />
          
          <Route 
            path="/checkout" 
            element={
              user ? <CheckoutPage user={user} onLogout={handleLogout} /> : <Navigate to="/" replace />
            }
          />
          
          <Route 
            path="/order-confirmation/:orderId" 
            element={
              user ? <OrderConfirmationPage user={user} onLogout={handleLogout} /> : <Navigate to="/" replace />
            }
          />
          
          <Route 
            path="/order-tracking/:orderId"
            element={
              user ? <OrderTrackingPage user={user} onLogout={handleLogout} /> : <Navigate to="/" replace />
            }
          />
          
          <Route 
            path="/orders"
            element={
              user ? <OrdersPage user={user} onLogout={handleLogout} /> : <Navigate to="/" replace />
            }
          />
          
          <Route 
            path="/profile"
            element={
              user ? <UserProfilePage user={user} onLogout={handleLogout} /> : <Navigate to="/" replace />
            }
          />

          <Route
            path="/admin"
            element={
              !user ? (
                <Navigate to="/" replace />
              ) : user.isAdmin ? (
                <AdminDashboard onLogout={handleLogout} isLoggedIn={true} />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </CartProvider>
  );
}

export default App;
