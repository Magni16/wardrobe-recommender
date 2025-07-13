from flask import Blueprint, request, jsonify
from server.database.mongo_connection import get_db
from server.ml.outfit_transformer.infer import OutfitScorer

recommend_bp = Blueprint("recommend", __name__)

# Initialize once
scorer = OutfitScorer()

@recommend_bp.route("/api/recommend", methods=["GET"])
def recommend_clothes():
    selected_category = request.args.get("category")
    db = get_db()

    if selected_category != "shirt":
        return jsonify({"error": "Currently only shirt-based recommendations are supported"}), 400

    clothes = list(db.clothes.find({}))
    shirts = [item for item in clothes if item.get("category") == "shirt"]
    jeans = [item for item in clothes if item.get("category") == "jeans"]
    shoes = [item for item in clothes if item.get("category") == "shoes"]

    if not shirts or not jeans or not shoes:
        return jsonify({"error": "Insufficient items in wardrobe"}), 400

    # For now, pick the *first* shirt
    selected_shirt = shirts[0]
    shirt_url = selected_shirt.get("imageUrl")

    best_score = float('-inf')
    best_combo = {"jeans": None, "shoes": None}

    for j in jeans:
        for s in shoes:
            jeans_url = j.get("imageUrl")
            shoes_url = s.get("imageUrl")

            score = scorer.get_outfit_score(shirt_url, jeans_url, shoes_url)

            if score > best_score:
                best_score = score
                best_combo = {
                    "jeans": jeans_url,
                    "shoes": shoes_url
                }

    return jsonify({
        "selectedShirt": shirt_url,
        "recommendedJeans": best_combo["jeans"],
        "recommendedShoes": best_combo["shoes"],
        "score": best_score
    })
