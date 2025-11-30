import { GoogleGenAI, Type, Schema } from "@google/genai";
import { AnalysisResult } from "../types";

const processFileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // Remove the Data URL prefix (e.g., "data:application/pdf;base64,")
      const base64Data = result.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = (error) => reject(error);
  });
};

export const analyzeCV = async (file: File): Promise<AnalysisResult> => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing");
  }

  const ai = new GoogleGenAI({ apiKey });
  const base64Data = await processFileToBase64(file);
  
  // Determine mime type
  const mimeType = file.type || 'application/pdf';

  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      feedback: {
        type: Type.OBJECT,
        description: "Structured analysis of the CV.",
        properties: {
          strengths: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "List of 3-5 positive aspects of the CV."
          },
          improvements: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "List of 3-5 specific areas that need improvement."
          },
          actionPlan: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Concrete, actionable steps the user should take to fix the issues."
          },
          conclusion: {
            type: Type.STRING,
            description: "A final encouraging summary paragraph."
          }
        },
        required: ["strengths", "improvements", "actionPlan", "conclusion"]
      },
      cvData: {
        type: Type.OBJECT,
        description: "Structured data extracted and optimized for ATS systems.",
        properties: {
          fullName: { type: Type.STRING },
          contactInfo: {
            type: Type.OBJECT,
            properties: {
              email: { type: Type.STRING },
              phone: { type: Type.STRING },
              linkedin: { type: Type.STRING },
              location: { type: Type.STRING },
            }
          },
          professionalSummary: { type: Type.STRING, description: "A strong, concise professional summary." },
          experience: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                role: { type: Type.STRING },
                company: { type: Type.STRING },
                dates: { type: Type.STRING },
                description: { 
                  type: Type.ARRAY, 
                  items: { type: Type.STRING },
                  description: "Bullet points describing achievements, starting with action verbs."
                }
              }
            }
          },
          education: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                degree: { type: Type.STRING },
                institution: { type: Type.STRING },
                year: { type: Type.STRING }
              }
            }
          },
          skills: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          languages: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        },
        required: ["fullName", "experience", "education", "skills"]
      },
      tracking: {
        type: Type.OBJECT,
        description: "Datos para tracking interno.",
        properties: {
          perfilInteres: {
            type: Type.STRING,
            description: "Nivel de interés del perfil: Alto, Medio o Bajo",
            enum: ["Alto", "Medio", "Bajo"]
          },
          ciudad: { type: Type.STRING, description: "Ciudad del candidato" },
          pais: { type: Type.STRING, description: "País del candidato" },
          puestosAfines: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Lista de 3-5 puestos para los que este perfil sería ideal"
          }
        },
        required: ["perfilInteres", "ciudad", "pais", "puestosAfines"]
      },
      ranking: {
        type: Type.OBJECT,
        description: "Sistema de ranking gamificado del CV.",
        properties: {
          score: {
            type: Type.NUMBER,
            description: "Puntaje de 0 a 100. Sé generoso: 40-55 es principiante, 56-65 en camino, 66-75 competitivo, 76-85 destacado, 86+ excepcional. Incluso CVs básicos pueden tener 45-50."
          },
          nivel: {
            type: Type.STRING,
            description: "Nivel según score",
            enum: ["🌟 Principiante", "⭐ En Camino", "✨ Competitivo", "🚀 Destacado", "💎 Excepcional"]
          },
          mensaje: {
            type: Type.STRING,
            description: "Mensaje motivador personalizado explicando el score y qué hacer para subir de nivel."
          }
        },
        required: ["score", "nivel", "mensaje"]
      }
    },
    required: ["feedback", "cvData", "tracking", "ranking"]
  };

  const model = "gemini-2.5-flash";
  
  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Data
            }
          },
          {
            text: `Sos un experto consultor de RRHH de Adhoc S.A. en Argentina. Analizá este CV.
            
            1. Generá un feedback estructurado en 4 partes:
               - **Fortalezas**: Lo que el candidato hizo bien.
               - **A mejorar**: Errores o debilidades detectadas.
               - **Plan de acción**: Pasos super concretos para arreglarlo (ej: "Cambiá el verbo 'hacer' por 'liderar'").
               - **Conclusión**: Un cierre motivador.
            
            2. Extraé y reescribí el contenido del CV ("cvData") para que quede perfecto para un sistema ATS:
               - Redactá un resumen profesional potente.
               - Mejorá las descripciones de experiencia usando verbos de acción y métricas.
            
            3. Generá datos de tracking ("tracking"):
               - **perfilInteres**: Evaluá si es un perfil Alto, Medio o Bajo (basándote en experiencia, skills y potencial).
               - **ciudad** y **pais**: Extraélos del CV.
               - **puestosAfines**: Listá 3-5 puestos específicos para los que este perfil sería ideal.
            
            4. Generá un ranking gamificado ("ranking"):
               - **score**: Dale un puntaje de 0 a 100. SÉ GENEROSO para motivar:
                 * 40-55: Principiante (CV básico pero con potencial)
                 * 56-65: En Camino (tiene fundamentos, necesita pulir)
                 * 66-75: Competitivo (buen CV, listo para aplicar)
                 * 76-85: Destacado (excelente CV, va a llamar la atención)
                 * 86-100: Excepcional (CV de oro, difícil de mejorar)
               - **nivel**: Asigná el emoji + nivel según el score.
               - **mensaje**: Escribí un mensaje motivador personalizado que explique por qué tiene ese score y QUÉ PUEDE HACER para subir al siguiente nivel (2-3 líneas).
               
            IMPORTANTE:
            - Hablá siempre de "vos" (español argentino).
            - Sé directo, amable y profesional.
            - Usá terminología local (ej: "Laburo", "CV", "Recruiter").
            - En el ranking, NUNCA des menos de 40 puntos. Todos tienen potencial.`
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
      }
    });

    if (!response.text) {
      throw new Error("No response text from Gemini");
    }

    const result: AnalysisResult = JSON.parse(response.text);
    return result;

  } catch (error) {
    console.error("Error analyzing CV:", error);
    throw error;
  }
};