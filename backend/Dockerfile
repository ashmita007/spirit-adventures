# Spirit Adventures API (Django + django-ninja) - production image
FROM python:3.12-slim AS base

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

WORKDIR /app

# libpq for psycopg2, curl for the healthcheck
RUN apt-get update \
    && apt-get install -y --no-install-recommends libpq5 curl \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

# Admin CSS/JS baked into the image (served by WhiteNoise). Dummy key is build-time only.
RUN DEBUG=True SECRET_KEY=build-only python manage.py collectstatic --no-input \
    && chmod +x docker-entrypoint.sh \
    && useradd --create-home --uid 10001 app \
    && mkdir -p /app/media \
    && chown -R app:app /app

USER app
EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
  CMD curl -fsS http://127.0.0.1:8000/api/v1/health/ || exit 1

ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["sh", "-c", "gunicorn spirit_backend.wsgi:application --bind 0.0.0.0:8000 --workers ${GUNICORN_WORKERS:-3} --threads ${GUNICORN_THREADS:-2} --timeout 120 --access-logfile - --error-logfile -"]
