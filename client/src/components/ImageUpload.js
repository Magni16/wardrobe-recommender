import React, { useState, useEffect } from "react";
import axios from "axios";

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
    const formData = new FormData();
    formData.append("image", image);
    formData.append("category", category);

    try {
      await axios.post("http://localhost:5000/api/upload", formData);
      alert("Upload successful!");
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
    <div>
      <h2>Upload Clothing Item</h2>

      <input type="file" onChange={(e) => setImage(e.target.files[0])} />
      <select value={category} onChange={(e) => setCategory(e.target.value)}>
        <option value="">Select Category</option>
        <option value="shirt">Shirt</option>
        <option value="jeans">Jeans</option>
        <option value="shoes">Shoes</option>
        <option value="hat">Hat</option>
      </select>
      <button onClick={handleUpload}>Upload</button>

      <hr />

      <h3>Uploaded Items</h3>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "20px" }}>
        {clothes.map((item) => (
          <div
            key={item._id}
            style={{ border: "1px solid #ccc", padding: "10px", width: "180px" }}
          >
            <img
              src={item.imageUrl}
              alt="Uploaded"
              style={{ width: "100%", height: "auto" }}
            />
            <p>Category: {item.category || "N/A"}</p>
            <button onClick={() => handleDelete(item._id)}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ImageUpload;
