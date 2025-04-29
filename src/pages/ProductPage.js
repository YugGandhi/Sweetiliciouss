import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import "../styles/ProductPage.css";
import Header from "../components/Navbar";
import Footer from "../components/Footer";
import { getSocket } from "../services/socketService";
import { sweets as sweetsApi } from "../services/api";
import { useCart } from "../context/CartContext";
import { toast } from "react-toastify";

import naturalIngredientsIcon from "../assets/organic.png";
import naturalIcon from "../assets/no-additives.png";
import gheeIcon from "../assets/ghee.png";
import nutrientsIcon from "../assets/premium-quality.png";


const ProductPage = ({ user }) => {
  const { id } = useParams();
  const [sweet, setSweet] = useState(null);
  const [mainImg, setMainImg] = useState("");
  const [selectedSize, setSelectedSize] = useState("250g");
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { addToCart } = useCart();

  useEffect(() => {
    window.scrollTo(0, 0);

    const fetchSweet = async () => {
      try {
        setLoading(true);
        const { data } = await sweetsApi.getOne(id);
        setSweet(data);
        if (data.photos && data.photos.length > 0) {
          setMainImg(data.photos[0]);
        }
        setError(null);
      } catch (error) {
        console.error("Error fetching sweet:", error);
        setError("Failed to load product. Please try again.");
        toast.error("Failed to load product");
      } finally {
        setLoading(false);
      }
    };

    fetchSweet();

    // Get the shared socket instance
    const socket = getSocket();

    socket.on("sweetUpdated", (updatedSweet) => {
      if (updatedSweet._id === id) {
        setSweet(updatedSweet);
        if (updatedSweet.photos && updatedSweet.photos.length > 0) {
          setMainImg(updatedSweet.photos[0]);
        }
      }
    });

    return () => {
      if (socket) {
        socket.off("sweetUpdated");
        // Don't disconnect here - other components may be using it
      }
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

  const handleAddToCart = () => {
    if (!sweet) return;

    const sizeKey = selectedSize === "250g" ? "quantity250g" :
      selectedSize === "500g" ? "quantity500g" : "quantity1kg";

    // Check availability
    if (sweet[sizeKey] < quantity) {
      toast.error(`Only ${sweet[sizeKey]} ${selectedSize} packages available`);
      return;
    }

    // Create cart item with selected size and quantity
    const cartItem = {
      ...sweet,
      _id: `${sweet._id}-${selectedSize}`, // Make unique ID for each size
      selectedSize,
      quantity,
      price: selectedSize === "250g" ? sweet.price / 4 :
        selectedSize === "500g" ? sweet.price / 2 : sweet.price
    };

    addToCart(cartItem);
    toast.success(`${sweet.name} (${selectedSize}) added to cart!`);
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading product...</p>
        </div>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <div className="error-container">
          <p>{error}</p>
          <button onClick={() => window.location.reload()} className="retry-btn">
            Try Again
          </button>
        </div>
        <Footer />
      </>
    );
  }

  if (!sweet) {
    return (
      <>
        <Header />
        <div className="error-container">
          <p>Product not found</p>
          <button onClick={() => window.history.back()} className="back-btn">
            Go Back
          </button>
        </div>
        <Footer />
      </>
    );
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
            {mainImg ? (
              <img
                className="main-image"
                src={sweet.photos && sweet.photos.length > 0 ? sweet.photos[0] : '/placeholder-image.jpg'}
                alt={sweet.name}
                onError={e => {
                  console.warn('Image failed to load:', e.target.src);
                  e.target.onerror = null;
                  e.target.src = '/placeholder-image.jpg';
                }}
              />
            ) : (
              <div className="main-image placeholder">No Image Available</div>
            )}
            <div className="thumbnail-images">
              {sweet.photos && sweet.photos.map((photo, index) => (
                <img
                  key={index}
                  src={photo}
                  alt={`Thumbnail ${index}`}
                  onClick={() => setMainImg(photo)}
                  onError={e => {
                    console.warn('Image failed to load:', e.target.src);
                    e.target.onerror = null;
                    e.target.src = '/placeholder-image.jpg';
                  }}
                />
              ))}
            </div>
          </div>

          {/* Right - Product Details */}
          <div className="product-details">
            <h1 className="product-title">{sweet.name}</h1>
            <p className="product-description">
              Sugar-free sweets made with premium dry fruits, roasted in pure Gir Cow Ghee.
            </p>
            {/* Product Highlights */}
            <div className="product-highlights">
              <div className="highlights-list">
                <div className="highlight-item">
                  <img src={naturalIngredientsIcon} alt="Natural Ingredients" />
                  <p>Natural Ingredients</p>
                </div>
                <div className="highlight-item">
                  <img src={naturalIcon} alt="Natural" />
                  <p>No Artificial Flavor</p>
                </div>
                <div className="highlight-item">
                  <img src={gheeIcon} alt="Ghee" />
                  <p>Made with Ghee</p>
                </div>
                <div className="highlight-item">
                  <img src={nutrientsIcon} alt="Nutrients" />
                  <p>Premium Quality</p>
                </div>
              </div>
            </div>

            {/* Price Display */}
            <div className="price-section">
              <p className="default-price"><strong>Price:</strong> ₹{priceMap[selectedSize].toFixed(2)}</p>
              <p className="total-price"><strong>Subtotal:</strong> ₹{totalPrice.toFixed(2)}</p>
            </div>

            {/* Size Selection */}
            <div className="size-selection">
              {Object.keys(priceMap).map((size) => {
                const sizeKey = size === "250g" ? "quantity250g" :
                  size === "500g" ? "quantity500g" : "quantity1kg";
                const inStock = sweet[sizeKey] > 0;

                return (
                  <button
                    key={size}
                    className={`size-btn ${selectedSize === size ? "selected" : ""} ${!inStock ? "out-of-stock" : ""}`}
                    onClick={() => inStock && handleSizeSelect(size)}
                    disabled={!inStock}
                  >
                    {size}
                    {!inStock && <span className="stock-label">Out of Stock</span>}
                  </button>
                );
              })}
            </div>

            {/* Quantity & Add to Cart */}
            <div className="quantity-cart">
              <div className="quantity-selector">
                <button onClick={decrementQuantity} disabled={quantity <= 1}>−</button>
                <span>{quantity}</span>
                <button onClick={incrementQuantity}>+</button>
              </div>
              <button
                className="add-to-cart"
                onClick={handleAddToCart}
                disabled={sweet[selectedSize === "250g" ? "quantity250g" :
                  selectedSize === "500g" ? "quantity500g" : "quantity1kg"] < quantity}
              >
                Add to Cart
              </button>
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="additional-info-container">
          <div className="additional-info">
            <h3 className="info-title">Description</h3>
            <p className="product-description">{sweet.description || "Sugar-free sweets made with premium dry fruits, roasted in pure Gir Cow Ghee."}</p>

            <h3 className="info-title">Storage Information</h3>
            <p className="info-text">
              Once you receive the Sweet box, keep it in a cool and dry place. Ideal temperature is 25-28°C.
              Avoid moisture and direct sunlight. Do not refrigerate. Store in an airtight container.
            </p>

            <h3 className="info-title">Shelf Life</h3>
            <p className="info-text">45 days from the date of manufacturing.</p>

            <h3 className="info-title">Product Information</h3>
            <p className="info-text">This product contains no additives, preservatives, or artificial flavorings. It is 100% natural.</p>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ProductPage;
