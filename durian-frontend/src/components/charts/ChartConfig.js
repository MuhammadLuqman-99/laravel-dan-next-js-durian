import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Common chart options
export const commonOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true,
      position: 'bottom',
    },
    tooltip: {
      mode: 'index',
      intersect: false,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      padding: 12,
      titleColor: '#fff',
      bodyColor: '#fff',
      borderColor: 'rgba(255, 255, 255, 0.1)',
      borderWidth: 1,
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      grid: {
        color: 'rgba(0, 0, 0, 0.05)',
      },
    },
    x: {
      grid: {
        display: false,
      },
    },
  },
};

// Chart colors
export const chartColors = {
  primary: 'rgb(22, 163, 74)',
  primaryLight: 'rgba(22, 163, 74, 0.2)',
  secondary: 'rgb(59, 130, 246)',
  secondaryLight: 'rgba(59, 130, 246, 0.2)',
  warning: 'rgb(245, 158, 11)',
  warningLight: 'rgba(245, 158, 11, 0.2)',
  danger: 'rgb(239, 68, 68)',
  dangerLight: 'rgba(239, 68, 68, 0.2)',
  success: 'rgb(34, 197, 94)',
  successLight: 'rgba(34, 197, 94, 0.2)',
};

export default ChartJS;
