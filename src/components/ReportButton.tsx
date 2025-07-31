import React from 'react';
import { FileText, Download } from 'lucide-react';

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

interface ReportButtonProps {
  anomalies: Anomaly[];
  isProcessing: boolean;
  onGenerateReport: () => void;
}

const ReportButton: React.FC<ReportButtonProps> = ({ anomalies, isProcessing, onGenerateReport }) => {
  if (isProcessing || anomalies.length === 0) {
    return null;
  }

  return (
    <div className="flex justify-center py-4">
      <button
        onClick={onGenerateReport}
        className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white font-medium rounded-lg transition-colors duration-200 shadow hover:shadow-md"
        disabled={isProcessing}
      >
        <FileText className="w-5 h-5 mr-2" />
        Generate Anomaly Report
        <Download className="w-4 h-4 ml-2" />
      </button>
    </div>
  );
};

export default ReportButton;