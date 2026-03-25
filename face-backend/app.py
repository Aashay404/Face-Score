from flask import Flask, request, jsonify
from flask_cors import CORS
import cv2
import numpy as np
import base64
import mediapipe as mp
import os
from pymongo import MongoClient
from dotenv import load_dotenv
import cloudinary
import cloudinary.uploader
from datetime import datetime

app = Flask(__name__)
CORS(app)

load_dotenv()

# ⭐ MongoDB
client = MongoClient(os.getenv("MONGO_URI"))
db = client["faceAI"]
collection = db["scans"]
print("Mongo Connected")

# ⭐ Cloudinary
cloudinary.config(
    cloud_name=os.getenv("CLOUD_NAME"),
    api_key=os.getenv("API_KEY"),
    api_secret=os.getenv("API_SECRET")
)

# ⭐ Mediapipe FaceMesh (DEPLOY SAFE)
mp_face = mp.solutions.face_mesh
face_mesh = mp_face.FaceMesh(
    static_image_mode=True,
    max_num_faces=1,
    refine_landmarks=True
)

def upload_image(img):
    if img is None:
        return None
    _, buffer = cv2.imencode(".jpg", img)
    result = cloudinary.uploader.upload(buffer.tobytes())
    return result["secure_url"]

def decode_image(base64_string):
    if base64_string is None:
        return None
    try:
        img_data = base64.b64decode(base64_string.split(',')[1])
        np_arr = np.frombuffer(img_data, np.uint8)
        return cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
    except:
        return None

# ⭐ REAL GEOMETRIC SCORING
def calculate_scores(landmarks):

    pts = [(lm.x, lm.y) for lm in landmarks]

    def dist(a, b):
        return np.sqrt((a[0]-b[0])**2 + (a[1]-b[1])**2)

    face_width = dist(pts[234], pts[454])
    face_height = dist(pts[10], pts[152])

    left_eye = dist(pts[33], pts[133])
    right_eye = dist(pts[362], pts[263])
    eye_diff = abs(left_eye - right_eye)

    nose_ratio = dist(pts[1], pts[4]) / face_height
    jaw_ratio = dist(pts[172], pts[397]) / face_width
    cheek_ratio = dist(pts[116], pts[345]) / face_width
    lip_ratio = dist(pts[61], pts[291]) / face_width
    chin_ratio = dist(pts[152], pts[199]) / face_height
    forehead_ratio = dist(pts[10], pts[151]) / face_height
    face_ratio = face_width / face_height

    def map_score(value, ideal, tolerance):
        diff = abs(value - ideal)
        normalized = diff / tolerance
        score = 100 - normalized * 80
        return int(max(75, min(95, score)))

    return {
        "eyes": map_score(eye_diff, 0.02, 0.05),
        "eyebrows": map_score(nose_ratio, 0.18, 0.08),
        "nose": map_score(nose_ratio, 0.30, 0.10),
        "lips": map_score(lip_ratio, 0.35, 0.10),
        "jawline": map_score(jaw_ratio, 0.75, 0.15),
        "cheekbones": map_score(cheek_ratio, 0.60, 0.12),
        "chin": map_score(chin_ratio, 0.18, 0.07),
        "forehead": map_score(forehead_ratio, 0.22, 0.07),
        "ears": map_score(face_ratio, 0.85, 0.20)
    }

@app.route("/analyze-face", methods=["POST"])
def analyze():
    try:
        data = request.json

        front = decode_image(data.get("front"))
        left = decode_image(data.get("left"))
        right = decode_image(data.get("right"))
        front1 = decode_image(data.get("front1"))

        if front is None:
            return jsonify({"error": "Front image missing"}), 400

        front = cv2.resize(front, (640, 480))
        rgb = cv2.cvtColor(front, cv2.COLOR_BGR2RGB)

        result = face_mesh.process(rgb)

        if not result.multi_face_landmarks:
            return jsonify({"error": "No face detected"}), 400

        landmarks = result.multi_face_landmarks[0].landmark
        scores = calculate_scores(landmarks)

        front_url = upload_image(front)
        left_url = upload_image(left)
        right_url = upload_image(right)
        front1_url = upload_image(front1)

        collection.insert_one({
            "front": front_url,
            "left": left_url,
            "right": right_url,
            "front1": front1_url,
            "scores": scores,
            "created_at": datetime.utcnow()
        })

        return jsonify(scores)

    except Exception as e:
        print("🔥 BACKEND ERROR:", e)
        return jsonify({"error": "Backend crash"}), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 5000)))