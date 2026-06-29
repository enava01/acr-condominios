# ACR Condominios — Sistema de Acreditación de Propiedad

Sistema para la acreditación digital de propiedades en condominios multifamiliar. Permite a residentes subir sus documentos legales (escrituras, contratos, boletas prediales) para que la administración revise y valide su expediente. Incluye extracción inteligente de datos mediante **Gemini AI**.

---

## Clientes

| Cliente | Descripción | Puerto |
|---|---|---|
| **Portal Residente** | Sube documentos, revisa datos extraídos por IA y envía su expediente | `8501` |
| **Panel Admin** | Revisa el avance global de acreditación, filtra expedientes y dictamina cada uno | `8502` |
| **Backend API** | REST API (FastAPI) que alimenta ambos clientes | `8000` |

---

## Stack

- **Backend:** Python · [FastAPI](https://fastapi.tiangolo.com/) · [Uvicorn](https://www.uvicorn.org/)
- **Clientes:** Python · [Streamlit](https://streamlit.io/) · [Plotly](https://plotly.com/python/)
- **IA:** [Google Gemini](https://ai.google.dev/) (extracción de datos desde documentos PDF/imagen)
- **Contenedores:** Docker · Docker Compose

---

## Estructura del proyecto

```
acr-condominios/
├── python/
│   ├── backend/
│   │   ├── Dockerfile
│   │   └── main.py               # FastAPI — CRUD + endpoint de extracción Gemini
│   ├── cliente_residente/
│   │   ├── Dockerfile
│   │   └── app.py                # Streamlit — portal para el condomino
│   ├── cliente_admin/
│   │   ├── Dockerfile
│   │   └── app.py                # Streamlit — panel de administración
│   ├── docker-compose.yml
│   ├── requirements.txt
│   ├── .env.example
│   └── start.sh                  # Arranca los 3 servicios sin Docker
└── src/                          # Implementación original TypeScript / React
```

---

## Inicio rápido con Docker (recomendado)

### Prerrequisitos
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) instalado y corriendo

### 1. Configura variables de entorno

```bash
cd python
cp .env.example .env
```

Edita `.env` y agrega tu API Key de Gemini (opcional — sin ella el sistema corre en modo demo):

```env
GEMINI_API_KEY=tu_api_key_aqui
```

### 2. Construye y arranca los contenedores

```bash
docker compose up --build
```

Para correr en segundo plano:

```bash
docker compose up --build -d
```

### 3. Abre los clientes

| Servicio | URL |
|---|---|
| Portal Residente | http://localhost:8501 |
| Panel Admin | http://localhost:8502 |
| API (docs) | http://localhost:8000/docs |

### Comandos útiles

```bash
# Ver logs de un servicio específico
docker compose logs -f cliente_residente

# Detener todos los contenedores
docker compose down

# Detener y eliminar el volumen de datos
docker compose down -v

# Reconstruir una sola imagen
docker compose build backend
```

---

## Inicio sin Docker (ambiente local)

### Prerrequisitos
- Python 3.11+

### 1. Crea el ambiente virtual e instala dependencias

```bash
cd python
python3 -m venv .venv
source .venv/bin/activate      # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Configura variables de entorno

```bash
cp .env.example .env
# edita .env con tu GEMINI_API_KEY
```

### 3. Arranca los tres servicios

```bash
./start.sh
```

O manualmente en tres terminales:

```bash
# Terminal 1 — backend
uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload

# Terminal 2 — portal residente
streamlit run cliente_residente/app.py --server.port 8501

# Terminal 3 — panel admin
streamlit run cliente_admin/app.py --server.port 8502
```

---

## API REST

El backend expone los siguientes endpoints:

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/api/registrations` | Lista todos los expedientes |
| `POST` | `/api/registrations` | Crea un nuevo expediente |
| `PATCH` | `/api/registrations/{id}` | Actualiza estado, comentarios u otros campos |
| `DELETE` | `/api/registrations/{id}` | Elimina un expediente |
| `POST` | `/api/extract` | Extrae datos de un documento con Gemini AI |

Documentación interactiva disponible en `http://localhost:8000/docs` cuando el backend está corriendo.

---

## Gemini AI — extracción de documentos

El endpoint `/api/extract` recibe un documento en base64 (PDF, JPG, PNG) y usa **Gemini 2.0 Flash** para extraer automáticamente:

- Nombre del propietario o residente
- Tipo de documento (Escritura Pública, Contrato de Arrendamiento, Boleta Predial, etc.)
- Torre y número de departamento
- Porcentaje de indiviso
- Datos notariales (número de notaría, nombre del notario, ciudad)
- Folio real del Registro Público de la Propiedad
- Vehículos y mascotas mencionados

> **Sin API Key:** el sistema corre en modo demo con datos simulados. No se requiere API Key para explorar la aplicación.

---

## Arquitectura Docker

```
┌─────────────────────────────────────────────┐
│               Docker Network                │
│                                             │
│  ┌─────────────┐      ┌──────────────────┐  │
│  │ acr-residente│      │   acr-admin      │  │
│  │  :8501       │      │   :8502          │  │
│  └──────┬──────┘      └────────┬─────────┘  │
│         │                      │            │
│         └──────────┬───────────┘            │
│                    ▼                        │
│           ┌────────────────┐                │
│           │  acr-backend   │                │
│           │  :8000         │                │
│           └────────┬───────┘                │
│                    │                        │
└────────────────────┼────────────────────────┘
                     │
             ┌───────▼───────┐
             │ Named Volume  │
             │ acr-registrations │
             └───────────────┘
```

- Los clientes se comunican con el backend via nombre de servicio interno (`http://backend:8000`)
- `registrations.json` persiste en el volumen `acr-registrations` y sobrevive reinicios
- Los clientes esperan a que el backend esté `healthy` antes de iniciar

---

## Variables de entorno

| Variable | Descripción | Default |
|---|---|---|
| `GEMINI_API_KEY` | API Key de Google Gemini para extracción de documentos | *(vacío — modo demo)* |
| `API_BASE_URL` | URL del backend (solo para clientes en modo local) | `http://localhost:8000` |

---

## Documentos de muestra

La aplicación incluye tres documentos de muestra para probar sin necesidad de subir archivos reales:

1. **Escritura Pública** — Torre C, Depto 304 · Lic. Alejandro Ortiz, CDMX
2. **Contrato de Arrendamiento** — Torre A, Depto 501 · Inquilino
3. **Boleta de Impuesto Predial** — Torre E, Depto 102 · Tesorería Municipal
