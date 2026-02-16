---
title: Scam Shield Backend
emoji: 🛡️
colorFrom: red
colorTo: blue
sdk: docker
app_port: 7860
pinned: false
---

# Scam Shield Backend API

AI-powered scam detection service using Django and ML models.

## Deployment Details
- **SDK**: Docker
- **Port**: 7860
- **Base Image**: python:3.10-slim

## Environment Variables Required
Please set the following secrets in the Hugging Face Space settings:
- `SECRET_KEY`
- `GROQ_API_KEY`
- `MONGO_URI`
- `DEBUG=False`
- `ALLOWED_HOSTS=*`
- `CORS_ALLOWED_ORIGINS` (Your Vercel URL)
