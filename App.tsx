import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Header } from './components/Header';
import FileUpload from './components/FileUpload';
import ResultView from './components/ResultView';
import { analyzeCV } from './services/gemini';
import { logCVAnalysis } from './services/supabase';
import { AnalysisResult, AppState } from './types';

function App() {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = async (file: File) => {
    setAppState(AppState.ANALYZING);
    setError(null);
    try {
      const data = await analyzeCV(file);
      setResult(data);
      setAppState(AppState.SUCCESS);
      
      // Convertir archivo a base64
      const reader = new FileReader();
      const fileBase64 = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      
      // Log to Supabase con datos completos
      await logCVAnalysis({
        nombre: data.cvData.fullName,
        perfil_interes: data.tracking.perfilInteres,
        ciudad: data.tracking.ciudad,
        pais: data.tracking.pais,
        email: data.cvData.contactInfo.email || '',
        telefono: data.cvData.contactInfo.phone || '',
        puestos_afines: data.tracking.puestosAfines,
        cv_data: data.cvData,
        file_name: file.name,
        file_data: fileBase64
      });
    } catch (err: any) {
      console.error(err);
      setError("Hubo un error al analizar el CV. Por favor, probá de nuevo. Asegurate de que el archivo sea un PDF o texto legible.");
      setAppState(AppState.ERROR);
    }
  };

  const handleReset = () => {
    setAppState(AppState.IDLE);
    setResult(null);
    setError(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-4 py-12 md:py-16">
        <div className="max-w-4xl mx-auto">
          
          {/* Hero Section (only visible when IDLE) */}
          {appState === AppState.IDLE && (
            <div className="text-center mb-12">
              <span className="inline-block px-4 py-1.5 rounded-full bg-adhoc-lavender/20 text-adhoc-violet font-bold text-xs uppercase tracking-wider mb-4">
                Potenciado por IA
              </span>
              <h1 className="text-4xl md:text-5xl font-display font-medium text-gray-900 mb-6 leading-tight">
                Análisis de CV para que <br/>
                <span className="text-adhoc-violet">no te filtren sin verlo</span>
              </h1>
              <p className="text-lg text-gray-500 font-sans max-w-2xl mx-auto mb-8">
                Subí tu CV y recibí sugerencias instantáneas para subir tus posibilidades de que te tomen en tu próximo trabajo.
              </p>
            </div>
          )}

          {/* Interaction Area */}
          <div className="transition-all duration-500">
            {appState === AppState.IDLE && (
              <FileUpload onFileSelect={handleFileSelect} disabled={false} />
            )}

            {appState === AppState.ANALYZING && (
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-12 text-center">
                <div className="relative inline-block mb-6">
                  <div className="absolute inset-0 bg-adhoc-violet blur-xl opacity-20 rounded-full animate-pulse"></div>
                  <Loader2 className="w-16 h-16 text-adhoc-violet animate-spin relative z-10" />
                </div>
                <h3 className="text-2xl font-display text-gray-800 mb-2">Analizando tu perfil...</h3>
                <p className="text-gray-500 font-sans animate-pulse">
                  Nuestros algoritmos están revisando estructura, palabras clave y contenido.
                </p>
              </div>
            )}

            {appState === AppState.ERROR && (
              <div className="bg-red-50 rounded-xl border border-red-200 p-8 text-center">
                <div className="text-red-500 font-medium font-sans text-lg mb-4">
                  {error}
                </div>
                <button 
                  onClick={handleReset}
                  className="px-6 py-2 bg-adhoc-violet hover:bg-adhoc-violet/90 text-white rounded-lg font-sans font-medium transition-colors"
                >
                  Probar de nuevo
                </button>
              </div>
            )}

            {appState === AppState.SUCCESS && result && (
              <ResultView result={result} onReset={handleReset} />
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-8">
        <div className="container mx-auto px-4 text-center space-y-2">
          <p className="font-sans text-sm text-gray-500">
            <a 
              href="https://www.adhoc.inc" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-adhoc-violet hover:text-adhoc-coral transition-colors font-medium"
            >
              Conocé más sobre la tecnología de Adhoc →
            </a>
          </p>
          <p className="font-sans text-sm text-gray-400">
            © {new Date().getFullYear()} Adhoc S.A. - Soluciones Tecnológicas. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
