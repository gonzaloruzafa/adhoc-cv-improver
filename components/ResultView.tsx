import React, { useState } from 'react';
import { FileText, Download, CheckCircle, AlertTriangle, Hammer, Sparkles } from 'lucide-react';
import { AnalysisResult } from '../types';
import { generateATSPdf } from '../utils/pdf';

interface ResultViewProps {
  result: AnalysisResult;
  onReset: () => void;
}

const ResultView: React.FC<ResultViewProps> = ({ result, onReset }) => {
  const [activeTab, setActiveTab] = useState<'feedback' | 'preview'>('feedback');
  const { feedback, cvData } = result;
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownload = async () => {
    setIsGenerating(true);
    try {
      // Small delay to allow UI to update
      await new Promise(resolve => setTimeout(resolve, 100));
      generateATSPdf(cvData);
    } catch (e) {
      console.error("Error generating pdf", e);
      alert("Hubo un error generando el PDF. Por favor intentá de nuevo.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
      <div className="bg-adhoc-violeta p-6 text-white flex justify-between items-center flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-primary">Análisis completado</h2>
          <p className="font-secondary opacity-90 text-sm">Optimizamos tu CV con la tecnología de Adhoc</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={onReset}
            className="px-4 py-2 bg-adhoc-lavanda/20 hover:bg-adhoc-lavanda/30 text-white rounded-lg font-secondary text-sm transition-colors"
          >
            Cargar otro
          </button>
          <button 
            onClick={handleDownload}
            disabled={isGenerating}
            className="px-6 py-2 bg-adhoc-coral hover:bg-orange-500 text-white rounded-lg font-secondary font-medium shadow-lg flex items-center gap-2 transition-all transform hover:scale-105 disabled:opacity-70 disabled:scale-100"
          >
            {isGenerating ? (
              <span className="animate-pulse">Generando PDF...</span>
            ) : (
              <>
                <Download size={18} /> Descargar PDF Optimizado
              </>
            )}
          </button>
        </div>
      </div>

      <div className="flex border-b border-gray-200">
        <button
          className={`flex-1 py-4 text-center font-secondary font-medium text-sm sm:text-base flex justify-center items-center gap-2 border-b-2 transition-colors ${activeTab === 'feedback' ? 'border-adhoc-violeta text-adhoc-violeta bg-adhoc-lavanda/5' : 'border-transparent text-gray-500 hover:text-adhoc-violeta'}`}
          onClick={() => setActiveTab('feedback')}
        >
          <Sparkles size={18} /> Resultados del Análisis
        </button>
        <button
          className={`flex-1 py-4 text-center font-secondary font-medium text-sm sm:text-base flex justify-center items-center gap-2 border-b-2 transition-colors ${activeTab === 'preview' ? 'border-adhoc-violeta text-adhoc-violeta bg-adhoc-lavanda/5' : 'border-transparent text-gray-500 hover:text-adhoc-violeta'}`}
          onClick={() => setActiveTab('preview')}
        >
          <FileText size={18} /> Vista Previa (CV Optimizado)
        </button>
      </div>

      <div className="p-6 min-h-[400px] bg-gray-50/50">
        {activeTab === 'feedback' ? (
          <div className="space-y-6 max-w-4xl mx-auto">
            
            {/* Strengths */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-green-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-green-100 p-2 rounded-lg text-green-600">
                  <CheckCircle size={24} />
                </div>
                <h3 className="text-xl font-primary text-gray-800">Tus Puntos Fuertes</h3>
              </div>
              <ul className="space-y-3">
                {feedback.strengths.map((item, i) => (
                  <li key={i} className="flex items-start gap-3 font-secondary text-gray-600">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Improvements */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-orange-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-orange-100 p-2 rounded-lg text-orange-600">
                  <AlertTriangle size={24} />
                </div>
                <h3 className="text-xl font-primary text-gray-800">Áreas de Mejora</h3>
              </div>
              <ul className="space-y-3">
                {feedback.improvements.map((item, i) => (
                  <li key={i} className="flex items-start gap-3 font-secondary text-gray-600">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-orange-500 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Action Plan */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-adhoc-lavanda">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-adhoc-lavanda/20 p-2 rounded-lg text-adhoc-violeta">
                  <Hammer size={24} />
                </div>
                <h3 className="text-xl font-primary text-gray-800">Plan de Acción Concreto</h3>
              </div>
              <div className="grid gap-3">
                {feedback.actionPlan.map((item, i) => (
                  <div key={i} className="flex items-start gap-3 bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-adhoc-violeta text-white flex items-center justify-center font-bold text-xs mt-0.5">
                      {i + 1}
                    </div>
                    <p className="font-secondary text-gray-700">{item}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Conclusion */}
            <div className="bg-gradient-to-r from-adhoc-violeta to-adhoc-lavanda p-6 rounded-xl shadow-md text-white">
              <div className="flex items-center gap-3 mb-3">
                <Sparkles size={24} className="text-adhoc-mostaza" />
                <h3 className="text-lg font-bold font-primary">Conclusión</h3>
              </div>
              <p className="font-secondary leading-relaxed opacity-95">
                {feedback.conclusion}
              </p>
            </div>

          </div>
        ) : (
          <div className="space-y-8 font-secondary bg-white p-8 rounded-xl shadow-sm max-w-4xl mx-auto border border-gray-200">
            {/* Header Preview */}
            <div className="border-b pb-6 text-center md:text-left">
              <h3 className="text-3xl font-primary font-bold text-adhoc-violeta mb-2">{cvData.fullName}</h3>
              <div className="flex flex-wrap gap-4 justify-center md:justify-start text-sm text-gray-600">
                {cvData.contactInfo.email && <span>{cvData.contactInfo.email}</span>}
                {cvData.contactInfo.phone && <span>• {cvData.contactInfo.phone}</span>}
                {cvData.contactInfo.linkedin && <span>• {cvData.contactInfo.linkedin}</span>}
                {cvData.contactInfo.location && <span>• {cvData.contactInfo.location}</span>}
              </div>
            </div>

            {/* Summary */}
            {cvData.professionalSummary && (
              <div>
                <h4 className="text-adhoc-dark font-primary font-bold text-lg mb-3 border-b-2 border-adhoc-mostaza inline-block">PERFIL PROFESIONAL</h4>
                <p className="text-gray-700 text-sm leading-relaxed">{cvData.professionalSummary}</p>
              </div>
            )}

            {/* Experience */}
            <div>
              <h4 className="text-adhoc-dark font-primary font-bold text-lg mb-4 border-b-2 border-adhoc-mostaza inline-block">EXPERIENCIA LABORAL</h4>
              <div className="space-y-8">
                {cvData.experience.map((exp, idx) => (
                  <div key={idx} className="relative pl-4 border-l-2 border-gray-100 hover:border-adhoc-lavanda transition-colors">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-baseline mb-1">
                      <h5 className="font-bold text-gray-800 text-lg">{exp.role}</h5>
                      <span className="text-sm font-medium text-adhoc-violeta">{exp.dates}</span>
                    </div>
                    <div className="text-adhoc-coral font-medium mb-3">{exp.company}</div>
                    <ul className="space-y-2">
                      {exp.description.map((desc, i) => (
                        <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                          <span className="text-adhoc-mostaza mt-1.5">•</span>
                          <span>{desc}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

             {/* Education */}
             <div>
              <h4 className="text-adhoc-dark font-primary font-bold text-lg mb-4 border-b-2 border-adhoc-mostaza inline-block">EDUCACIÓN</h4>
              <div className="space-y-4">
                {cvData.education.map((edu, idx) => (
                  <div key={idx} className="flex justify-between items-start border-b border-gray-50 pb-4 last:border-0 last:pb-0">
                    <div>
                      <h5 className="font-bold text-gray-800">{edu.institution}</h5>
                      <div className="text-sm text-gray-600">{edu.degree}</div>
                    </div>
                    <span className="text-sm font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">{edu.year}</span>
                  </div>
                ))}
              </div>
            </div>

             {/* Skills */}
             <div>
              <h4 className="text-adhoc-dark font-primary font-bold text-lg mb-4 border-b-2 border-adhoc-mostaza inline-block">HABILIDADES</h4>
              <div className="flex flex-wrap gap-2">
                {cvData.skills.map((skill, idx) => (
                  <span key={idx} className="bg-white text-gray-700 px-3 py-1.5 rounded-lg text-sm font-medium border border-gray-200 shadow-sm">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
            
             {/* Languages */}
             {cvData.languages && cvData.languages.length > 0 && (
              <div>
                <h4 className="text-adhoc-dark font-primary font-bold text-lg mb-4 border-b-2 border-adhoc-mostaza inline-block">IDIOMAS</h4>
                <div className="flex flex-wrap gap-4">
                  {cvData.languages.map((lang, idx) => (
                    <span key={idx} className="text-gray-700 text-sm font-medium">
                      {lang}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ResultView;