import React, { useState , useEffect } from "react";
import "../styles/ProductPage.css";
import Header from "../components/Navbar";
import Footer from "../components/Footer";

// Import images
import mainImage from "../assets/Product_dryfruit_punch1.png";
import image1 from "../assets/Product_dryfruit_punch1.png";
import image2 from "../assets/Product_dryfruit_punch2.png";
import image3 from "../assets/Product_dryfruit_punch3.png";

// Highlight icons
import naturalIngredientsIcon from "../assets/organic.png";
import naturalIcon from "../assets/no-additives.png";
import gheeIcon from "../assets/ghee.png";
import nutrientsIcon from "../assets/premium-quality.png";

// Price list
const priceList = {
  "250g": 200,
  "500g": 400,
  "1kg": 800,
};



const ProductPage = () => {
  const [mainImg, setMainImg] = useState(mainImage);
  const [selectedSize, setSelectedSize] = useState("250g");
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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

  // Default price (price per unit)
  const defaultPrice = priceList[selectedSize];

  // Dynamic price based on quantity
  const totalPrice = defaultPrice * quantity;

  return (
    <>
      <Header />
      <div className="product-page">
        <div className="container">
          {/* Left - Product Images */}
          <div className="product-gallery">
            <img className="main-image" src={mainImg} alt="DryFruit Punch" />
            <div className="thumbnail-images">
              <img src={image1} alt="Thumb 1" onClick={() => setMainImg(image1)} />
              <img src={image2} alt="Thumb 2" onClick={() => setMainImg(image2)} />
              <img src={image3} alt="Thumb 3" onClick={() => setMainImg(image3)} />
            </div>
          </div>

          {/* Right - Product Details */}
          <div className="product-details">
            <h1 className="product-title">DryFruit Punch</h1>
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
              <p className="default-price">
                <strong>Rs.</strong> ₹{defaultPrice.toFixed(2)}
              </p>
              <p className="total-price">
                <strong>Subtotal:</strong> ₹{totalPrice.toFixed(2)}
              </p>
            </div>

            {/* Size Selection */}
            <div className="size-selection">
              {Object.keys(priceList).map((size) => (
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
            <h3 className="info-title">Description</h3>
            <p className="info-text">
              Dryfruit Punch is a premium blend of the finest dry fruits, offering a rich taste and high nutritional value.
            </p>
            <p className="info-text">
              A perfect mix of Almonds, Cashew nuts, Pistachios, and Figs, slow-roasted in pure Gir Cow Ghee and naturally sweetened with honey. Every bite is packed with crunch, energy, and a burst of flavor.
            </p>
            <p className="info-text">
              An ideal treat for festivals, fasting, diet-conscious individuals, or simply enjoying as a healthy dessert.
            </p>
            <p className="info-text">
              Enjoy this wholesome Dryfruit Punch, made fresh with 100% natural ingredients—Almonds, Cashew nuts, Pistachios, Figs, Honey & Gir Cow Ghee.
            </p>
            <h3 className="info-title">Specific storage info</h3>
            <p className="info-text">
              Once you received the Sweet box please keep in a cool and dry place. Ideal temperature is at room temperature 25 to 28 degree Celsius. Avoid exposure to moisture and direct sunlight. Do not refrigerate. Keep it in an airtight container.
            </p>

            <h3 className="info-title">Shelf Life</h3>
            <p className="info-text">45 days from the date of manufacturing.</p>

            <h3 className="info-title">Info</h3>
            <p className="info-text">This product contains no additives, preservatives or artificial flavourings. It is 100% natural.</p>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ProductPage;
