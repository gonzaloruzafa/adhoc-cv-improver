import React, { useState } from 'react';
import { FileText, Download, CheckCircle, AlertTriangle, Hammer, Sparkles } from 'lucide-react';
import { AnalysisResult } from '../types';
import { generateATSPdf } from '../utils/pdf';
import { generateRankingImage } from '../utils/shareImage';

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
      <div className="bg-adhoc-violet p-6 text-white flex justify-between items-center flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-primary">Análisis completado</h2>
          <p className="font-secondary opacity-90 text-sm">Optimizamos tu CV con la tecnología de Adhoc</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={onReset}
            className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg font-secondary text-sm transition-colors border border-white/30"
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
            
            {/* Ranking Card */}
            <div className="bg-gradient-to-br from-adhoc-violet via-adhoc-lavanda to-adhoc-violet p-8 rounded-2xl shadow-xl border-2 border-white/20 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full -ml-16 -mb-16" />
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                  <div>
                    <p className="text-sm font-secondary opacity-90 mb-1">Tu CV está en nivel</p>
                    <h3 className="text-4xl font-primary font-bold">{result.ranking.nivel}</h3>
                  </div>
                  <div className="text-center">
                    <div className="text-6xl font-bold bg-white/20 rounded-2xl px-6 py-4 backdrop-blur-sm border border-white/30">
                      {result.ranking.score}
                    </div>
                    <p className="text-xs font-secondary opacity-80 mt-2">de 100 puntos</p>
                  </div>
                </div>
                
                {/* Progress Bar with Levels */}
                <div className="mb-6 space-y-3">
                  {/* Level indicators above bar */}
                  <div className="flex justify-between items-end px-2">
                    {[
                      { emoji: '🌟', name: 'Principiante', threshold: 40 },
                      { emoji: '⭐', name: 'En Camino', threshold: 56 },
                      { emoji: '✨', name: 'Competitivo', threshold: 66 },
                      { emoji: '🚀', name: 'Destacado', threshold: 76 },
                      { emoji: '💎', name: 'Excepcional', threshold: 86 }
                    ].map((level, idx) => (
                      <div 
                        key={idx}
                        className="flex flex-col items-center -space-y-1"
                      >
                        <div className={`text-3xl transition-all duration-300 ${result.ranking.score >= level.threshold ? 'scale-110 drop-shadow-lg' : 'opacity-40 scale-90 grayscale'}`}>
                          {level.emoji}
                        </div>
                        <div className={`text-[10px] font-secondary text-center leading-tight ${result.ranking.score >= level.threshold ? 'font-bold text-white' : 'opacity-60 text-white/70'}`}>
                          {level.name}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Progress bar */}
                  <div className="relative h-4 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm">
                    <div 
                      className="absolute top-0 left-0 h-full bg-gradient-to-r from-adhoc-mostaza via-adhoc-coral to-pink-500 rounded-full transition-all duration-1000 ease-out shadow-lg"
                      style={{ width: `${result.ranking.score}%` }}
                    />
                  </div>
                  
                  {/* Threshold markers */}
                  <div className="flex justify-between text-xs font-secondary text-white/60 px-2">
                    <span>40</span>
                    <span>56</span>
                    <span>66</span>
                    <span>76</span>
                    <span>86</span>
                  </div>
                </div>
                
                <p className="font-secondary text-white/95 leading-relaxed mb-4">
                  {result.ranking.mensaje}
                </p>
                
                {/* Share Buttons */}
                <div className="flex gap-3 flex-wrap">
                  {/* LinkedIn */}
                  <button
                    onClick={async () => {
                      try {
                        const imageBlob = await generateRankingImage(result.ranking, cvData.fullName);
                        const file = new File([imageBlob], 'mi-cv-ranking.png', { type: 'image/png' });
                        
                        // Check if Web Share API is available with file support
                        if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
                          await navigator.share({
                            title: `Mi resultado en Adhoc CV: ${result.ranking.score} puntos`,
                            text: `¡Logré ${result.ranking.score} puntos en mi CV! 🎯 Nivel: ${result.ranking.nivel}`,
                            files: [file]
                          });
                        } else {
                          // Fallback: download image
                          const url = URL.createObjectURL(imageBlob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = 'mi-cv-ranking.png';
                          a.click();
                          URL.revokeObjectURL(url);
                          alert('📸 Imagen descargada! Subila a LinkedIn manualmente');
                        }
                      } catch (err) {
                        console.error('Error sharing:', err);
                        alert('Hubo un error. Intentá de nuevo.');
                      }
                    }}
                    className="flex-1 py-3 bg-white/20 hover:bg-white/30 text-white rounded-lg font-secondary font-medium transition-all border border-white/30 flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                    LinkedIn
                  </button>
                  
                  {/* Instagram */}
                  <button
                    onClick={async () => {
                      try {
                        const imageBlob = await generateRankingImage(result.ranking, cvData.fullName);
                        const file = new File([imageBlob], 'mi-cv-ranking.png', { type: 'image/png' });
                        
                        // Check if Web Share API is available
                        if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
                          await navigator.share({
                            title: 'Mi resultado en Adhoc CV',
                            text: `¡Logré ${result.ranking.score} puntos ${result.ranking.nivel} en mi CV! 🎯`,
                            files: [file]
                          });
                        } else {
                          // Fallback: download image
                          const url = URL.createObjectURL(imageBlob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = 'mi-cv-ranking.png';
                          a.click();
                          URL.revokeObjectURL(url);
                          alert('📸 Imagen descargada! Subila a tu historia de Instagram');
                        }
                      } catch (err) {
                        console.error('Error sharing:', err);
                        alert('Hubo un error. Intentá de nuevo.');
                      }
                    }}
                    className="flex-1 py-3 bg-white/20 hover:bg-white/30 text-white rounded-lg font-secondary font-medium transition-all border border-white/30 flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                    Instagram
                  </button>
                </div>
              </div>
            </div>
            
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