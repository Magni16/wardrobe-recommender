// components/ChromaGrid.jsx
import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import "./ChromaGrid.css";

export default function ChromaGrid({
  items,
  className = "",
  radius = 300,
  columns = 3,
  rows = 2,
  damping = 0.45,
  fadeOut = 0.6,
  ease = "power3.out",
  onCardClick, // optional handler
}) {
  const rootRef = useRef(null);
  const fadeRef = useRef(null);
  const setX = useRef(null);
  const setY = useRef(null);
  const pos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    setX.current = gsap.quickSetter(el, "--x", "px");
    setY.current = gsap.quickSetter(el, "--y", "px");

    const { width, height } = el.getBoundingClientRect();
    pos.current = { x: width / 2, y: height / 2 };
    setX.current(pos.current.x);
    setY.current(pos.current.y);
  }, []);

  const moveTo = (x, y) => {
    gsap.to(pos.current, {
      x,
      y,
      duration: damping,
      ease,
      onUpdate: () => {
        setX.current?.(pos.current.x);
        setY.current?.(pos.current.y);
      },
      overwrite: true,
    });
  };

  const handleMove = (e) => {
    const r = rootRef.current.getBoundingClientRect();
    moveTo(e.clientX - r.left, e.clientY - r.top);
    gsap.to(fadeRef.current, { opacity: 0, duration: 0.25, overwrite: true });
  };

  const handleLeave = () => {
    gsap.to(fadeRef.current, { opacity: 1, duration: fadeOut, overwrite: true });
  };

  const handleCardMove = (e) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    card.style.setProperty("--mouse-x", `${x}px`);
    card.style.setProperty("--mouse-y", `${y}px`);
  };

  return (
    <div
      ref={rootRef}
      className={`chroma-grid ${className}`}
      style={{ "--r": `${radius}px`, "--cols": columns, "--rows": rows }}
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
    >
      {items.map((c, i) => (
        <article
          key={c.id ?? i}
          className="chroma-card"
          onMouseMove={handleCardMove}
          onClick={() => (onCardClick ? onCardClick(c) : c.url && window.open(c.url, "_blank", "noopener,noreferrer"))}
          style={{
            "--card-border": c.borderColor || "transparent",
            "--card-gradient": c.gradient || "linear-gradient(145deg, #1d9bf0, #000)",
            cursor: c.url || onCardClick ? "pointer" : "default",
          }}
          role={onCardClick || c.url ? "button" : "article"}
          tabIndex={0}
          onKeyDown={(e) => {
            if ((e.key === "Enter" || e.key === " ") && (onCardClick || c.url)) {
              e.preventDefault();
              if (onCardClick) onCardClick(c);
              else if (c.url) window.open(c.url, "_blank", "noopener,noreferrer");
            }
          }}
          aria-label={c.title || c.caption || c.category || "item"}
        >
          <div className="chroma-img-wrapper">
            <img src={c.image} alt={c.title || c.caption || c.category || "item"} loading="lazy" />
          </div>
          <footer className="chroma-info">
            <h3 className="name">{c.title || c.caption || (c.category ? c.category.toUpperCase() : "Item")}</h3>
            {c.handle && <span className="handle">{c.handle}</span>}
            {(c.subtitle || c.meta) && <p className="role">{c.subtitle || c.meta}</p>}
            {c.location && <span className="location">{c.location}</span>}
          </footer>
        </article>
      ))}
      <div className="chroma-overlay" />
      <div ref={fadeRef} className="chroma-fade" />
    </div>
  );
}
