import React, { useState } from "react";
import { 
  Building2, 
  Search, 
  Filter, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  Eye, 
  Check, 
  X, 
  MessageSquare, 
  TrendingUp, 
  Layers, 
  FileText, 
  User, 
  Calendar, 
  MapPin, 
  Car, 
  Cat, 
  Plus, 
  Settings, 
  ChevronRight,
  ShieldAlert,
  Save,
  Trash2,
  PieChart
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Registration } from "../types";

interface AdminDashboardProps {
  registrations: Registration[];
  onUpdateRegistration: (id: string, updatedData: Partial<Registration>) => void;
  onDeleteRegistration: (id: string) => void;
}

export default function AdminDashboard({ registrations, onUpdateRegistration, onDeleteRegistration }: AdminDashboardProps) {
  // Filters & Search state
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTorreFilter, setSelectedTorreFilter] = useState<string>("All");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>("All");

  // Selected registration for detail panel
  const [selectedReg, setSelectedReg] = useState<Registration | null>(null);
  const [adminComments, setAdminComments] = useState("");
  const [isEditingData, setIsEditingData] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Registration>>({});

  // Calculations
  const towersList: ("A" | "B" | "C" | "D" | "E" | "F")[] = ["A", "B", "C", "D", "E", "F"];
  const totalApartmentsPerTower = 10; // Assume 10 units per tower, 60 total
  const totalUnits = towersList.length * totalApartmentsPerTower;

  // Filter registrations
  const filteredRegs = registrations.filter((reg) => {
    const matchesSearch = 
      reg.nombre_propietario.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reg.departamento.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reg.numero_escritura_o_contrato.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTorre = selectedTorreFilter === "All" ? true : reg.torre === selectedTorreFilter;
    const matchesStatus = selectedStatusFilter === "All" ? true : reg.status === selectedStatusFilter;

    return matchesSearch && matchesTorre && matchesStatus;
  });

  // Calculate Metrics
  const totalExpedientes = registrations.length;
  const aprobadosCount = registrations.filter((r) => r.status === "Aprobado").length;
  const pendientesCount = registrations.filter((r) => r.status === "Pendiente").length;
  const enRevisionCount = registrations.filter((r) => r.status === "En Revisión").length;
  const rechazadosCount = registrations.filter((r) => r.status === "Rechazado").length;

  const globalProgressPercentage = Math.round((aprobadosCount / totalUnits) * 100);

  // Sum percentage of indiviso of approved properties
  const approvedIndivisoSum = registrations
    .filter((r) => r.status === "Aprobado")
    .reduce((sum, r) => sum + (r.porcentaje_indiviso || 0), 0);

  // Tower Specific Metrics
  const getTowerMetrics = (torre: "A" | "B" | "C" | "D" | "E" | "F") => {
    const towerRegs = registrations.filter((r) => r.torre === torre);
    const approved = towerRegs.filter((r) => r.status === "Aprobado").length;
    const pending = towerRegs.filter((r) => r.status === "Pendiente").length;
    const revision = towerRegs.filter((r) => r.status === "En Revisión").length;
    const rejected = towerRegs.filter((r) => r.status === "Rechazado").length;
    const total = towerRegs.length;
    
    const progressPercent = Math.round((approved / totalApartmentsPerTower) * 100);
    const indivisoSum = towerRegs
      .filter((r) => r.status === "Aprobado")
      .reduce((sum, r) => sum + (r.porcentaje_indiviso || 0), 0);

    return { approved, pending, revision, rejected, total, progressPercent, indivisoSum };
  };

  // Open detailing panel
  const handleOpenDetail = (reg: Registration) => {
    setSelectedReg(reg);
    setAdminComments(reg.comments || "");
    setEditForm({ ...reg });
    setIsEditingData(false);
  };

  // Quick Approval Handler
  const handleQuickApprove = (regId: string) => {
    onUpdateRegistration(regId, { status: "Aprobado" });
    if (selectedReg && selectedReg.id === regId) {
      setSelectedReg({ ...selectedReg, status: "Aprobado" });
    }
  };

  // Administrative Save Handler
  const handleAdminSave = () => {
    if (!selectedReg) return;
    
    const updatePayload: Partial<Registration> = {
      comments: adminComments,
      ...(isEditingData ? editForm : {})
    };

    onUpdateRegistration(selectedReg.id, updatePayload);
    setSelectedReg({ ...selectedReg, ...updatePayload });
    setIsEditingData(false);
  };

  // Full status change handler inside detail panel
  const handleStatusChange = (newStatus: "Aprobado" | "Rechazado" | "Pendiente" | "En Revisión") => {
    if (!selectedReg) return;
    onUpdateRegistration(selectedReg.id, { status: newStatus, comments: adminComments });
    setSelectedReg({ ...selectedReg, status: newStatus, comments: adminComments });
  };

  const handleDelete = (id: string) => {
    if (confirm("¿Estás seguro de que deseas eliminar este expediente del registro?")) {
      onDeleteRegistration(id);
      setSelectedReg(null);
    }
  };

  return (
    <div id="admin-dashboard-root" className="space-y-6 py-4">
      
      {/* 1. Global KPI Metrics Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* Metric Card 1: Total */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center gap-3">
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Registros</p>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-extrabold text-slate-800">{totalExpedientes}</span>
              <span className="text-[10px] text-slate-400">recibidos</span>
            </div>
          </div>
        </div>

        {/* Metric Card 2: Pendientes */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center gap-3">
          <div className="p-2.5 bg-amber-50 text-amber-600 rounded-lg shrink-0 animate-pulse">
            <Clock className="w-5 h-5 animate-spin" style={{ animationDuration: '3s' }} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Pendientes</p>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-extrabold text-slate-800">{pendientesCount}</span>
              <span className="text-[10px] text-slate-400">por revisar</span>
            </div>
          </div>
        </div>

        {/* Metric Card 3: En Revisión */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center gap-3">
          <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-lg shrink-0">
            <Eye className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">En Revisión</p>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-extrabold text-slate-800">{enRevisionCount}</span>
              <span className="text-[10px] text-slate-400">en proceso</span>
            </div>
          </div>
        </div>

        {/* Metric Card 4: Aprobados */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center gap-3">
          <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg shrink-0">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider text-emerald-600">Aprobados</p>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-extrabold text-slate-800">{aprobadosCount}</span>
              <span className="text-[10px] text-slate-400">de {totalUnits}</span>
            </div>
          </div>
        </div>

        {/* Metric Card 5: Rechazados */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center gap-3 col-span-2 lg:col-span-1">
          <div className="p-2.5 bg-red-50 text-red-600 rounded-lg shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Rechazados</p>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-extrabold text-slate-800">{rechazadosCount}</span>
              <span className="text-[10px] text-slate-400">observaciones</span>
            </div>
          </div>
        </div>

      </div>

      {/* 2. Visual Chart & Tower Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Interactive Stacked Bar Chart (5 cols on lg) */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5 mb-1">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              Gráfico de Registros por Torre (Apilado)
            </h3>
            <p className="text-[11px] text-slate-400 mb-4">
              Cada barra representa una torre (A-F). Haz clic para filtrar la base de datos por torre.
            </p>
          </div>

          {/* Stacked Bar Chart Visualization */}
          <div className="flex items-end justify-between h-48 px-2 border-b border-slate-100 pb-2 mb-2">
            {towersList.map((torre) => {
              const m = getTowerMetrics(torre);
              const totalRegs = m.total;
              
              const maxUnits = 10;
              const approvedPct = (m.approved / maxUnits) * 100;
              const revisionPct = (m.revision / maxUnits) * 100;
              const pendingPct = (m.pending / maxUnits) * 100;
              const rejectedPct = (m.rejected / maxUnits) * 100;

              const isFiltered = selectedTorreFilter === torre;

              return (
                <div 
                  key={torre} 
                  onClick={() => setSelectedTorreFilter(selectedTorreFilter === torre ? "All" : torre)}
                  className={`flex flex-col items-center cursor-pointer transition-all duration-200 group relative w-10 md:w-12 ${
                    selectedTorreFilter !== "All" && !isFiltered ? "opacity-40 scale-95" : "opacity-100 scale-100"
                  }`}
                >
                  {/* Tooltip on Hover */}
                  <div className="absolute bottom-full mb-2 bg-slate-800 text-white text-[10px] rounded-lg px-2.5 py-1.5 shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-150 z-20 w-32 text-center">
                    <p className="font-bold border-b border-slate-700 pb-0.5 mb-1">Torre {torre}</p>
                    <div className="text-left space-y-0.5">
                      <div className="flex justify-between text-emerald-400"><span>Aprobados:</span> <span>{m.approved}</span></div>
                      <div className="flex justify-between text-indigo-300"><span>Revisión:</span> <span>{m.revision}</span></div>
                      <div className="flex justify-between text-amber-300"><span>Pendientes:</span> <span>{m.pending}</span></div>
                      <div className="flex justify-between text-red-400"><span>Rechazados:</span> <span>{m.rejected}</span></div>
                      <div className="flex justify-between border-t border-slate-700 pt-0.5 font-semibold"><span>Total:</span> <span>{totalRegs}/10</span></div>
                    </div>
                  </div>

                  {/* Vertical Bar Cylinder container */}
                  <div className={`w-6 md:w-8 h-36 bg-slate-50 border rounded-lg overflow-hidden flex flex-col justify-end shadow-inner relative transition-colors ${
                    isFiltered ? "border-blue-500 ring-2 ring-blue-500/15" : "border-slate-200"
                  }`}>
                    {/* Stack segment: Pending */}
                    <div 
                      className="bg-amber-400 hover:brightness-105 transition-all" 
                      style={{ height: `${pendingPct}%` }}
                    />
                    {/* Stack segment: Revision */}
                    <div 
                      className="bg-indigo-500 hover:brightness-105 transition-all" 
                      style={{ height: `${revisionPct}%` }}
                    />
                    {/* Stack segment: Rejected */}
                    <div 
                      className="bg-red-500 hover:brightness-105 transition-all" 
                      style={{ height: `${rejectedPct}%` }}
                    />
                    {/* Stack segment: Approved */}
                    <div 
                      className="bg-emerald-500 hover:brightness-105 transition-all" 
                      style={{ height: `${approvedPct}%` }}
                    />
                  </div>

                  <span className={`text-[11px] mt-1.5 font-bold transition-colors ${isFiltered ? "text-blue-600 underline underline-offset-4" : "text-slate-600"}`}>
                    Torre {torre}
                  </span>
                  <span className="text-[9px] text-slate-400 font-semibold">{totalRegs} regs</span>
                </div>
              );
            })}
          </div>

          {/* Chart Legend */}
          <div className="flex justify-center flex-wrap gap-x-3 gap-y-1 text-[9px] text-slate-500 font-medium pt-1">
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 bg-emerald-500 rounded" />
              <span>Aprobado</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 bg-indigo-500 rounded" />
              <span>En Revisión</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 bg-amber-400 rounded" />
              <span>Pendiente</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 bg-red-500 rounded" />
              <span>Rechazado</span>
            </div>
          </div>
        </div>

        {/* Detailed Tower Grid Cards (7 cols on lg) */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5 mb-1">
              <Layers className="w-4 h-4 text-blue-600" />
              Desglose de Acreditación por Torre
            </h3>
            <p className="text-[11px] text-slate-400 mb-4">
              Progreso de propiedad e indiviso acumulado por cada sector del condominio (Torres A-F).
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {towersList.map((torre) => {
              const m = getTowerMetrics(torre);
              const isFiltered = selectedTorreFilter === torre;
              return (
                <div 
                  key={torre}
                  onClick={() => setSelectedTorreFilter(selectedTorreFilter === torre ? "All" : torre)}
                  className={`border p-3 rounded-xl transition-all duration-200 cursor-pointer flex flex-col justify-between text-left ${
                    isFiltered 
                      ? "border-blue-500 bg-blue-50/15 shadow-sm" 
                      : "border-slate-200 hover:border-slate-300 bg-slate-50/20 hover:bg-white"
                  }`}
                >
                  <div>
                    <div className="flex justify-between items-center pb-1 border-b border-slate-100 mb-2">
                      <span className="font-extrabold text-slate-800 text-xs">Torre {torre}</span>
                      <span className="text-[9px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-bold">
                        {m.total}/10 reg
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-[9px] text-slate-400 font-semibold">
                        <span>Progreso</span>
                        <span className="font-bold text-slate-700">{m.progressPercent}%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1 overflow-hidden">
                        <div 
                          className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                          style={{ width: `${m.progressPercent}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 mt-2 flex flex-col gap-1 text-[9px]">
                    <div className="flex justify-between text-slate-500">
                      <span>Indiviso:</span>
                      <span className="font-bold text-slate-700">{m.indivisoSum.toFixed(3)}%</span>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-0.5 mt-1 font-mono text-[8px] text-center">
                      <div className="bg-amber-50 text-amber-700 rounded py-0.5 font-bold">
                        <span>{m.pending} P</span>
                      </div>
                      <div className="bg-indigo-50 text-indigo-700 rounded py-0.5 font-bold">
                        <span>{m.revision} R</span>
                      </div>
                      <div className="bg-red-50 text-red-700 rounded py-0.5 font-bold">
                        <span>{m.rejected} X</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* 3. Database Table and Filters */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
        
        {/* Filter Toolbar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          
          <div className="flex-1 max-w-md relative">
            <Search className="absolute left-3.5 top-2.5 w-4.5 h-4.5 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por Propietario, Departamento, Escritura..."
              className="w-full text-slate-800 bg-slate-50/50 border border-slate-200 pl-10 pr-4 py-2 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-600 transition-all"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            
            {/* Filter by Torre */}
            <div className="flex items-center gap-1">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mr-1">Torre:</span>
              <div className="flex bg-slate-50 p-1 rounded-lg border border-slate-100">
                {["All", "A", "B", "C", "D", "E", "F"].map((t) => (
                  <button
                    key={t}
                    onClick={() => setSelectedTorreFilter(t)}
                    className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-all cursor-pointer ${
                      selectedTorreFilter === t 
                        ? "bg-white text-blue-600 shadow-sm font-bold" 
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    {t === "All" ? "Todas" : t}
                  </button>
                ))}
              </div>
                      {/* Filter by Status */}
            <div className="flex items-center gap-1">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mr-1">Estado:</span>
              <div className="flex bg-slate-50 p-1 rounded-lg border border-slate-100">
                {[
                  { value: "All", label: "Todos" },
                  { value: "Pendiente", label: "Pendientes" },
                  { value: "En Revisión", label: "En Revisión" },
                  { value: "Aprobado", label: "Aprobados" },
                  { value: "Rechazado", label: "Rechazados" }
                ].map((s) => (
                  <button
                    key={s.value}
                    onClick={() => setSelectedStatusFilter(s.value)}
                    className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-all cursor-pointer ${
                      selectedStatusFilter === s.value 
                        ? "bg-white text-blue-600 shadow-sm font-bold" 
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>     </div>

          </div>
        </div>

        {/* Database List Table */}
        <div className="overflow-x-auto">
          {filteredRegs.length > 0 ? (
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Propietario / Residente</th>
                  <th className="py-3 px-4">Unidad (Torre)</th>
                  <th className="py-3 px-4">Documento / Folio</th>
                  <th className="py-3 px-4 text-right">Indiviso</th>
                  <th className="py-3 px-4 text-center">Estado</th>
                  <th className="py-3 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/60 text-xs">
                {filteredRegs.map((reg) => (
                  <tr key={reg.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="py-3.5 px-4 font-medium text-slate-800">
                      <div>
                        <div className="font-bold text-slate-800">{reg.nombre_propietario}</div>
                        <div className="text-[10px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                          <span>{reg.correo_electronico || "Sin correo"}</span>
                          <span>•</span>
                          <span>{reg.telefono_contacto || "Sin teléfono"}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        <span className="bg-indigo-50 border border-indigo-100 text-indigo-700 font-bold px-2 py-0.5 rounded font-mono">
                          Torre {reg.torre}
                        </span>
                        <span className="text-slate-700 font-semibold font-mono">
                          Depto {reg.departamento}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      <div>
                        <div className="font-semibold text-[11px] text-slate-700 flex items-center gap-1">
                          <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          {reg.tipo_documento}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">{reg.numero_escritura_o_contrato}</div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-700">
                      {reg.porcentaje_indiviso}%
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        reg.status === "Aprobado"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                          : reg.status === "En Revisión"
                          ? "bg-indigo-50 text-indigo-700 border border-indigo-100"
                          : reg.status === "Pendiente"
                          ? "bg-amber-50 text-amber-700 border border-amber-100"
                          : "bg-red-50 text-red-700 border border-red-100"
                      }`}>
                        {reg.status === "Aprobado" && <CheckCircle className="w-3 h-3 text-emerald-600" />}
                        {reg.status === "En Revisión" && <Eye className="w-3 h-3 text-indigo-500" />}
                        {reg.status === "Pendiente" && <Clock className="w-3 h-3 animate-spin text-amber-500" />}
                        {reg.status === "Rechazado" && <AlertTriangle className="w-3 h-3 text-red-500" />}
                        {reg.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenDetail(reg)}
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          title="Revisar expediente"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {reg.status !== "Aprobado" && (
                          <button
                            onClick={() => handleQuickApprove(reg.id)}
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                            title="Aprobar rápidamente"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="py-12 text-center text-slate-400">
              <Building2 className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-xs">No se encontraron expedientes con los criterios de búsqueda.</p>
            </div>
          )}
        </div>
      </div>

      {/* 4. Slide-Over Detail & Verification Panel */}
      <AnimatePresence>
        {selectedReg && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedReg(null)}
              className="fixed inset-0 bg-black z-40"
            ></motion.div>

            {/* Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-full max-w-2xl bg-white shadow-2xl z-50 overflow-y-auto flex flex-col"
            >
              
              {/* Header */}
              <div className="bg-slate-900 text-white p-6 flex justify-between items-center shrink-0">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                      Expediente #{selectedReg.id}
                    </span>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      selectedReg.status === "Aprobado"
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                        : selectedReg.status === "En Revisión"
                        ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                        : selectedReg.status === "Pendiente"
                        ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                        : "bg-red-500/20 text-red-300 border border-red-500/30"
                    }`}>
                      {selectedReg.status}
                    </span>
                  </div>
                  <h3 className="text-base font-bold mt-1">Revisión de Acreditación de Propiedad</h3>
                </div>
                <button
                  onClick={() => setSelectedReg(null)}
                  className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 flex-1 space-y-6">

                {/* Submited Document Info Block */}
                <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-indigo-50 text-indigo-700 rounded-xl">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-slate-800 truncate max-w-[280px]">
                        {selectedReg.documentName}
                      </p>
                      <p className="text-[10px] text-slate-400">Tipo de Documento: {selectedReg.tipo_documento}</p>
                    </div>
                  </div>
                  <div className="text-right text-[10px] text-slate-400 font-mono">
                    {new Date(selectedReg.createdAt).toLocaleDateString()}
                  </div>
                </div>

                {/* Action Controls for Admin */}
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3">
                  <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1">
                    <Settings className="w-3.5 h-3.5 text-blue-600" />
                    Controles de Dictaminador
                  </h4>
                  
                  {/* Status Picker Button Group */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <button
                      onClick={() => handleStatusChange("Aprobado")}
                      className={`py-2 px-2.5 text-[11px] font-bold rounded-lg border flex items-center justify-center gap-1 transition-all cursor-pointer ${
                        selectedReg.status === "Aprobado"
                          ? "bg-green-600 border-green-600 text-white shadow-sm"
                          : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      <CheckCircle className="w-3.5 h-3.5" /> Aprobar
                    </button>
                    <button
                      onClick={() => handleStatusChange("En Revisión")}
                      className={`py-2 px-2.5 text-[11px] font-bold rounded-lg border flex items-center justify-center gap-1 transition-all cursor-pointer ${
                        selectedReg.status === "En Revisión"
                          ? "bg-indigo-600 border-indigo-600 text-white shadow-sm"
                          : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      <Eye className="w-3.5 h-3.5 text-indigo-100" /> Revisión
                    </button>
                    <button
                      onClick={() => handleStatusChange("Pendiente")}
                      className={`py-2 px-2.5 text-[11px] font-bold rounded-lg border flex items-center justify-center gap-1 transition-all cursor-pointer ${
                        selectedReg.status === "Pendiente"
                          ? "bg-amber-500 border-amber-500 text-white shadow-sm"
                          : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      <Clock className="w-3.5 h-3.5" /> Pendiente
                    </button>
                    <button
                      onClick={() => handleStatusChange("Rechazado")}
                      className={`py-2 px-2.5 text-[11px] font-bold rounded-lg border flex items-center justify-center gap-1 transition-all cursor-pointer ${
                        selectedReg.status === "Rechazado"
                          ? "bg-red-600 border-red-600 text-white shadow-sm"
                          : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      <AlertTriangle className="w-3.5 h-3.5" /> Rechazar
                    </button>
                  </div>

                  {/* Comments for feedback */}
                  <div className="space-y-1 pt-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      Retroalimentación de la Administración
                    </label>
                    <textarea
                      value={adminComments}
                      onChange={(e) => setAdminComments(e.target.value)}
                      placeholder="Agregue retroalimentación de por qué se aprueba o rechaza el documento..."
                      rows={3}
                      className="w-full text-slate-800 bg-white border border-slate-200 p-3 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-600 transition-colors"
                    />
                  </div>
                </div>

                {/* Form fields review split */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Datos Técnicos Registrados
                    </h4>
                    <button
                      onClick={() => setIsEditingData(!isEditingData)}
                      className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      {isEditingData ? "Cancelar Edición" : "Editar Datos"}
                    </button>
                  </div>

                  {isEditingData ? (
                    /* EDITING GRID */
                    <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-400">Propietario</label>
                        <input
                          type="text"
                          value={editForm.nombre_propietario}
                          onChange={(e) => setEditForm({ ...editForm, nombre_propietario: e.target.value })}
                          className="w-full p-2 border border-slate-200 rounded-lg bg-white"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-400">Tipo Doc</label>
                        <input
                          type="text"
                          value={editForm.tipo_documento}
                          onChange={(e) => setEditForm({ ...editForm, tipo_documento: e.target.value })}
                          className="w-full p-2 border border-slate-200 rounded-lg bg-white"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-400">Torre</label>
                        <select
                          value={editForm.torre}
                          onChange={(e) => setEditForm({ ...editForm, torre: e.target.value as any })}
                          className="w-full p-2 border border-slate-200 rounded-lg bg-white"
                        >
                          <option value="A">Torre A</option>
                          <option value="B">Torre B</option>
                          <option value="C">Torre C</option>
                          <option value="D">Torre D</option>
                          <option value="E">Torre E</option>
                          <option value="F">Torre F</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-400">Departamento</label>
                        <input
                          type="text"
                          value={editForm.departamento}
                          onChange={(e) => setEditForm({ ...editForm, departamento: e.target.value })}
                          className="w-full p-2 border border-slate-200 rounded-lg bg-white"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-400">Indiviso (%)</label>
                        <input
                          type="number"
                          step="0.01"
                          value={editForm.porcentaje_indiviso}
                          onChange={(e) => setEditForm({ ...editForm, porcentaje_indiviso: parseFloat(e.target.value) || 0 })}
                          className="w-full p-2 border border-slate-200 rounded-lg bg-white"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-400">Cajón Estacionamiento</label>
                        <input
                          type="text"
                          value={editForm.cajones_estacionamiento}
                          onChange={(e) => setEditForm({ ...editForm, cajones_estacionamiento: e.target.value })}
                          className="w-full p-2 border border-slate-200 rounded-lg bg-white"
                        />
                      </div>
                      <div className="space-y-1 col-span-2">
                        <label className="text-[10px] text-slate-400">Escritura / Contrato ID</label>
                        <input
                          type="text"
                          value={editForm.numero_escritura_o_contrato}
                          onChange={(e) => setEditForm({ ...editForm, numero_escritura_o_contrato: e.target.value })}
                          className="w-full p-2 border border-slate-200 rounded-lg bg-white"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-400">Fecha Doc</label>
                        <input
                          type="text"
                          value={editForm.fecha_documento}
                          onChange={(e) => setEditForm({ ...editForm, fecha_documento: e.target.value })}
                          className="w-full p-2 border border-slate-200 rounded-lg bg-white"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-400">Notario</label>
                        <input
                          type="text"
                          value={editForm.notario_publico_numero}
                          onChange={(e) => setEditForm({ ...editForm, notario_publico_numero: e.target.value })}
                          className="w-full p-2 border border-slate-200 rounded-lg bg-white"
                        />
                      </div>
                      <div className="space-y-1 col-span-2">
                        <label className="text-[10px] text-slate-400">Nombre Notario / Ciudad</label>
                        <input
                          type="text"
                          value={editForm.notario_nombre_o_ciudad}
                          onChange={(e) => setEditForm({ ...editForm, notario_nombre_o_ciudad: e.target.value })}
                          className="w-full p-2 border border-slate-200 rounded-lg bg-white"
                        />
                      </div>
                      <div className="space-y-1 col-span-2">
                        <label className="text-[10px] text-slate-400">Folio Real Registral</label>
                        <input
                          type="text"
                          value={editForm.folio_real_registro}
                          onChange={(e) => setEditForm({ ...editForm, folio_real_registro: e.target.value })}
                          className="w-full p-2 border border-slate-200 rounded-lg bg-white"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-400">Habitantes</label>
                        <input
                          type="number"
                          value={editForm.numero_habitantes}
                          onChange={(e) => setEditForm({ ...editForm, numero_habitantes: parseInt(e.target.value) || 1 })}
                          className="w-full p-2 border border-slate-200 rounded-lg bg-white"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-400">Vehículos</label>
                        <input
                          type="text"
                          value={editForm.vehiculos}
                          onChange={(e) => setEditForm({ ...editForm, vehiculos: e.target.value })}
                          className="w-full p-2 border border-slate-200 rounded-lg bg-white"
                        />
                      </div>
                      <div className="space-y-1 col-span-2">
                        <label className="text-[10px] text-slate-400">Mascotas</label>
                        <input
                          type="text"
                          value={editForm.mascotas}
                          onChange={(e) => setEditForm({ ...editForm, mascotas: e.target.value })}
                          className="w-full p-2 border border-slate-200 rounded-lg bg-white"
                        />
                      </div>
                    </div>
                  ) : (
                    /* READ ONLY PRESENTATION */
                    <div className="space-y-4">
                      
                      {/* Identity Details */}
                      <div className="border border-slate-200 rounded-xl p-4 space-y-3">
                        <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Identidad y Unidad</h5>
                        <div className="grid grid-cols-2 gap-y-2 text-xs">
                          <div className="text-slate-500">Propietario / Residente:</div>
                          <div className="font-semibold text-slate-800 text-right">{selectedReg.nombre_propietario}</div>
                          
                          <div className="text-slate-500">Unidad:</div>
                          <div className="font-semibold text-slate-800 text-right">Torre {selectedReg.torre} - Depto {selectedReg.departamento}</div>
                          
                          <div className="text-slate-500">Porcentaje de Indiviso:</div>
                          <div className="font-bold text-slate-800 text-right">{selectedReg.porcentaje_indiviso}%</div>

                          <div className="text-slate-500">Cajón Estacionamiento:</div>
                          <div className="font-semibold text-slate-800 text-right">{selectedReg.cajones_estacionamiento}</div>
                        </div>
                      </div>

                      {/* Notarial & Deed Details */}
                      <div className="border border-slate-200 rounded-xl p-4 space-y-3">
                        <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Información de Escritura / Registro</h5>
                        <div className="grid grid-cols-2 gap-y-2 text-xs">
                          <div className="text-slate-500">Nº de Instrumento:</div>
                          <div className="font-mono text-slate-800 text-right">{selectedReg.numero_escritura_o_contrato}</div>
                          
                          <div className="text-slate-500">Fecha del Documento:</div>
                          <div className="font-semibold text-slate-800 text-right">{selectedReg.fecha_documento || "N/A"}</div>
                          
                          <div className="text-slate-500">Notaría Pública:</div>
                          <div className="font-semibold text-slate-800 text-right">{selectedReg.notario_publico_numero || "N/A"}</div>

                          <div className="text-slate-500">Nombre Notario / Ciudad:</div>
                          <div className="font-semibold text-slate-800 text-right">{selectedReg.notario_nombre_o_ciudad || "N/A"}</div>

                          <div className="text-slate-500">Folio Real Registral:</div>
                          <div className="font-mono text-indigo-700 font-semibold text-right">{selectedReg.folio_real_registro || "Sin inscribir"}</div>
                        </div>
                      </div>

                      {/* Habitability details */}
                      <div className="border border-slate-200 rounded-xl p-4 space-y-3">
                        <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Habitabilidad y Servicios</h5>
                        <div className="grid grid-cols-2 gap-y-2 text-xs">
                          <div className="text-slate-500">Nº Habitantes habituales:</div>
                          <div className="font-semibold text-slate-800 text-right">{selectedReg.numero_habitantes}</div>
                          
                          <div className="text-slate-500">Vehículos de Residente:</div>
                          <div className="font-semibold text-slate-800 text-right">{selectedReg.vehiculos || "Ninguno"}</div>
                          
                          <div className="text-slate-500">Mascotas en departamento:</div>
                          <div className="font-semibold text-slate-800 text-right">{selectedReg.mascotas || "Ninguna"}</div>
                        </div>
                      </div>

                    </div>
                  )}
                </div>

              </div>

              {/* Footer */}
              <div className="bg-slate-50 p-4 border-t border-slate-150 flex items-center justify-between shrink-0">
                <button
                  onClick={() => handleDelete(selectedReg.id)}
                  className="flex items-center gap-1 text-red-600 hover:text-red-700 hover:bg-red-50 text-xs px-3 py-2 rounded-lg transition-colors font-semibold cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" /> Eliminar Expediente
                </button>
                
                <button
                  onClick={handleAdminSave}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs px-6 py-2 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Save className="w-4 h-4" /> Guardar Cambios y Cerrar
                </button>
              </div>

            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}
