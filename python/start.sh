#!/usr/bin/env bash
# Inicia los tres servicios: backend, cliente residente y cliente admin

set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "==================================================="
echo "  ACR Condominios - Stack Python"
echo "==================================================="
echo "  Backend  API  → http://localhost:8000"
echo "  Residente app → http://localhost:8501"
echo "  Admin     app → http://localhost:8502"
echo "---------------------------------------------------"

# Install dependencies if needed
if ! python3 -c "import fastapi" 2>/dev/null; then
  echo "[setup] Instalando dependencias..."
  pip install -r "$SCRIPT_DIR/requirements.txt" -q
fi

# Start backend
uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload \
  --app-dir "$SCRIPT_DIR" &
BACKEND_PID=$!
echo "[backend] PID $BACKEND_PID iniciado"

sleep 1

# Start resident client
streamlit run "$SCRIPT_DIR/cliente_residente/app.py" \
  --server.port 8501 --server.address 0.0.0.0 \
  --browser.gatherUsageStats false &
RESIDENT_PID=$!
echo "[residente] PID $RESIDENT_PID iniciado"

# Start admin client
streamlit run "$SCRIPT_DIR/cliente_admin/app.py" \
  --server.port 8502 --server.address 0.0.0.0 \
  --browser.gatherUsageStats false &
ADMIN_PID=$!
echo "[admin] PID $ADMIN_PID iniciado"

echo ""
echo "Presiona Ctrl+C para detener todos los servicios."

trap "kill $BACKEND_PID $RESIDENT_PID $ADMIN_PID 2>/dev/null; echo 'Servicios detenidos.'" EXIT
wait
