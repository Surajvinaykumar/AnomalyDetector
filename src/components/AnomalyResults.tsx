import React from 'react';
import { AlertTriangle, TrendingUp, Clock, FileText } from 'lucide-react';

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

interface AnomalyResultsProps {
  anomalies: Anomaly[];
  isProcessing: boolean;
}

const AnomalyResults: React.FC<AnomalyResultsProps> = ({ anomalies, isProcessing }) => {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/50 border-red-300 dark:border-red-700';
      case 'high': return 'text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/50 border-orange-300 dark:border-orange-700';
      case 'medium': return 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/50 border-yellow-300 dark:border-yellow-700';
      case 'low': return 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/50 border-blue-300 dark:border-blue-700';
      default: return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
      case 'high':
        return <AlertTriangle className="w-5 h-5" />;
      case 'medium':
        return <TrendingUp className="w-5 h-5" />;
      default:
        return <Clock className="w-5 h-5" />;
    }
  };

  if (isProcessing) {
    return (
      <div className="space-y-4">
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900/50 rounded-full mb-4">
            <div className="w-8 h-8 border-4 border-blue-500 dark:border-blue-400 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <h3 className="text-xl font-medium text-gray-800 dark:text-gray-200 mb-2">Analyzing Logs</h3>
          <p className="text-gray-600 dark:text-gray-400">AI is detecting anomalies in your data...</p>
        </div>
      </div>
    );
  }

  if (anomalies.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
        <h3 className="text-xl font-medium text-gray-800 dark:text-gray-200 mb-2">No Anomalies Detected</h3>
        <p className="text-gray-600 dark:text-gray-400">Your logs appear to be normal. Upload a file to begin analysis.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Detected Anomalies</h2>
        <span className="px-3 py-1 bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 rounded-full text-sm border border-red-300 dark:border-red-700">
          {anomalies.length} anomalies found
        </span>
      </div>

      <div className="space-y-4">
        {anomalies.map((anomaly) => (
          <div
            key={anomaly.id}
            className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors shadow-sm"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg border ${getSeverityColor(anomaly.severity)}`}>
                  {getSeverityIcon(anomaly.severity)}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 dark:text-gray-200">{anomaly.description}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{anomaly.timestamp}</p>
                </div>
              </div>
              <div className="text-right">
                <span className={`inline-block px-2 py-1 rounded-full text-xs border ${getSeverityColor(anomaly.severity)}`}>
                  {anomaly.severity.toUpperCase()}
                </span>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{anomaly.confidence}% confidence</p>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 mb-4">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{anomaly.naturalLanguage}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Affected Systems</h4>
                <div className="flex flex-wrap gap-2">
                  {anomaly.affectedSystems.map((system, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded border border-gray-300 dark:border-gray-600"
                    >
                      {system}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Log Entry</h4>
                <code className="text-xs text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 p-2 rounded block overflow-x-auto">
                  {anomaly.logEntry.substring(0, 100)}...
                </code>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AnomalyResults;