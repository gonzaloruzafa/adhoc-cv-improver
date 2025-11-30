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

export interface AnalysisResult {
  feedback: AnalysisFeedback;
  cvData: CVData;
}

export enum AppState {
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}