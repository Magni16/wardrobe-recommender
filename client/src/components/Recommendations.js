// Recommendations.js
import React, { useEffect, useState } from "react";
import axios from "axios";

const Recommendations = ({ selectedCategory, selectedId, selectedImage }) => {
  const [recommendation, setRecommendation] = useState(null);

  useEffect(() => {
    console.log(`Calling: /api/recommend?category=${selectedCategory}&id=${selectedId}`);
    if (!selectedCategory || !selectedId) return;

    const fetch = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/recommend?category=${selectedCategory}&id=${selectedId}`);
        console.log("Requesting recommendation with:", selectedCategory, selectedId);
        setRecommendation(res.data);
        console.log("Recommendation result:", res.data);
      } catch (err) {
        console.error("Failed to get recommendations:", err);
      }
    };

    fetch();
  }, [selectedCategory, selectedId]);

  if (!recommendation) return null;

  return (
    <div style={{ marginTop: "40px" }}>
      <h2>Recommended Outfit</h2>
      <p>🟢 Match Score: {(recommendation.score * 100).toFixed(2)}%</p>
      <div style={{ display: "flex", gap: "20px" }}>
        <div>
          <p><strong>Selected {selectedCategory}</strong></p>
          <img src={selectedImage} alt="selected" width={150} />
          console.log("Selected Image:", selectedImage);
        </div>
        <div>
          <p><strong>Recommended Jeans</strong></p>
          <img src={recommendation.recommendedJeans} alt="jeans" width={150} />
        </div>
        <div>
          <p><strong>Recommended Shoes</strong></p>
          <img src={recommendation.recommendedShoes} alt="shoes" width={150} />
        </div>
      </div>
    </div>
  );
};

export default Recommendations;
