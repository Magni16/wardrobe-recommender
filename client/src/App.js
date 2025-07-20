// App.js
import './App.css';
import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  useNavigate
} from "react-router-dom";
import { FiUpload, FiGrid, FiHome } from "react-icons/fi";
import ImageUpload from "./components/ImageUpload";
import ClothesGallery from "./components/ClothesGallery";
import Recommendations from "./components/Recommendations";
import Modal from "./components/Modal";

// >>>>>>>>>> SPLIT HERO COMPONENT <<<<<<<<<<<
const HERO_IMAGE = "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=900&q=80";

function Hero({ onUpload, onWardrobe, onImageHover }) {
  const [hovered, setHovered] = useState(false);

  // Notify parent for background takeover
  React.useEffect(() => {
    if (onImageHover) onImageHover(hovered, HERO_IMAGE);
  }, [hovered, onImageHover]);

  return (
    <section className="split-hero">
      <div className="split-hero-left">
        <h1 className="split-hero-title">OPEN STORAGE</h1>
        <p className="split-hero-subtitle">
          Garage Collection of Wardrobe Art <br />
          <span className="split-hero-period">Curated fits, instantly.</span>
        </p>
        <div className="split-hero-actions">
          <button className="hero-btn" onClick={onUpload}>
            <FiUpload style={{ marginRight: 8, fontSize: "1.15em" }} />
            Upload Items
          </button>
          <button className="hero-btn" onClick={onWardrobe}>
            <FiGrid style={{ marginRight: 8, fontSize: "1.15em" }} />
            View Wardrobe
          </button>
        </div>
      </div>
      <div className="split-hero-right">
        <img
          src={HERO_IMAGE}
          alt="Wardrobe Luxury Display"
          className="split-hero-image"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          onFocus={() => setHovered(true)}
          onBlur={() => setHovered(false)}
          tabIndex={0}
        />
      </div>
    </section>
  );
}

// >>>>>>>> REST OF App.js <<<<<<<<<

function WardrobePage({ onItemSelected }) {
  return (
    <div className="panel-content">
      <h2 className="panel-title">YOUR WARDROBE</h2>
      <ClothesGallery onItemSelected={onItemSelected} />
    </div>
  );
}

function UploadPage() {
  return (
    <div className="panel-content">
      <h2 className="panel-title">UPLOADED ITEMS</h2>
      <ImageUpload />
    </div>
  );
}

function HomePage({ onUpload, onWardrobe, onImageHover }) {
  return <Hero onUpload={onUpload} onWardrobe={onWardrobe} onImageHover={onImageHover} />;
}

function MainApp() {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Hero BG active state for background takeover
  const [heroBgActive, setHeroBgActive] = useState(false);
  const [heroImage, setHeroImage] = useState("");

  const location = useLocation();
  const navigate = useNavigate();

  // Navigation handlers
  const handleUploadsToggle = () => {
    if (location.pathname === "/uploads") {
      navigate("/");
    } else {
      navigate("/uploads");
    }
  };

  const handleWardrobeToggle = () => {
    if (location.pathname === "/wardrobe") {
      navigate("/");
    } else {
      navigate("/wardrobe");
    }
  };

  const handleItemSelected = (category, id, imageUrl) => {
    setSelectedCategory(category);
    setSelectedId(id);
    setSelectedImage(imageUrl);
    setIsModalOpen(true);
  };
  const handleCloseModal = () => setIsModalOpen(false);

  const handleGoHome = () => navigate("/");

  // Handler for hero image hover
  const handleHeroImageHover = (active, img) => {
    setHeroBgActive(active);
    setHeroImage(img);
  };

  return (
    <div
      className={`App${heroBgActive ? " hero-bg-active" : ""}`}
      style={
        heroBgActive && heroImage
          ? {
              backgroundImage: `url('${heroImage}')`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
              transition:
                "background-image 1.1s cubic-bezier(.32,1.6,.45,0.93), background 1.1s cubic-bezier(.32,1.6,.45,0.93)",
            }
          : undefined
      }
    >
      <button
        onClick={handleGoHome}
        className="nav-home-btn"
        aria-label="Go home"
      >
        <FiHome style={{ marginRight: 8, fontSize: "1.34rem" }} />
        Home
      </button>

      {location.pathname !== "/" && (
        <div className="main-nav">
          <button
            onClick={handleUploadsToggle}
            className={`main-nav-btn${location.pathname === "/uploads" ? " main-nav-btn-active" : ""}`}>
            <FiUpload style={{ marginRight: 8, fontSize: "1.18rem" }} />
            Uploaded Items
          </button>
          <button
            onClick={handleWardrobeToggle}
            className={`main-nav-btn${location.pathname === "/wardrobe" ? " main-nav-btn-active" : ""}`}>
            <FiGrid style={{ marginRight: 8, fontSize: "1.18rem" }} />
            Your Wardrobe
          </button>
        </div>
      )}

      <Routes>
        <Route
          path="/wardrobe"
          element={<WardrobePage onItemSelected={handleItemSelected} />}
        />
        <Route
          path="/uploads"
          element={<UploadPage />}
        />
        <Route
          path="/"
          element={
            <HomePage
              onUpload={handleUploadsToggle}
              onWardrobe={handleWardrobeToggle}
              onImageHover={handleHeroImageHover}
            />
          }
        />
      </Routes>

      <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
        <Recommendations
          selectedCategory={selectedCategory}
          selectedId={selectedId}
          selectedImage={selectedImage}
        />
      </Modal>
    </div>
  );
}

function App() {
  return (
    <Router>
      <MainApp />
    </Router>
  );
}

export default App;
