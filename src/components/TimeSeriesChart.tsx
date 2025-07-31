import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
  ChartOptions,
  ChartData
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import 'chartjs-adapter-date-fns';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
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

interface TimeSeriesChartProps {
  anomalies: Anomaly[];
}

const TimeSeriesChart: React.FC<TimeSeriesChartProps> = ({ anomalies }) => {
  // Prepare data for the chart
  const chartData: ChartData<'line'> = {
    datasets: [
      {
        label: 'Anomaly Count',
        data: anomalies.map(anomaly => ({
          x: new Date(anomaly.timestamp).getTime(),
          y: 1
        })),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        pointRadius: 4,
        pointBackgroundColor: 'rgb(59, 130, 246)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
      },
    ],
  };

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#374151',
          font: {
            size: 12,
          },
        },
      },
      title: {
        display: true,
        text: 'Anomaly Detection Trend Over Time',
        color: '#1f2937',
        font: {
          size: 16,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        titleColor: '#1f2937',
        bodyColor: '#374151',
        borderColor: 'rgba(59, 130, 246, 0.5)',
        borderWidth: 1,
        padding: 12,
        callbacks: {
          label: function(context) {
            return `Anomalies: ${context.parsed.y}`;
          },
          title: function(context) {
            return new Date(context[0].parsed.x).toLocaleString();
          }
        }
      },
    },
    scales: {
      x: {
        type: 'time',
        time: {
          unit: 'minute',
          tooltipFormat: 'MMM d, yyyy HH:mm:ss',
          displayFormats: {
            minute: 'HH:mm'
          }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          color: '#6b7280',
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          color: '#6b7280',
          stepSize: 1,
        },
      },
    },
  };

  if (anomalies.length === 0) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl p-6 shadow-sm">
      <div className="h-80">
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
};

export default TimeSeriesChart;