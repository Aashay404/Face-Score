import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

function Result() {
  const location = useLocation();
  const navigate = useNavigate();
  const data = location.state || {};

  if (data.error) {
    return (
      <div style={styles.container}>
        <h2 style={styles.title}>Face Analysis</h2>

        <div style={styles.errorCard}>
          <h3>No Face Detected</h3>
          <p>Please scan clearly in good lighting.</p>
        </div>

        <button style={styles.btn} onClick={() => navigate("/scan")}>
          Scan Again
        </button>
      </div>
    );
  }

  const features = [
    { name: "Eyes", score: data.eyes },
    { name: "Eyebrows", score: data.eyebrows },
    { name: "Nose", score: data.nose },
    { name: "Lips", score: data.lips },
    { name: "Jawline", score: data.jawline },
    { name: "Cheekbones", score: data.cheekbones },
    { name: "Chin", score: data.chin },
    { name: "Forehead", score: data.forehead },
    { name: "Ears", score: data.ears }
  ];

  const overall =
    features.reduce((sum, f) => sum + (f.score || 0), 0) /
    features.length;

  const getColor = (score) => {
    if (score >= 90) return "#00ff9c";
    if (score >= 80) return "#ffd166";
    return "#40893d";
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Your Face Score</h2>

      {/* ⭐ Overall Circle */}
      <div style={styles.circle}>
        <h1>{Math.round(overall)}</h1>
        <span>Overall</span>
      </div>

      {/* ⭐ Feature Bars */}
      <div style={styles.list}>
        {features.map((f, i) => (
          <div key={i} style={styles.card}>
            <div style={styles.row}>
              <span>{f.name}</span>
              <span>{f.score}</span>
            </div>

            <div style={styles.barBg}>
              <div
                style={{
                  ...styles.barFill,
                  width: `${f.score}%`,
                  background: getColor(f.score)
                }}
              />
            </div>
          </div>
        ))}
      </div>

      <button style={styles.btn} onClick={() => navigate("/scan")}>
        Scan Again
      </button>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    background: "linear-gradient(180deg,#0f0f0f,#1a1a1a)",
    color: "white",
    padding: 20
  },

  title: {
    textAlign: "center",
    marginBottom: 20,
    letterSpacing: 1
  },

  circle: {
    width: 160,
    height: 160,
    borderRadius: "50%",
    margin: "20px auto",
    background: "radial-gradient(circle,#00ff9c33,#000)",
    border: "3px solid #00ff9c",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    boxShadow: "0 0 25px #00ff9c"
  },

  list: {
    display: "flex",
    flexDirection: "column",
    gap: 14
  },

  card: {
    background: "#1e1e1e",
    padding: 15,
    borderRadius: 14,
    boxShadow: "0 0 10px #000"
  },

  row: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 6
  },

  barBg: {
    height: 8,
    background: "#333",
    borderRadius: 10,
    overflow: "hidden"
  },

  barFill: {
    height: "100%",
    borderRadius: 10,
    transition: "0.6s"
  },

  btn: {
    marginTop: 25,
    width: "100%",
    padding: 18,
    background: "#00ff9c",
    border: "none",
    borderRadius: 14,
    fontSize: 18,
    fontWeight: "bold"
  },

  errorCard: {
    background: "#1e1e1e",
    padding: 25,
    borderRadius: 20,
    textAlign: "center",
    boxShadow: "0 0 20px red",
    marginTop: 40
  }
};

export default Result;