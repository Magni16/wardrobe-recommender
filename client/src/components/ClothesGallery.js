// client/src/components/ClothesGallery.js
import React, { useEffect, useState } from "react";
import './ClothesGallery.css';
import axios from "axios";


const ClothesGallery = () => {
  const [clothes, setClothes] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:5000/api/clothes")
      .then(response => setClothes(response.data))
      .catch(error => console.error("Error fetching clothes:", error));
  }, []);

  return (
    <div>
      <h2>Your Wardrobe</h2>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
        {clothes.map((item, index) => (
          <div key={index}>
            <img
              src={item.imageUrl}
              alt={`Clothing ${index}`}
              style={{ width: "150px", height: "auto", borderRadius: "10px" }}
            />
            <p>{item.category}</p> {/* Optional if you store categories */}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ClothesGallery;
