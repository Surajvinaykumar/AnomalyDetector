import React, { useState } from 'react';
import Header from './components/Header';
import FileUpload from './components/FileUpload';
import AnomalyResults from './components/AnomalyResults';
import { anomalyService } from './services/anomalyService';

interface Anomaly {
  id: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  naturalLanguage: string;
  confidence: number;
  affectedSystems: string[];
  logEntry: string;
}

function App() {
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = async (file: File, content: string) => {
    setIsProcessing(true);
    setError(null);
    
    try {
      const fileExtension = file.name.split('.').pop() || 'txt';
      const detectedAnomalies = await anomalyService.mockDetectAnomalies(content, fileExtension);
      setAnomalies(detectedAnomalies);
    } catch (err) {
      setError('Failed to analyze the log file. Please try again.');
      console.error('Analysis error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4 tracking-tight">
            AI-Powered Log Anomaly Detection
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
            Upload your log files to detect anomalies. Supports multiple formats including JSON, CSV, XML, and Syslog.
          </p>
        </div>

        <div className="space-y-12">
          <FileUpload onFileUpload={handleFileUpload} isProcessing={isProcessing} />
          
          {error && (
            <div className="max-w-2xl mx-auto">
              <div className="bg-red-900/20 border border-red-800 rounded-xl p-4">
                <p className="text-red-400 text-center">{error}</p>
              </div>
            </div>
          )}
          
          <AnomalyResults anomalies={anomalies} isProcessing={isProcessing} />
        </div>

        <footer className="mt-20 pt-8 border-t border-gray-800">
          <div className="text-center space-y-4">
            <p className="text-gray-400">
              Powered by Cisco Foundation Models and Hugging Face Transformers
            </p>
            <div className="flex justify-center space-x-6 text-sm text-gray-500">
              
              <span>•</span>
              <span>Made by Suraj</span>
              <span>•</span>
              
            </div>
            
          </div>
        </footer>
      </main>
    </div>
  );
}

export default App;
