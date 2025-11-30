import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import FileUpload from './components/FileUpload';
import ResultView from './components/ResultView';
import { analyzeCV } from './services/gemini';
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
    <div className="min-h-screen flex flex-col bg-adhoc-light text-adhoc-dark">
      {/* Header */}
      <header className="bg-white border-b border-adhoc-lavanda/30 sticky top-0 z-50">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Simple Adhoc Logo Representation */}
            <div className="w-10 h-10 bg-adhoc-violeta rounded-lg flex items-center justify-center">
              <span className="text-white font-primary font-bold text-xl">A</span>
            </div>
            <span className="text-2xl font-primary font-bold text-adhoc-violeta">Adhoc</span>
          </div>
          <nav className="hidden md:flex gap-6 font-secondary text-sm font-medium text-gray-600">
            <a href="#" className="hover:text-adhoc-violeta transition-colors">Soluciones</a>
            <a href="#" className="hover:text-adhoc-violeta transition-colors">Nosotros</a>
            <a href="#" className="hover:text-adhoc-violeta transition-colors">Carreras</a>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-4 py-12 md:py-16">
        <div className="max-w-4xl mx-auto">
          
          {/* Hero Section (only visible when IDLE) */}
          {appState === AppState.IDLE && (
            <div className="text-center mb-12">
              <span className="inline-block px-4 py-1.5 rounded-full bg-adhoc-mostaza/20 text-adhoc-mostaza font-bold text-xs uppercase tracking-wider mb-4 font-secondary">
                Potenciado por IA
              </span>
              <h1 className="text-4xl md:text-5xl font-primary font-medium text-adhoc-dark mb-6 leading-tight">
                Análisis de CV para que <br/>
                <span className="text-adhoc-violeta">no te filtren sin verlo</span>
              </h1>
              <p className="text-lg text-gray-500 font-secondary max-w-2xl mx-auto mb-8">
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
              <div className="bg-white rounded-xl shadow-lg border border-adhoc-lavanda/30 p-12 text-center">
                <div className="relative inline-block mb-6">
                  <div className="absolute inset-0 bg-adhoc-violeta blur-xl opacity-20 rounded-full animate-pulse"></div>
                  <Loader2 className="w-16 h-16 text-adhoc-violeta animate-spin relative z-10" />
                </div>
                <h3 className="text-2xl font-primary text-gray-800 mb-2">Analizando tu perfil...</h3>
                <p className="text-gray-500 font-secondary animate-pulse">
                  Nuestros algoritmos están revisando estructura, palabras clave y contenido.
                </p>
              </div>
            )}

            {appState === AppState.ERROR && (
              <div className="bg-red-50 rounded-xl border border-red-200 p-8 text-center">
                <div className="text-red-500 font-medium font-secondary text-lg mb-4">
                  {error}
                </div>
                <button 
                  onClick={handleReset}
                  className="px-6 py-2 bg-adhoc-violeta hover:bg-indigo-700 text-white rounded-lg font-secondary font-medium transition-colors"
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
      <footer className="bg-white border-t border-adhoc-lavanda/20 py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-400 font-secondary text-sm">
            © {new Date().getFullYear()} Adhoc S.A. - Soluciones Tecnológicas. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;