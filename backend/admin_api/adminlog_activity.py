from fastapi import Depends
from requests import Session
from backend.database import get_db
from backend.models import ActivityLog
from drivve_api.app_config import create_app

app = create_app()
def log_activity(
    db: Session,
    module: str,
    action: str,
    description: str,
    entity_id: int | None = None,
    entity_name: str | None = None
):
    log = ActivityLog(
        module=module,
        action=action,
        entity_id=entity_id,
        entity_name=entity_name,
        description=description
    )
    db.add(log)
    db.commit()
@app.get("/api/v1/admin/activity-logs")
def get_activity_logs(
    module: str | None = None,
    db: Session = Depends(get_db)
):
    query = db.query(ActivityLog)

    if module:
        query = query.filter(ActivityLog.module == module)

    return query.order_by(ActivityLog.created_at.desc()).limit(500).all()

