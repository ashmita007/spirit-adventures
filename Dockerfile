# ====================================================
# Stage 1: Build Next.js Frontend
# ====================================================
FROM node:20-slim AS frontend-builder
WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm install

COPY frontend/ ./
ENV NEXT_PUBLIC_API_URL=/api/v1
RUN npm run build

# ====================================================
# Stage 2: Unified Production Runner (Django + Next.js)
# ====================================================
FROM python:3.11-slim
WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PORT=3000
ENV NODE_ENV=production

# Install Node.js runtime & essentials
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    ca-certificates \
    gnupg \
    build-essential \
    libpq-dev \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y --no-install-recommends nodejs \
    && rm -rf /var/lib/apt/lists/*

# Install Python backend dependencies
COPY backend/requirements.txt /app/backend/
RUN pip install --no-cache-dir -r /app/backend/requirements.txt

# Copy Backend Code & Database
COPY backend/ /app/backend/
RUN cd /app/backend && python manage.py collectstatic --no-input || true

# Copy Frontend Built Artifacts
COPY --from=frontend-builder /app/frontend /app/frontend

# Copy Unified Startup Script
COPY start.sh /app/start.sh
RUN chmod +x /app/start.sh

EXPOSE 3000

CMD ["/app/start.sh"]
