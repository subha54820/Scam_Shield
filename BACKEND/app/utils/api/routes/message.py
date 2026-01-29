from fastapi import APIRouter
from app.services.detection import analyze_message

router = APIRouter()

@router.post("/")
def analyze(payload: dict):
    message = payload.get("message", "")
    return analyze_message(message)