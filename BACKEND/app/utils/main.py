from fastapi import FastAPI
from app.api.routes import message

app = FastAPI(title="ScamShield API")

app.include_router(message.router, prefix="/analyze", tags=["Analyzer"])

@app.get("/")
def root():
    return {"status": "ScamShield Backend Running"}