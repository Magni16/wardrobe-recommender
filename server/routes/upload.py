import cloudinary
import cloudinary.api
import cloudinary.uploader
import os

from flask import Blueprint, request, jsonify
from dotenv import load_dotenv

from server.ml.feature_extractor import extract_features
from server.database.mongo_connection import get_db

load_dotenv()
upload_bp = Blueprint("upload", __name__)

# Cloudinary config
cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET"),
    secure=True
)

@upload_bp.route("/", methods=["POST"])
def upload_image():
    if "image" not in request.files:
        return jsonify({"error": "No image provided"}), 400

    file = request.files["image"]
    category = request.form.get("category").strip()  # ✅ ADD THIS LINE

    if category == '':
        print("category is empty")
        return jsonify({"error": "Category is required"}), 400

    # Upload to Cloudinary
    upload_result = cloudinary.uploader.upload(file)
    image_url = upload_result.get("secure_url")

    # Extract features
    features = extract_features(image_url)

    # Store in MongoDB
    db = get_db()
    print("Category received from form:", category)
    db.clothes.insert_one({
        "imageUrl": image_url,
        "features": features,
        "category": category
    })

    return jsonify({"imageUrl": image_url, "message": "Image uploaded"})




