FROM python:3.10-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt gunicorn

# Copy project
COPY . .

# Collect static files
RUN python manage.py collectstatic --noinput || true

# Expose port (Hugging Face uses 7860)
EXPOSE 7860

# Run migrations and start server
CMD python manage.py migrate && \
    gunicorn scamshield.wsgi:application --bind 0.0.0.0:7860 --workers 2 --timeout 120
