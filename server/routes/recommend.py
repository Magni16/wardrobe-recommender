from flask import Blueprint, request, jsonify
from bson import ObjectId
from server.database.mongo_connection import get_db
from server.ml.outfit_transformer.infer import OutfitScorer

recommend_bp = Blueprint("recommend", __name__)
scorer = OutfitScorer()

@recommend_bp.route("/api/recommend", methods=["GET"])
def recommend_clothes():
    selected_category = request.args.get("category")
    selected_id = request.args.get("id")

    db = get_db()
    clothes = list(db.clothes.find({}))

    selected_item = next((item for item in clothes if str(item["_id"]) == selected_id), None)
    if not selected_item:
        return jsonify({"error": "Item not found"}), 404

    selected_url = selected_item["imageUrl"]

    # Separate the other clothes
    jeans = [item for item in clothes if item.get("category") == "jeans"]
    shirts = [item for item in clothes if item.get("category") == "shirt"]
    shoes = [item for item in clothes if item.get("category") == "shoes"]

    best_score = float('-inf')
    best_combo = {"shirt": None, "jeans": None, "shoes": None}

    if selected_category == "shirt":
        for j in jeans:
            for s in shoes:
                score = scorer.get_outfit_score(selected_url, j["imageUrl"], s["imageUrl"])
                if score > best_score:
                    best_score = score
                    best_combo.update({
                        "jeans": j["imageUrl"],
                        "shoes": s["imageUrl"],
                        "shirt": selected_url
                    })

    elif selected_category == "jeans":
        for sh in shirts:
            for s in shoes:
                score = scorer.get_outfit_score(sh["imageUrl"], selected_url, s["imageUrl"])
                if score > best_score:
                    best_score = score
                    best_combo.update({
                        "shirt": sh["imageUrl"],
                        "shoes": s["imageUrl"],
                        "jeans": selected_url
                    })

    elif selected_category == "shoes":
        for sh in shirts:
            for j in jeans:
                score = scorer.get_outfit_score(sh["imageUrl"], j["imageUrl"], selected_url)
                if score > best_score:
                    best_score = score
                    best_combo.update({
                        "shirt": sh["imageUrl"],
                        "jeans": j["imageUrl"],
                        "shoes": selected_url
                    })

    else:
        return jsonify({"error": "Unsupported category"}), 400

    # ✅ FIXED: Return different response formats based on selected category
    if selected_category == "shirt":
        return jsonify({
            "selectedShirt": best_combo["shirt"],
            "recommendedJeans": best_combo["jeans"],
            "recommendedShoes": best_combo["shoes"],
            "score": best_score
        })
    elif selected_category == "jeans":
        return jsonify({
            "selectedJeans": best_combo["jeans"],
            "recommendedShirt": best_combo["shirt"],
            "recommendedShoes": best_combo["shoes"],
            "score": best_score
        })
    elif selected_category == "shoes":
        return jsonify({
            "selectedShoes": best_combo["shoes"],
            "recommendedShirt": best_combo["shirt"],
            "recommendedJeans": best_combo["jeans"],
            "score": best_score
        })



# @recommend_bp.route("/api/recommend", methods=["GET"])
# def recommend_clothes():
#     selected_category = request.args.get("category")
#     selected_id = request.args.get("id")
#     db = get_db()
#
#     # ✅ Validate input
#     if selected_category not in ["shirt", "jeans", "shoes"]:
#         return jsonify({"error": "Invalid category"}), 400
#     if not selected_id:
#         return jsonify({"error": "Missing clothing item ID"}), 400
#
#     # ✅ Fetch selected item from DB
#     try:
#         selected_item = db.clothes.find_one({"_id": ObjectId(selected_id)})
#     except Exception:
#         return jsonify({"error": "Invalid ObjectId format"}), 400
#
#     if not selected_item:
#         return jsonify({"error": "Clothing item not found"}), 404
#
#     selected_url = selected_item.get("imageUrl")
#
#     # ✅ Get remaining 2 categories
#     category_map = {
#         "shirt": ("jeans", "shoes"),
#         "jeans": ("shirt", "shoes"),
#         "shoes": ("shirt", "jeans"),
#     }
#     cat1, cat2 = category_map[selected_category]
#
#     clothes = list(db.clothes.find({}))
#     cat1_items = [item for item in clothes if item.get("category") == cat1]
#     cat2_items = [item for item in clothes if item.get("category") == cat2]
#
#     if not cat1_items or not cat2_items:
#         return jsonify({"error": "Not enough items in wardrobe"}), 400
#
#     # ✅ Loop to find best combo
#     best_score = float('-inf')
#     best_combo = {}
#
#     for i1 in cat1_items:
#         for i2 in cat2_items:
#             urls = {
#                 selected_category: selected_url,
#                 cat1: i1.get("imageUrl"),
#                 cat2: i2.get("imageUrl")
#             }
#
#             try:
#                 score = scorer.get_outfit_score(
#                     shirt_url=urls.get("shirt"),
#                     jeans_url=urls.get("jeans"),
#                     shoes_url=urls.get("shoes")
#                 )
#             except Exception as e:
#                 print("Scoring error:", e)
#                 continue
#
#             if score > best_score:
#                 best_score = score
#                 best_combo = {
#                     "selectedShirt": urls.get("shirt"),
#                     "recommendedJeans": urls.get("jeans"),
#                     "recommendedShoes": urls.get("shoes"),
#                     "score": score
#                 }
#
#     return jsonify(best_combo)
