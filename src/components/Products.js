import React, { useState, useEffect } from "react";
import "../styles/Products.css"; 
import { Link } from "react-router-dom";
import { getSocket, disconnectSocket } from "../services/socketService";
import { useCart } from "../context/CartContext";
import { toast } from "react-toastify";
import { sweets as sweetsApi } from "../services/api";

const Products = () => {
  const [sweets, setSweets] = useState([]);
  const { addToCart } = useCart();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSweets = async () => {
      try {
        setLoading(true);
        const { data } = await sweetsApi.getAll();
        setSweets(data);
      } catch (error) {
        console.error("Error fetching sweets:", error);
        toast.error("Failed to load sweets. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchSweets();

    // Get the shared socket instance
    const socket = getSocket();

    socket.on("sweetAdded", (newSweet) => {
      setSweets((prevSweets) => [...prevSweets, newSweet]);
    });

    socket.on("sweetUpdated", (updatedSweet) => {
      setSweets((prevSweets) =>
        prevSweets.map((sweet) => (sweet._id === updatedSweet._id ? updatedSweet : sweet))
      );
    });

    socket.on("sweetDeleted", (deletedSweetId) => {
      setSweets((prevSweets) => prevSweets.filter((sweet) => sweet._id !== deletedSweetId));
    });

    // Cleanup WebSocket listeners when component unmounts
    return () => {
      if (socket) {
        socket.off("sweetAdded");
        socket.off("sweetUpdated");
        socket.off("sweetDeleted");
        // Don't disconnect here - other components may be using it
      }
    };
  }, []);

  const handleAddToCart = (sweet) => {
    addToCart(sweet);
    toast.success(`${sweet.name} added to cart!`);
  };

  if (loading) {
    return (
      <section className="products" id="products">
        <h2 className="section-title">Sweetiliciouss's Top Picks</h2>
        <div className="loading-spinner-container">
          <div className="loading-spinner"></div>
          <p>Loading sweets...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="products" id="products">
      <h2 className="section-title">Sweetiliciouss's Top Picks</h2>
      <div className="product-grid">
        {sweets.length === 0 ? (
          <div className="no-products">
            <p>No sweets available at the moment. Please check back later.</p>
          </div>
        ) : (
          sweets.map((sweet) => (
            <div className="product-card" key={sweet._id}>
              <div className="product-image-container">
                <img 
                  src={sweet.photos && sweet.photos.length > 0 ? sweet.photos[0] : '/placeholder-image.jpg'} 
                  alt={sweet.name} 
                  className="product-image" 
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/placeholder-image.jpg';
                  }} 
                />
                <div className="product-description-hover">
                  <p className="product-description">
                    Sugar-free sweets made with premium dry fruits, roasted in pure Gir Cow Ghee.
                  </p>
                </div>
              </div>
              <h3>{sweet.name}</h3>
              <p className="product-description-static">Price: ₹{sweet.price}</p>
              <div className="product-actions">
                <button 
                  className="add-to-cart-btn"
                  onClick={() => handleAddToCart(sweet)}
                >
                  Add to Cart
                </button>
                <Link to={`/product/${sweet._id}`}>
                  <button className="view-details-btn">View Details</button>
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
};

export default Products;
