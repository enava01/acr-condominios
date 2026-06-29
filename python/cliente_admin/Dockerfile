FROM python:3.13-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY cliente_admin/ ./cliente_admin/

EXPOSE 8502

HEALTHCHECK --interval=15s --timeout=5s --start-period=20s --retries=3 \
  CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8502/_stcore/health')" || exit 1

CMD ["streamlit", "run", "cliente_admin/app.py", \
     "--server.port=8502", \
     "--server.address=0.0.0.0", \
     "--browser.gatherUsageStats=false", \
     "--server.headless=true"]
