from flask import Blueprint, jsonify
from server.database.mongo_connection import get_db

clothes_bp = Blueprint("clothes", __name__)

@clothes_bp.route("/api/clothes", methods=["GET"])
def get_clothes():
    db = get_db()
    clothes = list(db.clothes.find({}))

    # ✅ Convert ObjectId to string
    for item in clothes:
        if "_id" in item:
            item["_id"] = str(item["_id"])

    return jsonify(clothes)
