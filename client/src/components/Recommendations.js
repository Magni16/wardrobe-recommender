// src/components/Recommendations.js
import React, { useEffect, useState } from "react";
import axios from "axios";

const Recommendations = ({ category }) => {
  const [recommended, setRecommended] = useState([]);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/recommend?category=${category}`);
        setRecommended(res.data[category] || []);
      } catch (err) {
        console.error("Failed to get recommendations:", err);
      }
    };

    if (category) fetch();
  }, [category]);

  return (
    <div>
      <h2>Recommended {category}</h2>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "20px" }}>
        {recommended.map((url, idx) => (
          <img key={idx} src={url} alt="Recommendation" style={{ width: 150 }} />
        ))}
      </div>
    </div>
  );
};

export default Recommendations;
