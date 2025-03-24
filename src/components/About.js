import React, { useState, useEffect } from "react";
import "../styles/About.css";
import reviewsImage1 from "../assets/About_review1.png"; // Import all 9 review images
import reviewsImage2 from "../assets/About_review2.png";
import reviewsImage3 from "../assets/About_review3.png";
import reviewsImage4 from "../assets/About_review4.png";
import reviewsImage5 from "../assets/About_review5.png";
import reviewsImage6 from "../assets/About_review6.png";
import reviewsImage7 from "../assets/About_review7.png";
import reviewsImage8 from "../assets/About_review8.png";
import reviewsImage9 from "../assets/About_review9.png";

const reviewImages = [
  reviewsImage1, reviewsImage2, reviewsImage3,
  reviewsImage4, reviewsImage5, reviewsImage6,
  reviewsImage7, reviewsImage8, reviewsImage9
];

const About = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextReview = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % reviewImages.length);
  };

  const prevReview = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? reviewImages.length - 1 : prevIndex - 1
    );
  };

  useEffect(() => {
    const interval = setInterval(nextReview, 3000); // Auto-slide every 3 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="about" id="about">
      <h2>About Us</h2>
      <p>
        Sweetiliciouss is a premium sweet shop offering the finest quality traditional sweets.
        Made with love and the best ingredients, our sweets bring joy to every occasion.
      </p>

      {/* Reviews Section */}
      <div className="reviews">
        <h2>What Our Customers Say</h2>
        <div className="review-carousel">
          <button className="prev-btn" onClick={prevReview}>❮</button>
          <div className="review-track">
            {reviewImages.map((image, index) => {
              // Calculate the position of each review relative to the currentIndex
              let position = index - currentIndex;
              if (position < -4) position += reviewImages.length; // Handle left overflow
              if (position > 4) position -= reviewImages.length; // Handle right overflow

              return (
                <div
                  key={index}
                  className={`review-slide ${
                    position === 0
                      ? "active" // Center
                      : position === -1 || position === 1
                      ? "near" // Left and right of center
                      : "far" // Far left and far right
                  }`}
                  style={{
                    transform: `translateX(${position * 100}%) scale(${
                      position === 0 ? 1 : 0.8
                    })`,
                    opacity: position === 0 ? 1 : 0.6,
                    zIndex: position === 0 ? 2 : 1,
                  }}
                >
                  <img src={image} alt={`Review ${index + 1}`} className="review-image" />
                </div>
              );
            })}
          </div>
          <button className="next-btn" onClick={nextReview}>❯</button>
        </div>
      </div>
    </section>
  );
};

export default About;