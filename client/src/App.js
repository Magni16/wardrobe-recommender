import './App.css';
import React from "react";
import ImageUpload from "./components/ImageUpload";
import ClothesGallery from "./components/ClothesGallery";
import Recommendations from "./components/Recommendations";

function App() {
  return (
    <div className="App">
      <h1>Wardrobe Recommender</h1>
      <ImageUpload />
      <ClothesGallery />
      <Recommendations category="shirt" />

    </div>
  );
}

export default App;
