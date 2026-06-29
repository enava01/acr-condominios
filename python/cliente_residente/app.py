import base64
import os
import re
import time

import requests
import streamlit as st
from dotenv import load_dotenv

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), "..", ".env"))

API_BASE = os.getenv("API_BASE_URL", "http://localhost:8000")

st.set_page_config(
    page_title="Portal Residente · ACR Condominios",
    page_icon="🏢",
    layout="centered",
    initial_sidebar_state="collapsed",
)

st.markdown("""
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

  html, body, [class*="css"] { font-family: 'Inter', sans-serif; }

  .main .block-container { max-width: 860px; padding: 2rem 1.5rem; }

  /* Hide Streamlit branding */
  #MainMenu, footer, header { visibility: hidden; }

  /* Cards */
  .card {
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 14px;
    padding: 1.5rem;
    margin-bottom: 1rem;
    box-shadow: 0 1px 4px rgba(0,0,0,0.04);
  }
  .card-dark {
    background: #0f172a;
    border-radius: 14px;
    padding: 1.5rem;
    margin-bottom: 1rem;
    color: white;
  }
  .card-blue {
    background: #eff6ff;
    border: 1px solid #dbeafe;
    border-radius: 14px;
    padding: 1.25rem 1.5rem;
    margin-bottom: 1rem;
  }
  .card-success {
    background: white;
    border: 1px solid #d1fae5;
    border-radius: 14px;
    padding: 2rem;
    text-align: center;
    margin-bottom: 1rem;
  }
  .card-error {
    background: #fef2f2;
    border: 1px solid #fee2e2;
    border-radius: 12px;
    padding: 1rem 1.25rem;
    margin-bottom: 0.5rem;
    color: #b91c1c;
    font-size: 0.82rem;
  }
  .card-warning {
    background: #fffbeb;
    border: 1px solid #fde68a;
    border-radius: 12px;
    padding: 1rem 1.25rem;
    margin-bottom: 0.5rem;
    color: #92400e;
    font-size: 0.82rem;
  }

  /* Badge */
  .badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    background: #1d4ed8;
    color: white;
    font-size: 0.65rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    padding: 2px 10px;
    border-radius: 9999px;
  }
  .badge-amber {
    background: rgba(245,158,11,0.15);
    color: #92400e;
    border: 1px solid rgba(245,158,11,0.3);
    font-size: 0.65rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    padding: 2px 10px;
    border-radius: 9999px;
    display: inline-block;
  }

  /* Section headers */
  .section-header {
    display: flex;
    align-items: center;
    gap: 8px;
    padding-bottom: 0.75rem;
    border-bottom: 1px solid #f1f5f9;
    margin-bottom: 1rem;
    font-size: 0.85rem;
    font-weight: 700;
    color: #1e293b;
  }

  /* Unit analysis chip */
  .unit-chip {
    background: #eff6ff;
    border: 1px solid #dbeafe;
    border-radius: 10px;
    padding: 0.6rem 0.8rem;
    font-size: 0.7rem;
    font-family: monospace;
    margin-top: 0.4rem;
    display: grid;
    grid-template-columns: 1fr 1px 1fr 1px 1fr;
    text-align: center;
    gap: 4px;
  }
  .unit-chip-label { color: #94a3b8; font-size: 0.6rem; text-transform: uppercase; display: block; }
  .unit-chip-value { color: #1d4ed8; font-weight: 700; font-size: 0.82rem; }
  .unit-chip-divider { background: #bfdbfe; width: 1px; }

  /* Summary receipt */
  .receipt {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    padding: 1.25rem;
    font-family: monospace;
    font-size: 0.78rem;
  }
  .receipt-row {
    display: flex;
    justify-content: space-between;
    padding: 0.35rem 0;
    border-bottom: 1px solid #f1f5f9;
    color: #475569;
  }
  .receipt-row:last-child { border-bottom: none; }
  .receipt-row strong { color: #1e293b; }

  /* Preset buttons */
  .preset-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 0.75rem; }
  @media (max-width: 600px) { .preset-grid { grid-template-columns: 1fr; } }

  /* Custom file upload area */
  [data-testid="stFileUploader"] {
    border: 2px dashed #cbd5e1;
    border-radius: 14px;
    padding: 1.5rem;
    transition: border-color 0.2s;
  }
  [data-testid="stFileUploader"]:hover { border-color: #3b82f6; }

  /* Input styling */
  [data-testid="stTextInput"] input,
  [data-testid="stNumberInput"] input,
  [data-testid="stSelectbox"] select {
    border-radius: 10px !important;
    font-size: 0.85rem !important;
  }

  /* Button primary */
  .stButton > button[kind="primary"] {
    background: #1d4ed8;
    border-radius: 10px;
    font-weight: 600;
    padding: 0.5rem 1.5rem;
  }
  .stButton > button[kind="secondary"] {
    border-radius: 10px;
    font-weight: 600;
  }

  h1 { font-size: 1.6rem !important; font-weight: 800 !important; }
  h2 { font-size: 1.1rem !important; font-weight: 700 !important; }
  h3 { font-size: 0.95rem !important; font-weight: 700 !important; }

  /* Spinner overlay text */
  .loading-text {
    text-align: center;
    color: #3b82f6;
    font-size: 0.8rem;
    font-weight: 500;
    font-family: monospace;
    margin-top: 0.5rem;
  }
</style>
""", unsafe_allow_html=True)

# ── Presets ───────────────────────────────────────────────────────────────────

PRESETS = [
    {
        "id": "preset-escritura",
        "title": "Escritura Pública",
        "desc": "Escritura No. 124,502 · Torre C - Depto 304 · Lic. Alejandro Ortiz, CDMX",
        "data": {
            "nombre_propietario": "Elena Rostova Soler",
            "tipo_documento": "Escritura Pública",
            "correo_electronico": "elena.rostova@gmail.com",
            "telefono_contacto": "555-400-2011",
            "torre": "C",
            "departamento": "304",
            "cajones_estacionamiento": "C-12",
            "porcentaje_indiviso": 1.34,
            "numero_escritura_o_contrato": "Escritura No. 124,502",
            "fecha_documento": "2023-04-12",
            "notario_publico_numero": "Notaría Pública No. 202",
            "notario_nombre_o_ciudad": "Lic. Alejandro Ortiz, CDMX",
            "folio_real_registro": "FOLIO-77402-MX",
            "numero_habitantes": 2,
            "vehiculos": "Mazda CX-5 color gris (Placas PTK-441)",
            "mascotas": "Un gato siamés de nombre 'Simba'",
            "documentName": "escritura_publica_muestra_124502.pdf",
        },
    },
    {
        "id": "preset-arrendamiento",
        "title": "Contrato de Arrendamiento",
        "desc": "Contrato ARR-2026-X8 · Torre A - Depto 501 · Inquilino",
        "data": {
            "nombre_propietario": "Juan Carlos Gómez Silva",
            "tipo_documento": "Contrato de Arrendamiento",
            "correo_electronico": "jc.gomez@gmail.com",
            "telefono_contacto": "555-101-9002",
            "torre": "A",
            "departamento": "501",
            "cajones_estacionamiento": "C-01",
            "porcentaje_indiviso": 1.05,
            "numero_escritura_o_contrato": "ARR-2026-X8",
            "fecha_documento": "2026-02-15",
            "notario_publico_numero": "N/A - Contrato Privado",
            "notario_nombre_o_ciudad": "N/A",
            "folio_real_registro": "102912-A",
            "numero_habitantes": 3,
            "vehiculos": "Volkswagen Jetta blanco (Placas GGG-551-A)",
            "mascotas": "Perro mediano de nombre 'Toby'",
            "documentName": "contrato_arrendamiento_torrea_501.pdf",
        },
    },
    {
        "id": "preset-predial",
        "title": "Boleta Predial",
        "desc": "Predial 2026 · Torre E - Depto 102 · Tesorería Municipal",
        "data": {
            "nombre_propietario": "María Eugenia Lozano",
            "tipo_documento": "Boleta Predial",
            "correo_electronico": "maria.lozano@outlook.com",
            "telefono_contacto": "555-883-9912",
            "torre": "E",
            "departamento": "102",
            "cajones_estacionamiento": "C-30",
            "porcentaje_indiviso": 1.15,
            "numero_escritura_o_contrato": "PREDIAL-993-8822",
            "fecha_documento": "2026-01-15",
            "notario_publico_numero": "N/A",
            "notario_nombre_o_ciudad": "Tesorería Municipal de Administración",
            "folio_real_registro": "FOLIO-PRED-99812",
            "numero_habitantes": 1,
            "vehiculos": "Chevrolet Aveo rojo (Placas YY-332-PP)",
            "mascotas": "Ninguna",
            "documentName": "boleta_impuesto_predial_2026.jpg",
        },
    },
]

TORRE_OPTIONS = ["A", "B", "C", "D", "E", "F"]
DOC_TYPES = [
    "Escritura Pública",
    "Contrato de Arrendamiento",
    "Contrato de Compraventa",
    "Boleta Predial",
    "Otro",
]

LOADING_MESSAGES = [
    "Cargando archivo en el portal seguro...",
    "Gemini analizando la nitidez del documento...",
    "Localizando datos del propietario e inmueble...",
    "Extrayendo Notaría Pública y Folio Real...",
    "Calculando porcentaje de indiviso condominal...",
    "Consolidando datos en expediente estructurado...",
]

# ── Session state init ────────────────────────────────────────────────────────

def init_state():
    defaults = {
        "app_state": "upload",   # upload | review | success
        "is_mocked": False,
        "selected_file_name": None,
        "form": {
            "nombre_propietario": "",
            "tipo_documento": "Escritura Pública",
            "correo_electronico": "",
            "telefono_contacto": "",
            "torre": "A",
            "departamento": "",
            "cajones_estacionamiento": "Sin especificar",
            "porcentaje_indiviso": 0.0,
            "numero_escritura_o_contrato": "",
            "fecha_documento": "",
            "notario_publico_numero": "",
            "notario_nombre_o_ciudad": "",
            "folio_real_registro": "",
            "numero_habitantes": 1,
            "vehiculos": "",
            "mascotas": "",
            "documentName": "",
        },
    }
    for k, v in defaults.items():
        if k not in st.session_state:
            st.session_state[k] = v

init_state()


# ── Helpers ───────────────────────────────────────────────────────────────────

def reset_state():
    for k in list(st.session_state.keys()):
        del st.session_state[k]
    init_state()
    st.rerun()


def parse_dept_info(dept: str):
    """Return tower/floor/unit breakdown if dept matches 'X-NNN' pattern."""
    m = re.match(r"^([a-fA-F])\s*[-]?\s*(\d+)$", dept.strip())
    if not m:
        return None
    tower = m.group(1).upper()
    num = m.group(2)
    if len(num) == 3:
        floor, unit = num[0], num[1:]
    elif len(num) == 4:
        floor, unit = num[:2], num[2:]
    elif len(num) >= 2:
        floor, unit = num[: max(1, len(num) - 2)], num[max(1, len(num) - 2):]
    else:
        floor, unit = "Bajo", num
    return {"tower": tower, "floor": floor, "unit": unit}


def validate_form(form: dict) -> dict:
    errors = {}
    if not form.get("nombre_propietario", "").strip():
        errors["nombre_propietario"] = "Requerido."
    if not form.get("departamento", "").strip():
        errors["departamento"] = "Requerido."
    if form.get("torre") not in TORRE_OPTIONS:
        errors["torre"] = "Solo se permiten Torres A–F."
    indiviso = form.get("porcentaje_indiviso", 0)
    if not isinstance(indiviso, (int, float)) or indiviso < 0 or indiviso > 100:
        errors["porcentaje_indiviso"] = "Debe ser un número entre 0 y 100."
    if not form.get("numero_escritura_o_contrato", "").strip():
        errors["numero_escritura_o_contrato"] = "Requerido."
    fecha = form.get("fecha_documento", "")
    if not re.match(r"^\d{4}-\d{2}-\d{2}$", fecha.strip() if fecha else ""):
        errors["fecha_documento"] = "Formato AAAA-MM-DD requerido."
    email = form.get("correo_electronico", "")
    if email and not re.match(r"^[^\s@]+@[^\s@]+\.[^\s@]+$", email.strip()):
        errors["correo_electronico"] = "Formato de correo inválido."
    return errors


def call_extract(file_b64: str, mime: str, filename: str) -> dict:
    resp = requests.post(
        f"{API_BASE}/api/extract",
        json={"fileBase64": file_b64, "mimeType": mime, "fileName": filename},
        timeout=60,
    )
    resp.raise_for_status()
    return resp.json()


def submit_registration(form: dict) -> dict:
    resp = requests.post(f"{API_BASE}/api/registrations", json=form, timeout=30)
    resp.raise_for_status()
    return resp.json()


# ── Header ────────────────────────────────────────────────────────────────────

col_logo, col_title = st.columns([1, 8])
with col_logo:
    st.markdown("<div style='font-size:2.2rem;margin-top:4px'>🏢</div>", unsafe_allow_html=True)
with col_title:
    st.markdown("<h1 style='margin:0;padding-top:0.15rem'>Portal de Acreditación de Propiedad</h1>", unsafe_allow_html=True)
    st.markdown("<p style='color:#64748b;font-size:0.82rem;margin:0'>ACR Condominios · Residente / Propietario</p>", unsafe_allow_html=True)

st.divider()

# ── Upload state ──────────────────────────────────────────────────────────────

if st.session_state.app_state == "upload":

    st.markdown("""
    <div class="card-blue">
      <div style="font-size:0.95rem;font-weight:700;color:#1e293b;margin-bottom:0.3rem">
        ✨ Acreditación Inteligente de Propiedad
      </div>
      <p style="font-size:0.82rem;color:#475569;margin:0">
        Sube una fotografía legible o PDF de tu Escritura Pública, Contrato de Compraventa
        o Arrendamiento. El sistema con <strong>Gemini AI</strong> extraerá automáticamente
        la información para prellenar tu expediente.
      </p>
    </div>
    """, unsafe_allow_html=True)

    # File uploader
    uploaded = st.file_uploader(
        "Arrastra tu documento aquí o haz clic para buscar",
        type=["pdf", "jpg", "jpeg", "png"],
        help="Formatos soportados: PDF, JPG, PNG (máx. 15 MB)",
        label_visibility="visible",
    )

    if uploaded is not None:
        with st.spinner("Procesando con Gemini AI..."):
            for msg in LOADING_MESSAGES:
                time.sleep(0.5)
            file_bytes = uploaded.read()
            file_b64 = base64.b64encode(file_bytes).decode()
            try:
                result = call_extract(file_b64, uploaded.type or "application/pdf", uploaded.name)
                if result.get("success"):
                    st.session_state.form.update(result["data"])
                    st.session_state.form["documentName"] = uploaded.name
                    st.session_state.is_mocked = result.get("isMocked", False)
                    st.session_state.selected_file_name = uploaded.name
                    st.session_state.app_state = "review"
                    st.rerun()
            except Exception as exc:
                st.error(f"Error al extraer datos: {exc}. Verifica que el backend esté corriendo en {API_BASE}")

    # Preset samples
    st.markdown("<br>", unsafe_allow_html=True)
    st.markdown("""
    <div class="card" style="margin-bottom:0.5rem">
      <div class="section-header">
        ❓ ¿No tienes un documento real a la mano?
      </div>
      <p style="font-size:0.78rem;color:#64748b;margin:0 0 0.75rem 0">
        Selecciona uno de los siguientes ejemplos para experimentar la extracción instantánea:
      </p>
    </div>
    """, unsafe_allow_html=True)

    cols = st.columns(3)
    for i, preset in enumerate(PRESETS):
        with cols[i]:
            if st.button(
                f"📄 {preset['title']}\n\n{preset['desc']}",
                key=f"preset_{preset['id']}",
                use_container_width=True,
                help="Cargar muestra de documento",
            ):
                with st.spinner(f"Cargando {preset['title']}..."):
                    for msg in LOADING_MESSAGES:
                        time.sleep(0.35)
                st.session_state.form.update(preset["data"])
                st.session_state.is_mocked = True
                st.session_state.selected_file_name = preset["data"]["documentName"]
                st.session_state.app_state = "review"
                st.rerun()

# ── Review / Form state ───────────────────────────────────────────────────────

elif st.session_state.app_state == "review":
    form = st.session_state.form

    # Header strip
    st.markdown(f"""
    <div class="card-dark">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:12px">
        <div>
          <div style="margin-bottom:6px">
            <span class="badge">✦ Extraído Exitosamente</span>
            {"<span class='badge-amber' style='margin-left:6px'>Muestra Simulada</span>" if st.session_state.is_mocked else ""}
          </div>
          <h2 style="color:white;margin:0">Por favor, revisa y valida los datos extraídos</h2>
          <p style="color:#94a3b8;font-size:0.78rem;margin:4px 0 0">
            La IA ha prellenado el expediente a partir de
            <strong style="color:#cbd5e1">{st.session_state.selected_file_name}</strong>.
            Corrige cualquier campo inexacto.
          </p>
        </div>
      </div>
    </div>
    """, unsafe_allow_html=True)

    col_reset, _ = st.columns([2, 8])
    with col_reset:
        if st.button("↩ Re-subir documento", type="secondary"):
            reset_state()

    st.markdown("<br>", unsafe_allow_html=True)

    # ── Section 1: Propietario y Unidad ──────────────────────────────────────
    st.markdown('<div class="card">', unsafe_allow_html=True)
    st.markdown('<div class="section-header">👤 Datos del Propietario y Unidad</div>', unsafe_allow_html=True)

    c1, c2 = st.columns(2)
    with c1:
        form["nombre_propietario"] = st.text_input(
            "Nombre Completo del Residente / Propietario",
            value=form.get("nombre_propietario", ""),
            placeholder="Nombre completo",
        )
    with c2:
        tipo_idx = DOC_TYPES.index(form.get("tipo_documento", "Escritura Pública")) if form.get("tipo_documento") in DOC_TYPES else 0
        form["tipo_documento"] = st.selectbox("Tipo de Acreditación / Documento", DOC_TYPES, index=tipo_idx)

    c3, c4 = st.columns(2)
    with c3:
        form["correo_electronico"] = st.text_input(
            "Correo Electrónico de Contacto",
            value=form.get("correo_electronico", ""),
            placeholder="ejemplo@correo.com",
        )
    with c4:
        form["telefono_contacto"] = st.text_input(
            "Teléfono de Contacto",
            value=form.get("telefono_contacto", ""),
            placeholder="55-1234-5678",
        )

    c5, c6 = st.columns(2)
    with c5:
        torre_idx = TORRE_OPTIONS.index(form.get("torre", "A")) if form.get("torre") in TORRE_OPTIONS else 0
        form["torre"] = st.selectbox("Torre (Solo A – F)", TORRE_OPTIONS, index=torre_idx)
    with c6:
        form["departamento"] = st.text_input(
            "Departamento / Interior",
            value=form.get("departamento", ""),
            placeholder="Ej. C-103 o F-805",
        )
        dept_info = parse_dept_info(form["departamento"])
        if dept_info:
            # Auto-align tower
            if dept_info["tower"] in TORRE_OPTIONS:
                form["torre"] = dept_info["tower"]
            st.markdown(f"""
            <div class="unit-chip">
              <div>
                <span class="unit-chip-label">Torre</span>
                <span class="unit-chip-value">Torre {dept_info['tower']}</span>
              </div>
              <div class="unit-chip-divider"></div>
              <div>
                <span class="unit-chip-label">Piso</span>
                <span class="unit-chip-value">Piso {dept_info['floor']}</span>
              </div>
              <div class="unit-chip-divider"></div>
              <div>
                <span class="unit-chip-label">Depto</span>
                <span class="unit-chip-value">Depto {dept_info['unit']}</span>
              </div>
            </div>
            """, unsafe_allow_html=True)

    c7, c8 = st.columns(2)
    with c7:
        form["cajones_estacionamiento"] = st.text_input(
            "Cajón(es) de Estacionamiento",
            value=form.get("cajones_estacionamiento", "Sin especificar"),
            placeholder="Ej. E-15",
        )
    with c8:
        form["porcentaje_indiviso"] = st.number_input(
            "Porcentaje de Indiviso (%)",
            value=float(form.get("porcentaje_indiviso") or 0),
            step=0.0001,
            format="%.4f",
            min_value=0.0,
            max_value=100.0,
        )

    st.markdown("</div>", unsafe_allow_html=True)

    # ── Section 2: Datos Legales ──────────────────────────────────────────────
    st.markdown('<div class="card">', unsafe_allow_html=True)
    st.markdown('<div class="section-header">🛡 Información Legal de Acreditación</div>', unsafe_allow_html=True)

    l1, l2 = st.columns(2)
    with l1:
        form["numero_escritura_o_contrato"] = st.text_input(
            "Número de Escritura / Contrato / Folio",
            value=form.get("numero_escritura_o_contrato", ""),
            placeholder="Ej. Escritura No. 24,192",
        )
    with l2:
        form["fecha_documento"] = st.text_input(
            "Fecha de Expedición / Firma (AAAA-MM-DD)",
            value=form.get("fecha_documento", ""),
            placeholder="2023-04-12",
        )

    l3, l4 = st.columns(2)
    with l3:
        form["notario_publico_numero"] = st.text_input(
            "Notaría Pública (Número)",
            value=form.get("notario_publico_numero", ""),
            placeholder="Ej. Notaría No. 125",
        )
    with l4:
        form["notario_nombre_o_ciudad"] = st.text_input(
            "Nombre del Notario / Ciudad",
            value=form.get("notario_nombre_o_ciudad", ""),
            placeholder="Ej. Lic. Arturo Gómez, Monterrey",
        )

    form["folio_real_registro"] = st.text_input(
        "Folio Real / Inscripción de Registro Público",
        value=form.get("folio_real_registro", ""),
        placeholder="Ej. FOL-9921132-B",
    )
    st.markdown("</div>", unsafe_allow_html=True)

    # ── Section 3: Habitabilidad ──────────────────────────────────────────────
    st.markdown('<div class="card">', unsafe_allow_html=True)
    st.markdown('<div class="section-header">🏠 Datos de Habitabilidad y Coexistencia</div>', unsafe_allow_html=True)

    h1, h2 = st.columns([1, 3])
    with h1:
        form["numero_habitantes"] = st.number_input(
            "Número de Habitantes",
            value=int(form.get("numero_habitantes") or 1),
            min_value=1,
            step=1,
        )
    with h2:
        form["vehiculos"] = st.text_input(
            "Vehículos (Marca, Modelo, Placas)",
            value=form.get("vehiculos", ""),
            placeholder="Ej. Mazda 3 color Rojo (Placas MX-221)",
        )

    form["mascotas"] = st.text_input(
        "Mascotas Habitantes (Tipo, Nombre)",
        value=form.get("mascotas", ""),
        placeholder="Ej. Perro Pug de nombre 'Waffles'",
    )
    st.markdown("</div>", unsafe_allow_html=True)

    # ── Validation & Submit ───────────────────────────────────────────────────
    st.session_state.form = form
    errors = validate_form(form)

    if errors:
        err_list = " · ".join(errors.values())
        st.markdown(f"""
        <div class="card-warning">
          <strong>⚠ Se requieren correcciones ({len(errors)} campo(s)):</strong><br>
          <span style="font-size:0.77rem">{err_list}</span>
        </div>
        """, unsafe_allow_html=True)

    ca, cb = st.columns([1, 2])
    with ca:
        if st.button("Cancelar y Borrar", type="secondary", use_container_width=True):
            reset_state()
    with cb:
        submit_disabled = len(errors) > 0
        if st.button(
            "✔ Confirmar y Enviar para Revisión",
            type="primary",
            disabled=submit_disabled,
            use_container_width=True,
        ):
            try:
                submit_registration(form)
                st.session_state.app_state = "success"
                st.rerun()
            except Exception as exc:
                st.error(f"No se pudo enviar el expediente: {exc}")

# ── Success state ─────────────────────────────────────────────────────────────

elif st.session_state.app_state == "success":
    form = st.session_state.form

    st.markdown("""
    <div class="card-success">
      <div style="font-size:3.5rem">✅</div>
      <h1 style="color:#065f46;margin:0.5rem 0 0.25rem">¡Expediente Recibido!</h1>
      <p style="color:#6b7280;font-size:0.9rem;max-width:480px;margin:0 auto">
        Los datos han sido registrados con éxito y están en espera de revisión por la administración.
      </p>
    </div>
    """, unsafe_allow_html=True)

    st.markdown(f"""
    <div class="receipt">
      <div class="receipt-row">
        <span>Unidad Registrada:</span>
        <strong>Torre {form.get('torre')} · Depto {form.get('departamento')}</strong>
      </div>
      <div class="receipt-row">
        <span>Propietario / Residente:</span>
        <strong>{form.get('nombre_propietario')}</strong>
      </div>
      <div class="receipt-row">
        <span>Porcentaje de Indiviso:</span>
        <strong>{form.get('porcentaje_indiviso')}%</strong>
      </div>
      <div class="receipt-row">
        <span>Documento Evaluado:</span>
        <strong>{form.get('documentName', '—')}</strong>
      </div>
      <div class="receipt-row">
        <span>Estado del Trámite:</span>
        <strong style="color:#d97706">⏳ Pendiente de Revisión</strong>
      </div>
    </div>
    """, unsafe_allow_html=True)

    st.markdown(f"""
    <p style="font-size:0.8rem;color:#6b7280;text-align:center;margin-top:1rem">
      La administración notificará a
      <strong>{form.get('correo_electronico') or 'tu correo registrado'}</strong>
      una vez que el expediente sea <strong>Aprobado</strong> o requiera correcciones.
    </p>
    """, unsafe_allow_html=True)

    _, center, _ = st.columns([1, 2, 1])
    with center:
        if st.button("Registrar otra unidad", use_container_width=True):
            reset_state()
