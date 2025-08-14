// src/components/HoverEnlargeCard.jsx
import React from "react";
import "./HoverEnlargeCard.css";

function HoverEnlargeCard({ src, alt, caption, onClick }) {
  return (
    <article
      className="hec group"
      aria-label={caption || alt || "item"}
      tabIndex={0}
      role="button"
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick?.();
        }
      }}
    >
      <div className="hec-media">
        <img src={src} alt={alt || caption || "item"} loading="lazy" className="hec-img" />
        <div className="hec-veil" />
      </div>
      {caption && (
        <footer className="hec-footer">
          <div className="hec-chip">{caption}</div>
        </footer>
      )}
    </article>
  );
}

export default HoverEnlargeCard;
