import { PresetDocument } from "./types";

// We store base64 strings or simple mock configurations for our presets
export const samplePresets: PresetDocument[] = [
  {
    id: "preset-escritura",
    title: "Muestra 1: Escritura Pública (Propiedad)",
    description: "Escritura pública mexicana No. 124,502 del Lic. Alejandro Ortiz (CDMX) para departamento en Torre C - Depto 304 con 1.34% de indiviso.",
    fileName: "escritura_publica_muestra_124502.pdf",
    mimeType: "application/pdf",
    fileBase64: "JVBERi0xLjQKJ...[MOCK_PDF_BASE64]...", // shortened for utility, our server handles this gracefully
    mockResult: {
      nombre_propietario: "Elena Rostova Soler",
      tipo_documento: "Escritura Pública",
      correo_electronico: "elena.rostova@gmail.com",
      telefono_contacto: "555-400-2011",
      torre: "C",
      departamento: "304",
      cajones_estacionamiento: "C-12",
      porcentaje_indiviso: 1.34,
      numero_escritura_o_contrato: "Escritura No. 124,502",
      fecha_documento: "2023-04-12",
      notario_publico_numero: "Notaría Pública No. 202",
      notario_nombre_o_ciudad: "Lic. Alejandro Ortiz, CDMX",
      folio_real_registro: "FOLIO-77402-MX",
      numero_habitantes: 2,
      vehiculos: "Mazda CX-5 color gris (Placas PTK-441)",
      mascotas: "Un gato siamés de nombre 'Simba'"
    }
  },
  {
    id: "preset-arrendamiento",
    title: "Muestra 2: Contrato de Arrendamiento (Inquilino)",
    description: "Contrato privado de arrendamiento celebrado entre Juan Carlos Gómez y la propietaria para departamento en Torre A - Depto 501.",
    fileName: "contrato_arrendamiento_torrea_501.pdf",
    mimeType: "application/pdf",
    fileBase64: "JVBERi0xLjQKJ...[MOCK_PDF_BASE64]...",
    mockResult: {
      nombre_propietario: "Juan Carlos Gómez Silva",
      tipo_documento: "Contrato de Arrendamiento",
      correo_electronico: "jc.gomez@gmail.com",
      telefono_contacto: "555-101-9002",
      torre: "A",
      departamento: "501",
      cajones_estacionamiento: "C-01",
      porcentaje_indiviso: 1.05,
      numero_escritura_o_contrato: "ARR-2026-X8",
      fecha_documento: "2026-02-15",
      notario_publico_numero: "N/A - Contrato Privado",
      notario_nombre_o_ciudad: "N/A",
      folio_real_registro: "102912-A",
      numero_habitantes: 3,
      vehiculos: "Volkswagen Jetta blanco (Placas GGG-551-A)",
      mascotas: "Perro mediano de nombre 'Toby'"
    }
  },
  {
    id: "preset-predial",
    title: "Muestra 3: Boleta de Impuesto Predial",
    description: "Boleta bimestral de impuesto predial para Torre E - Depto 102 con 1.15% de indiviso.",
    fileName: "boleta_impuesto_predial_2026.jpg",
    mimeType: "image/jpeg",
    fileBase64: "iVBORw0KGgo...",
    mockResult: {
      nombre_propietario: "María Eugenia Lozano",
      tipo_documento: "Boleta Predial",
      correo_electronico: "maria.lozano@outlook.com",
      telefono_contacto: "555-883-9912",
      torre: "E",
      departamento: "102",
      cajones_estacionamiento: "C-30",
      porcentaje_indiviso: 1.15,
      numero_escritura_o_contrato: "PREDIAL-993-8822",
      fecha_documento: "2026-01-15",
      notario_publico_numero: "N/A",
      notario_nombre_o_ciudad: "Tesorería Municipal de Administración",
      folio_real_registro: "FOLIO-PRED-99812",
      numero_habitantes: 1,
      vehiculos: "Chevrolet Aveo rojo (Placas YY-332-PP)",
      mascotas: "Ninguna"
    }
  }
];
