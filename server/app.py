from flask import Flask
from flask_cors import CORS
from flask import Flask, jsonify
from server.routes.clothes import clothes_bp
from server.routes.upload import upload_bp
from server.routes.recommend import recommend_bp
from server.database.mongo_connection import get_db


from flask import request, jsonify
from bson.objectid import ObjectId

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "http://localhost:3000"}})

# Register upload route
app.register_blueprint(upload_bp, url_prefix="/api/upload")
app.register_blueprint(clothes_bp)
app.register_blueprint(recommend_bp)

# delete logic for clothes
@app.route("/api/delete", methods=["POST"])
def delete_item():
    data = request.get_json()
    item_id = data.get("id")

    if not item_id:
        return jsonify({"error": "No ID provided"}), 400

    try:
        db = get_db()
        result = db.clothes.delete_one({"_id": ObjectId(item_id)})
        if result.deleted_count == 1:
            return jsonify({"message": "Deleted successfully"})
        else:
            return jsonify({"error": "Item not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/debug/db")
def debug_db():
    db = get_db()
    clothes = list(db.clothes.find({}))
    return jsonify([
        {
            "_id": str(c.get("_id")),
            "category": c.get("category"),
            "imageUrl": c.get("imageUrl"),
            "features": c.get("features")[:5]  # 🧠 Show only first 5 values for brevity
        } for c in clothes[:10]
    ])

if __name__ == "__main__":
    app.run(debug=True)
