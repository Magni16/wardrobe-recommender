import React from "react";

function HoverEnlargeCard({ src, alt, caption }) {
return (
<article
className="hec group"
aria-label={caption || alt}
tabIndex={0}
>
<div className="hec-media">
<img src={src} alt={alt} loading="lazy" className="hec-img" />
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