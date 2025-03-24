import React, { useState, useEffect } from "react";
import "../styles/Modal.css"; // Ensure this file exists

const Modal = ({ isOpen, onClose, onSubmit, sweetDetails }) => {
  const [name, setName] = useState("");
  const [quantity250g, setQuantity250g] = useState("");
  const [quantity500g, setQuantity500g] = useState("");
  const [quantity1kg, setQuantity1kg] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [photos, setPhotos] = useState([null, null, null]);
  const [photoPreviews, setPhotoPreviews] = useState([null, null, null]);

  useEffect(() => {
    if (sweetDetails) {
      setName(sweetDetails.name);
      setQuantity250g(sweetDetails.quantity250g);
      setQuantity500g(sweetDetails.quantity500g);
      setQuantity1kg(sweetDetails.quantity1kg);
      setDescription(sweetDetails.description);
      setPrice(sweetDetails.price);
      setPhotos(sweetDetails.photos || [null, null, null]);

      // Set image previews if existing photos are present
      const previews = sweetDetails.photos?.map(photo =>
        photo ? `/api/sweets/image/${sweetDetails._id}` : null
      );
      setPhotoPreviews(previews || [null, null, null]);
    } else {
      resetForm();
    }
  }, [isOpen, sweetDetails]);

  const resetForm = () => {
    setName("");
    setQuantity250g("");
    setQuantity500g("");
    setQuantity1kg("");
    setDescription("");
    setPrice("");
    setPhotos([null, null, null]);
    setPhotoPreviews([null, null, null]);
  };

  const handlePhotoChange = (index, e) => {
    const file = e.target.files[0];
    if (file) {
      const updatedPhotos = [...photos];
      updatedPhotos[index] = file;
      setPhotos(updatedPhotos);

      const updatedPreviews = [...photoPreviews];
      updatedPreviews[index] = URL.createObjectURL(file);
      setPhotoPreviews(updatedPreviews);
    }
  };

  const handleSubmit = () => {
    const updatedSweet = {
      ...sweetDetails,
      name,
      quantity250g,
      quantity500g,
      quantity1kg,
      description,
      price,
      photos
    };
    onSubmit(updatedSweet);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>{sweetDetails ? "Modify Sweet" : "Add New Sweet"}</h3>

        <div className="form-group">
          <label>Sweet Name:</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>

        <div className="form-group">
          <label>Quantity (250g):</label>
          <input type="number" value={quantity250g} onChange={(e) => setQuantity250g(e.target.value)} min="0" required />
        </div>

        <div className="form-group">
          <label>Quantity (500g):</label>
          <input type="number" value={quantity500g} onChange={(e) => setQuantity500g(e.target.value)} min="0" required />
        </div>

        <div className="form-group">
          <label>Quantity (1kg):</label>
          <input type="number" value={quantity1kg} onChange={(e) => setQuantity1kg(e.target.value)} min="0" required />
        </div>

        <div className="form-group">
          <label>Price per kg (₹):</label>
          <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} min="0.01" step="0.01" required />
        </div>

        <div className="form-group">
          <label>Description:</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows="5"
            placeholder="Enter a description of the sweet"
            style={{ resize: "vertical", overflowY: "auto" }}
          />
        </div>

        <div className="form-group">
          <label>Upload Photos (Max 3):</label>
          <div className="photo-upload-container">
            {[0, 1, 2].map((index) => (
              <div key={index} className="photo-upload-item">
                <div className="photo-preview">
                  {photoPreviews[index] ? (
                    <img src={photoPreviews[index]} alt={`Preview ${index + 1}`} />
                  ) : (
                    <div className="no-photo">Photo {index + 1}</div>
                  )}
                </div>
                <input type="file" accept="image/*" onChange={(e) => handlePhotoChange(index, e)} id={`photo-upload-${index}`} />
                <label htmlFor={`photo-upload-${index}`} className="photo-upload-button">
                  {photoPreviews[index] ? "Change Photo" : "Select Photo"}
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className="form-buttons">
          <button onClick={handleSubmit} className="btn-add">
            {sweetDetails ? "Update Sweet" : "Add Sweet"}
          </button>
          <button onClick={onClose} className="btn-cancel">Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
