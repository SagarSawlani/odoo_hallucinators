from datetime import datetime


def check_overlap(new_start: datetime, new_end: datetime,
                   existing_bookings: list[tuple[datetime, datetime]]) -> bool:
    """existing_bookings must already be filtered to status IN ('Upcoming','Ongoing')"""
    new_start = new_start.replace(tzinfo=None) if new_start.tzinfo else new_start
    new_end = new_end.replace(tzinfo=None) if new_end.tzinfo else new_end

    for ex_start, ex_end in existing_bookings:
        ex_start = ex_start.replace(tzinfo=None) if ex_start.tzinfo else ex_start
        ex_end = ex_end.replace(tzinfo=None) if ex_end.tzinfo else ex_end
        
        if new_start < ex_end and ex_start < new_end:
            return True
    return False


def compute_status(start_time: datetime, end_time: datetime, current_status: str) -> str:
    """Time-based recompute. Terminal states (Cancelled/Completed) are never overridden."""
    if current_status in ("Cancelled", "Completed"):
        return current_status
        
    start_time = start_time.replace(tzinfo=None) if start_time.tzinfo else start_time
    end_time = end_time.replace(tzinfo=None) if end_time.tzinfo else end_time
    now = datetime.utcnow()
    
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