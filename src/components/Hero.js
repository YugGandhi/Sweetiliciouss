import React, { useState, useEffect } from "react";
import "../styles/Hero.css"; // Import CSS
import img1 from "../assets/Hero1.png"; 
import img2 from "../assets/Hero2.png";
import img3 from "../assets/Hero3.png";

const images = [img1, img2, img3];

const Hero = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-slide effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 3000); // Change image every 3 seconds

    return () => clearInterval(interval);
  }, []);

  // Manual navigation
  const prevSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
  };

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  return (
    <section className="hero">
      <div className="hero-slider">
        <img src={images[currentIndex]} alt="Sweetiliciouss Slide" className="hero-image" />
        <button className="prev" onClick={prevSlide}>&#10094;</button>
        <button className="next" onClick={nextSlide}>&#10095;</button>
      </div>
      {/* <div className="hero-text">
        <h1>Welcome to Sweetiliciouss</h1>
        <p>Delicious sweets made with love ❤️</p>
        <button className="btn">Explore Now</button>
      </div> */} 
    </section>
  );
};

export default Hero;
 