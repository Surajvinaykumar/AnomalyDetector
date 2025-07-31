import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import FileUpload from './components/FileUpload';
import AnomalyResults from './components/AnomalyResults';
import ReportButton from './components/ReportButton';
import ThreatMetricsDashboard from './components/ThreatMetricsDashboard';
import TimeSeriesChart from './components/TimeSeriesChart';
import StackedBarChart from './components/StackedBarChart';
import RiskDistributionPieChart from './components/RiskDistributionPieChart';
import AnomalyFilterDropdown from './components/AnomalyFilterDropdown';
import Login from './components/Login';
import Register from './components/Register';
import ProtectedRoute from './components/ProtectedRoute';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
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
  return (
    <Router>
      <AuthProvider>
        <ThemeProvider>
          <div className="min-h-screen bg-black transition-colors duration-300 ease-in-out">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/" element={
                <ProtectedRoute>
                  <MainApp />
                </ProtectedRoute>
              } />
            </Routes>
          </div>
        </ThemeProvider>
      </AuthProvider>
    </Router>
  );
}

function MainApp() {
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedAnomaly, setSelectedAnomaly] = useState<Anomaly | null>(null);

  const handleFileUpload = async (file: File, content: string) => {
    setIsProcessing(true);
    setError(null);
    setSelectedAnomaly(null);
    
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

  const handleGenerateReport = () => {
    // For now, we'll just log the report data
    console.log('Generating report for anomalies:', anomalies);
    // In a real implementation, this would generate and download a report
    alert('Report generation would be implemented here. In a real application, this would generate and download a detailed PDF report.');
  };

  // Filter anomalies based on selection
  const filteredAnomalies = selectedAnomaly
    ? anomalies.filter(a => a.id === selectedAnomaly.id)
    : anomalies;

  return (
    <>
      <Header />
  
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-6 bg-gray-900 rounded-xl shadow-lg">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-3">
            AI-Powered Log Anomaly Detection
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Upload your log files and let our advanced AI models detect anomalies with
            natural language explanations. Supports multiple formats including JSON, CSV, XML, and Syslog.
          </p>
        </div>

        <div className="space-y-8">
          <FileUpload onFileUpload={handleFileUpload} isProcessing={isProcessing} />
          
          {error && (
            <div className="max-w-2xl mx-auto">
              <div className="bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-xl p-4">
                <p className="text-red-700 dark:text-red-300 text-center">{error}</p>
              </div>
            </div>
          )}
          
          {/* Reporting Components - Only show when anomalies exist and processing is complete */}
          {anomalies.length > 0 && !isProcessing && (
            <>
              {/* Top Section with Data Visualizations */}
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Anomaly Analysis</h3>
                  <AnomalyFilterDropdown
                    anomalies={anomalies}
                    onAnomalySelect={setSelectedAnomaly}
                    selectedAnomaly={selectedAnomaly}
                  />
                </div>
                
                <ThreatMetricsDashboard anomalies={filteredAnomalies} />
                <TimeSeriesChart anomalies={filteredAnomalies} />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <StackedBarChart anomalies={filteredAnomalies} />
                  <RiskDistributionPieChart anomalies={filteredAnomalies} />
                </div>
              </div>
              
              {/* Report Button */}
              <ReportButton
                anomalies={anomalies}
                isProcessing={isProcessing}
                onGenerateReport={handleGenerateReport}
              />
            </>
          )}
          
          {/* Anomaly Results - Always show after processing */}
          {!isProcessing && anomalies.length > 0 && (
            <AnomalyResults anomalies={filteredAnomalies} isProcessing={isProcessing} />
          )}
        </div>

      </main>
    </>
  );
}

export default App;