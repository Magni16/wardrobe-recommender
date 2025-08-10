import React, { useState, useEffect } from "react";
import axios from "axios";
import "./ImageUpload.css";
import HoverEnlargeCard from "./HoverEnlargeCard";

const ImageUpload = () => {
  const [image, setImage] = useState(null);
  const [category, setCategory] = useState("");
  const [clothes, setClothes] = useState([]); // Store uploaded clothes

  // ✅ Fetch clothes from backend
  const fetchClothes = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/debug/db");
      setClothes(res.data);
    } catch (err) {
      console.error("Failed to fetch clothes:", err);
    }
  };

  // ✅ Run on component mount
  useEffect(() => {
    fetchClothes();
  }, []);

  // ✅ Upload handler
  const handleUpload = async () => {
    // Keep your current behavior (guards commented out by you)
    const formData = new FormData();
    formData.append("image", image);
    formData.append("category", category);

    try {
      await axios.post("http://localhost:5000/api/upload", formData);
      alert("Upload successful!");
      setImage(null);
      setCategory("");
      fetchClothes(); // ✅ Refresh after upload
    } catch (err) {
      console.error(err);
      alert("Upload failed.");
    }
  };

  // ✅ Delete handler
  const handleDelete = async (id) => {
    try {
      await axios.post(
        "http://localhost:5000/api/delete",
        { id },
        { headers: { "Content-Type": "application/json" } }
      );
      alert("Deleted successfully!");
      fetchClothes(); // ✅ Refresh after delete
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Delete failed.");
    }
  };

  return (
    <div className="image-upload">
      <h2>Upload Clothing Item</h2>

      <div className="upload-toolbar">
        <input
          className="input"
          type="file"
          accept="image/*"
          onChange={(e) => setImage(e.target.files?.[0] || null)}
        />
        <select
          className="select"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="">Select Category</option>
          <option value="shirt">Shirt</option>
          <option value="jeans">Jeans</option>
          <option value="shoes">Shoes</option>
          <option value="hat">Hat</option>
        </select>
        <button className="btn btn--primary" onClick={handleUpload}>
          Upload
        </button>
      </div>

      <hr className="hr-soft" />

      <h3>Uploaded Items</h3>
      <div className="uploaded-list">
        {clothes.map((item) => (
          <div key={item._id} className="upload-card">
            <HoverEnlargeCard
              src={item.imageUrl}
              alt="Uploaded"
              caption={item.category || "Item"}
            />
            <p className="meta">Category: {item.category || "N/A"}</p>
            <div className="upload-actions">
              <button
                className="btn btn--danger"
                onClick={() => handleDelete(item._id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ImageUpload;
