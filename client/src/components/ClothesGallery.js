// ClothesGallery.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import "./ClothesGallery.css";
import HoverEnlargeCard from "./HoverEnlargeCard";

const ClothesGallery = ({ onItemSelected }) => {
  const [clothes, setClothes] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/clothes")
      .then((response) => setClothes(response.data))
      .catch((error) => console.error("Error fetching clothes:", error));
  }, []);

  const grouped = {
    shirt: [],
    jeans: [],
    shoes: [],
  };

  clothes.forEach((item) => {
    if (grouped[item.category]) grouped[item.category].push(item);
  });

  console.log("Clothes:", clothes);

  return (
    <div>
      {Object.entries(grouped).map(([category, items]) => (
        <div key={category}>
          <h3>{category.toUpperCase()}</h3>
          <div className="clothes-grid">
            {items.map((item, index) => {
              console.log("🔍 Item from wardrobe:", item);
              const itemId =
                item._id?.$oid || item._id?.toString?.() || item._id;
              console.log("🆔 Extracted ID:", itemId);

              return (
                <div
                  className="clothing-item"
                  key={itemId || `${category}-${index}`}
                  onClick={() => {
                    console.log("Item clicked:", {
                      category,
                      id: itemId,
                      imageUrl: item.imageUrl,
                    });
                    onItemSelected(category, itemId, item.imageUrl);
                  }}
                  tabIndex={0}
                  role="button"
                  aria-label={`Select ${category}`}
                >
                  <HoverEnlargeCard
                    src={item.imageUrl}
                    alt={category}
                    caption={category.toUpperCase()}
                  />
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ClothesGallery;
