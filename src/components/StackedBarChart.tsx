import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
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

interface StackedBarChartProps {
  anomalies: Anomaly[];
}

const StackedBarChart: React.FC<StackedBarChartProps> = ({ anomalies }) => {
  // Group anomalies by affected system and severity
  const systems = Array.from(new Set(anomalies.flatMap(a => a.affectedSystems)));
  
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
    labels: systems,
    datasets: [
      {
        label: severityLabels.critical,
        data: systems.map(system => 
          anomalies.filter(a => 
            a.severity === 'critical' && a.affectedSystems.includes(system)
          ).length
        ),
        backgroundColor: severityColors.critical,
        stack: 'stack1',
      },
      {
        label: severityLabels.high,
        data: systems.map(system => 
          anomalies.filter(a => 
            a.severity === 'high' && a.affectedSystems.includes(system)
          ).length
        ),
        backgroundColor: severityColors.high,
        stack: 'stack1',
      },
      {
        label: severityLabels.medium,
        data: systems.map(system => 
          anomalies.filter(a => 
            a.severity === 'medium' && a.affectedSystems.includes(system)
          ).length
        ),
        backgroundColor: severityColors.medium,
        stack: 'stack1',
      },
      {
        label: severityLabels.low,
        data: systems.map(system => 
          anomalies.filter(a => 
            a.severity === 'low' && a.affectedSystems.includes(system)
          ).length
        ),
        backgroundColor: severityColors.low,
        stack: 'stack1',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: '#374151',
          font: {
            size: 12,
          },
        },
      },
      title: {
        display: true,
        text: 'Anomaly Distribution by System and Severity',
        color: '#1f2937',
        font: {
          size: 16,
        },
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
            return `${context.dataset.label}: ${context.parsed.y} anomalies`;
          }
        }
      },
    },
    scales: {
      x: {
        stacked: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          color: '#6b7280',
        },
      },
      y: {
        stacked: true,
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          color: '#6b7280',
          precision: 0,
        },
      },
    },
  };

  if (anomalies.length === 0 || systems.length === 0) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl p-6 shadow-sm">
      <div className="h-80">
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
};

export default StackedBarChart;