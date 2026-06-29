export interface Registration {
  id: string;
  nombre_propietario: string;
  tipo_documento: string;
  correo_electronico: string;
  telefono_contacto: string;
  torre: "A" | "B" | "C" | "D" | "E" | "F";
  departamento: string;
  cajones_estacionamiento: string;
  porcentaje_indiviso: number;
  numero_escritura_o_contrato: string;
  fecha_documento: string;
  notario_publico_numero: string;
  notario_nombre_o_ciudad: string;
  folio_real_registro: string;
  numero_habitantes: number;
  vehiculos: string;
  mascotas: string;
  status: "Pendiente" | "Aprobado" | "Rechazado" | "En Revisión";
  documentName: string;
  comments: string;
  createdAt: string;
  updatedAt: string;
}

export interface PresetDocument {
  id: string;
  title: string;
  description: string;
  fileName: string;
  mimeType: string;
  fileBase64: string; // we will put a simulated or shortened base64
  mockResult: Partial<Registration>;
}
