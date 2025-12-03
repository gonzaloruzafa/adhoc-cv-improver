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
  const apiUrl = import.meta.env.VITE_API_URL || '/api/analyze-cv';
  
  const base64Data = await processFileToBase64(file);
  
  // Determine mime type
  const mimeType = file.type || 'application/pdf';
  
  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fileData: base64Data,
        mimeType: mimeType,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || `Server error: ${response.status}`);
    }

    const result: AnalysisResult = await response.json();
    return result;

  } catch (error: any) {
    console.error("Error calling CV analysis API:", error);
    throw new Error(error.message || 'Error analyzing CV. Please try again.');
  }
};