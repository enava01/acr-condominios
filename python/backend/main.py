import base64
import json
import os
import uuid
from datetime import datetime, timezone
from typing import Literal, Optional

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), "..", ".env"))

app = FastAPI(title="ACR Condominios API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DATA_DIR = os.path.join(os.path.dirname(__file__), "data")
REGISTRATIONS_FILE = os.path.join(DATA_DIR, "registrations.json")
os.makedirs(DATA_DIR, exist_ok=True)

TorreType = Literal["A", "B", "C", "D", "E", "F"]
StatusType = Literal["Pendiente", "Aprobado", "Rechazado", "En Revisión"]

SEED_DATA: list[dict] = [
    {
        "id": "reg-1",
        "nombre_propietario": "Carlos Mendoza Ruiz",
        "tipo_documento": "Escritura Pública",
        "correo_electronico": "carlos.mendoza@email.com",
        "telefono_contacto": "555-123-4567",
        "torre": "A",
        "departamento": "201",
        "cajones_estacionamiento": "C-15, C-16",
        "porcentaje_indiviso": 1.45,
        "numero_escritura_o_contrato": "18,452",
        "fecha_documento": "2021-05-14",
        "notario_publico_numero": "Notario 12",
        "notario_nombre_o_ciudad": "Lic. Alfredo Bañuelos, CDMX",
        "folio_real_registro": "987654-A",
        "numero_habitantes": 3,
        "vehiculos": "Mazda 3 (Placas MX-998)",
        "mascotas": "Perro (Max, Pastor Alemán)",
        "status": "Aprobado",
        "documentName": "escritura_propiedad_torrea_201.pdf",
        "comments": "Expediente completo y verificado contra escritura física.",
        "createdAt": "2026-06-20T10:30:00.000Z",
        "updatedAt": "2026-06-21T15:20:00.000Z",
    },
    {
        "id": "reg-2",
        "nombre_propietario": "Ana Sofía Herrera",
        "tipo_documento": "Contrato de Arrendamiento",
        "correo_electronico": "ana.herrera@email.com",
        "telefono_contacto": "555-987-6543",
        "torre": "B",
        "departamento": "104",
        "cajones_estacionamiento": "C-08",
        "porcentaje_indiviso": 1.12,
        "numero_escritura_o_contrato": "ARR-2025-09",
        "fecha_documento": "2025-08-01",
        "notario_publico_numero": "N/A - Contrato Privado",
        "notario_nombre_o_ciudad": "N/A",
        "folio_real_registro": "123456-B",
        "numero_habitantes": 2,
        "vehiculos": "Honda Civic (Placas LKY-291)",
        "mascotas": "Ninguna",
        "status": "Pendiente",
        "documentName": "contrato_arrendamiento_104.pdf",
        "comments": "",
        "createdAt": "2026-06-28T14:15:00.000Z",
        "updatedAt": "2026-06-28T14:15:00.000Z",
    },
    {
        "id": "reg-3",
        "nombre_propietario": "Mauricio Garza Solís",
        "tipo_documento": "Escritura Pública",
        "correo_electronico": "mauricio.garza@email.com",
        "telefono_contacto": "811-344-9901",
        "torre": "C",
        "departamento": "402",
        "cajones_estacionamiento": "C-22",
        "porcentaje_indiviso": 1.85,
        "numero_escritura_o_contrato": "45,012",
        "fecha_documento": "2019-11-22",
        "notario_publico_numero": "Notario 4",
        "notario_nombre_o_ciudad": "Lic. Clara Salazar, Monterrey",
        "folio_real_registro": "654321-C",
        "numero_habitantes": 4,
        "vehiculos": "Toyota RAV4 (Placas GHY-102)",
        "mascotas": "Gato (Luna)",
        "status": "Aprobado",
        "documentName": "escritura_final_notaria4.pdf",
        "comments": "Acreditado exitosamente como propietario único.",
        "createdAt": "2026-06-24T09:10:00.000Z",
        "updatedAt": "2026-06-25T11:45:00.000Z",
    },
    {
        "id": "reg-4",
        "nombre_propietario": "Lucía Fernández Torres",
        "tipo_documento": "Boleta Predial",
        "correo_electronico": "lucia.ft@email.com",
        "telefono_contacto": "555-772-1133",
        "torre": "D",
        "departamento": "301",
        "cajones_estacionamiento": "Sin especificar",
        "porcentaje_indiviso": 1.22,
        "numero_escritura_o_contrato": "PREDIAL-2026-881",
        "fecha_documento": "2026-01-10",
        "notario_publico_numero": "N/A",
        "notario_nombre_o_ciudad": "Tesorería Municipal",
        "folio_real_registro": "88122-D",
        "numero_habitantes": 1,
        "vehiculos": "Ninguno",
        "mascotas": "Perro (Milú, Shih Tzu)",
        "status": "Rechazado",
        "documentName": "boleta_predial_301_borrosa.jpg",
        "comments": "La boleta predial subida está ilegible. Por favor, suba una foto con mejor resolución.",
        "createdAt": "2026-06-26T16:40:00.000Z",
        "updatedAt": "2026-06-27T10:15:00.000Z",
    },
    {
        "id": "reg-5",
        "nombre_propietario": "Roberto Elizondo Villarreal",
        "tipo_documento": "Contrato de Compraventa",
        "correo_electronico": "roberto.elizondo@email.com",
        "telefono_contacto": "333-884-1234",
        "torre": "E",
        "departamento": "502",
        "cajones_estacionamiento": "C-41, C-42",
        "porcentaje_indiviso": 1.55,
        "numero_escritura_o_contrato": "CONV-9912-A",
        "fecha_documento": "2024-03-12",
        "notario_publico_numero": "Notario 32",
        "notario_nombre_o_ciudad": "Lic. Roberto Pérez, Guadalajara",
        "folio_real_registro": "44921-E",
        "numero_habitantes": 3,
        "vehiculos": "Ford Explorer (Placas UY-12-PP)",
        "mascotas": "Ninguna",
        "status": "En Revisión",
        "documentName": "compraventa_notaria32.pdf",
        "comments": "",
        "createdAt": "2026-06-28T18:00:00.000Z",
        "updatedAt": "2026-06-28T18:00:00.000Z",
    },
]

MOCK_EXTRACTION = {
    "nombre_propietario": "Elena Rostova Soler",
    "tipo_documento": "Escritura Pública",
    "correo_electronico": "elena.rostova@gmail.com",
    "telefono_contacto": "555-400-2011",
    "torre": "C",
    "departamento": "304",
    "cajones_estacionamiento": "C-12",
    "porcentaje_indiviso": 1.34,
    "numero_escritura_o_contrato": "Escritura No. 94,102",
    "fecha_documento": "2023-04-12",
    "notario_publico_numero": "Notaría Pública No. 202",
    "notario_nombre_o_ciudad": "Lic. Alejandro Ortiz, CDMX",
    "folio_real_registro": "FOLIO-77402-MX",
    "numero_habitantes": 2,
    "vehiculos": "Mazda CX-5 color gris (Placas PTK-441)",
    "mascotas": "Un gato siamés de nombre 'Simba'",
}

GEMINI_PROMPT = """
Eres un extractor experto de datos legales de acreditación de propiedad condominal mexicana.
Analiza detalladamente esta foto, PDF o imagen de documento legal (puede ser una Escritura Pública,
Boleta de Impuesto Predial, Contrato de Compraventa o de Arrendamiento).
Extrae la información en formato JSON con estos campos exactos:
- nombre_propietario: Nombre completo del propietario o residente
- tipo_documento: Uno de: 'Escritura Pública', 'Contrato de Arrendamiento', 'Contrato de Compraventa', 'Boleta Predial', 'Otro'
- correo_electronico: Correo si se encuentra, vacío si no
- telefono_contacto: Teléfono si se encuentra, vacío si no
- torre: Letra A-F que identifica la torre. Si no se especifica usar 'A'
- departamento: Número o clave del departamento/interior (Ej: '304', 'B-402')
- cajones_estacionamiento: Cajones asignados o 'Sin especificar'
- porcentaje_indiviso: Número decimal del % de indiviso (Ej: 1.34). Si no se encuentra: 0
- numero_escritura_o_contrato: Número de escritura, folio de contrato o ID de boleta
- fecha_documento: Fecha en formato YYYY-MM-DD
- notario_publico_numero: Número del notario (Ej: 'Notaría 22') o 'N/A'
- notario_nombre_o_ciudad: Nombre del notario y ciudad (Ej: 'Lic. Manuel Ruiz, Zapopan') o 'N/A'
- folio_real_registro: Folio real o clave registral, vacío si no se encuentra
- numero_habitantes: Número entero de habitantes (mínimo 1)
- vehiculos: Vehículos mencionados o vacío
- mascotas: Mascotas mencionadas o vacío
Responde SOLO el JSON, sin explicaciones adicionales.
"""


def read_registrations() -> list[dict]:
    if not os.path.exists(REGISTRATIONS_FILE):
        write_registrations(SEED_DATA)
        return list(SEED_DATA)
    try:
        with open(REGISTRATIONS_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return list(SEED_DATA)


def write_registrations(registrations: list[dict]) -> None:
    with open(REGISTRATIONS_FILE, "w", encoding="utf-8") as f:
        json.dump(registrations, f, ensure_ascii=False, indent=2)


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat().replace("+00:00", ".000Z")


# ── Pydantic models ─────────────────────────────────────────────────────────

class RegistrationCreate(BaseModel):
    nombre_propietario: str = "Sin Nombre"
    tipo_documento: str = "Otro"
    correo_electronico: str = ""
    telefono_contacto: str = ""
    torre: TorreType = "A"
    departamento: str = ""
    cajones_estacionamiento: str = "Sin especificar"
    porcentaje_indiviso: float = 0.0
    numero_escritura_o_contrato: str = ""
    fecha_documento: str = ""
    notario_publico_numero: str = "N/A"
    notario_nombre_o_ciudad: str = "N/A"
    folio_real_registro: str = ""
    numero_habitantes: int = 1
    vehiculos: str = ""
    mascotas: str = ""
    documentName: str = "documento_cargado.pdf"


class RegistrationUpdate(BaseModel):
    nombre_propietario: Optional[str] = None
    tipo_documento: Optional[str] = None
    correo_electronico: Optional[str] = None
    telefono_contacto: Optional[str] = None
    torre: Optional[TorreType] = None
    departamento: Optional[str] = None
    cajones_estacionamiento: Optional[str] = None
    porcentaje_indiviso: Optional[float] = None
    numero_escritura_o_contrato: Optional[str] = None
    fecha_documento: Optional[str] = None
    notario_publico_numero: Optional[str] = None
    notario_nombre_o_ciudad: Optional[str] = None
    folio_real_registro: Optional[str] = None
    numero_habitantes: Optional[int] = None
    vehiculos: Optional[str] = None
    mascotas: Optional[str] = None
    status: Optional[StatusType] = None
    comments: Optional[str] = None


class ExtractRequest(BaseModel):
    fileBase64: str
    mimeType: str
    fileName: str = ""


# ── Endpoints ────────────────────────────────────────────────────────────────

@app.get("/api/registrations")
def get_registrations():
    return read_registrations()


@app.post("/api/registrations", status_code=201)
def create_registration(body: RegistrationCreate):
    records = read_registrations()
    new_reg = {
        "id": f"reg-{uuid.uuid4().hex[:8]}",
        **body.model_dump(),
        "status": "Pendiente",
        "comments": "",
        "createdAt": now_iso(),
        "updatedAt": now_iso(),
    }
    records.insert(0, new_reg)
    write_registrations(records)
    return new_reg


@app.patch("/api/registrations/{reg_id}")
def update_registration(reg_id: str, body: RegistrationUpdate):
    records = read_registrations()
    idx = next((i for i, r in enumerate(records) if r["id"] == reg_id), None)
    if idx is None:
        raise HTTPException(status_code=404, detail="Registro no encontrado.")

    updates = {k: v for k, v in body.model_dump().items() if v is not None}
    records[idx].update(updates)
    records[idx]["updatedAt"] = now_iso()
    write_registrations(records)
    return records[idx]


@app.delete("/api/registrations/{reg_id}")
def delete_registration(reg_id: str):
    records = read_registrations()
    filtered = [r for r in records if r["id"] != reg_id]
    write_registrations(filtered)
    return {"success": True}


@app.post("/api/extract")
def extract_document(body: ExtractRequest):
    api_key = os.getenv("GEMINI_API_KEY", "")
    if not api_key or api_key == "your_gemini_api_key_here":
        return {"success": True, "isMocked": True, "data": MOCK_EXTRACTION}

    try:
        from google import genai
        from google.genai import types

        client = genai.Client(api_key=api_key)
        file_bytes = base64.b64decode(body.fileBase64)

        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=[
                types.Part.from_bytes(data=file_bytes, mime_type=body.mimeType),
                GEMINI_PROMPT,
            ],
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
            ),
        )

        data = json.loads(response.text.strip())
        return {"success": True, "isMocked": False, "data": data}

    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
