export interface Experience {
  role: string;
  company: string;
  dates: string;
  description: string[];
}

export interface Education {
  degree: string;
  institution: string;
  year: string;
}

export interface CVData {
  fullName: string;
  contactInfo: {
    email?: string;
    phone?: string;
    linkedin?: string;
    location?: string;
  };
  professionalSummary: string;
  experience: Experience[];
  education: Education[];
  skills: string[];
  languages: string[];
}

export interface AnalysisFeedback {
  strengths: string[];
  improvements: string[];
  actionPlan: string[];
  conclusion: string;
}

export interface TrackingData {
  perfilInteres: 'Alto' | 'Medio' | 'Bajo';
  ciudad: string;
  pais: string;
  puestosAfines: string[];
}

export interface CVRanking {
  score: number; // 0-100
  nivel: '🌟 Principiante' | '⭐ En Camino' | '✨ Competitivo' | '🚀 Destacado' | '💎 Excepcional';
  mensaje: string;
}

export interface AnalysisResult {
  feedback: AnalysisFeedback;
  cvData: CVData;
  tracking: TrackingData;
  ranking: CVRanking;
}

export enum AppState {
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}
