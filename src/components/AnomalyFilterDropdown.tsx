import React, { useState } from 'react';
import { ChevronDown, Filter } from 'lucide-react';

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

interface AnomalyFilterDropdownProps {
  anomalies: Anomaly[];
  onAnomalySelect: (anomaly: Anomaly | null) => void;
  selectedAnomaly: Anomaly | null;
}

const AnomalyFilterDropdown: React.FC<AnomalyFilterDropdownProps> = ({ 
  anomalies, 
  onAnomalySelect,
  selectedAnomaly
}) => {
  const [isOpen, setIsOpen] = useState(false);
  
  // Get unique systems
  const systems = Array.from(new Set(anomalies.flatMap(a => a.affectedSystems)));
  
  // Filter anomalies by system if needed
  const filteredAnomalies = anomalies;
  
  const handleAnomalySelect = (anomaly: Anomaly | null) => {
    onAnomalySelect(anomaly);
    setIsOpen(false);
  };
  
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-400 dark:text-red-300';
      case 'high': return 'text-orange-400 dark:text-orange-300';
      case 'medium': return 'text-yellow-400 dark:text-yellow-300';
      default: return 'text-blue-400 dark:text-blue-300';
    }
  };

  if (anomalies.length === 0) {
    return null;
  }

  return (
    <div className="relative w-full max-w-md">
      <div className="flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg cursor-pointer"
           onClick={() => setIsOpen(!isOpen)}>
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          <span className="text-gray-700 dark:text-gray-300">
            {selectedAnomaly
              ? `${selectedAnomaly.description} (${selectedAnomaly.timestamp})`
              : 'Filter and examine individual anomalies'}
          </span>
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>
      
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-lg">
          <div className="max-h-60 overflow-y-auto">
            <div
              className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer border-b dark:border-gray-700"
              onClick={() => handleAnomalySelect(null)}
            >
              Show All Anomalies
            </div>
            {filteredAnomalies.map((anomaly) => (
              <div
                key={anomaly.id}
                className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer border-b dark:border-gray-700 last:border-b-0"
                onClick={() => handleAnomalySelect(anomaly)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium text-gray-900 dark:text-gray-200">{anomaly.description}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{anomaly.timestamp}</div>
                  </div>
                  <span className={`text-xs font-medium ${getSeverityColor(anomaly.severity)}`}>
                    {anomaly.severity.toUpperCase()}
                  </span>
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400 mt-1 truncate">{anomaly.logEntry.substring(0, 60)}...</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AnomalyFilterDropdown;