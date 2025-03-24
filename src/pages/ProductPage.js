import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom"; // Get ID from URL
import "../styles/ProductPage.css";
import Header from "../components/Navbar";
import Footer from "../components/Footer";
import io from "socket.io-client";

const socket = io("http://localhost:5000", { autoConnect: false });

const ProductPage = () => {
  const { id } = useParams(); // Get sweet ID from URL
  const [sweet, setSweet] = useState(null);
  const [mainImg, setMainImg] = useState("");
  const [selectedSize, setSelectedSize] = useState("250g");
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    window.scrollTo(0, 0);
    
    const fetchSweet = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/sweets/${id}`);
        const data = await response.json();
        setSweet(data);
        setMainImg(data.photos[0]); // Set first image as default
      } catch (error) {
        console.error("Error fetching sweet:", error);
      }
    };

    fetchSweet();

    if (!socket.connected) {
      socket.connect();
    }

    socket.on("sweetUpdated", (updatedSweet) => {
      if (updatedSweet._id === id) {
        setSweet(updatedSweet);
        setMainImg(updatedSweet.photos[0]);
      }
    });

    return () => {
      socket.off("sweetUpdated");
      socket.disconnect();
    };
  }, [id]);

  const handleSizeSelect = (size) => {
    setSelectedSize(size);
  };

  const incrementQuantity = () => {
    setQuantity(quantity + 1);
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  if (!sweet) {
    return <p>Loading...</p>;
  }

  // Price calculation
  const priceMap = {
    "250g": sweet.price / 4,
    "500g": sweet.price / 2,
    "1kg": sweet.price,
  };

  const totalPrice = priceMap[selectedSize] * quantity;

  return (
    <>
      <Header />
      <div className="product-page">
        <div className="container">
          {/* Left - Product Images */}
          <div className="product-gallery">
            <img className="main-image" src={mainImg} alt={sweet.name} />
            <div className="thumbnail-images">
              {sweet.photos.map((photo, index) => (
                <img key={index} src={photo} alt={`Thumbnail ${index}`} onClick={() => setMainImg(photo)} />
              ))}
            </div>
          </div>

          {/* Right - Product Details */}
          <div className="product-details">
            <h1 className="product-title">{sweet.name}</h1>
            <p className="product-description">{sweet.description}</p>

            {/* Product Highlights */}
            <div className="product-highlights">
              <div className="highlights-list">
                <div className="highlight-item">
                  <p>Natural Ingredients</p>
                </div>
                <div className="highlight-item">
                  <p>No Artificial Flavor</p>
                </div>
                <div className="highlight-item">
                  <p>Made with Ghee</p>
                </div>
                <div className="highlight-item">
                  <p>Premium Quality</p>
                </div>
              </div>
            </div>

            {/* Price Display */}
            <div className="price-section">
              <p className="default-price"><strong>Rs.</strong> ₹{priceMap[selectedSize].toFixed(2)}</p>
              <p className="total-price"><strong>Subtotal:</strong> ₹{totalPrice.toFixed(2)}</p>
            </div>

            {/* Size Selection */}
            <div className="size-selection">
              {Object.keys(priceMap).map((size) => (
                <button
                  key={size}
                  className={`size-btn ${selectedSize === size ? "selected" : ""}`}
                  onClick={() => handleSizeSelect(size)}
                >
                  {size}
                </button>
              ))}
            </div>

            {/* Quantity & Add to Cart */}
            <div className="quantity-cart">
              <div className="quantity-selector">
                <button onClick={decrementQuantity}>−</button>
                <span>{quantity}</span>
                <button onClick={incrementQuantity}>+</button>
              </div>
              <button className="add-to-cart">Add to Cart</button>
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="additional-info-container">
          <div className="additional-info">
            <h3 className="info-title">Specific storage info</h3>
            <p className="info-text">
              Once you receive the Sweet box, keep it in a cool and dry place. Ideal temperature is 25-28°C. 
              Avoid moisture and direct sunlight. Do not refrigerate. Store in an airtight container.
            </p>

            <h3 className="info-title">Shelf Life</h3>
            <p className="info-text">45 days from the date of manufacturing.</p>

            <h3 className="info-title">Info</h3>
            <p className="info-text">This product contains no additives, preservatives, or artificial flavorings. It is 100% natural.</p>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ProductPage;
