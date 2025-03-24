import React, { useState, useEffect } from "react";
import "../styles/Products.css"; 
import { Link } from "react-router-dom";
import io from "socket.io-client";

const socket = io("http://localhost:5000", { autoConnect: false }); // Prevent auto-reconnect loops

const Products = () => {
  const [sweets, setSweets] = useState([]);

  useEffect(() => {
    const fetchSweets = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/sweets");
        const data = await response.json();
        setSweets(data);
      } catch (error) {
        console.error("Error fetching sweets:", error);
      }
    };

    fetchSweets();

    // ✅ Ensure WebSocket connects only once
    if (!socket.connected) {
      socket.connect();
    }

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

    // ✅ Cleanup WebSocket listeners when component unmounts
    return () => {
      socket.off("sweetAdded");
      socket.off("sweetUpdated");
      socket.off("sweetDeleted");
      socket.disconnect(); // Close WebSocket properly
    };
  }, []);

  return (
    <section className="products" id="products">
      <h2 className="section-title">Sweetiliciouss's Top Picks</h2>
      <div className="product-grid">
        {sweets.map((sweet) => (
          <div className="product-card" key={sweet._id}>
            <div className="product-image-container">
              <img src={sweet.photos[0]} alt={sweet.name} className="product-image" />
              <div className="product-description-hover">{sweet.description}</div>
            </div>
            <h3>{sweet.name}</h3>
            <p className="product-description-static">Price: ₹{sweet.price}</p>
            <Link to={`/product/${sweet._id}`}>
              <button className="buy-btn">Order Now</button>
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Products;
