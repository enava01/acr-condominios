import os
from datetime import datetime

import plotly.graph_objects as go
import requests
import streamlit as st
from dotenv import load_dotenv

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), "..", ".env"))

API_BASE = os.getenv("API_BASE_URL", "http://localhost:8000")

st.set_page_config(
    page_title="Administración · ACR Condominios",
    page_icon="🏗",
    layout="wide",
    initial_sidebar_state="collapsed",
)

st.markdown("""
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

  html, body, [class*="css"] { font-family: 'Inter', sans-serif; }
  #MainMenu, footer, header { visibility: hidden; }
  .main .block-container { padding: 1.5rem 2rem; max-width: 1400px; }

  /* KPI Cards */
  .kpi-card {
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 14px;
    padding: 1rem 1.25rem;
    display: flex;
    align-items: center;
    gap: 12px;
    box-shadow: 0 1px 4px rgba(0,0,0,0.04);
  }
  .kpi-icon {
    width: 42px; height: 42px;
    border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    font-size: 1.2rem; flex-shrink: 0;
  }
  .kpi-label { font-size: 0.62rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: #94a3b8; }
  .kpi-value { font-size: 1.5rem; font-weight: 800; color: #1e293b; line-height: 1.1; }
  .kpi-sub { font-size: 0.65rem; color: #94a3b8; }

  /* Panel cards */
  .card {
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 14px;
    padding: 1.25rem;
    margin-bottom: 0.75rem;
    box-shadow: 0 1px 4px rgba(0,0,0,0.04);
  }
  .section-header {
    font-size: 0.82rem;
    font-weight: 700;
    color: #1e293b;
    display: flex;
    align-items: center;
    gap: 6px;
    border-bottom: 1px solid #f1f5f9;
    padding-bottom: 0.6rem;
    margin-bottom: 0.85rem;
  }
  .section-sub {
    font-size: 0.72rem;
    color: #94a3b8;
    margin: -0.5rem 0 0.75rem;
  }

  /* Tower grid card */
  .tower-card {
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    padding: 0.75rem;
    cursor: pointer;
    transition: all 0.15s;
    background: #f8fafc;
  }
  .tower-card:hover { border-color: #93c5fd; background: white; }
  .tower-card.active { border-color: #3b82f6; background: #eff6ff; box-shadow: 0 0 0 2px rgba(59,130,246,0.15); }
  .tower-title { font-size: 0.78rem; font-weight: 800; color: #1e293b; }
  .tower-count { font-size: 0.65rem; background: #f1f5f9; color: #475569; border-radius: 4px; padding: 1px 6px; font-weight: 700; }
  .tower-indiviso { font-size: 0.7rem; color: #475569; display: flex; justify-content: space-between; }
  .tower-indiviso strong { color: #1e293b; }

  /* Status badges */
  .status-badge {
    display: inline-flex; align-items: center; gap: 4px;
    font-size: 0.68rem; font-weight: 700;
    padding: 2px 10px; border-radius: 9999px;
  }
  .badge-aprobado { background: #ecfdf5; color: #065f46; border: 1px solid #a7f3d0; }
  .badge-revision { background: #eef2ff; color: #3730a3; border: 1px solid #c7d2fe; }
  .badge-pendiente { background: #fffbeb; color: #92400e; border: 1px solid #fde68a; }
  .badge-rechazado { background: #fef2f2; color: #991b1b; border: 1px solid #fecaca; }

  /* Data table rows */
  .reg-row {
    border-bottom: 1px solid #f1f5f9;
    padding: 0.6rem 0.5rem;
    transition: background 0.1s;
    cursor: pointer;
  }
  .reg-row:hover { background: #f8fafc; }
  .owner-name { font-size: 0.82rem; font-weight: 700; color: #1e293b; }
  .owner-sub { font-size: 0.68rem; color: #94a3b8; margin-top: 1px; }
  .unit-tag {
    display: inline-flex; align-items: center;
    background: #eef2ff; border: 1px solid #c7d2fe;
    color: #3730a3; font-weight: 700; font-size: 0.68rem;
    border-radius: 6px; padding: 2px 8px; font-family: monospace;
    margin-right: 4px;
  }
  .doc-type { font-size: 0.72rem; font-weight: 600; color: #475569; }
  .doc-folio { font-size: 0.65rem; color: #94a3b8; font-family: monospace; }
  .indiviso-val { font-size: 0.82rem; font-weight: 700; color: #1e293b; font-family: monospace; }

  /* Detail dialog */
  .detail-header {
    background: #0f172a; color: white;
    border-radius: 12px; padding: 1.25rem;
    margin-bottom: 1rem;
  }
  .detail-field-label { font-size: 0.65rem; font-weight: 700; text-transform: uppercase; color: #94a3b8; letter-spacing: 0.06em; }
  .detail-field-value { font-size: 0.82rem; font-weight: 600; color: #1e293b; text-align: right; }
  .detail-section { border: 1px solid #e2e8f0; border-radius: 10px; padding: 0.85rem; margin-bottom: 0.75rem; }
  .detail-section-title { font-size: 0.65rem; font-weight: 700; text-transform: uppercase; color: #94a3b8; letter-spacing: 0.06em; margin-bottom: 0.6rem; }

  /* Progress bar */
  .progress-bar-outer { background: #f1f5f9; border-radius: 9999px; height: 5px; overflow: hidden; margin-top: 3px; }
  .progress-bar-inner { height: 100%; border-radius: 9999px; background: #10b981; transition: width 0.4s; }

  h1 { font-size: 1.5rem !important; font-weight: 800 !important; }
  h2, h3 { font-weight: 700 !important; }
</style>
""", unsafe_allow_html=True)

TORRES = ["A", "B", "C", "D", "E", "F"]
TOTAL_PER_TOWER = 10
STATUS_OPTIONS = ["Pendiente", "En Revisión", "Aprobado", "Rechazado"]

# ── Session state ─────────────────────────────────────────────────────────────

def init_state():
    defaults = {
        "registrations": [],
        "selected_reg_id": None,
        "filter_torre": "Todas",
        "filter_status": "Todos",
        "search": "",
    }
    for k, v in defaults.items():
        if k not in st.session_state:
            st.session_state[k] = v

init_state()

# ── API helpers ───────────────────────────────────────────────────────────────

def fetch_registrations():
    resp = requests.get(f"{API_BASE}/api/registrations", timeout=15)
    resp.raise_for_status()
    return resp.json()


def update_registration(reg_id: str, payload: dict):
    resp = requests.patch(f"{API_BASE}/api/registrations/{reg_id}", json=payload, timeout=15)
    resp.raise_for_status()
    return resp.json()


def delete_registration(reg_id: str):
    resp = requests.delete(f"{API_BASE}/api/registrations/{reg_id}", timeout=15)
    resp.raise_for_status()


# ── Status badge HTML ─────────────────────────────────────────────────────────

STATUS_ICONS = {
    "Aprobado": "✔",
    "En Revisión": "👁",
    "Pendiente": "⏳",
    "Rechazado": "✖",
}
STATUS_CLASSES = {
    "Aprobado": "badge-aprobado",
    "En Revisión": "badge-revision",
    "Pendiente": "badge-pendiente",
    "Rechazado": "badge-rechazado",
}


def status_badge(status: str) -> str:
    cls = STATUS_CLASSES.get(status, "badge-pendiente")
    icon = STATUS_ICONS.get(status, "")
    return f'<span class="status-badge {cls}">{icon} {status}</span>'


def format_date(iso: str) -> str:
    try:
        return datetime.fromisoformat(iso.replace("Z", "+00:00")).strftime("%d/%m/%Y")
    except Exception:
        return iso or "—"


# ── Load data ─────────────────────────────────────────────────────────────────

try:
    st.session_state.registrations = fetch_registrations()
except Exception as exc:
    st.error(f"No se pudo conectar con el backend ({API_BASE}): {exc}")
    st.stop()

regs = st.session_state.registrations

# ── Header ────────────────────────────────────────────────────────────────────

col_logo, col_title, col_refresh = st.columns([0.6, 8, 1.5])
with col_logo:
    st.markdown("<div style='font-size:2rem;margin-top:6px'>🏗</div>", unsafe_allow_html=True)
with col_title:
    st.markdown("<h1 style='margin:0'>Panel de Administración</h1>", unsafe_allow_html=True)
    st.markdown("<p style='color:#64748b;font-size:0.8rem;margin:0'>ACR Condominios · Control de Acreditación de Propiedad</p>", unsafe_allow_html=True)
with col_refresh:
    if st.button("↻ Actualizar", use_container_width=True):
        st.rerun()

st.divider()

# ── KPI Metrics ───────────────────────────────────────────────────────────────

total = len(regs)
aprobados = sum(1 for r in regs if r["status"] == "Aprobado")
pendientes = sum(1 for r in regs if r["status"] == "Pendiente")
en_revision = sum(1 for r in regs if r["status"] == "En Revisión")
rechazados = sum(1 for r in regs if r["status"] == "Rechazado")
total_units = len(TORRES) * TOTAL_PER_TOWER
progress_pct = round((aprobados / total_units) * 100, 1) if total_units else 0
indiviso_total = sum(r.get("porcentaje_indiviso", 0) for r in regs if r["status"] == "Aprobado")

kpi_cols = st.columns(5)
kpi_data = [
    ("📋", "#dbeafe", total, "Total Registros", "recibidos"),
    ("⏳", "#fef3c7", pendientes, "Pendientes", "por revisar"),
    ("👁", "#e0e7ff", en_revision, "En Revisión", "en proceso"),
    ("✔", "#d1fae5", aprobados, f"de {total_units}", "Aprobados"),
    ("✖", "#fee2e2", rechazados, "Rechazados", "observaciones"),
]
for col, (icon, bg, val, sub, label) in zip(kpi_cols, kpi_data):
    with col:
        st.markdown(f"""
        <div class="kpi-card">
          <div class="kpi-icon" style="background:{bg}">{icon}</div>
          <div>
            <div class="kpi-label">{label}</div>
            <div class="kpi-value">{val}</div>
            <div class="kpi-sub">{sub}</div>
          </div>
        </div>
        """, unsafe_allow_html=True)

st.markdown("<br>", unsafe_allow_html=True)

# ── Global Progress ───────────────────────────────────────────────────────────

st.markdown(f"""
<div style="display:flex;align-items:center;gap:12px;margin-bottom:1.25rem">
  <div style="flex:1">
    <div style="display:flex;justify-content:space-between;font-size:0.75rem;font-weight:600;color:#64748b;margin-bottom:4px">
      <span>Progreso Global de Acreditación</span>
      <span style="color:#1e293b;font-weight:800">{aprobados}/{total_units} unidades aprobadas · {progress_pct}%</span>
    </div>
    <div class="progress-bar-outer">
      <div class="progress-bar-inner" style="width:{progress_pct}%"></div>
    </div>
  </div>
  <div style="font-size:0.72rem;color:#64748b;white-space:nowrap">
    Indiviso acreditado: <strong style="color:#1e293b">{indiviso_total:.3f}%</strong>
  </div>
</div>
""", unsafe_allow_html=True)

# ── Charts + Tower Grid ───────────────────────────────────────────────────────

chart_col, grid_col = st.columns([5, 7])

with chart_col:
    st.markdown('<div class="card">', unsafe_allow_html=True)
    st.markdown('<div class="section-header">📊 Registros por Torre (Apilado)</div>', unsafe_allow_html=True)
    st.markdown('<p class="section-sub">Haz clic en una barra para filtrar</p>', unsafe_allow_html=True)

    def tower_metrics(torre: str) -> dict:
        tr = [r for r in regs if r["torre"] == torre]
        ap = sum(1 for r in tr if r["status"] == "Aprobado")
        rv = sum(1 for r in tr if r["status"] == "En Revisión")
        pe = sum(1 for r in tr if r["status"] == "Pendiente")
        re = sum(1 for r in tr if r["status"] == "Rechazado")
        return {"approved": ap, "revision": rv, "pending": pe, "rejected": re, "total": len(tr)}

    fig = go.Figure()
    t_labels = [f"Torre {t}" for t in TORRES]
    metrics_by_tower = {t: tower_metrics(t) for t in TORRES}

    color_map = {
        "Aprobado": ("#10b981", [metrics_by_tower[t]["approved"] for t in TORRES]),
        "En Revisión": ("#6366f1", [metrics_by_tower[t]["revision"] for t in TORRES]),
        "Pendiente": ("#f59e0b", [metrics_by_tower[t]["pending"] for t in TORRES]),
        "Rechazado": ("#ef4444", [metrics_by_tower[t]["rejected"] for t in TORRES]),
    }
    for status_name, (color, vals) in color_map.items():
        fig.add_trace(go.Bar(
            name=status_name,
            x=t_labels,
            y=vals,
            marker_color=color,
            hovertemplate=f"<b>{status_name}</b>: %{{y}}<extra></extra>",
        ))

    fig.update_layout(
        barmode="stack",
        height=220,
        margin=dict(l=0, r=0, t=10, b=10),
        paper_bgcolor="rgba(0,0,0,0)",
        plot_bgcolor="rgba(0,0,0,0)",
        legend=dict(orientation="h", yanchor="bottom", y=1.02, xanchor="left", x=0, font=dict(size=9)),
        xaxis=dict(tickfont=dict(size=10), showgrid=False),
        yaxis=dict(tickfont=dict(size=10), gridcolor="#f1f5f9", showgrid=True, dtick=1),
        showlegend=True,
    )

    selected_chart = st.plotly_chart(fig, use_container_width=True, on_select="rerun", selection_mode="points", key="tower_chart")

    # Sync chart click with torre filter
    if selected_chart and selected_chart.get("selection", {}).get("points"):
        pt = selected_chart["selection"]["points"][0]
        clicked_tower = pt.get("x", "").replace("Torre ", "")
        if st.session_state.filter_torre == clicked_tower:
            st.session_state.filter_torre = "Todas"
        else:
            st.session_state.filter_torre = clicked_tower

    st.markdown("</div>", unsafe_allow_html=True)

with grid_col:
    st.markdown('<div class="card">', unsafe_allow_html=True)
    st.markdown('<div class="section-header">🏛 Desglose por Torre</div>', unsafe_allow_html=True)
    st.markdown('<p class="section-sub">Progreso de acreditación e indiviso acumulado por sector</p>', unsafe_allow_html=True)

    gcols = st.columns(3)
    for i, torre in enumerate(TORRES):
        m = metrics_by_tower[torre]
        prog = round((m["approved"] / TOTAL_PER_TOWER) * 100)
        indiviso_t = sum(
            r.get("porcentaje_indiviso", 0)
            for r in regs
            if r["torre"] == torre and r["status"] == "Aprobado"
        )
        is_active = st.session_state.filter_torre == torre
        active_class = "active" if is_active else ""

        with gcols[i % 3]:
            st.markdown(f"""
            <div class="tower-card {active_class}" onclick="">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
                <span class="tower-title">Torre {torre}</span>
                <span class="tower-count">{m['total']}/10 reg</span>
              </div>
              <div style="margin-bottom:6px">
                <div style="display:flex;justify-content:space-between;font-size:0.65rem;color:#94a3b8;margin-bottom:2px">
                  <span>Progreso</span><strong style="color:#1e293b">{prog}%</strong>
                </div>
                <div class="progress-bar-outer">
                  <div class="progress-bar-inner" style="width:{prog}%"></div>
                </div>
              </div>
              <div class="tower-indiviso"><span>Indiviso:</span><strong>{indiviso_t:.3f}%</strong></div>
              <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:3px;margin-top:6px;font-size:0.65rem;text-align:center;font-weight:700">
                <div style="background:#fffbeb;color:#92400e;border-radius:4px;padding:2px">{m['pending']} P</div>
                <div style="background:#eef2ff;color:#3730a3;border-radius:4px;padding:2px">{m['revision']} R</div>
                <div style="background:#fef2f2;color:#991b1b;border-radius:4px;padding:2px">{m['rejected']} X</div>
              </div>
            </div>
            """, unsafe_allow_html=True)

            btn_label = f"✓ Torre {torre}" if is_active else f"Torre {torre}"
            if st.button(btn_label, key=f"tower_btn_{torre}", use_container_width=True,
                         type="primary" if is_active else "secondary"):
                st.session_state.filter_torre = "Todas" if is_active else torre
                st.rerun()

    st.markdown("</div>", unsafe_allow_html=True)

# ── Filter toolbar ────────────────────────────────────────────────────────────

st.markdown('<div class="card">', unsafe_allow_html=True)
st.markdown('<div class="section-header">📋 Base de Datos de Expedientes</div>', unsafe_allow_html=True)

fs1, fs2, fs3 = st.columns([4, 2, 2])
with fs1:
    st.session_state.search = st.text_input(
        "Buscar",
        value=st.session_state.search,
        placeholder="Propietario, departamento, escritura...",
        label_visibility="collapsed",
    )
with fs2:
    torre_options = ["Todas"] + TORRES
    curr_torre_idx = torre_options.index(st.session_state.filter_torre) if st.session_state.filter_torre in torre_options else 0
    st.session_state.filter_torre = st.selectbox("Torre", torre_options, index=curr_torre_idx, label_visibility="collapsed")
with fs3:
    status_options = ["Todos"] + STATUS_OPTIONS
    curr_st_idx = status_options.index(st.session_state.filter_status) if st.session_state.filter_status in status_options else 0
    st.session_state.filter_status = st.selectbox("Estado", status_options, index=curr_st_idx, label_visibility="collapsed")

# ── Filter registrations ──────────────────────────────────────────────────────

search_q = st.session_state.search.lower()
filtered = [
    r for r in regs
    if (
        (not search_q or
         search_q in r.get("nombre_propietario", "").lower() or
         search_q in r.get("departamento", "").lower() or
         search_q in r.get("numero_escritura_o_contrato", "").lower())
        and (st.session_state.filter_torre == "Todas" or r.get("torre") == st.session_state.filter_torre)
        and (st.session_state.filter_status == "Todos" or r.get("status") == st.session_state.filter_status)
    )
]

# ── Table header ──────────────────────────────────────────────────────────────

if filtered:
    hcols = st.columns([4, 2.5, 3, 1.5, 2, 1.5])
    headers = ["Propietario / Residente", "Unidad", "Documento / Folio", "Indiviso", "Estado", "Acciones"]
    for hcol, h in zip(hcols, headers):
        with hcol:
            st.markdown(f"<p style='font-size:0.65rem;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:0.06em;margin:0 0 4px'>{h}</p>", unsafe_allow_html=True)

    st.markdown("<hr style='margin:4px 0 8px;border-color:#f1f5f9'>", unsafe_allow_html=True)

    for reg in filtered:
        r1, r2, r3, r4, r5, r6 = st.columns([4, 2.5, 3, 1.5, 2, 1.5])

        with r1:
            st.markdown(f"""
            <div class="owner-name">{reg.get('nombre_propietario', '—')}</div>
            <div class="owner-sub">{reg.get('correo_electronico', 'Sin correo')} · {reg.get('telefono_contacto', 'Sin tel')}</div>
            """, unsafe_allow_html=True)
        with r2:
            st.markdown(f"""
            <span class="unit-tag">Torre {reg.get('torre')}</span>
            <span style="font-size:0.78rem;font-weight:600;color:#374151;font-family:monospace">Depto {reg.get('departamento')}</span>
            """, unsafe_allow_html=True)
        with r3:
            st.markdown(f"""
            <div class="doc-type">📄 {reg.get('tipo_documento', '—')}</div>
            <div class="doc-folio">{reg.get('numero_escritura_o_contrato', '')}</div>
            """, unsafe_allow_html=True)
        with r4:
            st.markdown(f"<span class='indiviso-val'>{reg.get('porcentaje_indiviso', 0):.4f}%</span>", unsafe_allow_html=True)
        with r5:
            st.markdown(status_badge(reg.get("status", "Pendiente")), unsafe_allow_html=True)
        with r6:
            if st.button("Ver", key=f"view_{reg['id']}", use_container_width=True):
                st.session_state.selected_reg_id = reg["id"]
                st.rerun()

        st.markdown("<hr style='margin:4px 0;border-color:#f8fafc'>", unsafe_allow_html=True)

else:
    st.markdown("""
    <div style="text-align:center;padding:3rem;color:#94a3b8">
      <div style="font-size:2.5rem;margin-bottom:0.5rem">🏢</div>
      <p style="font-size:0.82rem">No se encontraron expedientes con los criterios de búsqueda.</p>
    </div>
    """, unsafe_allow_html=True)

st.markdown("</div>", unsafe_allow_html=True)

# ── Detail Dialog ─────────────────────────────────────────────────────────────

@st.dialog("Revisar Expediente de Acreditación", width="large")
def show_detail(reg: dict):
    status = reg.get("status", "Pendiente")

    # Header
    st.markdown(f"""
    <div class="detail-header">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
        <span style="font-size:0.65rem;background:#1e293b;color:#94a3b8;border:1px solid #334155;padding:2px 10px;border-radius:9999px;font-weight:700">
          Expediente #{reg.get('id')}
        </span>
        {status_badge(status)}
      </div>
      <h3 style="color:white;margin:0">Revisión de Acreditación de Propiedad</h3>
      <p style="color:#94a3b8;font-size:0.75rem;margin:4px 0 0">
        {reg.get('nombre_propietario')} · Torre {reg.get('torre')} - Depto {reg.get('departamento')}
      </p>
    </div>
    """, unsafe_allow_html=True)

    # Document info bar
    doc_date = format_date(reg.get("createdAt", ""))
    st.markdown(f"""
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:0.75rem 1rem;display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem">
      <div style="display:flex;align-items:center;gap:10px">
        <div style="background:#eef2ff;border-radius:8px;padding:6px 8px;font-size:1.1rem">📄</div>
        <div>
          <div style="font-size:0.8rem;font-weight:700;color:#1e293b">{reg.get('documentName', '—')}</div>
          <div style="font-size:0.68rem;color:#94a3b8">Tipo: {reg.get('tipo_documento', '—')}</div>
        </div>
      </div>
      <div style="font-size:0.68rem;color:#94a3b8;font-family:monospace">{doc_date}</div>
    </div>
    """, unsafe_allow_html=True)

    # Status controls
    st.markdown('<div class="detail-section">', unsafe_allow_html=True)
    st.markdown('<div class="detail-section-title">⚙ Controles de Dictaminador</div>', unsafe_allow_html=True)

    btn_cols = st.columns(4)
    new_status = status
    status_actions = [
        ("Aprobado", "✔ Aprobar", "primary"),
        ("En Revisión", "👁 Revisión", "secondary"),
        ("Pendiente", "⏳ Pendiente", "secondary"),
        ("Rechazado", "✖ Rechazar", "secondary"),
    ]
    for bcol, (s_val, s_label, _) in zip(btn_cols, status_actions):
        with bcol:
            btn_type = "primary" if status == s_val else "secondary"
            if st.button(s_label, key=f"detail_status_{s_val}", use_container_width=True, type=btn_type):
                new_status = s_val

    admin_comment = st.text_area(
        "Retroalimentación de la Administración",
        value=reg.get("comments", ""),
        placeholder="Agregue retroalimentación de por qué se aprueba o rechaza el documento...",
        height=80,
        key="detail_comment",
    )
    st.markdown("</div>", unsafe_allow_html=True)

    # Data sections read-only
    dc1, dc2 = st.columns(2)
    with dc1:
        st.markdown('<div class="detail-section">', unsafe_allow_html=True)
        st.markdown('<div class="detail-section-title">🏠 Identidad y Unidad</div>', unsafe_allow_html=True)
        fields = [
            ("Propietario:", reg.get("nombre_propietario", "—")),
            ("Unidad:", f"Torre {reg.get('torre')} - Depto {reg.get('departamento')}"),
            ("Indiviso:", f"{reg.get('porcentaje_indiviso', 0):.4f}%"),
            ("Estacionamiento:", reg.get("cajones_estacionamiento", "—")),
            ("Correo:", reg.get("correo_electronico", "—")),
            ("Teléfono:", reg.get("telefono_contacto", "—")),
        ]
        for label, val in fields:
            c_l, c_v = st.columns(2)
            with c_l:
                st.markdown(f"<span class='detail-field-label'>{label}</span>", unsafe_allow_html=True)
            with c_v:
                st.markdown(f"<span class='detail-field-value'>{val}</span>", unsafe_allow_html=True)
        st.markdown("</div>", unsafe_allow_html=True)

    with dc2:
        st.markdown('<div class="detail-section">', unsafe_allow_html=True)
        st.markdown('<div class="detail-section-title">📜 Escritura y Registro</div>', unsafe_allow_html=True)
        fields2 = [
            ("Nº Instrumento:", reg.get("numero_escritura_o_contrato", "—")),
            ("Fecha Documento:", reg.get("fecha_documento", "—")),
            ("Notaría:", reg.get("notario_publico_numero", "—")),
            ("Notario / Ciudad:", reg.get("notario_nombre_o_ciudad", "—")),
            ("Folio Registral:", reg.get("folio_real_registro", "—") or "Sin inscribir"),
        ]
        for label, val in fields2:
            c_l, c_v = st.columns(2)
            with c_l:
                st.markdown(f"<span class='detail-field-label'>{label}</span>", unsafe_allow_html=True)
            with c_v:
                st.markdown(f"<span class='detail-field-value'>{val}</span>", unsafe_allow_html=True)
        st.markdown("</div>", unsafe_allow_html=True)

    # Habitability
    st.markdown('<div class="detail-section">', unsafe_allow_html=True)
    st.markdown('<div class="detail-section-title">👥 Habitabilidad</div>', unsafe_allow_html=True)
    hb1, hb2, hb3 = st.columns(3)
    with hb1:
        st.markdown(f"<span class='detail-field-label'>Habitantes</span><br><strong>{reg.get('numero_habitantes', 1)}</strong>", unsafe_allow_html=True)
    with hb2:
        st.markdown(f"<span class='detail-field-label'>Vehículos</span><br><span style='font-size:0.75rem'>{reg.get('vehiculos', 'Ninguno') or 'Ninguno'}</span>", unsafe_allow_html=True)
    with hb3:
        st.markdown(f"<span class='detail-field-label'>Mascotas</span><br><span style='font-size:0.75rem'>{reg.get('mascotas', 'Ninguna') or 'Ninguna'}</span>", unsafe_allow_html=True)
    st.markdown("</div>", unsafe_allow_html=True)

    # Footer actions
    st.markdown("<br>", unsafe_allow_html=True)
    fa1, fa2 = st.columns([2, 3])
    with fa1:
        if st.button("🗑 Eliminar Expediente", key="detail_delete", use_container_width=True):
            try:
                delete_registration(reg["id"])
                st.session_state.selected_reg_id = None
                st.rerun()
            except Exception as e:
                st.error(f"Error al eliminar: {e}")
    with fa2:
        if st.button("💾 Guardar Cambios", key="detail_save", type="primary", use_container_width=True):
            payload = {"status": new_status, "comments": admin_comment}
            try:
                update_registration(reg["id"], payload)
                st.session_state.selected_reg_id = None
                st.rerun()
            except Exception as e:
                st.error(f"Error al guardar: {e}")


# ── Trigger detail dialog ─────────────────────────────────────────────────────

if st.session_state.selected_reg_id:
    reg_detail = next((r for r in regs if r["id"] == st.session_state.selected_reg_id), None)
    if reg_detail:
        show_detail(reg_detail)
    else:
        st.session_state.selected_reg_id = None
