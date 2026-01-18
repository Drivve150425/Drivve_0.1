from flask import Blueprint, request, jsonify

auth_bp = Blueprint("auth_bp", __name__)

@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.json
    username = data.get("username")
    password = data.get("password")

    if username == "admin" and password == "admin@123":
        return jsonify({"success": True, "token": "dummy-token"})

    return jsonify({"success": False, "message": "Invalid credentials"}), 401
