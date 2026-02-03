import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";

// Rate limiting: almacena timestamps de requests por IP
const requestCounts = new Map<string, number[]>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minuto
const MAX_REQUESTS_PER_WINDOW = 5; // 5 CVs por minuto (más restrictivo que cuentos)

interface AnalysisResult {
  feedback: {
    strengths: string[];
    improvements: string[];
    actionPlan: string[];
    conclusion: string;
  };
  cvData: {
    fullName: string;
    contactInfo?: {
      email?: string;
      phone?: string;
      linkedin?: string;
      location?: string;
    };
    professionalSummary?: string;
    experience: Array<{
      role: string;
      company: string;
      dates: string;
      description: string[];
    }>;
    education: Array<{
      degree: string;
      institution: string;
      year: string;
    }>;
    skills: string[];
    languages?: string[];
  };
  tracking: {
    perfilInteres: "Alto" | "Medio" | "Bajo";
    ciudad: string;
    pais: string;
    puestosAfines: string[];
  };
  ranking: {
    score: number;
    nivel: string;
    mensaje: string;
  };
}

// Función auxiliar para rate limiting
function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const timestamps = requestCounts.get(ip) || [];
  
  // Filtrar timestamps dentro de la ventana
  const recentRequests = timestamps.filter(t => now - t < RATE_LIMIT_WINDOW);
  
  if (recentRequests.length >= MAX_REQUESTS_PER_WINDOW) {
    return false;
  }
  
  // Agregar el timestamp actual
  recentRequests.push(now);
  requestCounts.set(ip, recentRequests);
  
  return true;
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Solo permitir POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Obtener IP del cliente
  const ip = req.headers['x-forwarded-for']?.toString().split(',')[0] || 
             req.headers['x-real-ip']?.toString() || 
             'unknown';

  // Verificar rate limit
  if (!checkRateLimit(ip)) {
    return res.status(429).json({ 
      error: 'Too many requests. Please wait a moment before trying again.' 
    });
  }

  // Validar origen (opcional pero recomendado)
  const origin = req.headers.origin;
  const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '',
    'https://adhoc-cv-improver.vercel.app',
    'https://mejoratucv.adhoc.inc'
  ].filter(Boolean);

  if (origin && !allowedOrigins.includes(origin)) {
    console.warn(`Request from unauthorized origin: ${origin} (IP: ${ip})`);
    // No bloquear, solo loguear por ahora
  }

  // Validar API Key
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('GEMINI_API_KEY not configured');
    return res.status(500).json({ error: 'Service not configured correctly' });
  }

  // Validar request body
  const { fileData, mimeType } = req.body;
  
  if (!fileData || typeof fileData !== 'string') {
    return res.status(400).json({ 
      error: 'Missing or invalid "fileData" (base64 string required)' 
    });
  }

  if (!mimeType || typeof mimeType !== 'string') {
    return res.status(400).json({ 
      error: 'Missing or invalid "mimeType"' 
    });
  }

  // Validar tamaño (base64 string no debe ser excesivamente largo)
  const maxSize = 10 * 1024 * 1024; // 10MB en base64
  if (fileData.length > maxSize) {
    return res.status(400).json({ 
      error: 'File is too large. Maximum size is 10MB.' 
    });
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);

    const schema = {
      type: SchemaType.OBJECT,
      properties: {
        feedback: {
          type: SchemaType.OBJECT,
          description: "Structured analysis of the CV.",
          properties: {
            strengths: {
              type: SchemaType.ARRAY,
              items: { type: SchemaType.STRING },
              description: "List of 3-5 positive aspects of the CV."
            },
            improvements: {
              type: SchemaType.ARRAY,
              items: { type: SchemaType.STRING },
              description: "List of 3-5 specific areas that need improvement."
            },
            actionPlan: {
              type: SchemaType.ARRAY,
              items: { type: SchemaType.STRING },
              description: "Concrete, actionable steps the user should take to fix the issues."
            },
            conclusion: {
              type: SchemaType.STRING,
              description: "A final encouraging summary paragraph."
            }
          },
          required: ["strengths", "improvements", "actionPlan", "conclusion"]
        },
        cvData: {
          type: SchemaType.OBJECT,
          description: "Structured data extracted and optimized for ATS systems.",
          properties: {
            fullName: { type: SchemaType.STRING },
            contactInfo: {
              type: SchemaType.OBJECT,
              properties: {
                email: { type: SchemaType.STRING },
                phone: { type: SchemaType.STRING },
                linkedin: { type: SchemaType.STRING },
                location: { type: SchemaType.STRING },
              }
            },
            professionalSummary: { type: SchemaType.STRING, description: "A strong, concise professional summary." },
            experience: {
              type: SchemaType.ARRAY,
              items: {
                type: SchemaType.OBJECT,
                properties: {
                  role: { type: SchemaType.STRING },
                  company: { type: SchemaType.STRING },
                  dates: { type: SchemaType.STRING },
                  description: { 
                    type: SchemaType.ARRAY, 
                    items: { type: SchemaType.STRING },
                    description: "Bullet points describing achievements, starting with action verbs."
                  }
                }
              }
            },
            education: {
              type: SchemaType.ARRAY,
              items: {
                type: SchemaType.OBJECT,
                properties: {
                  degree: { type: SchemaType.STRING },
                  institution: { type: SchemaType.STRING },
                  year: { type: SchemaType.STRING }
                }
              }
            },
            skills: {
              type: SchemaType.ARRAY,
              items: { type: SchemaType.STRING }
            },
            languages: {
              type: SchemaType.ARRAY,
              items: { type: SchemaType.STRING }
            }
          },
          required: ["fullName", "experience", "education", "skills"]
        },
        tracking: {
          type: SchemaType.OBJECT,
          description: "Datos para tracking interno.",
          properties: {
            perfilInteres: {
              type: SchemaType.STRING,
              description: "Nivel de interés del perfil: Alto, Medio o Bajo",
              enum: ["Alto", "Medio", "Bajo"]
            },
            ciudad: { type: SchemaType.STRING, description: "Ciudad del candidato" },
            pais: { type: SchemaType.STRING, description: "País del candidato" },
            puestosAfines: {
              type: SchemaType.ARRAY,
              items: { type: SchemaType.STRING },
              description: "Lista de 3-5 puestos para los que este perfil sería ideal"
            }
          },
          required: ["perfilInteres", "ciudad", "pais", "puestosAfines"]
        },
        ranking: {
          type: SchemaType.OBJECT,
          description: "Sistema de ranking gamificado del CV.",
          properties: {
            score: {
              type: SchemaType.NUMBER,
              description: "Puntaje de 0 a 100. Sé generoso: 40-55 es principiante, 56-65 en camino, 66-75 competitivo, 76-85 destacado, 86+ excepcional. Incluso CVs básicos pueden tener 45-50."
            },
            nivel: {
              type: SchemaType.STRING,
              description: "Nivel según score",
              enum: ["🌟 Principiante", "⭐ En Camino", "✨ Competitivo", "🚀 Destacado", "💎 Excepcional"]
            },
            mensaje: {
              type: SchemaType.STRING,
              description: "Mensaje motivador personalizado explicando el score y qué hacer para subir de nivel."
            }
          },
          required: ["score", "nivel", "mensaje"]
        }
      },
      required: ["feedback", "cvData", "tracking", "ranking"]
    };

    const prompt = `
      **IMPORTANTE: RESPONDE SIEMPRE EN ESPAÑOL**
      
      Analiza el CV adjunto y proporciona feedback constructivo y detallado. Toda la respuesta debe estar EN ESPAÑOL.
      
      1. FEEDBACK:
         - Identifica 3-5 fortalezas principales del CV
         - Identifica 3-5 áreas de mejora específicas
         - Proporciona un plan de acción concreto con pasos accionables
         - Escribe una conclusión motivadora
      
      2. CV DATA:
         - Extrae y estructura toda la información del CV
         - Optimiza el lenguaje para sistemas ATS
         - Reescribe bullets con verbos de acción fuertes
         - Mejora el professional summary si existe
      
      3. TRACKING:
         - Evalúa el nivel de interés del perfil (Alto/Medio/Bajo)
         - Identifica ciudad y país
         - Sugiere 3-5 puestos afines para este perfil
      
      4. RANKING:
         - Asigna un score de 0-100 (sé generoso pero honesto)
         - Clasifica en nivel según el score
         - Proporciona un mensaje motivador personalizado
      
      Sé constructivo, específico y motivador en todo el análisis. Recuerda: TODO EN ESPAÑOL.
    `;

    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: schema,
      }
    });

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: mimeType,
          data: fileData
        }
      }
    ]);

    const analysisResult: AnalysisResult = JSON.parse(result.response.text() || '{}');

    // Log exitoso (sin datos sensibles)
    console.log(`CV analyzed successfully for IP: ${ip}, name: ${analysisResult.cvData?.fullName || 'unknown'}`);

    return res.status(200).json(analysisResult);

  } catch (error: any) {
    console.error('Error analyzing CV:', error);
    
    // No exponer detalles internos del error
    return res.status(500).json({ 
      error: 'Error analyzing CV. Please try again.' 
    });
  }
}
