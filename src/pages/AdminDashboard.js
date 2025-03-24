import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/AdminDashboard.css"; // Ensure correct CSS file
import Modal from "./Modal"; // Import modal component

const AdminDashboard = ({ onLogout, isLoggedIn }) => {
  const [activeSection, setActiveSection] = useState("orderPlaced");
  const [sweets, setSweets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [addSweetMode, setAddSweetMode] = useState(false);
  const [removeSweetMode, setRemoveSweetMode] = useState(false);
  const [selectedSweet, setSelectedSweet] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  const [newSweet, setNewSweet] = useState({
    name: "",
    quantity250g: "",
    quantity500g: "",
    quantity1kg: "",
    price: "",
    description: "",
    photos: [null, null, null]
  });

  // Fetch sweets from MongoDB when switching to "Sweet Details"
  useEffect(() => {
    if (activeSection === "sweetDetails" && isLoggedIn) {
      fetchSweetsData();
    }
  }, [activeSection, isLoggedIn]);

  const fetchSweetsData = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/sweets");
      if (!response.ok) throw new Error("Failed to fetch sweets data");
      const data = await response.json();
      setSweets(data);
      setError(null);
    } catch (err) {
      console.error("Error fetching sweets data:", err);
      setError("Failed to load sweets. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (index, e) => {
    const file = e.target.files[0];
    if (file) {
      const updatedPhotos = [...newSweet.photos];
      updatedPhotos[index] = file;
      setNewSweet({ ...newSweet, photos: updatedPhotos });
    }
  };

  const handleAddSweetSubmit = async () => {
    const formData = new FormData();
    formData.append("name", newSweet.name);
    formData.append("quantity250g", newSweet.quantity250g);
    formData.append("quantity500g", newSweet.quantity500g);
    formData.append("quantity1kg", newSweet.quantity1kg);
    formData.append("price", newSweet.price);
    formData.append("description", newSweet.description);
    newSweet.photos.forEach((photo) => {
      if (photo) {
        formData.append("photos", photo);
      }
    });

    try {
      const response = await fetch("/api/sweets", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) throw new Error("Failed to add sweet");
      alert("Sweet added successfully!");
      fetchSweetsData();
    } catch (error) {
      console.error("Error adding sweet:", error);
      alert("Failed to add sweet");
    }
  };

  const handleDeleteSweet = async (id) => {
    try {
      const response = await fetch(`/api/sweets/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete sweet");
      alert("Sweet deleted successfully!");
      fetchSweetsData();
    } catch (error) {
      console.error("Error deleting sweet:", error);
      alert("Failed to delete sweet");
    }
  };

  const renderContent = () => {
    switch (activeSection) {
      case "orderPlaced":
        return <div>Order Placed Content</div>;
      case "sweetDetails":
        return (
          <div>
            <h2>Manage Sweets</h2>

            {/* Add Sweet Form */}
            <div className="add-sweet-form">
              <input type="text" placeholder="Sweet Name" onChange={(e) => setNewSweet({ ...newSweet, name: e.target.value })} />
              <input type="number" placeholder="Quantity (250g)" onChange={(e) => setNewSweet({ ...newSweet, quantity250g: e.target.value })} />
              <input type="number" placeholder="Quantity (500g)" onChange={(e) => setNewSweet({ ...newSweet, quantity500g: e.target.value })} />
              <input type="number" placeholder="Quantity (1kg)" onChange={(e) => setNewSweet({ ...newSweet, quantity1kg: e.target.value })} />
              <input type="number" placeholder="Price per kg" onChange={(e) => setNewSweet({ ...newSweet, price: e.target.value })} />
              <textarea placeholder="Description" onChange={(e) => setNewSweet({ ...newSweet, description: e.target.value })} />
              
              <div>
                <label>Upload Photos (Max 3)</label>
                {[0, 1, 2].map((index) => (
                  <input key={index} type="file" accept="image/*" onChange={(e) => handleFileChange(index, e)} />
                ))}
              </div>

              <button onClick={handleAddSweetSubmit}>Add Sweet</button>
            </div>

            {/* Sweets List */}
            {loading ? <p>Loading sweets...</p> : (
              <div className="sweet-list">
                {sweets.map((sweet) => (
                  <div key={sweet._id} className="sweet-item">
                    <h3>{sweet.name}</h3>
                    <p>250g: {sweet.quantity250g}, 500g: {sweet.quantity500g}, 1kg: {sweet.quantity1kg}</p>
                    <p>Price: ₹{sweet.price}</p>
                    <p>{sweet.description}</p>

                    {sweet.photos.length > 0 && (
                      <img src={`/api/sweets/image/${sweet._id}`} alt={sweet.name} width="100" />
                    )}

                    <button onClick={() => handleDeleteSweet(sweet._id)}>Delete</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      case "successfulOrders":
        return <div>Successful Orders Content</div>;
      case "profit":
        return <div>Profit Content</div>;
      case "reviews":
        return <div>Reviews Content</div>;
      default:
        return <div>Select a section</div>;
    }
  };

  return (
    <div className="admin-dashboard">
      <div className="sidebar">
        {isLoggedIn && (
          <>
            <button onClick={() => setActiveSection("orderPlaced")}>Order Placed</button>
            <button onClick={() => setActiveSection("sweetDetails")}>Sweet Details</button>
            <button onClick={() => setActiveSection("profit")}>Profit</button>
            <button onClick={() => setActiveSection("successfulOrders")}>Successful Orders</button>
            <button onClick={() => setActiveSection("reviews")}>Reviews</button>
            <button onClick={onLogout}>Logout</button>
          </>
        )}
      </div>
      <div className="content">
        {renderContent()}
      </div>
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSubmit={handleAddSweetSubmit} 
        sweetDetails={selectedSweet} 
      />
    </div>
  );
};

export default AdminDashboard;
