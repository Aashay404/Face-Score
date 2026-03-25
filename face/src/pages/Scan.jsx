import React, { useRef, useState } from "react";
import Webcam from "react-webcam";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../config";


function Scan() {
  const navigate = useNavigate();

  const webcamRef = useRef(null);
const [capturedImage, setCapturedImage] = useState(null);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [images, setImages] = useState({
    front: null,
    left: null,
    right: null
  });

 const capture = () => {

  const img = webcamRef.current.getScreenshot();

  setCapturedImage(img);     // ⭐ freeze screen
  setLoading(true);

  setTimeout(() => {

    setLoading(false);
    setCapturedImage(null);  // ⭐ resume camera

    if (step === 1) {
      setImages(prev => ({ ...prev, front: img }));
      setStep(2);
    }

    else if (step === 2) {
      setImages(prev => ({ ...prev, left: img }));
      setStep(3);
    }

    else if (step === 3) {
      setImages(prev => ({ ...prev, right: img }));
      startProcessing();
    }

  }, 2000);

};

const startProcessing = async () => {

  setLoading(true);

  try {
 
    const response = await fetch(`${API_URL}/analyze-face`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(images)
    });

    const data = await response.json();

    setLoading(false);

    // ⭐ Navigate always
    navigate("/result", { state: data });

  } catch (err) {
    setLoading(false);

    navigate("/result", {
      state: { error: "Server error. Please try again." }
    });
  }

};


  const getInstruction = () => {
    if (step === 1) return "Look Straight";
    if (step === 2) return "Turn Face LEFT";
    if (step === 3) return "Turn Face RIGHT";
  };

  return (
    <div style={styles.container}>

      <h2 style={styles.title}>Face Scan</h2>

      <p style={styles.instruction}>{getInstruction()}</p>

      <div style={styles.cameraBox}>

  {capturedImage ? (
    <img src={capturedImage} style={styles.camera} />
  ) : (
    <Webcam
      ref={webcamRef}
      screenshotFormat="image/jpeg"
      mirrored={false}
      videoConstraints={{ facingMode: "user" }}
      style={styles.camera}
    />
  )}

  <div style={styles.faceFrame}></div>

  {loading && (
    <div style={styles.overlay}>
      <div style={styles.loader}></div>
      <p>Analyzing Facial Structure...</p>
    </div>
  )}

</div>

      {!loading && (
        <button style={styles.captureBtn} onClick={capture}>
          Capture
        </button>
      )}

    </div>
  );
}

const styles = {

  container: {
    height: "100vh",
    background: "#111",
    color: "white",
    padding: 15,
    display: "flex",
    flexDirection: "column"
  },

  title: {
    textAlign: "center"
  },

  instruction: {
    textAlign: "center",
    marginBottom: 8,
    color: "#00ff9c"
  },

  cameraBox: {
    flex: 1,
    position: "relative",
    borderRadius: 15,
    overflow: "hidden"
  },

  camera: {
    width: "100%",
    height: "100%",
    objectFit: "cover"
  },

  faceFrame: {
    position: "absolute",
    top: "20%",
    left: "15%",
    right: "15%",
    bottom: "20%",
    border: "3px solid #00ff9c",
    borderRadius: 20,
    boxShadow: "0 0 20px #00ff9c"
  },

  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0,0,0,0.7)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center"
  },

  loader: {
    width: 60,
    height: 60,
    border: "6px solid #00ff9c",
    borderTop: "6px solid transparent",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    marginBottom: 20
  },

  captureBtn: {
    marginTop: 10,
    padding: 18,
    background: "#00ff9c",
    border: "none",
    borderRadius: 12,
    fontSize: 18
  }

};

export default Scan;