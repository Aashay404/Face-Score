import React from "react";
import FeatureCard from "../components/FeatureCard";
import "../styles/home.css";

import { useNavigate } from "react-router-dom";

import "../styles/home.css";

function Home() {
    const navigate = useNavigate();
  return (
    <div className="home-container">

      <div className="hero">
        <h1>Face Scanner</h1>
        <p>Analyze your facial Score</p>
      </div>

      <div className="scan-preview">
        <div className="scan-circle"></div>
      </div>

      <div className="features">

        <FeatureCard
          title="Emotion Detection"
          desc="Detects facial emotions instantly"
        />

        <FeatureCard
          title="Facial Symmetry"
          desc="Measures facial balance and proportion"
        />

        <FeatureCard
          title="Confidence Score"
          desc="Generates confidence rating"
        />

        <FeatureCard
          title="Skin Analysis"
          desc="Basic clarity and tone evaluation"
        />

      </div>

      <button
  className="scan-btn"
  onClick={() => navigate("/scan")}
>
  Start Face Scan
</button>

    </div>
  );
}

export default Home;