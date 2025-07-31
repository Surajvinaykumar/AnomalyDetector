import React from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  Title,
} from 'chart.js';
import { Pie } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  Title
);

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

interface RiskDistributionPieChartProps {
  anomalies: Anomaly[];
}

const RiskDistributionPieChart: React.FC<RiskDistributionPieChartProps> = ({ anomalies }) => {
  // Calculate severity distribution
  const severityCounts = {
    critical: anomalies.filter(a => a.severity === 'critical').length,
    high: anomalies.filter(a => a.severity === 'high').length,
    medium: anomalies.filter(a => a.severity === 'medium').length,
    low: anomalies.filter(a => a.severity === 'low').length,
  };
  
  // Colors for each severity level
  const severityColors = {
    critical: 'rgb(239, 68, 68)',    // red
    high: 'rgb(249, 115, 22)',       // orange
    medium: 'rgb(234, 179, 8)',      // yellow
    low: 'rgb(59, 130, 246)'         // blue
  };
  
  const severityLabels = {
    critical: 'Critical',
    high: 'High',
    medium: 'Medium',
    low: 'Low'
  };
  
  // Prepare data for the chart
  const chartData = {
    labels: [
      severityLabels.critical,
      severityLabels.high,
      severityLabels.medium,
      severityLabels.low
    ],
    datasets: [
      {
        data: [
          severityCounts.critical,
          severityCounts.high,
          severityCounts.medium,
          severityCounts.low
        ],
        backgroundColor: [
          severityColors.critical,
          severityColors.high,
          severityColors.medium,
          severityColors.low
        ],
        borderColor: [
          'rgba(255, 255, 255, 0.2)',
          'rgba(255, 255, 255, 0.2)',
          'rgba(255, 255, 255, 0.2)',
          'rgba(255, 255, 255, 0.2)'
        ],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          color: '#374151',
          font: {
            size: 12,
          },
          padding: 20,
        },
      },
      title: {
        display: true,
        text: 'Risk Distribution by Severity',
        color: '#1f2937',
        font: {
          size: 16,
        },
        padding: {
          top: 10,
          bottom: 30
        }
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        titleColor: '#1f2937',
        bodyColor: '#374151',
        borderColor: 'rgba(0, 0, 0, 0.1)',
        borderWidth: 1,
        padding: 12,
        callbacks: {
          label: function(context: any) {
            const label = context.label || '';
            const value = context.parsed || 0;
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0';
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      },
    },
  };

  // Only show chart if there are anomalies
  const totalAnomalies = Object.values(severityCounts).reduce((a, b) => a + b, 0);
  
  if (totalAnomalies === 0) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl p-6 shadow-sm">
      <div className="h-80">
        <Pie data={chartData} options={options} />
      </div>
    </div>
  );
};

export default RiskDistributionPieChart;