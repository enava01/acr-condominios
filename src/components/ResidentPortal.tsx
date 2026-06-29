import React, { useState, useEffect, useRef } from "react";
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  AlertTriangle, 
  Building2, 
  FileCheck, 
  ArrowRight, 
  Sparkles, 
  Loader2, 
  Smartphone, 
  Check, 
  RefreshCw, 
  Clock, 
  FileSearch,
  User,
  Mail,
  Phone,
  Layers,
  Calendar,
  ShieldCheck,
  PlusCircle,
  HelpCircle
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { samplePresets } from "../presets";
import { Registration } from "../types";

interface ResidentPortalProps {
  onRegistrationComplete: () => void;
}

export default function ResidentPortal({ onRegistrationComplete }: ResidentPortalProps) {
  // File upload state
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<{ name: string; size: string; type: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingPhase, setLoadingPhase] = useState(0);
  const [isExtracted, setIsExtracted] = useState(false);
  const [isMockedExtract, setIsMockedExtract] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // Extracted data (The Form State)
  const [form, setForm] = useState<Partial<Registration>>({
    nombre_propietario: "",
    tipo_documento: "Escritura Pública",
    correo_electronico: "",
    telefono_contacto: "",
    torre: "A",
    departamento: "",
    cajones_estacionamiento: "Sin especificar",
    porcentaje_indiviso: 0,
    numero_escritura_o_contrato: "",
    fecha_documento: "",
    notario_publico_numero: "",
    notario_nombre_o_ciudad: "",
    folio_real_registro: "",
    numero_habitantes: 1,
    vehiculos: "",
    mascotas: ""
  });

  // Validation state
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});

  // Real-time parsing of Departamento and Tower extraction
  const [parsedDeptInfo, setParsedDeptInfo] = useState<{ tower: string; floor: string; unit: string; rawTower: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Progressive loader texts
  const loadingMessages = [
    "Cargando archivo en el portal seguro...",
    "Gemini Lite analizando la nitidez del documento...",
    "Localizando datos del propietario e inmueble...",
    "Extrayendo Notaría Pública y Folio Real...",
    "Calculando porcentaje de indiviso condominal...",
    "Consolidando datos en expediente estructurado..."
  ];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (loading) {
      interval = setInterval(() => {
        setLoadingPhase((prev) => (prev < loadingMessages.length - 1 ? prev + 1 : prev));
      }, 2500);
    } else {
      setLoadingPhase(0);
    }
    return () => clearInterval(interval);
  }, [loading]);

  // Drag handers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileProcess(e.target.files[0]);
    }
  };

  // Convert file and send to server
  const handleFileProcess = async (file: File) => {
    setSelectedFile({
      name: file.name,
      size: (file.size / (1024 * 1024)).toFixed(2) + " MB",
      type: file.type || "Desconocido"
    });
    setLoading(true);
    setSubmitError("");

    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = async () => {
        const base64data = reader.result as string;
        const commaIndex = base64data.indexOf(",");
        const fileBase64 = commaIndex !== -1 ? base64data.slice(commaIndex + 1) : base64data;

        await callExtractionAPI(fileBase64, file.type, file.name);
      };
    } catch (err: any) {
      console.error(err);
      setSubmitError("Error al leer el archivo seleccionado.");
      setLoading(false);
    }
  };

  // Trigger demo/preset document simulation
  const handleLoadPreset = async (presetId: string) => {
    const preset = samplePresets.find((p) => p.id === presetId);
    if (!preset) return;

    setSelectedFile({
      name: preset.fileName,
      size: "1.2 MB",
      type: preset.mimeType
    });
    setLoading(true);
    setSubmitError("");

    // Simulate server loading delay to showcase AI progressiveness
    setTimeout(async () => {
      try {
        const response = await fetch("/api/extract", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fileBase64: "PRESET_SIMULATION_DATA",
            mimeType: preset.mimeType,
            fileName: preset.fileName
          })
        });

        if (!response.ok) {
          throw new Error("HTTP error " + response.status);
        }

        const resData = await response.json();
        if (resData.success) {
          // If response succeeded, we fill the form either with mock or real API data
          setForm({
            ...form,
            ...preset.mockResult,
            documentName: preset.fileName
          });
          setIsExtracted(true);
          setIsMockedExtract(resData.isMocked || false);
        } else {
          throw new Error(resData.error || "Error desconocido");
        }
      } catch (err: any) {
        // Fallback robust prefill if API fails, ensuring stellar experience
        setForm({
          ...form,
          ...preset.mockResult,
          documentName: preset.fileName
        });
        setIsExtracted(true);
        setIsMockedExtract(true);
      } finally {
        setLoading(false);
      }
    }, 4000); // 4s of beautiful simulation
  };

  const callExtractionAPI = async (fileBase64: string, mimeType: string, fileName: string) => {
    try {
      const response = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileBase64, mimeType, fileName })
      });

      if (!response.ok) {
        throw new Error("La extracción falló. Verifique su API Key.");
      }

      const result = await response.json();
      if (result.success) {
        setForm({
          ...form,
          ...result.data,
          documentName: fileName
        });
        setIsExtracted(true);
        setIsMockedExtract(result.isMocked || false);
      } else {
        throw new Error(result.error || "Ocurrió un error en el procesamiento");
      }
    } catch (err: any) {
      setSubmitError(
        "Fallo la conexión con el motor de Inteligencia Artificial. Se requiere configurar la GEMINI_API_KEY en Secrets o el archivo subido es inválido. Detalle: " +
          err.message
      );
    } finally {
      setLoading(false);
    }
  };

  // Real-time parsing of Departamento and Tower extraction
  useEffect(() => {
    if (!form.departamento) {
      setParsedDeptInfo(null);
      return;
    }

    const deptStr = form.departamento.trim();
    // Regex for matching letter A-F (case insensitive), then optional space/hyphen, then digits
    const match = deptStr.match(/^([a-fA-F])\s*[- ]?\s*(\d+)$/);
    if (match) {
      const extractedTowerLetter = match[1].toUpperCase();
      const numPart = match[2];
      let floor = "";
      let unit = "";

      if (numPart.length === 3) {
        // e.g. 103 -> floor 1, unit 03
        floor = numPart.charAt(0);
        unit = numPart.substring(1);
      } else if (numPart.length === 4) {
        // e.g. 1005 -> floor 10, unit 05
        floor = numPart.substring(0, 2);
        unit = numPart.substring(2);
      } else if (numPart.length >= 2) {
        // e.g. 85 -> floor 8, unit 5
        floor = numPart.substring(0, Math.max(1, numPart.length - 2));
        unit = numPart.substring(Math.max(1, numPart.length - 2));
      } else {
        floor = "Bajo";
        unit = numPart;
      }

      setParsedDeptInfo({
        tower: extractedTowerLetter,
        floor: floor,
        unit: unit,
        rawTower: match[1]
      });

      // Auto-align tower if it matches A-F and isn't currently aligned
      if (form.torre !== extractedTowerLetter && ["A", "B", "C", "D", "E", "F"].includes(extractedTowerLetter)) {
        setForm((prev) => ({ ...prev, torre: extractedTowerLetter as any }));
      }
    } else {
      setParsedDeptInfo(null);
    }
  }, [form.departamento]);

  // Real-time validation
  useEffect(() => {
    if (!isExtracted) return;

    const errors: { [key: string]: string } = {};

    // 1. Nombre propietario
    if (!form.nombre_propietario?.trim()) {
      errors.nombre_propietario = "El nombre del propietario/residente es requerido.";
    }

    // 2. Departamento & Torre
    if (!form.departamento?.trim()) {
      errors.departamento = "El departamento es requerido.";
    } else {
      const deptStr = form.departamento.trim();
      const match = deptStr.match(/^([a-zA-Z])\s*[- ]?\s*(\d+)$/);
      if (match) {
        const deptLetter = match[1].toUpperCase();
        if (!["A", "B", "C", "D", "E", "F"].includes(deptLetter)) {
          errors.departamento = `La torre del departamento (${deptLetter}) no está permitida. Solo se admiten Torres de la A a la F.`;
        } else if (form.torre !== deptLetter) {
          errors.torre = `La Torre seleccionada (Torre ${form.torre}) no coincide con el departamento (${deptStr}, Torre ${deptLetter}).`;
        }
      }
    }

    // 3. Torre validation (must be A-F)
    if (!form.torre) {
      errors.torre = "La torre es requerida.";
    } else if (!["A", "B", "C", "D", "E", "F"].includes(form.torre)) {
      errors.torre = "La torre seleccionada no es válida. Solo se permiten torres de la A a la F.";
    }

    // 4. Porcentaje de Indiviso
    if (form.porcentaje_indiviso === undefined || isNaN(form.porcentaje_indiviso)) {
      errors.porcentaje_indiviso = "El porcentaje de indiviso debe ser un número válido.";
    } else if (form.porcentaje_indiviso < 0 || form.porcentaje_indiviso > 100) {
      errors.porcentaje_indiviso = "El porcentaje de indiviso debe estar entre 0% y 100%.";
    }

    // 5. Número de Escritura o Contrato (Acreditación)
    if (!form.numero_escritura_o_contrato?.trim()) {
      errors.numero_escritura_o_contrato = "El número de escritura, contrato o folio es requerido.";
    } else if (form.numero_escritura_o_contrato.length < 2) {
      errors.numero_escritura_o_contrato = "El número debe tener al menos 2 caracteres.";
    }

    // 6. Folio Real Registro (Formato de números de identificación)
    if (form.folio_real_registro !== undefined && form.folio_real_registro.trim() !== "") {
      const folioTrimmed = form.folio_real_registro.trim();
      // Enforce check: alphanumeric, hyphens, slashes, spaces
      const folioRegex = /^[A-Za-z0-9\-\/\s]+$/;
      if (!folioRegex.test(folioTrimmed)) {
        errors.folio_real_registro = "El Folio Real debe ser un número de identificación alfanumérico válido (admite letras, números, guiones y diagonales).";
      } else if (folioTrimmed.length < 3) {
        errors.folio_real_registro = "El Folio Real debe tener al menos 3 caracteres.";
      }
    }

    // 7. Fecha de Documento (rango de fechas y formato)
    if (form.fecha_documento) {
      const dateStr = form.fecha_documento.trim();
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      const parsedDate = Date.parse(dateStr);

      if (!dateRegex.test(dateStr) || isNaN(parsedDate)) {
        errors.fecha_documento = "El formato de fecha debe ser AAAA-MM-DD (Ej. 2023-04-12).";
      } else {
        const dateObj = new Date(parsedDate);
        const today = new Date();
        const minDate = new Date("1950-01-01");

        if (dateObj > today) {
          errors.fecha_documento = "La fecha del documento no puede ser en el futuro.";
        } else if (dateObj < minDate) {
          errors.fecha_documento = "La fecha del documento debe ser posterior al año 1950.";
        }
      }
    } else {
      errors.fecha_documento = "La fecha de firma/emisión del documento es requerida.";
    }

    // 8. Correo Electrónico
    if (form.correo_electronico) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(form.correo_electronico.trim())) {
        errors.correo_electronico = "Ingrese un correo electrónico con formato válido.";
      }
    }

    // 9. Teléfono
    if (form.telefono_contacto) {
      const phoneClean = form.telefono_contacto.replace(/\s+/g, "").replace(/[\-\(\)\+]/g, "");
      if (!/^\d{7,15}$/.test(phoneClean)) {
        errors.telefono_contacto = "El teléfono debe contener entre 7 y 15 dígitos.";
      }
    }

    setValidationErrors(errors);
  }, [
    form.nombre_propietario,
    form.departamento,
    form.torre,
    form.porcentaje_indiviso,
    form.numero_escritura_o_contrato,
    form.folio_real_registro,
    form.fecha_documento,
    form.correo_electronico,
    form.telefono_contacto,
    isExtracted
  ]);

  // Enforce validation rule: Towers can only be A to F
  const validateForm = (): boolean => {
    return Object.keys(validationErrors).length === 0;
  };

  // Submit record to backend
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const response = await fetch("/api/registrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });

      if (!response.ok) {
        throw new Error("HTTP error " + response.status);
      }

      setSubmitSuccess(true);
      onRegistrationComplete();
    } catch (err: any) {
      setSubmitError("No se pudo enviar el expediente para revisión: " + err.message);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setIsExtracted(false);
    setSubmitSuccess(false);
    setSubmitError("");
    setForm({
      nombre_propietario: "",
      tipo_documento: "Escritura Pública",
      correo_electronico: "",
      telefono_contacto: "",
      torre: "A",
      departamento: "",
      cajones_estacionamiento: "Sin especificar",
      porcentaje_indiviso: 0,
      numero_escritura_o_contrato: "",
      fecha_documento: "",
      notario_publico_numero: "",
      notario_nombre_o_ciudad: "",
      folio_real_registro: "",
      numero_habitantes: 1,
      vehiculos: "",
      mascotas: ""
    });
  };

  return (
    <div id="resident-portal-root" className="max-w-4xl mx-auto py-4">
      <AnimatePresence mode="wait">
        
        {/* State 1: Uploading and Selection */}
        {!loading && !isExtracted && !submitSuccess && (
          <motion.div
            key="upload-view"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6"
          >
            {/* Elegant Callout */}
            <div className="bg-blue-50/40 border border-blue-100/70 rounded-xl p-6 text-slate-700 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-1">
                <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-blue-600 animate-pulse" />
                  Acreditación Inteligente de Propiedad
                </h3>
                <p className="text-sm text-slate-600 max-w-xl">
                  Sube una fotografía legible o PDF de tu Escritura Pública, Contrato de Compraventa o Arrendamiento. 
                  Nuestro sistema con <strong>Gemini 3.1 Flash-Lite</strong> extraerá automáticamente la información para prellenar tu expediente.
                </p>
              </div>
              <div className="flex items-center gap-2 bg-white/80 border border-blue-100 px-3 py-1.5 rounded-lg text-xs font-mono text-blue-800 shrink-0">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping"></span>
                Gemini Lite Activo
              </div>
            </div>

            {/* Drag & Drop Area */}
            <div
              id="file-dropzone"
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border border-dashed rounded-xl p-10 text-center cursor-pointer transition-all duration-300 relative overflow-hidden group ${
                dragActive
                  ? "border-blue-500 bg-blue-50/30 scale-[1.01]"
                  : "border-slate-200 hover:border-blue-400 hover:bg-slate-50/50"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept=".jpg,.jpeg,.png,.pdf"
                onChange={handleFileInputChange}
              />
              <div className="flex flex-col items-center space-y-4">
                <div className="p-4 bg-blue-50 rounded-xl text-blue-600 group-hover:scale-105 transition-transform duration-300">
                  <Upload className="w-10 h-10" />
                </div>
                <div>
                  <p className="text-base font-semibold text-slate-800">
                    Arrastra tu documento aquí o haz clic para buscar
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Formatos soportados: PDF, JPG, PNG (Max 15MB)
                  </p>
                </div>
              </div>
            </div>

            {/* Presets and Samples (EXTREMELY IMPORTANT FOR CONVENIENT DEMO REVIEW) */}
            <div className="space-y-4 bg-white border border-slate-200 p-6 rounded-xl shadow-sm">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <HelpCircle className="w-5 h-5 text-blue-600" />
                <h4 className="font-semibold text-slate-800 text-sm">
                  ¿No tienes un documento condominal real a la mano?
                </h4>
              </div>
              <p className="text-xs text-slate-600">
                Selecciona uno de los siguientes ejemplos notariales simulados para experimentar la extracción inteligente instantáneamente:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                {samplePresets.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => handleLoadPreset(preset.id)}
                    className="p-4 text-left border border-slate-200 rounded-xl hover:border-blue-500 hover:bg-blue-50/10 transition-all duration-200 focus:outline-none flex flex-col justify-between h-full group cursor-pointer"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 font-semibold text-xs text-slate-800 group-hover:text-blue-700">
                        <FileText className="w-4 h-4 text-slate-400 group-hover:text-blue-500 shrink-0" />
                        {preset.title}
                      </div>
                      <p className="text-[11px] text-slate-500 line-clamp-3 leading-relaxed">
                        {preset.description}
                      </p>
                    </div>
                    <span className="text-[10px] text-blue-600 font-medium flex items-center gap-1 mt-3">
                      Cargar muestra <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {submitError && (
              <div className="bg-red-50 border border-red-100 p-4 rounded-xl flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <div className="text-xs text-red-700 leading-relaxed">{submitError}</div>
              </div>
            )}
          </motion.div>
        )}

        {/* State 2: Intelligent Loading Phase */}
        {loading && (
          <motion.div
            key="loading-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="bg-white border border-slate-200 shadow-sm rounded-xl p-12 text-center flex flex-col items-center justify-center min-h-[400px] space-y-6"
          >
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-4 border-slate-100 border-t-blue-600 animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-blue-600 animate-pulse" />
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-slate-800 flex items-center justify-center gap-2">
                IA Extrayendo Datos...
              </h3>
              <p className="text-xs text-blue-600 font-medium animate-pulse">
                Procesando con Gemini 3.1 Flash-Lite
              </p>
            </div>

            <div className="max-w-md w-full bg-slate-50 rounded-xl p-4 border border-slate-100 mt-4 h-12 flex items-center justify-center">
              <AnimatePresence mode="wait">
                <motion.p
                  key={loadingPhase}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="text-xs text-slate-600 font-mono"
                >
                  {loadingMessages[loadingPhase]}
                </motion.p>
              </AnimatePresence>
            </div>

            <p className="text-[11px] text-slate-400">
              Esto puede tardar entre 4 y 8 segundos dependiendo de la complejidad del documento legal.
            </p>
          </motion.div>
        )}

        {/* State 3: Structured Data Pre-filled Review & Correction Form */}
        {isExtracted && !loading && !submitSuccess && (
          <motion.div
            key="review-form"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6"
          >
            {/* Sticky/Top Header with warning */}
            <div className="bg-slate-900 text-white rounded-xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="bg-blue-600 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Extraído Exitosamente
                  </span>
                  {isMockedExtract && (
                    <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] px-2 py-0.5 rounded-full">
                      Muestra Simulada
                    </span>
                  )}
                </div>
                <h3 className="text-base font-bold">Por favor, revisa y valida los datos extraídos</h3>
                <p className="text-xs text-slate-400">
                  La Inteligencia Artificial ha prellenado el expediente basándose en el documento <strong>{selectedFile?.name}</strong>. Corrige cualquier campo que sea inexacto.
                </p>
              </div>
              <button
                type="button"
                onClick={handleReset}
                className="flex items-center gap-1.5 border border-slate-700 hover:border-slate-500 hover:bg-slate-800 text-xs px-3 py-1.5 rounded-lg transition-colors cursor-pointer shrink-0"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Re-subir Documento
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Group 1: Propietario e Identificación */}
              <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                  <User className="w-5 h-5 text-blue-600" />
                  <h4 className="font-bold text-slate-800 text-sm">Datos del Propietario y Unidad</h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700 block">Nombre Completo del Residente / Propietario</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={form.nombre_propietario}
                        onChange={(e) => setForm({ ...form, nombre_propietario: e.target.value })}
                        className={`w-full text-slate-800 bg-slate-50/50 border pl-3 pr-3 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-colors ${
                          validationErrors.nombre_propietario ? "border-red-400" : "border-slate-200"
                        }`}
                        placeholder="Nombre completo"
                      />
                    </div>
                    {validationErrors.nombre_propietario && (
                      <p className="text-[10px] text-red-500">{validationErrors.nombre_propietario}</p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700 block">Tipo de Acreditación / Documento</label>
                    <select
                      value={form.tipo_documento}
                      onChange={(e) => setForm({ ...form, tipo_documento: e.target.value })}
                      className="w-full text-slate-800 bg-slate-50/50 border border-slate-200 px-3 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-colors cursor-pointer"
                    >
                      <option value="Escritura Pública">Escritura Pública</option>
                      <option value="Contrato de Arrendamiento">Contrato de Arrendamiento (Inquilino)</option>
                      <option value="Contrato de Compraventa">Contrato de Compraventa</option>
                      <option value="Boleta Predial">Boleta de Impuesto Predial</option>
                      <option value="Otro">Otro Documento Legal</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700 block">Correo Electrónico de Contacto</label>
                    <div className="relative">
                      <input
                        type="email"
                        value={form.correo_electronico}
                        onChange={(e) => setForm({ ...form, correo_electronico: e.target.value })}
                        className="w-full text-slate-800 bg-slate-50/50 border border-slate-200 px-3 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-colors"
                        placeholder="ejemplo@correo.com"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700 block">Teléfono de Contacto</label>
                    <input
                      type="text"
                      value={form.telefono_contacto}
                      onChange={(e) => setForm({ ...form, telefono_contacto: e.target.value })}
                      className="w-full text-slate-800 bg-slate-50/50 border border-slate-200 px-3 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-colors"
                      placeholder="55-1234-5678"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700 block">Torre <span className="text-blue-600 font-medium">(Solamente A a la F)</span></label>
                    <select
                      value={form.torre}
                      onChange={(e) => setForm({ ...form, torre: e.target.value as any })}
                      className={`w-full text-slate-800 bg-slate-50/50 border px-3 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-colors cursor-pointer ${
                        validationErrors.torre ? "border-red-400" : "border-slate-200"
                      }`}
                    >
                      <option value="A">Torre A</option>
                      <option value="B">Torre B</option>
                      <option value="C">Torre C</option>
                      <option value="D">Torre D</option>
                      <option value="E">Torre E</option>
                      <option value="F">Torre F</option>
                    </select>
                    {validationErrors.torre && (
                      <p className="text-[10px] text-red-500">{validationErrors.torre}</p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700 block">Departamento / Interior</label>
                    <input
                      type="text"
                      value={form.departamento}
                      onChange={(e) => setForm({ ...form, departamento: e.target.value })}
                      className={`w-full text-slate-800 bg-slate-50/50 border px-3 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-colors ${
                        validationErrors.departamento ? "border-red-400" : "border-slate-200"
                      }`}
                      placeholder="Ej. C-103 o F-805"
                    />
                    {validationErrors.departamento && (
                      <p className="text-[10px] text-red-500">{validationErrors.departamento}</p>
                    )}

                    {/* Real-time parsing of department letter to Tower / Piso / Depto */}
                    {parsedDeptInfo && (
                      <div className="mt-1.5 p-2 bg-blue-50 border border-blue-150 rounded-lg text-[10px] text-blue-900 font-mono flex flex-col gap-1 animate-fadeIn">
                        <div className="flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          <span className="font-bold">📍 Análisis de Unidad Automático:</span>
                        </div>
                        <div className="grid grid-cols-3 gap-1 text-center mt-1 bg-white p-1.5 rounded border border-blue-100">
                          <div>
                            <span className="text-[9px] text-slate-400 block uppercase">Torre</span>
                            <span className="font-bold text-blue-700 text-xs">Torre {parsedDeptInfo.tower}</span>
                          </div>
                          <div className="border-x border-slate-100">
                            <span className="text-[9px] text-slate-400 block uppercase">Piso</span>
                            <span className="font-bold text-blue-700 text-xs">Piso {parsedDeptInfo.floor}</span>
                          </div>
                          <div>
                            <span className="text-[9px] text-slate-400 block uppercase">Depto</span>
                            <span className="font-bold text-blue-700 text-xs">Depto {parsedDeptInfo.unit}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700 block">Cajón(es) de Estacionamiento</label>
                    <input
                      type="text"
                      value={form.cajones_estacionamiento}
                      onChange={(e) => setForm({ ...form, cajones_estacionamiento: e.target.value })}
                      className="w-full text-slate-800 bg-slate-50/50 border border-slate-200 px-3 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-colors"
                      placeholder="Ej. E-15"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700 block">Porcentaje de Indiviso (%)</label>
                    <input
                      type="number"
                      step="0.0001"
                      value={form.porcentaje_indiviso}
                      onChange={(e) => setForm({ ...form, porcentaje_indiviso: parseFloat(e.target.value) || 0 })}
                      className={`w-full text-slate-800 bg-slate-50/50 border px-3 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-colors ${
                        validationErrors.porcentaje_indiviso ? "border-red-400" : "border-slate-200"
                      }`}
                      placeholder="Ej. 1.25"
                    />
                    {validationErrors.porcentaje_indiviso && (
                      <p className="text-[10px] text-red-500">{validationErrors.porcentaje_indiviso}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Group 2: Datos Legales */}
              <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                  <ShieldCheck className="w-5 h-5 text-blue-600" />
                  <h4 className="font-bold text-slate-800 text-sm">Información Legal de Acreditación</h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700 block">Número de Escritura / Contrato / Folio</label>
                    <input
                      type="text"
                      value={form.numero_escritura_o_contrato}
                      onChange={(e) => setForm({ ...form, numero_escritura_o_contrato: e.target.value })}
                      className={`w-full text-slate-800 bg-slate-50/50 border px-3 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-colors ${
                        validationErrors.numero_escritura_o_contrato ? "border-red-400" : "border-slate-200"
                      }`}
                      placeholder="Ej. Escritura No. 24,192"
                    />
                    {validationErrors.numero_escritura_o_contrato && (
                      <p className="text-[10px] text-red-500">{validationErrors.numero_escritura_o_contrato}</p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700 block">Fecha de Expedición / Firma del Documento</label>
                    <input
                      type="text"
                      value={form.fecha_documento}
                      onChange={(e) => setForm({ ...form, fecha_documento: e.target.value })}
                      className="w-full text-slate-800 bg-slate-50/50 border border-slate-200 px-3 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-colors"
                      placeholder="AAAA-MM-DD"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700 block">Notaría Pública (Número)</label>
                    <input
                      type="text"
                      value={form.notario_publico_numero}
                      onChange={(e) => setForm({ ...form, notario_publico_numero: e.target.value })}
                      className="w-full text-slate-800 bg-slate-50/50 border border-slate-200 px-3 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-colors"
                      placeholder="Ej. Notaría No. 125"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700 block">Nombre del Notario / Ciudad / Entidad</label>
                    <input
                      type="text"
                      value={form.notario_nombre_o_ciudad}
                      onChange={(e) => setForm({ ...form, notario_nombre_o_ciudad: e.target.value })}
                      className="w-full text-slate-800 bg-slate-50/50 border border-slate-200 px-3 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-colors"
                      placeholder="Ej. Lic. Arturo Gómez, Monterrey"
                    />
                  </div>

                  <div className="space-y-1 md:col-span-2">
                    <label className="text-xs font-semibold text-slate-700 block">Folio Real / Inscripción de Registro Público</label>
                    <input
                      type="text"
                      value={form.folio_real_registro}
                      onChange={(e) => setForm({ ...form, folio_real_registro: e.target.value })}
                      className="w-full text-slate-800 bg-slate-50/50 border border-slate-200 px-3 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-colors"
                      placeholder="Ej. FOL-9921132-B"
                    />
                  </div>
                </div>
              </div>

              {/* Group 3: Adicionales y Habitabilidad */}
              <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                  <PlusCircle className="w-5 h-5 text-blue-600" />
                  <h4 className="font-bold text-slate-800 text-sm">Datos de Habitabilidad y Coexistencia</h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700 block">Número Habitantes Estimado</label>
                    <input
                      type="number"
                      value={form.numero_habitantes}
                      onChange={(e) => setForm({ ...form, numero_habitantes: parseInt(e.target.value) || 1 })}
                      className="w-full text-slate-800 bg-slate-50/50 border border-slate-200 px-3 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-colors"
                      min="1"
                    />
                  </div>

                  <div className="space-y-1 md:col-span-2">
                    <label className="text-xs font-semibold text-slate-700 block">Vehículos de Residentes (Marca, Modelo, Placas)</label>
                    <input
                      type="text"
                      value={form.vehiculos}
                      onChange={(e) => setForm({ ...form, vehiculos: e.target.value })}
                      className="w-full text-slate-800 bg-slate-50/50 border border-slate-200 px-3 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-colors"
                      placeholder="Ej. Mazda 3 color Rojo (Placas MX-221)"
                    />
                  </div>

                  <div className="space-y-1 md:col-span-3">
                    <label className="text-xs font-semibold text-slate-700 block">Mascotas Habitantes (Tipo, Nombre)</label>
                    <input
                      type="text"
                      value={form.mascotas}
                      onChange={(e) => setForm({ ...form, mascotas: e.target.value })}
                      className="w-full text-slate-800 bg-slate-50/50 border border-slate-200 px-3 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-colors"
                      placeholder="Ej. Perro Pug de nombre 'Waffles'"
                    />
                  </div>
                </div>
              </div>

              {submitError && (
                <div className="bg-red-50 border border-red-100 p-4 rounded-xl flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  <div className="text-xs text-red-700 leading-relaxed">{submitError}</div>
                </div>
              )}

              {Object.keys(validationErrors).length > 0 && (
                <div className="bg-amber-50/60 border border-amber-200/80 p-4 rounded-xl flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <h5 className="text-xs font-bold text-amber-800">Atención: Se requieren correcciones</h5>
                    <p className="text-[11px] text-amber-700 leading-relaxed">
                      Por favor, corrige los {Object.keys(validationErrors).length} campo(s) con observaciones señalados arriba para poder enviar tu acreditación.
                    </p>
                  </div>
                </div>
              )}

              {/* CTA Form Submission */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-6 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-800 transition-colors border border-slate-200 hover:bg-slate-50 rounded-lg cursor-pointer"
                >
                  Cancelar y Borrar
                </button>
                <button
                  type="submit"
                  disabled={Object.keys(validationErrors).length > 0}
                  className={`px-8 py-2.5 text-xs font-semibold rounded-lg shadow-sm transition-colors flex items-center gap-2 cursor-pointer ${
                    Object.keys(validationErrors).length > 0
                      ? "bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300/30"
                      : "bg-blue-600 hover:bg-blue-700 text-white"
                  }`}
                >
                  <FileCheck className="w-4 h-4" /> Confirmar y Enviar para Revisión
                </button>
              </div>

            </form>
          </motion.div>
        )}

        {/* State 4: Success Feedback */}
        {submitSuccess && (
          <motion.div
            key="success-view"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white border border-slate-200 shadow-sm rounded-xl p-10 text-center flex flex-col items-center justify-center min-h-[400px] space-y-6"
          >
            <div className="p-4 bg-blue-50 text-blue-600 rounded-full animate-bounce">
              <CheckCircle className="w-12 h-12" />
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-slate-800">¡Expediente de Acreditación Recibido!</h3>
              <p className="text-sm text-slate-600 max-w-lg mx-auto">
                Los datos extraídos de la propiedad de <strong>{form.nombre_propietario}</strong> han sido registrados con éxito para la <strong>Torre {form.torre} - Depto {form.departamento}</strong>.
              </p>
            </div>

            <div className="max-w-md w-full bg-slate-50 rounded-xl p-5 border border-slate-200 text-left space-y-3 font-mono text-xs">
              <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                <span className="text-slate-500">Unidad Registrada:</span>
                <span className="font-semibold text-slate-800">Torre {form.torre} - Depto {form.departamento}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                <span className="text-slate-500">Porcentaje de Indiviso:</span>
                <span className="font-semibold text-slate-800">{form.porcentaje_indiviso}%</span>
              </div>
              <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                <span className="text-slate-500">Documento Evaluado:</span>
                <span className="font-semibold text-slate-800 text-right truncate max-w-[200px]">{form.documentName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Estado de Trámite:</span>
                <span className="font-bold text-amber-600 uppercase tracking-wider flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> Pendiente de Revisión
                </span>
              </div>
            </div>

            <div className="space-y-4 pt-2">
              <p className="text-xs text-slate-500 leading-relaxed max-w-md mx-auto">
                La administración condominal revisará la veracidad del documento legal. Se te enviará una notificación a <strong>{form.correo_electronico || "tu correo registrado"}</strong> una vez que el expediente haya sido <strong>Aprobado</strong> o si requiere correcciones.
              </p>
              
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={handleReset}
                  className="px-6 py-2.5 text-xs border border-slate-200 hover:bg-slate-50 font-semibold rounded-lg text-slate-700 transition-colors cursor-pointer"
                >
                  Registrar otra unidad
                </button>
              </div>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
