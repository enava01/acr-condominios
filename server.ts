import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Increase limit to allow base64 images/PDFs
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

const REGISTRATIONS_FILE = path.join(process.cwd(), "registrations.json");

// Define registration interface
interface Registration {
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

// Initial seed data to make the dashboard immediately fully interactive and comprehensive
const seedRegistrations: Registration[] = [
  {
    id: "reg-1",
    nombre_propietario: "Carlos Mendoza Ruiz",
    tipo_documento: "Escritura Pública",
    correo_electronico: "carlos.mendoza@email.com",
    telefono_contacto: "555-123-4567",
    torre: "A",
    departamento: "201",
    cajones_estacionamiento: "C-15, C-16",
    porcentaje_indiviso: 1.45,
    numero_escritura_o_contrato: "18,452",
    fecha_documento: "2021-05-14",
    notario_publico_numero: "Notario 12",
    notario_nombre_o_ciudad: "Lic. Alfredo Bañuelos, CDMX",
    folio_real_registro: "987654-A",
    numero_habitantes: 3,
    vehiculos: "Mazda 3 (Placas MX-998)",
    mascotas: "Perro (Max, Pastor Alemán)",
    status: "Aprobado",
    documentName: "escritura_propiedad_torrea_201.pdf",
    comments: "Expediente completo y verificado contra escritura física.",
    createdAt: "2026-06-20T10:30:00.000Z",
    updatedAt: "2026-06-21T15:20:00.000Z",
  },
  {
    id: "reg-2",
    nombre_propietario: "Ana Sofía Herrera",
    tipo_documento: "Contrato de Arrendamiento",
    correo_electronico: "ana.herrera@email.com",
    telefono_contacto: "555-987-6543",
    torre: "B",
    departamento: "104",
    cajones_estacionamiento: "C-08",
    porcentaje_indiviso: 1.12,
    numero_escritura_o_contrato: "ARR-2025-09",
    fecha_documento: "2025-08-01",
    notario_publico_numero: "N/A - Contrato Privado",
    notario_nombre_o_ciudad: "N/A",
    folio_real_registro: "123456-B",
    numero_habitantes: 2,
    vehiculos: "Honda Civic (Placas LKY-291)",
    mascotas: "Ninguna",
    status: "Pendiente",
    documentName: "contrato_arrendamiento_104.pdf",
    comments: "",
    createdAt: "2026-06-28T14:15:00.000Z",
    updatedAt: "2026-06-28T14:15:00.000Z",
  },
  {
    id: "reg-3",
    nombre_propietario: "Mauricio Garza Solís",
    tipo_documento: "Escritura Pública",
    correo_electronico: "mauricio.garza@email.com",
    telefono_contacto: "811-344-9901",
    torre: "C",
    departamento: "402",
    cajones_estacionamiento: "C-22",
    porcentaje_indiviso: 1.85,
    numero_escritura_o_contrato: "45,012",
    fecha_documento: "2019-11-22",
    notario_publico_numero: "Notario 4",
    notario_nombre_o_ciudad: "Lic. Clara Salazar, Monterrey",
    folio_real_registro: "654321-C",
    numero_habitantes: 4,
    vehiculos: "Toyota RAV4 (Placas GHY-102)",
    mascotas: "Gato (Luna)",
    status: "Aprobado",
    documentName: "escritura_final_notaria4.pdf",
    comments: "Acreditado exitosamente como propietario único.",
    createdAt: "2026-06-24T09:10:00.000Z",
    updatedAt: "2026-06-25T11:45:00.000Z",
  },
  {
    id: "reg-4",
    nombre_propietario: "Lucía Fernández Torres",
    tipo_documento: "Boleta Predial",
    correo_electronico: "lucia.ft@email.com",
    telefono_contacto: "555-772-1133",
    torre: "D",
    departamento: "301",
    cajones_estacionamiento: "Sin especificar",
    porcentaje_indiviso: 1.22,
    numero_escritura_o_contrato: "PREDIAL-2026-881",
    fecha_documento: "2026-01-10",
    notario_publico_numero: "N/A",
    notario_nombre_o_ciudad: "Tesorería Municipal",
    folio_real_registro: "88122-D",
    numero_habitantes: 1,
    vehiculos: "Ninguno",
    mascotas: "Perro (Milú, Shih Tzu)",
    status: "Rechazado",
    documentName: "boleta_predial_301_borrosa.jpg",
    comments: "La boleta predial subida está ilegible. Por favor, suba una foto con mejor resolución o la primera página de la escritura pública para acreditar propiedad.",
    createdAt: "2026-06-26T16:40:00.000Z",
    updatedAt: "2026-06-27T10:15:00.000Z",
  },
  {
    id: "reg-5",
    nombre_propietario: "Roberto Elizondo Villarreal",
    tipo_documento: "Contrato de Compraventa",
    correo_electronico: "roberto.elizondo@email.com",
    telefono_contacto: "333-884-1234",
    torre: "E",
    departamento: "502",
    cajones_estacionamiento: "C-41, C-42",
    porcentaje_indiviso: 1.55,
    numero_escritura_o_contrato: "CONV-9912-A",
    fecha_documento: "2024-03-12",
    notario_publico_numero: "Notario 32",
    notario_nombre_o_ciudad: "Lic. Roberto Pérez, Guadalajara",
    folio_real_registro: "44921-E",
    numero_habitantes: 3,
    vehiculos: "Ford Explorer (Placas UY-12-PP)",
    mascotas: "Ninguna",
    status: "En Revisión",
    documentName: "compraventa_notaria32.pdf",
    comments: "",
    createdAt: "2026-06-28T18:00:00.000Z",
    updatedAt: "2026-06-28T18:00:00.000Z",
  }
];

// Helper to read registrations from file
function readRegistrations(): Registration[] {
  try {
    if (!fs.existsSync(REGISTRATIONS_FILE)) {
      fs.writeFileSync(REGISTRATIONS_FILE, JSON.stringify(seedRegistrations, null, 2), "utf8");
      return seedRegistrations;
    }
    const data = fs.readFileSync(REGISTRATIONS_FILE, "utf8");
    return JSON.parse(data);
  } catch (err) {
    console.error("Error reading registrations, returning memory cache:", err);
    return seedRegistrations;
  }
}

// Helper to write registrations to file
function writeRegistrations(registrations: Registration[]) {
  try {
    fs.writeFileSync(REGISTRATIONS_FILE, JSON.stringify(registrations, null, 2), "utf8");
  } catch (err) {
    console.error("Error writing registrations:", err);
  }
}

// Initialize Gemini Client Lazily to prevent startup crashes if GEMINI_API_KEY is missing
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("Warning: GEMINI_API_KEY is not defined in environment.");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey || "MOCK_KEY",
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// REST APIs
// 1. Get all registrations
app.get("/api/registrations", (req, res) => {
  try {
    const data = readRegistrations();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "No se pudieron obtener los registros." });
  }
});

// 2. Add new registration
app.post("/api/registrations", (req, res) => {
  try {
    const records = readRegistrations();
    const newReg: Registration = {
      id: "reg-" + Date.now(),
      nombre_propietario: req.body.nombre_propietario || "Sin Nombre",
      tipo_documento: req.body.tipo_documento || "Otro",
      correo_electronico: req.body.correo_electronico || "",
      telefono_contacto: req.body.telefono_contacto || "",
      torre: req.body.torre || "A",
      departamento: req.body.departamento || "",
      cajones_estacionamiento: req.body.cajones_estacionamiento || "Sin especificar",
      porcentaje_indiviso: Number(req.body.porcentaje_indiviso) || 0,
      numero_escritura_o_contrato: req.body.numero_escritura_o_contrato || "",
      fecha_documento: req.body.fecha_documento || "",
      notario_publico_numero: req.body.notario_publico_numero || "N/A",
      notario_nombre_o_ciudad: req.body.notario_nombre_o_ciudad || "N/A",
      folio_real_registro: req.body.folio_real_registro || "",
      numero_habitantes: Number(req.body.numero_habitantes) || 1,
      vehiculos: req.body.vehiculos || "",
      mascotas: req.body.mascotas || "",
      status: "Pendiente",
      documentName: req.body.documentName || "documento_cargado.pdf",
      comments: "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    records.unshift(newReg);
    writeRegistrations(records);
    res.status(201).json(newReg);
  } catch (err) {
    res.status(500).json({ error: "Error al guardar el registro." });
  }
});

// 3. Update status or comments of registration (Admin control)
app.patch("/api/registrations/:id", (req, res) => {
  try {
    const records = readRegistrations();
    const index = records.findIndex((r) => r.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: "Registro no encontrado." });
    }

    const current = records[index];
    const { status, comments, nombre_propietario, tipo_documento, correo_electronico, telefono_contacto, torre, departamento, cajones_estacionamiento, porcentaje_indiviso, numero_escritura_o_contrato, fecha_documento, notario_publico_numero, notario_nombre_o_ciudad, folio_real_registro, numero_habitantes, vehiculos, mascotas } = req.body;

    if (status !== undefined) current.status = status;
    if (comments !== undefined) current.comments = comments;
    if (nombre_propietario !== undefined) current.nombre_propietario = nombre_propietario;
    if (tipo_documento !== undefined) current.tipo_documento = tipo_documento;
    if (correo_electronico !== undefined) current.correo_electronico = correo_electronico;
    if (telefono_contacto !== undefined) current.telefono_contacto = telefono_contacto;
    if (torre !== undefined) current.torre = torre;
    if (departamento !== undefined) current.departamento = departamento;
    if (cajones_estacionamiento !== undefined) current.cajones_estacionamiento = cajones_estacionamiento;
    if (porcentaje_indiviso !== undefined) current.porcentaje_indiviso = Number(porcentaje_indiviso);
    if (numero_escritura_o_contrato !== undefined) current.numero_escritura_o_contrato = numero_escritura_o_contrato;
    if (fecha_documento !== undefined) current.fecha_documento = fecha_documento;
    if (notario_publico_numero !== undefined) current.notario_publico_numero = notario_publico_numero;
    if (notario_nombre_o_ciudad !== undefined) current.notario_nombre_o_ciudad = notario_nombre_o_ciudad;
    if (folio_real_registro !== undefined) current.folio_real_registro = folio_real_registro;
    if (numero_habitantes !== undefined) current.numero_habitantes = Number(numero_habitantes);
    if (vehiculos !== undefined) current.vehiculos = vehiculos;
    if (mascotas !== undefined) current.mascotas = mascotas;

    current.updatedAt = new Date().toISOString();
    records[index] = current;

    writeRegistrations(records);
    res.json(current);
  } catch (err) {
    res.status(500).json({ error: "Error al actualizar el registro." });
  }
});

// 4. Delete registration
app.delete("/api/registrations/:id", (req, res) => {
  try {
    const records = readRegistrations();
    const filtered = records.filter((r) => r.id !== req.params.id);
    writeRegistrations(filtered);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Error al eliminar el registro." });
  }
});

// 5. Intelligent Data Extraction via Gemini 3.1 Flash-Lite
app.post("/api/extract", async (req, res) => {
  const { fileBase64, mimeType, fileName } = req.body;

  if (!fileBase64 || !mimeType) {
    return res.status(400).json({ error: "Faltan datos del archivo o MIME type." });
  }

  try {
    const ai = getGeminiClient();

    // Check if the API key is actual or placeholder
    if (process.env.GEMINI_API_KEY === undefined || process.env.GEMINI_API_KEY === "MY_GEMINI_API_KEY" || !process.env.GEMINI_API_KEY) {
      console.warn("Using mock response because Gemini API key is missing or is the default placeholder.");
      // We return a high-fidelity simulation so that the user's interface remains functional even if they haven't configured their secret yet.
      // This is a requirement for "Acknowledge preview limits - Guide configuration"
      return res.json({
        success: true,
        isMocked: true,
        data: {
          nombre_propietario: "Elena Rostova Soler",
          tipo_documento: "Escritura Pública",
          correo_electronico: "elena.rostova@gmail.com",
          telefono_contacto: "555-400-2011",
          torre: "C",
          departamento: "304",
          cajones_estacionamiento: "C-12",
          porcentaje_indiviso: 1.34,
          numero_escritura_o_contrato: "Escritura No. 94,102",
          fecha_documento: "2023-04-12",
          notario_publico_numero: "Notaría Pública No. 202",
          notario_nombre_o_ciudad: "Lic. Alejandro Ortiz, CDMX",
          folio_real_registro: "FOLIO-77402-MX",
          numero_habitantes: 2,
          vehiculos: "Mazda CX-5 color gris (Placas PTK-441)",
          mascotas: "Un gato siamés de nombre 'Simba'"
        }
      });
    }

    const imagePart = {
      inlineData: {
        mimeType: mimeType,
        data: fileBase64,
      },
    };

    const promptText = `
      Eres un extractor experto de datos legales de acreditación de propiedad condominal mexicana.
      Analiza detalladamente esta foto, PDF o imagen de documento legal (puede ser una Escritura Pública, Boleta de Impuesto Predial, Contrato de Compraventa o de Arrendamiento).
      Debes extraer con la mayor precisión posible la información requerida en la estructura JSON devuelta.

      Instrucciones específicas:
      1. Extrae el nombre del propietario o arrendatario principal.
      2. Determina el tipo de documento (debe ser uno de: 'Escritura Pública', 'Contrato de Arrendamiento', 'Contrato de Compraventa', 'Boleta Predial' u 'Otro').
      3. Extrae la torre (obligatoriamente debe ser una letra de la A a la F. Si el documento no especifica una torre explícitamente pero menciona un edificio o letra, usa esa. De lo contrario, infiérelo o pon 'A').
      4. Extrae el número de departamento o interior (por ejemplo: '101', '302', 'B-402').
      5. Extrae el porcentaje de indiviso (porcentaje de propiedad sobre las áreas comunes), suele expresarse como un porcentaje decimal, p. ej. 1.25% o 0.985. Devuélvelo como número simple (ej: 1.25), no como texto con '%'. Si no se encuentra, pon 0.
      6. Extrae el número de la escritura, folio del contrato o identificador de boleta.
      7. Extrae la fecha del documento en formato YYYY-MM-DD. Si no tiene ese formato, reestructúralo.
      8. Extrae el número del Notario Público (ej: '142' o 'Notario 125').
      9. Extrae el nombre completo del Notario y la ciudad o demarcación donde ejerce.
      10. Extrae el Folio Real o clave registral del Registro Público de la Propiedad.
      11. Si en el documento se mencionan datos de vehículos (marcas, modelos, placas) o mascotas, extráelos. Si no, déjalos vacíos.
      12. Deduce o extrae el número de habitantes si se menciona algo relacionado. De lo contrario coloca 1.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite",
      contents: [imagePart, { text: promptText }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            nombre_propietario: { type: Type.STRING, description: "Nombre completo del propietario o residente" },
            tipo_documento: { type: Type.STRING, description: "Tipo de documento (Escritura Pública, Contrato de Arrendamiento, Contrato de Compraventa, Boleta Predial, Otro)" },
            correo_electronico: { type: Type.STRING, description: "Correo de contacto si se encuentra" },
            telefono_contacto: { type: Type.STRING, description: "Teléfono de contacto si se encuentra" },
            torre: { type: Type.STRING, description: "Torre (A, B, C, D, E o F)" },
            departamento: { type: Type.STRING, description: "Departamento o unidad" },
            cajones_estacionamiento: { type: Type.STRING, description: "Cajones de estacionamiento asignados o 'Sin especificar'" },
            porcentaje_indiviso: { type: Type.NUMBER, description: "Porcentaje de indiviso como número decimal. Ej: 1.34. Si no se encuentra poner 0" },
            numero_escritura_o_contrato: { type: Type.STRING, description: "Número de escritura, folio del contrato o ID de boleta predial" },
            fecha_documento: { type: Type.STRING, description: "Fecha de expedición o firma en formato YYYY-MM-DD" },
            notario_publico_numero: { type: Type.STRING, description: "Número de notario público, ej. 'Notaría 22'" },
            notario_nombre_o_ciudad: { type: Type.STRING, description: "Nombre del notario y ciudad, ej. 'Lic. Manuel Ruiz, Zapopan'" },
            folio_real_registro: { type: Type.STRING, description: "Folio real o clave registral" },
            numero_habitantes: { type: Type.INTEGER, description: "Número de habitantes estimado" },
            vehiculos: { type: Type.STRING, description: "Vehículos mencionados o vacío" },
            mascotas: { type: Type.STRING, description: "Mascotas mencionadas o vacío" }
          },
          required: [
            "nombre_propietario",
            "tipo_documento",
            "torre",
            "departamento",
            "porcentaje_indiviso"
          ]
        }
      }
    });

    const textOutput = response.text;
    if (!textOutput) {
      throw new Error("Gemini returned an empty response.");
    }

    const extractedData = JSON.parse(textOutput.trim());
    res.json({
      success: true,
      isMocked: false,
      data: extractedData
    });
  } catch (err: any) {
    console.error("Gemini Extraction Error:", err);
    res.status(500).json({
      error: "Ocurrió un error al extraer los datos con Gemini.",
      details: err.message
    });
  }
});

// Setup Vite or static serving
async function start() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite development middleware mounted.");
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Serving static production build from:", distPath);
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

start();
