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
      case 'critical': return 'text-red-400 bg-red-900/20 border-red-800';
      case 'high': return 'text-orange-400 bg-orange-900/20 border-orange-800';
      case 'medium': return 'text-yellow-400 bg-yellow-900/20 border-yellow-800';
      case 'low': return 'text-blue-400 bg-blue-900/20 border-blue-800';
      default: return 'text-gray-400 bg-gray-900/20 border-gray-800';
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
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-900/20 rounded-full mb-4">
            <div className="w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <h3 className="text-xl font-medium text-white mb-2">Analyzing Logs</h3>
          <p className="text-gray-400">Cisco AI is detecting anomalies in your data...</p>
        </div>
      </div>
    );
  }

  if (anomalies.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
        <h3 className="text-xl font-medium text-white mb-2">No Anomalies Detected</h3>
        <p className="text-gray-400">Your logs appear to be normal. Upload a file to begin analysis.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Detected Anomalies</h2>
        <span className="px-3 py-1 bg-red-900/20 text-red-400 rounded-full text-sm border border-red-800">
          {anomalies.length} anomalies found
        </span>
      </div>

      <div className="space-y-4">
        {anomalies.map((anomaly) => (
          <div
            key={anomaly.id}
            className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 hover:bg-gray-900/70 transition-colors"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg border ${getSeverityColor(anomaly.severity)}`}>
                  {getSeverityIcon(anomaly.severity)}
                </div>
                <div>
                  <h3 className="font-semibold text-white">{anomaly.description}</h3>
                  <p className="text-sm text-gray-400">{anomaly.timestamp}</p>
                </div>
              </div>
              <div className="text-right">
                <span className={`inline-block px-2 py-1 rounded-full text-xs border ${getSeverityColor(anomaly.severity)}`}>
                  {anomaly.severity.toUpperCase()}
                </span>
                <p className="text-sm text-gray-400 mt-1">{anomaly.confidence}% confidence</p>
              </div>
            </div>

            <div className="bg-gray-800/50 rounded-lg p-4 mb-4">
              <p className="text-gray-300 leading-relaxed">{anomaly.naturalLanguage}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-gray-400 mb-2">Affected Systems</h4>
                <div className="flex flex-wrap gap-2">
                  {anomaly.affectedSystems.map((system, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-gray-800 text-gray-300 text-xs rounded border border-gray-700"
                    >
                      {system}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-400 mb-2">Log Entry</h4>
                <code className="text-xs text-gray-300 bg-gray-800/50 p-2 rounded block overflow-x-auto">
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