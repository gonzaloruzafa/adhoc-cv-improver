import React, { useCallback } from 'react';
import { UploadCloud } from 'lucide-react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  disabled: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, disabled }) => {
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (disabled) return;
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      if (files[0].type === 'application/pdf') {
        onFileSelect(files[0]);
      } else {
        alert("Por favor, subí solo archivos PDF para asegurar un buen análisis.");
      }
    }
  }, [onFileSelect, disabled]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    if (e.target.files && e.target.files.length > 0) {
      onFileSelect(e.target.files[0]);
    }
  };

  return (
    <div 
      className={`border-2 border-dashed border-adhoc-lavanda rounded-xl p-10 text-center transition-all duration-300 ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-adhoc-violeta hover:bg-adhoc-lavanda/10 cursor-pointer'}`}
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
    >
      <input 
        type="file" 
        id="cv-upload" 
        className="hidden" 
        accept=".pdf"
        onChange={handleChange}
        disabled={disabled}
      />
      <label htmlFor="cv-upload" className="cursor-pointer flex flex-col items-center">
        <div className="bg-adhoc-lavanda/20 p-4 rounded-full mb-4">
          <UploadCloud className="w-10 h-10 text-adhoc-violeta" />
        </div>
        <h3 className="text-xl font-primary font-medium text-adhoc-violeta mb-2">Subí tu CV acá</h3>
        <p className="text-gray-500 text-sm font-secondary max-w-xs mx-auto">
          Arrastrá y soltá tu archivo PDF (Recomendado)
        </p>
      </label>
    </div>
  );
};

export default FileUpload;