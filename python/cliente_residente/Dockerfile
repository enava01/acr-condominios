FROM python:3.13-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY cliente_residente/ ./cliente_residente/

EXPOSE 8501

HEALTHCHECK --interval=15s --timeout=5s --start-period=20s --retries=3 \
  CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8501/_stcore/health')" || exit 1

CMD ["streamlit", "run", "cliente_residente/app.py", \
     "--server.port=8501", \
     "--server.address=0.0.0.0", \
     "--browser.gatherUsageStats=false", \
     "--server.headless=true"]
