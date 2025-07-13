from flask import Blueprint, jsonify
from server.database.mongo_connection import get_db

clothes_bp = Blueprint("clothes", __name__)

@clothes_bp.route("/api/clothes", methods=["GET"])
def get_clothes():
    db = get_db()
    clothes = list(db.clothes.find({}, {"_id": 0}))
    return jsonify(clothes)
