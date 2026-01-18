from flask import Blueprint, request, jsonify

document_bp = Blueprint("document_bp", __name__)

# Dummy data (replace with DB later)
DOCUMENTS = [
    {
        "id": 1,
        "document_type": "AADHAR",
        "document_number": "1234-5678-9012",
        "user_name": "Shashank",
        "phone_number": "9999999999",
        "status": "pending"
    }
]

@document_bp.route("/documents", methods=["GET"])
def get_documents():
    status = request.args.get("status")

    if status and status != "all":
        filtered = [d for d in DOCUMENTS if d["status"] == status]
    else:
        filtered = DOCUMENTS

    return jsonify({
        "success": True,
        "documents": filtered
    })


@document_bp.route("/documents/update", methods=["POST"])
def update_document():
    data = request.json
    doc_id = data.get("id")
    status = data.get("status")
    reason = data.get("reason", "")

    for doc in DOCUMENTS:
        if doc["id"] == doc_id:
            doc["status"] = status
            doc["rejection_reason"] = reason

    return jsonify({"success": True})
