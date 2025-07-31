import React from 'react';
import { AlertTriangle, Shield, Clock, TrendingUp } from 'lucide-react';

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

interface ThreatMetricsDashboardProps {
  anomalies: Anomaly[];
}

const ThreatMetricsDashboard: React.FC<ThreatMetricsDashboardProps> = ({ anomalies }) => {
  // Calculate metrics
  const totalAnomalies = anomalies.length;
  
  const severityCounts = {
    critical: anomalies.filter(a => a.severity === 'critical').length,
    high: anomalies.filter(a => a.severity === 'high').length,
    medium: anomalies.filter(a => a.severity === 'medium').length,
    low: anomalies.filter(a => a.severity === 'low').length,
  };
  
  const highestSeverity = Math.max(severityCounts.critical, severityCounts.high, severityCounts.medium, severityCounts.low);
  
  // Get affected systems
  const affectedSystems = Array.from(
    new Set(anomalies.flatMap(anomaly => anomaly.affectedSystems))
  );
  
  // Get recent anomalies (last 5)
  const recentAnomalies = [...anomalies]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 5);

  if (anomalies.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {/* Total Anomalies */}
      <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 dark:text-gray-400 text-sm">Total Anomalies</p>
            <p className="text-3xl font-bold text-gray-800 dark:text-gray-200 mt-2">{totalAnomalies}</p>
          </div>
          <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
            <Shield className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
        </div>
      </div>
      
      {/* Critical Anomalies */}
      <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 dark:text-gray-400 text-sm">Critical</p>
            <p className="text-3xl font-bold text-red-600 dark:text-red-400 mt-2">{severityCounts.critical}</p>
          </div>
          <div className="p-3 bg-red-100 dark:bg-red-900/50 rounded-lg">
            <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
          </div>
        </div>
        {severityCounts.critical > 0 && (
          <div className="mt-4 flex items-center">
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-red-500 h-2 rounded-full"
                style={{ width: `${(severityCounts.critical / highestSeverity) * 100}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>
      
      {/* High Anomalies */}
      <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 dark:text-gray-400 text-sm">High Severity</p>
            <p className="text-3xl font-bold text-orange-600 dark:text-orange-400 mt-2">{severityCounts.high}</p>
          </div>
          <div className="p-3 bg-orange-100 dark:bg-orange-900/50 rounded-lg">
            <TrendingUp className="w-6 h-6 text-orange-600 dark:text-orange-400" />
          </div>
        </div>
        {severityCounts.high > 0 && (
          <div className="mt-4 flex items-center">
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-orange-500 h-2 rounded-full"
                style={{ width: `${(severityCounts.high / highestSeverity) * 100}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>
      
      {/* Affected Systems */}
      <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 dark:text-gray-400 text-sm">Affected Systems</p>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">{affectedSystems.length}</p>
          </div>
          <div className="p-3 bg-green-100 dark:bg-green-900/50 rounded-lg">
            <Clock className="w-6 h-6 text-green-600 dark:text-green-400" />
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-1">
          {affectedSystems.slice(0, 3).map((system, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded border border-gray-300 dark:border-gray-600"
            >
              {system}
            </span>
          ))}
          {affectedSystems.length > 3 && (
            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded border border-gray-300 dark:border-gray-600">
              +{affectedSystems.length - 3} more
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ThreatMetricsDashboard;