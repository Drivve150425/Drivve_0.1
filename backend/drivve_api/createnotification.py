
from requests import Session

from models import NotificationType, UserNotification


def create_notification(
    db: Session,
    phone_number: str,
    title: str,
    message: str,
    ntype: NotificationType,
    action_type: str | None = None,
    action_value: str | None = None
):
    notif = UserNotification(
        phone_number=phone_number,
        title=title,
        message=message,
        type=ntype,
        action_type=action_type,
        action_value=action_value
    )
    db.add(notif)
    db.commit()