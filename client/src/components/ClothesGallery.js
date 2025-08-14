// ClothesGallery.js
import React, { useEffect, useMemo, useState } from "react";
import api from "../api/axios"; // use your centralized axios instance
import "./ClothesGallery.css";
import ChromaGrid from "./ChromaGrid";

import HoverEnlargeCard from "./HoverEnlargeCard";

const ORDER = ["shirt", "jeans", "shoes", "hat"];

const CAT_STYLE = {
  shirt: { borderColor: "#1d9bf0", gradient: "linear-gradient(145deg, #1d9bf0, #000)" },
  jeans: { borderColor: "#06b6d4", gradient: "linear-gradient(145deg, #06b6d4, #000)" },
  shoes: { borderColor: "#10b981", gradient: "linear-gradient(145deg, #10b981, #000)" },
  hat:   { borderColor: "#8b5cf6", gradient: "linear-gradient(145deg, #8b5cf6, #000)" },
};

export default function ClothesGallery({ onItemSelected }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await api.get("/clothes");
        const data = res?.data?.data || res?.data || [];
        if (mounted) setItems(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error("Error fetching clothes:", e);
        if (mounted) setItems([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const grouped = useMemo(() => {
    const g = { shirt: [], jeans: [], shoes: [], hat: [] };
    for (const it of items) {
      if (g[it.category]) g[it.category].push(it);
    }
    return g;
  }, [items]);

  if (loading) {
    return (
      <div className="clothes-gallery">
        <div className="skeleton-grid">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="skeleton-card" />
          ))}
        </div>
      </div>
    );
  }

  const hasAny = ORDER.some((c) => grouped[c]?.length);

  return (
  <div className="clothes-gallery">
    {!hasAny && <p className="empty-state">No items yet. Upload a few pieces to start curating your fits.</p>}
    {ORDER.map((category) => {
      const arr = grouped[category] || [];
      if (!arr.length) return null;

      const mapped = arr.map((it) => {
        const id = it._id?.$oid || it._id?.toString?.() || it._id;
        const style = CAT_STYLE[category] || {};
        return {
          id,
          image: it.imageUrl,
          title: category.toUpperCase(),
          subtitle: "Tap to select",
          borderColor: style.borderColor,
          gradient: style.gradient,
          category,
        };
      });

      return (
        <section key={category}>
          <h3>{category}</h3>
          <ChromaGrid
            items={mapped}
            columns={3}
            rows={Math.ceil(mapped.length / 3)}
            radius={380}
            damping={0.45}
            fadeOut={0.8}
            ease="power3.out"
            onCardClick={(c) => onItemSelected?.(c.category, c.id, c.image)}
          />
        </section>
      );
    })}
  </div>
);
}
