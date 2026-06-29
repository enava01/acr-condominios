import React, { useState, useEffect } from "react";
import { 
  Building2, 
  Users, 
  ShieldCheck, 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  FileCheck2,
  Sparkles,
  HelpCircle
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import ResidentPortal from "./components/ResidentPortal";
import AdminDashboard from "./components/AdminDashboard";
import { Registration } from "./types";

export default function App() {
  const [activeTab, setActiveTab] = useState<"residente" | "admin">("residente");
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch registrations from Express server JSON DB
  const fetchRegistrations = async () => {
    try {
      const response = await fetch("/api/registrations");
      if (!response.ok) {
        throw new Error("HTTP error " + response.status);
      }
      const data = await response.json();
      setRegistrations(data);
      setError("");
    } catch (err: any) {
      console.error("Error fetching registrations:", err);
      setError("No se pudo conectar con el servidor para obtener los expedientes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, []);

  // Update a registration status or comments
  const handleUpdateRegistration = async (id: string, updatedFields: Partial<Registration>) => {
    try {
      const response = await fetch(`/api/registrations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedFields)
      });

      if (!response.ok) {
        throw new Error("HTTP error " + response.status);
      }

      // Re-fetch to synchronize state
      await fetchRegistrations();
    } catch (err) {
      console.error("Error updating registration:", err);
      alert("Ocurrió un error al intentar actualizar el registro en el servidor.");
    }
  };

  // Delete a registration
  const handleDeleteRegistration = async (id: string) => {
    try {
      const response = await fetch(`/api/registrations/${id}`, {
        method: "DELETE"
      });

      if (!response.ok) {
        throw new Error("HTTP error " + response.status);
      }

      // Re-fetch to synchronize state
      await fetchRegistrations();
    } catch (err) {
      console.error("Error deleting registration:", err);
      alert("Ocurrió un error al intentar eliminar el registro.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col">
      
      {/* Premium Navigation Header */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-4 py-3 shadow-sm shrink-0">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Logo & Branding */}
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-600 text-white rounded-xl shadow-sm flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="font-display font-bold text-sm text-slate-900 tracking-tight">
                  Condominio Residencial Vista Hermosa
                </h1>
                <span className="bg-blue-50 text-blue-700 text-[10px] font-bold px-1.5 py-0.5 rounded border border-blue-100">
                  Acreditación
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">Plataforma de Control de Propiedad</p>
            </div>
          </div>

          {/* Interactive Sliding Toggle Tab (using motion/react) */}
          <div className="relative flex bg-slate-100 p-1 rounded-xl border border-slate-200/50">
            
            {/* Resident Button */}
            <button
              onClick={() => setActiveTab("residente")}
              className={`relative z-10 px-5 py-2 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
                activeTab === "residente" ? "text-slate-900" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Users className="w-4 h-4" />
              Soy Residente
            </button>

            {/* Administrator Button */}
            <button
              onClick={() => setActiveTab("admin")}
              className={`relative z-10 px-5 py-2 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
                activeTab === "admin" ? "text-slate-900" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              Administración
              {registrations.filter(r => r.status === "Pendiente").length > 0 && (
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
              )}
            </button>

            {/* Animated Slidnig Background Pill */}
            <motion.div
              layoutId="activeRoleTab"
              className="absolute top-1 bottom-1 bg-white rounded-lg shadow-sm border border-slate-200/40"
              initial={false}
              transition={{ type: "spring", stiffness: 380, damping: 30 }}
              style={{
                left: activeTab === "residente" ? "4px" : "132px",
                width: activeTab === "residente" ? "124px" : "138px"
              }}
            />
          </div>

        </div>
      </header>

      {/* Main Container Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 md:py-8">
        
        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[400px] space-y-3">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            <p className="text-xs text-slate-500 font-mono">Cargando base de datos del condominio...</p>
          </div>
        ) : error ? (
          <div className="max-w-md mx-auto bg-white border border-slate-200 rounded-xl p-6 text-center space-y-4 shadow-sm">
            <div className="p-3 bg-red-50 text-red-600 rounded-full w-12 h-12 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-slate-800 text-sm">Error de Comunicación</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{error}</p>
            </div>
            <button
              onClick={() => {
                setLoading(true);
                fetchRegistrations();
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-5 py-2 rounded-lg transition-all cursor-pointer"
            >
              Reintentar Conexión
            </button>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              {activeTab === "residente" ? (
                <ResidentPortal onRegistrationComplete={fetchRegistrations} />
              ) : (
                <AdminDashboard 
                  registrations={registrations} 
                  onUpdateRegistration={handleUpdateRegistration}
                  onDeleteRegistration={handleDeleteRegistration}
                />
              )}
            </motion.div>
          </AnimatePresence>
        )}

      </main>

      {/* Clean Aesthetic Footer */}
      <footer className="bg-white border-t border-slate-200/80 py-4 px-4 text-center text-[10px] text-slate-400 font-mono shrink-0">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2">
          <span>Vista Hermosa Condominios © 2026 • Registro Legal de Propietarios</span>
          <span className="flex items-center gap-1">
            Desarrollado con <Sparkles className="w-3.5 h-3.5 text-blue-500" /> Gemini 3.1 Flash-Lite
          </span>
        </div>
      </footer>

    </div>
  );
}
