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

import DarkVeil from "./components/DarkVeil";
import ImageUpload from "./components/ImageUpload";
import ClothesGallery from "./components/ClothesGallery";
import Recommendations from "./components/Recommendations";
import Modal from "./components/Modal";

/* ================= Home Page ================= */
function HomePage({ onUpload, onWardrobe }) {
  return (
    <div className="home-container">
      {/* DarkVeil full background */}
      <div className="darkveil-wrapper">
        <DarkVeil
          hueShift={20}
          noiseIntensity={0}
          scanlineIntensity={0.15}
          scanlineFrequency={0}
          speed={1}
          warpAmount={0.15}
        />
      </div>

      {/* Overlay: tagline + buttons */}
      <div className="home-overlay">
        <div className="hero-tagline">
          <span className="tagline-eyebrow">Powered by taste</span>
          <h1 className="tagline-title">Compute the perfect fit</h1>
          <p className="tagline-sub">
            Turn every piece into a versatile outfit with intelligent matching.
          </p>
        </div>

        <div className="home-buttons">
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
    </div>
  );
}

/* ================ Other Pages ================= */
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
      <ImageUpload />
    </div>
  );
}

/* ================ Main App ================= */
function MainApp() {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  const handleUploadsToggle = () => {
    location.pathname === "/uploads" ? navigate("/") : navigate("/uploads");
  };
  const handleWardrobeToggle = () => {
    location.pathname === "/wardrobe" ? navigate("/") : navigate("/wardrobe");
  };

  const handleItemSelected = (category, id, imageUrl) => {
    setSelectedCategory(category);
    setSelectedId(id);
    setSelectedImage(imageUrl);
    setIsModalOpen(true);
  };
  const handleCloseModal = () => setIsModalOpen(false);
  const handleGoHome = () => navigate("/");

  return (
    <div className={`App ${location.pathname === '/' ? 'home-no-scroll' : ''}`}>
      {/* Always-visible Home button */}
      <button
        onClick={handleGoHome}
        className="nav-home-btn"
        aria-label="Go home"
      >
        <FiHome style={{ marginRight: 8, fontSize: "1.34rem" }} />
        Home
      </button>

      {/* Secondary nav on non-home routes */}
      {location.pathname !== "/" && (
        <div className="main-nav">
          <button
            onClick={handleUploadsToggle}
            className={`main-nav-btn${location.pathname === "/uploads" ? " main-nav-btn-active" : ""}`}
          >
            <FiUpload style={{ marginRight: 8, fontSize: "1.18rem" }} />
            Uploaded Items
          </button>
          <button
            onClick={handleWardrobeToggle}
            className={`main-nav-btn${location.pathname === "/wardrobe" ? " main-nav-btn-active" : ""}`}
          >
            <FiGrid style={{ marginRight: 8, fontSize: "1.18rem" }} />
            Your Wardrobe
          </button>
        </div>
      )}

      {/* Routes */}
      <Routes>
        <Route
          path="/"
          element={
            <HomePage
              onUpload={handleUploadsToggle}
              onWardrobe={handleWardrobeToggle}
            />
          }
        />
        <Route path="/uploads" element={<UploadPage />} />
        <Route path="/wardrobe" element={<WardrobePage onItemSelected={handleItemSelected} />} />
      </Routes>

      {/* Modal */}
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

export default function App() {
  return (
    <Router>
      <MainApp />
    </Router>
  );
}
