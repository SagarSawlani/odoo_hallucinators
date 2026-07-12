from datetime import datetime, timezone

def to_utc_aware(dt: datetime) -> datetime:
    if dt.tzinfo is None:
        return dt.replace(tzinfo=timezone.utc)
    return dt.astimezone(timezone.utc)

def check_overlap(new_start: datetime, new_end: datetime,
                   existing_bookings: list[tuple[datetime, datetime]]) -> bool:
    """existing_bookings must already be filtered to status IN ('Upcoming','Ongoing')"""
    new_start = to_utc_aware(new_start)
    new_end = to_utc_aware(new_end)

    for ex_start, ex_end in existing_bookings:
        ex_start = to_utc_aware(ex_start)
        ex_end = to_utc_aware(ex_end)
        
        if new_start < ex_end and ex_start < new_end:
            return True
    return False


def compute_status(start_time: datetime, end_time: datetime, current_status: str) -> str:
    """Time-based recompute. Terminal states (Cancelled/Completed) are never overridden."""
    if current_status in ("Cancelled", "Completed"):
        return current_status
        
    start_time = to_utc_aware(start_time)
    end_time = to_utc_aware(end_time)
    now = datetime.now(timezone.utc)
    
    if now < start_time:
        return "Upcoming"
    elif start_time <= now <= end_time:
        return "Ongoing"
    else:
        return "Completed"


def resolve_cancel_status(current_status: str) -> tuple[str, bool]:
    """Returns (new_status, ended_early). Raises ValueError if not cancellable."""
    if current_status == "Upcoming":
        return "Cancelled", False
    elif current_status == "Ongoing":
        return "Completed", True
    else:
        raise ValueError(f"Cannot cancel a booking with status '{current_status}'")