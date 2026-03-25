import React, { useRef, useState } from "react";
import Webcam from "react-webcam";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../config";

function Scan() {
  const navigate = useNavigate();

  const webcamRef = useRef(null);

  const [cameraReady, setCameraReady] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [images, setImages] = useState({
    front: null,
    left: null,
    right: null
  });

  // ⭐ Capture Function
  const capture = () => {
    if (!webcamRef.current) return;

    const video = webcamRef.current.video;

    if (!video || video.videoWidth === 0) return;

    // ⭐ Capture REAL frame using canvas (no stretch)
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0);

    const img = canvas.toDataURL("image/jpeg", 0.95);

    // ⭐ Freeze UI
    setCapturedImage(img);
    setLoading(true);

    setTimeout(() => {
      setCapturedImage(null);
      setLoading(false);

      if (step === 1) {
        setImages(prev => ({ ...prev, front: img }));
        setStep(2);
      }

      else if (step === 2) {
        setImages(prev => ({ ...prev, left: img }));
        setStep(3);
      }

      else if (step === 3) {
        const finalImages = {
          ...images,
          right: img
        };

        setImages(finalImages);
        startProcessing(finalImages);
      }

    }, 1500);
  };

  // ⭐ API Call
  const startProcessing = async (finalImages) => {
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/analyze-face`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(finalImages)
      });

      const data = await response.json();

      setLoading(false);
      navigate("/result", { state: data });

    } catch {
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
            forceScreenshotSourceSize={true}
            videoConstraints={{
              facingMode: "user",
              width: 640,
              height: 480
            }}
            onUserMedia={() => {
              setTimeout(() => setCameraReady(true), 1000);
            }}
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
        <button
          style={{
            ...styles.captureBtn,
            opacity: cameraReady ? 1 : 0.5
          }}
          disabled={!cameraReady}
          onClick={capture}
        >
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
  title: { textAlign: "center" },
  instruction: {
    textAlign: "center",
    marginBottom: 8,
    color: "#00ff9c"
  },
  cameraBox: {
    cameraBox: {
  width: "100%",
  maxWidth: 420,
  aspectRatio: "3 / 4",   // ⭐ VERY IMPORTANT
  margin: "auto",
  position: "relative",
  borderRadius: 15,
  overflow: "hidden"
}
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
    border: "3px solid #6f00ff",
    borderRadius: 20,
    boxShadow: "0 0 20px #0080ff"
  },
  overlay: {
    position: "absolute",
    inset: 0,
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